#!/usr/bin/env python3
"""Build one Highvis HTML report using only Python's standard library."""

import argparse
import html
import json
import re
from pathlib import Path


LEVELS = {"Context", "Containers", "Components", "Code", "Dynamic"}
EVENT_KINDS = {"request", "response", "publish", "consume", "callback", "redirect", "local"}
EVENT_MODES = {"sync", "async", "local"}


def require_text(value, location):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{location} must be a non-empty string")


def validate_annotations(value, location):
    notes = value.get("notes")
    if not isinstance(notes, list):
        raise ValueError(f"{location}.notes must be an array")
    for index, note in enumerate(notes):
        require_text(note, f"{location}.notes[{index}]")
    evidence = value.get("evidence")
    if not isinstance(evidence, list):
        raise ValueError(f"{location}.evidence must be an array")
    for index, item in enumerate(evidence):
        here = f"{location}.evidence[{index}]"
        if not isinstance(item, dict):
            raise ValueError(f"{here} must be an object")
        for field in ("path", "detail"):
            require_text(item.get(field), f"{here}.{field}")
        if "lines" in item and not re.fullmatch(r"[1-9][0-9]*(?:-[1-9][0-9]*)?", str(item["lines"])):
            raise ValueError(f"{here}.lines must be a positive line or range")


def validate_events(events, location):
    if not isinstance(events, list):
        raise ValueError(f"{location} must be an array")
    seen = {}
    ancestors = {}
    requests = {}
    responses = set()
    for index, event in enumerate(events):
        here = f"{location}[{index}]"
        if not isinstance(event, dict):
            raise ValueError(f"{here} must be an object")
        for field in ("id", "title", "kind", "mode", "from", "to", "description"):
            require_text(event.get(field), f"{here}.{field}")
        identifier = event["id"]
        if not re.fullmatch(r"[a-z][a-z0-9_-]*", identifier) or identifier in seen:
            raise ValueError(f"{here}.id must be a unique lowercase slug")
        if event["kind"] not in EVENT_KINDS or event["mode"] not in EVENT_MODES:
            raise ValueError(f"{here} has an unsupported kind or mode")
        if (event["kind"] == "local") != (event["mode"] == "local"):
            raise ValueError(f"{here} local events must use local mode only")
        if event["kind"] in {"publish", "consume", "callback"} and event["mode"] != "async":
            raise ValueError(f"{here} delivery and callback events must be async")
        after = event.get("after")
        if not isinstance(after, list) or any(not isinstance(item, str) or item not in seen for item in after):
            raise ValueError(f"{here}.after must reference earlier event ids")
        ancestors[identifier] = set(after)
        for parent in after:
            ancestors[identifier].update(ancestors[parent])
        for field in ("method", "url", "status", "channel", "exchange", "parallelGroup"):
            if field in event:
                require_text(event[field], f"{here}.{field}")
        if "headers" in event and (
            not isinstance(event["headers"], dict)
            or any(not isinstance(value, str) for value in event["headers"].values())
        ):
            raise ValueError(f"{here}.headers must be an object of strings")
        kind = event["kind"]
        if kind == "request":
            for field in ("exchange", "method", "url"):
                require_text(event.get(field), f"{here}.{field}")
            if event["exchange"] in requests:
                raise ValueError(f"{here}.exchange must identify one request attempt")
            requests[event["exchange"]] = event
        elif kind == "response":
            exchange = event.get("exchange")
            require_text(exchange, f"{here}.exchange")
            request = requests.get(exchange)
            if request is None or request["id"] not in ancestors[identifier]:
                raise ValueError(f"{here} response must follow its request causally")
            if exchange in responses or (event["from"], event["to"], event["mode"]) != (
                request["to"], request["from"], request["mode"]
            ):
                raise ValueError(f"{here} response must reverse its request participants and preserve mode")
            require_text(event.get("status"), f"{here}.status")
            responses.add(exchange)
        elif kind in {"publish", "consume"}:
            require_text(event.get("channel"), f"{here}.channel")
        elif kind in {"callback", "redirect"}:
            require_text(event.get("url"), f"{here}.url")
        if kind in {"request", "response"} and "payload" not in event:
            raise ValueError(f"{here}.payload must describe the contract, absence, or unknown")
        validate_annotations(event, here)
        seen[identifier] = event


def validate_report(report):
    if not isinstance(report, dict):
        raise ValueError("report must be an object")
    for field in ("title", "summary", "scope", "revision"):
        require_text(report.get(field), field)
    views = report.get("views")
    if not isinstance(views, list) or not views:
        raise ValueError("views must be a non-empty array")
    identifiers = set()
    for index, view in enumerate(views):
        location = f"views[{index}]"
        if not isinstance(view, dict):
            raise ValueError(f"{location} must be an object")
        for field in ("id", "title", "level", "description"):
            require_text(view.get(field), f"{location}.{field}")
        if not re.fullmatch(r"[a-z][a-z0-9_-]*", view["id"]):
            raise ValueError(f"{location}.id must be a lowercase slug")
        if view["id"] in identifiers:
            raise ValueError(f"duplicate view id: {view['id']}")
        identifiers.add(view["id"])
        if view["level"] not in LEVELS:
            raise ValueError(f"{location}.level must be one of {sorted(LEVELS)}")
        validate_annotations(view, location)
        if "events" in view:
            validate_events(view["events"], f"{location}.events")
        if "mermaid" not in view:
            if view["level"] != "Dynamic" or not view.get("events"):
                raise ValueError(f"{location} needs Mermaid or a non-empty Dynamic chronology")
            continue
        require_text(view["mermaid"], f"{location}.mermaid")
        # Ignore leading blank lines/comments when identifying the diagram type.
        source = "\n".join(
            line for line in view["mermaid"].splitlines()
            if line.strip() and not line.lstrip().startswith("%%")
        )
        if not re.match(r"\s*flowchart\s+(LR|TB|TD|RL|BT)\b", source):
            raise ValueError(f"{location}.mermaid must be a flowchart")
        if re.search(r"%%\{|^\s*---|\bclick\s|https?://|<\s*/?\s*(?!br\s*/?>)[a-z]", view["mermaid"], re.I | re.M):
            raise ValueError(f"{location}.mermaid contains directives, links, or unsupported HTML")
    return report


def build_report(report):
    validate_report(report)
    template = Path(__file__).resolve().parents[1] / "assets" / "report.html"
    # JSON in a script data block still needs HTML-parser-safe escaping.
    payload = json.dumps(report, ensure_ascii=True).replace("&", "\\u0026").replace("<", "\\u003c").replace(">", "\\u003e")
    return template.read_text(encoding="utf-8").replace(
        "<!-- HIGHVIS_DATA -->", payload
    ).replace("<!-- HIGHVIS_TITLE -->", html.escape(report["title"]))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path, help="JSON report input")
    parser.add_argument("--output", required=True, type=Path, help="HTML destination")
    args = parser.parse_args()
    if args.report.resolve() == args.output.resolve():
        parser.error("output must differ from the JSON input")
    try:
        result = build_report(json.loads(args.report.read_text(encoding="utf-8")))
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(result, encoding="utf-8")
    except (OSError, ValueError) as error:
        parser.exit(1, f"highvis: {error}\n")
    print(args.output.resolve())


if __name__ == "__main__":
    main()

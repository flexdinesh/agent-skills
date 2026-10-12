"""Run with python3 -m unittest discover -s skills/highvis/scripts -p 'test_*.py'."""

import copy
import json
import re
import unittest
from pathlib import Path

from build_report import build_report, validate_report


class ReportTests(unittest.TestCase):
    def setUp(self):
        self.report = json.loads((Path(__file__).resolve().parents[1] / "examples/app.json").read_text())

    def test_legacy_reports_remain_valid(self):
        for view in self.report["views"]:
            view.pop("entities", None)
        self.assertIs(validate_report(self.report), self.report)

    def test_entity_navigation_can_reference_a_later_view(self):
        self.assertEqual(self.report["views"][0]["entities"][1]["view"], "containers")
        self.assertIs(validate_report(self.report), self.report)

    def test_rejects_ambiguous_entity_ids_and_unknown_roles(self):
        for field, value in [("id", "customer"), ("role", "unverified-role"), ("role", [])]:
            with self.subTest(field=field, value=value):
                report = copy.deepcopy(self.report)
                report["views"][0]["entities"][1][field] = value
                with self.assertRaises(ValueError):
                    validate_report(report)

    def test_rejects_broken_deeper_view_links(self):
        self.report["views"][0]["entities"][1]["view"] = "missing-view"
        with self.assertRaisesRegex(ValueError, "existing view"):
            validate_report(self.report)

    def test_entity_evidence_must_use_valid_source_locations(self):
        self.report["views"][0]["entities"][1]["evidence"] = [{"path": "app.py", "lines": "0", "detail": "System boundary"}]
        with self.assertRaisesRegex(ValueError, "positive line"):
            validate_report(self.report)

    def test_entity_annotations_cannot_break_the_html_data_block(self):
        text = '</script><script>alert("example")</script>&'
        self.report["views"][0]["entities"][1]["notes"] = [text]
        output = build_report(self.report)
        data = re.search(r'<script id="highvis-data" type="application/json">(.*?)</script>', output, re.S)
        self.assertIsNotNone(data)
        payload = data.group(1)
        self.assertNotIn("<", payload)
        self.assertEqual(json.loads(payload), self.report)


if __name__ == "__main__":
    unittest.main()

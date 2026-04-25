---
name: execute-mode
description: "Use when executing a plan or implementing a set of changes making writes and edits."
---

# Execute Plan

Use this skill when the task is to execute or implement a plan.

## Purpose

Follow the plan to the dot and don't deviate from the plan. It's important to respect the plan during execution.

## Orchestration

If there is an opportunity to execute tasks in parallel by spawning background agents, take that.

- it's important to execute tasks in parallel using background agents only when the harness supports it and when there are tools that make it possible to spawn background agents.
- execute only independent tasks in parallel
- use orchestration pattern to coordinate the background agents when executing tasks in parallel

## During execution:

These execution instructions are important. Follow them to the dot. In case you can't follow them, let the user know why.

- if the implementation deviates from the saved plan, update the plan (and the plan file if there is one) to reflect the latest approved plan state
- let the user know about the deviation in plan with reasons and capture the updated decisions, tradeoffs, and risks in the saved plan
- if something doesn't work, do not keep pushing or try various things to force it. stop execution, present the user with alternative approaches, and get explicit approval before changing direction

## After execution:

These after execution instructions are important. Follow them to the dot. In case you can't follow them, let the user know why.

- summarise the changes by listing down all the files that were changed and briefly explain what changed in each file. keep it concise.
- summarise the decisions and tradeoffs in the execution
- list down the files that were changed
- list down all the commands that run during execution

## Stop Condition

When there is an ambiguity in execution or when the execution didn't go as planned, stop the execution and present the user with options on how to proceed and ask the user for direction.

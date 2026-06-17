---
title: "AI Agents"
---

# AI Agents

These are the projects where I work on getting AI agents to do useful work without me babysitting them. Most of the effort goes into the boring parts: handing an agent the standards, formats, and guardrails up front so it follows them on its own instead of waiting on me to re-explain them every time.

## Agentic Skills
[![GitHub: LittleSeneca/agentic-skills](https://img.shields.io/badge/GitHub-LittleSeneca%2Fagentic--skills-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/agentic-skills)

This is a marketplace of skills and plugins for Claude Code that front-load the knowledge an agent needs before it starts a task. The idea is simple: spend the token budget on the work, not the warm-up. Instead of an agent rediscovering the same standards, house formats, and operating conventions on every run, I load that foundation once and let it get straight to the job.

It splits into two halves. The **plugins** are read-only by default and hand back any write operation as a command for me to run myself, which is exactly the posture I want for cloud access. There are read-only plugins for AWS, Azure, GCP, and the X API, so an agent can look but never touch without a human in the loop. The **skills** carry the domain knowledge: governance and compliance policy drafting in the right house format, security control writing grounded in NIST SP 800-53, process and plan writing built on NIST and ISO, plus writing, decision-making, and pull-request conventions.

Every skill and plugin is a self-contained folder with its own documentation, registered through a single marketplace manifest. Adding one is a matter of dropping in a folder and listing it. The whole thing is built on one principle I keep coming back to: ground the agent in established practice so its output is consistent and defensible, not improvised.

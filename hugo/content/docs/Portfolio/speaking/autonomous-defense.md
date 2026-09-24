---
title: "Autonomous Defense"
meta: "Sep 2023 · 21 min"
weight: 5
---

# Autonomous Defense

Building a full defense-in-depth stack as a single workflow, layer by layer, and then the operational discipline it needs to survive production.

<video class="video-embed" controls preload="none" playsinline poster="/images/poster-autonomous-defense.jpg" src="https://www.brooks-security.com/downloads/autonomous-defense.mp4">
  Your browser cannot play this video. <a href="https://www.brooks-security.com/downloads/autonomous-defense.mp4">Download the recording</a> instead.
</video>

The opening argument is about attacker economics. Most threat actors are not targeting anyone in particular. They scan, find nothing they can reach easily, and move on to the next organisation. Being expensive to enter is a real defensive strategy, and it is measurable in a way that "we have not been breached" is not.

## What it covers

The stack assembled in one workflow: firewall enforced, then the agent itself, then antivirus, then VPN, then log collection, then patch scan and deploy, then a vulnerability scan filtered to the critical end of the CVSS range. Each layer is one node on the canvas, and the workflow is the whole posture in one readable object rather than seven consoles.

The second half is the part most automation conversations skip. A policy is only useful if it runs on a cadence the endpoints can tolerate, is scoped to the right assets, and produces a number someone can watch move month over month.

## Worth watching

The exchange about intervals. Running a thousand compliance checks every thirty minutes is a good way to make an endpoint slow enough that users notice, and the honest answer to "how often" turns out to be a tradeoff rather than a best practice. Choosing twelve hours and saying why is a better answer than choosing the most aggressive option available.

Then the reporting section, which makes the argument that a compliance programme without a baseline is not a programme. Pick a metric, take a monthly snapshot, and hold yourself to a target. Twenty-five percent fewer non-compliant items each month is the example, and the point is that it is falsifiable.

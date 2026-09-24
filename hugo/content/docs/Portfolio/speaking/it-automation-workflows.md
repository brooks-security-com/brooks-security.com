---
title: "Harnessing Automation"
meta: "Aug 2023 · 21 min"
weight: 4
---

# Harnessing Automation

Deliberately scoped away from patching, which the series had already covered, to the rest of the automation surface: service control, access control, and software provisioning.

<video class="video-embed" controls preload="none" playsinline poster="/images/poster-it-automation-workflows.jpg" src="https://www.brooks-security.com/downloads/it-automation-workflows.mp4">
  Your browser cannot play this video. <a href="https://www.brooks-security.com/downloads/it-automation-workflows.mp4">Download the recording</a> instead.
</video>

The whole session is one live build, which is the right format for this argument. Talking about drag-and-drop automation is unconvincing. Watching a workflow go from an empty canvas to enforcing a policy in about six minutes is the actual claim.

## What it covers

A provisioning chain first, installing one package and then another on the condition that the first succeeded, then packaging something bespoke that needs its own installer flags. From there, BitLocker enforcement with a branching path, and a firewall check with its own branch. The canvas handles the decision tree, which is the part that normally means opening an editor and debugging a script.

The interesting turn is the enforcement demo. A stopped service triggers a firewall rule that blocks access to a DNS server, and restoring the service releases it. That is gating, and gating alone is only half a policy.

## Worth watching

The last few minutes, where the workflow gains a step that starts the stopped service back up. Once that is in place the policy heals the environment instead of locking people out of it, which is the difference between an enforcement tool and something a service desk can live with.

The closing example is a Log4j remediation on a server that runs to roughly twenty steps: opening a ticket, snapshotting a VM, draining it from an AWS elastic load balancer, patching Apache, revalidating, and putting it back. It is the answer to anyone who thinks no-code means shallow.

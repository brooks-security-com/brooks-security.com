---
title: "Security"
weight: 3
---

# Security Projects

## Local NVD Database
[![GitHub: LittleSeneca/local-nvd](https://img.shields.io/badge/GitHub-LittleSeneca%2Flocal--nvd-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/local-nvd)

This project automates pulling down the full NIST National Vulnerability Database, minus the current year, and loads it into PostgreSQL. It sets up the server, creates the tables, and runs the scripts that collect the data and push it in.

The reason to want this is control. Once the NVD lives in your own database, you can query it, join it against your asset inventory, and run the kind of analysis the public web interface will not give you. It is built for security teams, researchers, and admins who would rather own the data than poke at it through someone else's UI.

## Inspector Triage
[![GitHub: LittleSeneca/inspector-triage](https://img.shields.io/badge/GitHub-LittleSeneca%2Finspector--triage-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/inspector-triage)

Amazon Inspector will tell you that a package inside one of your images carries a critical CVE. It will not tell you whether anything in your application ever loads that package. On a real account that difference is most of the backlog, which is why a list sorted by severity is not a work queue.

The question worth asking is whether anyone outside the resource's trust boundary can actually cause the vulnerable code to run. So the tool consolidates Inspector findings into one record per CVE and package, then builds a numbered evidence report out of your own account and repositories: the Dockerfile, the base image, the dependency manifests, code search for the package and the names it gets invoked by, and what each host class is running. A language model reads that report alongside a written statement of what your estate is, and it has to cite the evidence items by number. A verdict of unreachable with no citation is rejected, and there are floors the model cannot lower, starting with KEV-listed and reachable being P1.

What you get back is a short Jira board, one card per vulnerability, prioritized by reachability and exploitation evidence instead of CVSS. Risk acceptances are filed as children of a standing issue per exception class, so the acceptance and the evidence behind it sit in one auditable place, and undeployed image tags are never ticketed. It deploys as one CloudFormation stack: a single Lambda, a versioned S3 object for state, an EventBridge schedule, and an alarm. It ships with dry-run on, because the first thing to do is read a few runs' decisions before letting it write to Jira. The honest caveat is the one the README leads with. Most of the reachability evidence comes from searching your repositories, so a read-only GitHub token is what makes it useful. Without one it still runs correctly, but it answers unknown more often, and unknown is treated as reachable.

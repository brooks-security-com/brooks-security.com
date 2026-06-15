# Automation Projects

These are the side projects where I work out automation ideas before they ever touch a client. Some are tools I reach for constantly. Others started as a one-off problem I refused to solve by hand twice.

## Jarvis - Executive Summary Agent
[![GitHub: LittleSeneca/jarvis-executive-summary](https://img.shields.io/badge/GitHub-LittleSeneca%2Fjarvis--executive--summary-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/jarvis-executive-summary)

Jarvis is a containerized Python tool that reads the last 24 hours of activity from a set of data sources, summarizes each one through Groq-hosted inference, posts a single executive brief to Slack, and then exits. One container, one run, one clean morning digest. No daemon, no scheduler, no loop to babysit.

On startup it runs every enabled plugin at once. Each plugin pulls its own data (Site24x7, AWS Security Hub, AWS Billing, Drata, Gmail, GitHub, weather, news, stocks, and a few more), sends the payload through a rate-limited Groq queue with its own prompt and temperature, and the results get assembled into one Slack Block Kit message in a DM or channel.

The whole thing is built around plugins. Every data source is a self-contained folder under `plugins/<name>/` that implements a single contract. Adding a source means dropping in a folder, implementing the contract, and adding its name to `ENABLED_PLUGINS`. No core changes. And if a plugin fails, the brief still goes out with a note about what broke. A partial brief beats silence.

## Hard Drive Auditor
[![GitHub: LittleSeneca/hard-drive-auditor](https://img.shields.io/badge/GitHub-LittleSeneca%2Fhard--drive--auditor-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/hard-drive-auditor)

Most offices have a pile of old hard drives in a drawer somewhere, and half of them are unlabeled. That is a real security problem. You cannot protect data you do not know you still have. This tool gives you a fast way to see what is actually on a drive without clicking through the filesystem by hand.

Point it at a standard unencrypted Windows drive and it crawls the disk, pulls the hostname from the registry, and shows you the user folders. Point it at a BitLocker drive and it asks for the recovery password (pull that from your AD), unlocks the volume, and scans it the same way. Hand it a raw filesystem with no operating system and it prints the root directory. Hand it a Linux disk and it prints the root directory and tells you it is a boot device.

The point is triage. You learn what a mystery drive holds in seconds instead of an afternoon.

## Clonezilla Image Builder
[![GitHub: LittleSeneca/clonezilla-builder](https://img.shields.io/badge/GitHub-LittleSeneca%2Fclonezilla--builder-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/clonezilla-builder)

Clonezilla is a great imaging tool, and it does a lot out of the box. But you can push it well past the defaults with a little effort. The catch is that unpacking and repacking a Clonezilla image by hand is tedious and easy to get wrong.

So I built a tool that does it for you. It cleanly unpacks and repacks Clonezilla images with changes to the syslinux, live, home, EFI, and boot folders. Right now it adds a boot menu entry that pulls a GitHub repo you choose and offers to run a script from it, which turns a plain imaging disk into something you can tailor for each deployment.

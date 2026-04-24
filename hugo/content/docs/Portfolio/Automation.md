# Automation Projects
## Jarvis - Executive Summary Agent
[![GitHub: LittleSeneca/jarvis-executive-summary](https://img.shields.io/badge/GitHub-LittleSeneca%2Fjarvis--executive--summary-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/jarvis-executive-summary)

A containerized Python tool that pulls the last 24 hours of activity from a configurable set of data sources, summarizes each through Groq-hosted LLM inference, and posts a single consolidated executive brief to Slack — then exits. One container, one run, one well-formatted morning digest. No daemon, no scheduler, no loop.

On startup, Jarvis runs every enabled plugin concurrently — each plugin fetches its own data (Site24x7, AWS SecurityHub, AWS Billing, Drata, Gmail, GitHub, Weather, News, Stocks, and Truth Social), pipes the payload through a rate-limited Groq inference queue using a plugin-owned prompt and temperature, then assembles all summaries into a single Slack Block Kit message posted to a DM or channel.

Each data source is a self-contained plugin folder under `plugins/<name>/` implementing a `DataSourcePlugin` contract. Adding a new source means dropping a folder in, implementing the contract, and adding the plugin name to `ENABLED_PLUGINS` in `.env` — no core changes required. If a plugin fails, the digest still goes out with a note about the failed source; a partial brief beats silence.

The container is a one-shot: start it, it runs, it exits. Scheduling (cron, ECS, EventBridge) is left entirely to the operator.

## Hard Drive Auditor
[![GitHub: LittleSeneca/hard-drive-auditor](https://img.shields.io/badge/GitHub-LittleSeneca%2Fhard--drive--auditor-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/hard-drive-auditor)

Many organizations have stacks of hard drives laying around the office. Many of these hard drives are unlabeled. Thats dangerous! This tool provides a fast process to quickly analyze hard drives for their file contents. No need to manually click through file systems.

If the drive is a standard un-encrypted windows drive, it will simply crawl through the drive, finding and displaying the hostname from the registry and the user folder contents.

If its a bitlocker encrypted windows drive, it will prompt you for the recovery password (which im assuming can be pulled from your Org's ADUC). Once the password has been accepted, the script will automatically mount the bitlocker drive and scan it like an un-encrypted windows drive.

If the drive is a filesystem without a operating system, it will output the root directory file system of the drive.

If the drive is a linux filesystem, it will output the root directory file system of the drive and state that it is a linux boot device.

## Clonezilla Image Builder
[![GitHub: LittleSeneca/clonezilla-builder](https://img.shields.io/badge/GitHub-LittleSeneca%2Fclonezilla--builder-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/clonezilla-builder)

Clonezilla is awesome! By default it has a huge amount of power. 

But, with a bit of effort, its existing utility can be greatly expanded. 

Unfortunately, it can be very cumbersome to unpackage and repackage a clonezilla image. That is why I built this tool. It efficiently unpackes and repackes clonezilla images with changes made to the syslinux, live, home, EFI, and Boot folders. Currently, I have added a boot menu entry which pulls a user determined github repo and prompts the user to run a script from the pulled repo.

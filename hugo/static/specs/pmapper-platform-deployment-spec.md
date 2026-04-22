# IAM Graph Analysis Platform Deployment Spec

## 1. Overview

This spec defines a lightweight deployment of [PMapper (Principal Mapper)](https://github.com/nccgroup/PMapper) on an existing CI utility EC2 instance.

PMapper models AWS IAM permissions as a directed graph and identifies privilege-escalation paths, including multi-hop chains that are easy to miss in manual policy review.

Deployment model:
- Python virtual environment under `/opt/pmapper`
- Managed by Ansible
- Invoked through existing SSM-based automation
- No new EC2 instances, containers, or managed services

## 2. Goals

- Deploy PMapper on existing host with minimal footprint (venv + scripts, no daemon).
- Build IAM graph for one AWS account and persist outputs to S3.
- Publish scheduled findings summary to team documentation.
- Integrate with existing security reporting automation.

## 3. Host

PMapper runs on an existing utility host. No new infrastructure is provisioned.

| Attribute      | Value |
| -------------- | ----- |
| Hostname       | `ci-runner-x86.prod.example.internal` |
| Connection     | AWS SSM via Ansible `community.aws.aws_ssm` |
| Region         | `us-east-2` |
| OS             | Amazon Linux 2 (x86_64) |
| Overlay tag    | `tag:ci-runner` |

## 4. Deployment layout

```text
/opt/pmapper/
├── venv/
├── graph/
│   └── <account-id>/
├── scripts/
│   ├── build_graph.sh
│   ├── run_analysis.sh
│   └── push_report.py
└── requirements.txt
```

`/opt/pmapper` is owned by the automation user. `graph/` is excluded from ephemeral cleanup.

## 5. IAM requirements

Attach broad read policies or equivalent custom policy:

- `SecurityAudit`
- `ReadOnlyAccess`

Additional required actions:

- `iam:SimulatePrincipalPolicy`
- `iam:SimulateCustomPolicy`
- `sts:AssumeRole` (if cross-account traversal is needed)

Reference: [PMapper permissions wiki](https://github.com/nccgroup/PMapper/wiki/Permissions)

## 6. Automation role

Create role: `roles/pmapper`

Tasks:
1. `setup`: install deps, create directories, create venv, install `principalmapper`
2. `build_graph`: run `pmapper graph create` (tagged `never`)
3. `run_analysis`: run `pmapper analysis` / query outputs (tagged `never`)
4. `push_report`: publish summary to docs platform (tagged `never`)
5. `run_all`: build -> analyze -> report (tagged `never`)

Playbook target: existing CI runner host.

## 7. Graph persistence and S3 backup

Graph state in `/opt/pmapper/graph/` is local source of truth and is synced to S3 after successful graph builds.

- Bucket: existing security artifacts bucket
- Prefix: `pmapper/graphs/<account-id>/<YYYY-MM-DD>/`
- Retention: 90 days

## 8. First-run checklist

1. Run IAM gap review against required PMapper actions.
2. Deploy setup: `ansible-playbook pmapper.yml --tags setup`
3. Verify install: `... "/opt/pmapper/venv/bin/pmapper --version"`
4. Run graph build and review permission errors.
5. Verify S3 objects land under expected prefix.
6. Run full pipeline: `ansible-playbook pmapper.yml --tags run_all`

## 9. Scheduling

Recommended weekly cadence:

- `build_graph`
- `run_analysis`
- `push_report`

On-demand run:

```bash
ansible-playbook pmapper.yml --tags run_all
```

## 10. Resource considerations

- Disk: typically low (small graph artifacts)
- CPU/RAM: bursty during graph build, idle between runs
- Network: outbound AWS API calls only
- Process model: one-shot execution, no daemon

---
title: "Operations Consulting"
weight: 2
---
# Operations Consulting

I'm an SRE, and I treat infrastructure like software. If you're running production by hand, paying way too much for cloud, or scared to touch anything because nobody's sure what'll break, that's exactly the kind of mess I like to clean up.

This site is a small proof of how I think about it. The content, the AWS infrastructure, and the CI/CD that ships both live in one repo and cost about a dollar a month to run, with no servers to babysit. Anyone can build on AWS. Building it cheap, reliable, and boring to maintain is the actual skill.

## Where I can help

- **Infrastructure as code.** Terraform-managed, PR-locked infrastructure so every change gets reviewed, planned, and is easy to roll back. No more click-ops, no more "who changed this?"
- **Configuration as code.** Ansible-driven fleet management. I've kept hundreds of EC2 boxes consistent and patched this way.
- **CI/CD pipelines.** GitHub Actions that validate, plan, and deploy, with the right approval gates in the right places.
- **Cloud cost optimization.** Keeping the AWS best-practice setup without the AWS-sized bill. I'll find what you're overpaying for and cut it without breaking what works.
- **Reliability and databases.** Production PostgreSQL and Amazon Aurora, container workloads on ECS, and load balancing with whatever fits the job (ALB, Nginx, or Caddy).
- **Killing toil.** The manual, repetitive work that eats your team's week, turned into Python and Bash that just runs.

## How I work

I automate the boring parts and document the rest. Manual processes don't scale, and they don't survive someone quitting. Encoded ones do. I also won't reach for the heaviest tool out of habit. Sometimes the right answer is Caddy instead of an ALB, or a one-shot container instead of a service that runs forever.

Independent consulting work runs through my company, Brooks Security LLC.

Want to talk through your stack? [Get in touch.](/docs/services/contact-me/)

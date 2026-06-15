# X as Code

This section collects some of my configuration-as-code and infrastructure-as-code projects. These are the labs and templates I use to keep my own skills sharp and to stand up throwaway environments fast.

## Local Kubernetes Cluster - Terraform & Ansible
[![GitHub: LittleSeneca/localk8_vpc](https://img.shields.io/badge/GitHub-LittleSeneca%2Flocalk8__vpc-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/localk8_vpc)

This project stands up a local Kubernetes cluster with Terraform, Ansible, HashiCorp Vault, Proxmox, and AWS. It assumes you already have Vault configured, Terraform and Ansible on your deployment machine, and a Proxmox node ready to go.

It is built for a single-host deployment, but the layout makes it easy to spread across as many physical nodes as you want. Start here when you need a real cluster to break things on.

## Digital Ocean RHCE Lab - Terraform & Ansible
[![GitHub: LittleSeneca/digitalocean-rhcelab](https://img.shields.io/badge/GitHub-LittleSeneca%2Fdigitalocean--rhcelab-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/digitalocean-rhcelab)

This one uses Terraform to spin up five VMs as a study lab for the RHCE 8 exam. You get one controller and four workers, one of which has a second disk attached for the storage practice. Once the VMs are up, Ansible runs from your local machine to handle basic networking, install Ansible on the controller, and create an admin login on the four workers that is reachable only from the controller.

It is a cheap, fast way to get a realistic lab running when you are studying. Tear it down when you are finished and you are not paying for idle boxes.

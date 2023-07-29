# X as Code
In this portfolio section, I have provided a currated list of some of my Configuration as Code and Infrastructure as Code projects. 

## Local Kubernetes Cluster - Terraform & Ansible
[github.com/LittleSeneca/localk8_vpc](https://github.com/LittleSeneca/localk8_vpc)

This project aims to provision a local kubernetes cluster, using terraform, ansible, hashicorp vault, proxmox, and aws. This project assumes that you have a hashicorp vault already configured in your environment. We are also assuming that you have terraform and ansible configured on your local deployment machine, and that you have a proxmox node configured. 

This kubernetes cluster is designed for a single host deployment, but can easily be modified to accomodate any number of physical host nodes. 

## Digital Ocean RHCE Lab - Terraform & Ansible
[github.com/LittleSeneca/digitalocean-rhcelab](https://github.com/LittleSeneca/digitalocean-rhcelab)

This cool little tool uses Terraform to spin up 5 VMs for use as a lab for studying the material on the RHCE <= 8 exams. The lab consists of 1 controller and 4 workers, one of which has a second attached hard drive. Once spun up, ansible is dynamically called from your local machine to provision the 5 VMs for basic networking, ansible installation on the controller, and a usable administrator login account for the 4 worker nodes, accessable only from the controller.


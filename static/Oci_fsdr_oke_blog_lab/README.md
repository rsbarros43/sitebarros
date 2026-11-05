# OCI Full Stack Disaster Recovery (FSDR) with Oracle Kubernetes Engine (OKE)

### Enterprise Interactive Training Center

![OCI](https://img.shields.io/badge/Oracle%20Cloud-OCI-red)
![OKE](https://img.shields.io/badge/Kubernetes-OKE-blue)
![FSDR](https://img.shields.io/badge/FSDR-Disaster%20Recovery-green)
![Training](https://img.shields.io/badge/Training-Interactive-success)
![Status](https://img.shields.io/badge/Status-Enterprise-gold)

------------------------------------------------------------------------

# Overview

This project was developed as a complete **Enterprise Interactive
Training Center** focused on:

-   Oracle Cloud Infrastructure (OCI)
-   Oracle Kubernetes Engine (OKE)
-   OCI Full Stack Disaster Recovery (FSDR)
-   Cloud Native Disaster Recovery
-   Kubernetes Administration
-   OCI Load Balancer
-   Persistent Volumes
-   Volume Group Replication
-   Switchover Operations

The objective is to provide a hands-on experience that closely simulates
a real OCI environment through interactive laboratories, architecture
diagrams, runbooks, simulators, troubleshooting scenarios, interviews,
assessments, and certification.

------------------------------------------------------------------------

# Key Features

## Interactive Architecture

Visual architecture including:

-   Primary Region
-   Standby Region
-   OKE Clusters
-   OCI Load Balancer
-   Ingress NGINX
-   Persistent Volumes
-   Volume Groups
-   Object Storage Buckets
-   DR Protection Groups

------------------------------------------------------------------------

## Environment Dashboard

Real-time style dashboard showing:

-   Primary Region Status
-   Standby Region Status
-   OKE Health
-   Load Balancer Status
-   Replication Status
-   Switchover State

------------------------------------------------------------------------

## Interactive Runbook

Complete step-by-step implementation guide:

1.  IAM Configuration
2.  Dynamic Groups
3.  Policies
4.  OKE Deployment
5.  Object Storage
6.  Volume Groups
7.  Ingress NGINX
8.  Ghost Blog Deployment
9.  DR Protection Groups
10. Switchover Plan
11. Validation

------------------------------------------------------------------------

## Kubernetes Terminal Simulator

Interactive terminal supporting:

``` bash
kubectl get nodes
kubectl get pvc
kubectl get svc
kubectl get all

open http://ghost.example.com

execute switchover-plan

show drpg status
show replication status
show volume-group
```

------------------------------------------------------------------------

## Browser Validation Center

Integrated browser simulator allowing validation of:

``` text
http://ghost.example.com

http://ghost.example.com/ghost/

http://loadbalancer.primary

http://loadbalancer.standby
```

------------------------------------------------------------------------

## OCI Console Simulator

Simulated OCI navigation:

``` text
Identity
├── Dynamic Groups
├── Policies

Storage
├── Buckets
├── Volume Groups

OKE
├── Primary Cluster
├── Standby Cluster

Disaster Recovery
├── DR Protection Groups
├── Switchover Plan
```

------------------------------------------------------------------------

## Switchover Timeline

Visual representation of the recovery process:

``` text
Primary Region
      ↓
Volume Replication
      ↓
DR Protection Group
      ↓
Switchover Plan
      ↓
Standby Promotion
      ↓
Application Validation
```

------------------------------------------------------------------------

## Troubleshooting Center

Common real-world scenarios:

-   PVC Pending
-   Pod CrashLoopBackOff
-   Load Balancer Without IP
-   Ingress Not Available
-   Cluster Unreachable
-   Replication Failure

------------------------------------------------------------------------

## Interview Mode

Technical interview preparation:

-   What is FSDR?
-   What is a DR Protection Group?
-   Switchover vs Failover
-   OKE Architecture
-   Volume Group Replication
-   Persistent Volumes
-   OCI Networking

------------------------------------------------------------------------

## Quiz Engine

Features:

-   Student Identification
-   Quiz Lock/Unlock
-   Score Calculation
-   Progress Tracking
-   Certification Validation

------------------------------------------------------------------------

## Certificate Generator

Professional certificate including:

-   Student Name
-   Completion Date
-   Final Score
-   Training Name
-   Instructor Information

------------------------------------------------------------------------

# Learning Objectives

After completing this training, students will understand:

-   OCI Full Stack Disaster Recovery
-   Oracle Kubernetes Engine
-   Cloud Native Disaster Recovery
-   Persistent Storage Management
-   OCI Networking Concepts
-   Ingress Controllers
-   OCI Load Balancers
-   Switchover Operations
-   High Availability Concepts
-   Disaster Recovery Best Practices

------------------------------------------------------------------------

# Laboratory Flow

``` text
IAM Configuration
      ↓
Dynamic Groups
      ↓
Policies
      ↓
OKE Clusters
      ↓
Object Storage
      ↓
Volume Groups
      ↓
Ingress NGINX
      ↓
Ghost Blog
      ↓
DR Protection Groups
      ↓
Switchover Plan
      ↓
Validation
      ↓
Quiz
      ↓
Certificate
```

------------------------------------------------------------------------

# Repository Structure

``` text
oci-fsdr-oke-training-center/
│
├── index.html
├── README.md
│
├── images/
│   ├── architecture.png
│   ├── dashboard.png
│   ├── terminal.png
│   ├── browser.png
│   └── certificate.png
│
├── docs/
└── assets/
```

------------------------------------------------------------------------

# Screenshots

## Architecture Overview

Add screenshot here

------------------------------------------------------------------------

## Environment Dashboard

Add screenshot here

------------------------------------------------------------------------

## Terminal Simulator

Add screenshot here

------------------------------------------------------------------------

## Browser Validation Center

Add screenshot here

------------------------------------------------------------------------

## OCI Console Simulator

Add screenshot here

------------------------------------------------------------------------

## Certificate Center

Add screenshot here

------------------------------------------------------------------------

# Technologies

-   HTML5
-   CSS3
-   JavaScript
-   Oracle Cloud Infrastructure
-   Oracle Kubernetes Engine
-   OCI Full Stack Disaster Recovery
-   Kubernetes
-   NGINX Ingress Controller

------------------------------------------------------------------------

# Project Highlights

-   Interactive Training Center
-   Enterprise User Experience
-   OCI Disaster Recovery Concepts
-   Kubernetes Administration
-   Switchover Simulation
-   Browser Validation
-   Interview Preparation
-   Certification Workflow

------------------------------------------------------------------------

# Conclusion

This project demonstrates how Oracle Cloud Infrastructure Full Stack
Disaster Recovery (FSDR) can be integrated with Oracle Kubernetes Engine
(OKE) to provide a complete disaster recovery solution for containerized
applications.

The training combines architecture, implementation, troubleshooting,
validation, assessment, and certification into a single interactive
learning experience.

It was designed to simulate real-world OCI environments and provide
practical knowledge aligned with enterprise cloud operations.

------------------------------------------------------------------------

# Author

## Renato Barros

Database Engineer Specialist

Specialties:

-   Oracle Database
-   Oracle Exadata
-   Oracle Cloud Infrastructure
-   MySQL
-   PostgreSQL
-   Kubernetes
-   Cloud Architecture
-   Disaster Recovery
-   Performance Engineering

------------------------------------------------------------------------

# License

This project is intended for educational, training, and demonstration
purposes.

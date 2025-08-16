# Product Overview

RepoFlight is an AI-powered compliance and security copilot that continuously audits Git repositories for license compliance, security vulnerabilities, and configuration drift. It integrates with GitHub as both an application and CLI tool, backed by Kiro agent hooks.

## Core Features

- **License Compliance**: Automated scanning for forbidden licenses (GPL, SSPL, etc.)
- **Security Scanning**: SAST, DAST, and container vulnerability detection  
- **Risk Assessment**: Real-time scoring mapped to enterprise frameworks
- **Auto-Remediation**: AI-generated fixes and pull requests
- **Compliance Dashboard**: Visual metrics and reporting with real-time updates

## Architecture

Microservices architecture with:
- Hook Server: Receives GitHub webhooks and orchestrates scans
- License Agent: Scans dependencies for license compliance
- Security Agent: Performs security scanning
- Dashboard: Next.js application for visualization and management
- Database: PostgreSQL with Prisma ORM

## Target Users

Enterprise development teams requiring automated compliance monitoring, security scanning, and remediation workflows integrated into their GitHub repositories.
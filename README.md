# Paediatric Hospital Management System (PHMS)

A comprehensive, AI-enhanced hospital management system specifically designed for paediatric healthcare facilities, integrating patient management, clinical processes, and administrative functions into a unified platform.

## Overview

The Paediatric Hospital Management System addresses the unique challenges of paediatric healthcare by providing specialized tools for managing children's health across different developmental stages. The system combines efficient hospital operations with intelligent assistance features, including growth monitoring and an AI-powered health chatbot.

## Key Features

### Core Hospital Management
- **Patient Registration & Electronic Health Records** - Comprehensive patient management with automatic identifier generation
- **Appointment Scheduling** - Real-time availability tracking with conflict detection and prevention
- **Prescription Management** - Drug allergy checking, interaction detection, and pharmacy integration
- **Laboratory Services** - Age-specific paediatric reference ranges with automatic result flagging
- **Vaccination Tracking** - Aligned with WHO/CDC protocols with automatic due date calculation
- **Growth Monitoring** - WHO percentile calculations with automatic chart generation
- **Role-Based Access Control** - Six distinct user types (administrators, doctors, nurses, pharmacists, lab technicians, parents)
- **Reporting & Analytics** - Operational insights and administrative oversight

### AI-Powered Health Assistant
- **RAG-Based Chatbot** - Retrieval-Augmented Generation methodology for accurate health information
- **Curated Knowledge Base** - Grounded in authoritative sources (WHO, CDC, established medical literature)
- **24/7 Parental Support** - Accessible health information without immediate clinical consultation
- **Natural Language Interaction** - User-friendly conversational interface

### Parent Portal
- Access to children's medical records
- Growth and development tracking
- Vaccination history monitoring
- Appointment scheduling
- Educational health information

## Technology Stack

- **Backend**: Django
- **Frontend**: React
- **Database**: PostgreSQL
- **Deployment**: Docker containerization
- **Architecture**: Three-tier design (presentation, application, data layers)

## Target Users

### Healthcare Providers
- Doctors
- Nurses
- Pharmacists
- Laboratory technicians
- Hospital administrators

### Parents & Caregivers
- Access to child health information
- Growth and vaccination tracking
- AI chatbot assistance

## Problem Statement

Current hospital management systems reveal significant gaps in paediatric healthcare:

- **Lack of age-specific health metrics** tracking and monitoring
- **Inadequate developmental milestone** tracking capabilities
- **Poor management** of specialized vaccination schedules
- **Fragmented health recommendations** across nutrition, vaccinations, and personalized care
- **Manual, error-prone growth tracking** methods that may miss critical anomalies
- **Standalone AI symptom-checkers** not integrated into comprehensive hospital frameworks

## Project Objectives

### 1. Scalable, AI-Enhanced HMS
Design and implement a comprehensive platform that streamlines healthcare delivery and supports data-driven decision-making through:
- Paediatric-specific features (growth monitoring, immunization tracking, age-specific lab ranges)
- Scalable three-tier architecture
- RAG-based chatbot for reliable health information
- Comprehensive reporting and analytics

### 2. Automation & Intelligent Assistance
Reduce administrative burden and improve efficiency through:
- Automatic patient identifier generation
- Appointment conflict detection
- Prescription routing and allergy checking
- Laboratory result flagging and notifications
- Growth percentile calculations
- Vaccination due date determination

### 3. Usability & Adaptability
Ensure practical, user-friendly design that evolves with healthcare needs:
- Intuitive, role-specific interfaces
- Responsive design across devices
- Modular architecture for easy updates
- Well-documented RESTful APIs
- Flexible database schema
- Configurable user roles and permissions

## Significance

### For Healthcare Facilities
- Reduces administrative burden on staff
- Improves clinical workflow efficiency
- Enables data-driven decision-making
- Supports evidence-based healthcare management

### For Parents & Caregivers
- Empowers active participation in children's healthcare
- Provides 24/7 access to reliable health information
- Enables informed decision-making
- Increases transparency and trust

### For the Healthcare Technology Ecosystem
- **Cost-effective solution** leveraging open-source technologies
- **Practical AI application** demonstrating responsible healthcare AI integration
- **Digital transformation catalyst** for paper-based healthcare systems
- **Educational value** for healthcare informatics research

## Target Application Context

- Paediatric departments in general hospitals
- Standalone paediatric healthcare facilities
- Small to medium-sized facilities seeking digital transformation
- Resource-constrained settings requiring cost-effective solutions

## Prerequisites

Ensure you have the following installed on your system:

- **Python** 3.12 or higher
- **Node.js** 20 or higher
- **PostgreSQL** 16
- **Docker** & **Docker Compose**

## Installation Steps

### 1. Clone the Repository

Open your command terminal and navigate to your desired directory, then run:
```bash
git clone https://github.com/haariswaqas/pediatric-hms

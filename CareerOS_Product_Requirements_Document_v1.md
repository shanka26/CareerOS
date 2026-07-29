# CareerOS Product Requirements Document (PRD)

**Version:** 1.0 (MVP Foundation)

# 1. Purpose

This document defines the functional and technical requirements for the
CareerOS MVP.

## Goal

Enable a user to:

1.  Upload an existing resume.
2.  Build a structured Career Profile from that resume.
3.  Import a job by URL or pasted description.
4.  Generate a tailored resume and cover letter.
5.  Track the application through the hiring pipeline.
6.  Continuously improve future applications as the Career Knowledge
    Graph grows.

# 2. Product Scope

## In Scope (MVP)

-   Authentication
-   Resume upload (PDF/DOCX)
-   AI resume parsing
-   Career Profile
-   Career Knowledge Graph
-   Career Twin
-   Resume Library
-   Cover Letter Library
-   Job import (URL + paste)
-   Company and job analysis
-   Tailored resume generation
-   Cover letter generation
-   Application tracker (Kanban)
-   AI assistant
-   Career analytics
-   Explainable AI

## Out of Scope

-   Browser extension
-   Gmail integration
-   Calendar integration
-   Collaboration
-   GitHub analysis
-   Full LinkedIn synchronization
-   Mobile app

# 3. Product Principles

-   Upload-first onboarding
-   AI-first, user-controlled
-   Never fabricate experience
-   Every AI recommendation explains why
-   Every interaction strengthens the Career Knowledge Graph
-   Generated documents are versioned and reproducible

# 4. Core Domains

## Career

Source of truth for professional history.

Entities: - Experience - Projects - Skills - Technologies - Education -
Certifications - Achievements - Preferences - Goals

## Documents

Stores: - Base resumes - Generated resumes - Base cover letters -
Generated cover letters

Every document stores: - Version - Source knowledge snapshot - Model -
Prompt version - Generation timestamp

## Jobs

Stores: - Imported description - Parsed requirements - Company
analysis - Match score - Salary (when available) - Location - Employment
type - Status

## Applications

Pipeline:

-   Saved
-   Tailoring
-   Ready
-   Applied
-   Recruiter Screen
-   Technical Interview
-   Final Interview
-   Offer
-   Rejected
-   Archived

# 5. User Stories

## Resume Upload

As a user, I want to upload my existing resume, so I can start using
CareerOS immediately.

Acceptance Criteria

-   Accept PDF/DOCX
-   Parse within seconds
-   Show extracted information
-   Allow corrections
-   Build initial Career Profile

## Import Job

As a user, I want to import a job by URL or pasted text, so I can tailor
my application.

Acceptance Criteria

-   URL supported
-   Paste supported
-   Parse title, company, requirements
-   Save workspace

## Tailored Resume

As a user, I want AI to compose a new resume from my Career Profile.

Acceptance Criteria

-   Uses verified facts only
-   Explains changes
-   Preserves formatting quality
-   Can export PDF

## Cover Letter

As a user, I want AI to generate a tailored cover letter.

Acceptance Criteria

-   References company
-   References role
-   Uses my verified experience
-   Editable before saving

# 6. Career Twin

Responsibilities:

-   Understand user preferences
-   Coordinate specialist agents
-   Decide best resume strategy
-   Maintain long-term context
-   Never invent facts

# 7. AI Specialist Agents

-   Resume Strategist
-   ATS Optimizer
-   Company Researcher
-   Writing Editor
-   Recruiter Simulator
-   Interview Coach
-   Career Coach
-   Application Manager

# 8. Success Metrics

-   Time to first tailored application \< 5 minutes
-   Resume approval rate
-   Cover letter approval rate
-   Applications tracked
-   Career profile completeness
-   AI suggestion acceptance rate

# 9. Future Expansion

Architecture must support:

-   Browser extension
-   Email parsing
-   Calendar
-   Voice interviews
-   Salary negotiation
-   Offer comparison
-   Career growth mode

# Appendix

Subsequent documents will define:

-   Database schema
-   API specification
-   Next.js architecture
-   AI orchestration
-   Prompt architecture
-   Security
-   UX specification

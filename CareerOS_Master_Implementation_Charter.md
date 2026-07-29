# CareerOS Master Implementation Charter

## Purpose

This document instructs the implementation agent (Codex) how to build
CareerOS using the accompanying project documentation.

## Source of Truth

When requirements conflict, use this priority:

1.  Product Requirements Document (PRD)
2.  Database Schema
3.  Vision & Product Strategy

If something is ambiguous, make the smallest reasonable assumption,
document it, and continue.

## Mission

CareerOS is **not** a resume builder.

CareerOS is an **AI Career Operating System**.

The user's career---not their resume---is the source of truth. Resumes,
cover letters, interview preparation, and other artifacts are generated
from structured career knowledge.

## Core Principles

-   Upload-first onboarding
-   AI-first, user-controlled
-   Never fabricate experience
-   Explain every AI recommendation
-   Every interaction strengthens the Career Knowledge Graph
-   Generated documents are outputs, not the source of truth

## Required Technology

### Frontend

-   Next.js (App Router)
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   React Hook Form
-   TanStack Query

### Backend

-   Next.js Route Handlers
-   PostgreSQL
-   Prisma ORM
-   pgvector
-   Zod

### Authentication

-   Better Auth
-   Google OAuth
-   Email/password

### AI

-   OpenAI Responses API (primary)
-   Architecture ready for Gemini later

## Architecture

Use Domain Driven Design.

Organize by domains:

-   career
-   documents
-   jobs
-   applications
-   assistant
-   analytics
-   settings
-   shared

Each domain owns its UI, services, API routes, validation, database
access, and business logic.

## AI

Implement an orchestration layer with specialized capabilities rather
than one large prompt.

Examples:

-   Analyze Resume
-   Analyze Job
-   Generate Resume
-   Generate Cover Letter
-   Research Company
-   Calculate Match Score
-   Update Career Knowledge
-   Generate Interview Prep

The user interacts with one assistant while specialist agents
collaborate behind the scenes.

## Development Process

Do **not** build everything at once.

Work through these milestones sequentially:

1.  Project foundation
2.  Authentication
3.  Database
4.  Career Profile
5.  Document Library
6.  AI Foundation
7.  Job Workspace
8.  Resume Composer
9.  Cover Letter Composer
10. Application CRM
11. Analytics
12. Polish

For every milestone:

1.  Explain the objective.
2.  Identify dependencies.
3.  Implement.
4.  Test.
5.  Refactor.
6.  Verify acceptance criteria.
7.  Ensure the application builds successfully.
8.  Commit before moving to the next milestone.

Never skip milestones.

## Definition of Done

A user can:

-   Create an account
-   Upload a resume
-   Build a Career Profile
-   Import a job
-   Generate a tailored resume
-   Generate a tailored cover letter
-   Track the application
-   Receive explainable AI recommendations

Build CareerOS as a long-term software platform, not a demo application.

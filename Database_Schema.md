# Database Schema

**CareerOS v1.0**

# Overview

CareerOS stores structured career knowledge instead of treating resumes
as the source of truth.

## Design Principles

-   Normalize factual career data.
-   Version all generated artifacts.
-   Preserve history.
-   Never overwrite user-provided facts.
-   AI suggestions require approval before becoming verified.

# Core Entities

## User

-   id
-   email
-   name
-   avatar_url
-   created_at
-   updated_at

Relationships: - One Career Profile - Many Jobs - Many Applications -
Many Documents

------------------------------------------------------------------------

## CareerProfile

-   id
-   user_id
-   headline
-   summary
-   target_role
-   preferred_locations
-   remote_preference
-   salary_expectation
-   created_at
-   updated_at

------------------------------------------------------------------------

## Experience

-   id
-   career_profile_id
-   company
-   title
-   start_date
-   end_date
-   current
-   description
-   verified

------------------------------------------------------------------------

## Project

-   id
-   career_profile_id
-   name
-   description
-   impact
-   technologies

------------------------------------------------------------------------

## Skill

-   id
-   name
-   category

## CareerSkill

Join table:

-   career_profile_id
-   skill_id
-   proficiency
-   confidence

------------------------------------------------------------------------

## Achievement

-   id
-   experience_id
-   metric
-   description
-   quantified
-   verified

------------------------------------------------------------------------

## Education

-   id
-   school
-   degree
-   field
-   graduation_date

------------------------------------------------------------------------

## Certification

-   id
-   name
-   issuer
-   issue_date
-   expiration_date

------------------------------------------------------------------------

# Documents

## Document

Stores every resume and cover letter.

Fields

-   id
-   owner_id
-   type
-   status
-   title
-   markdown
-   html
-   pdf_path
-   created_at

Types

-   Base Resume
-   Generated Resume
-   Base Cover Letter
-   Generated Cover Letter

------------------------------------------------------------------------

## DocumentVersion

-   id
-   document_id
-   version
-   ai_model
-   prompt_version
-   knowledge_snapshot
-   created_at

------------------------------------------------------------------------

# Jobs

## JobPosting

-   id
-   owner_id
-   source
-   url
-   company
-   title
-   location
-   description
-   parsed_requirements
-   salary
-   imported_at

------------------------------------------------------------------------

## Company

-   id
-   name
-   industry
-   website
-   mission
-   values
-   notes

------------------------------------------------------------------------

# Applications

## Application

-   id
-   user_id
-   job_id
-   resume_document_id
-   cover_letter_document_id
-   status
-   applied_date
-   last_updated

Status values

-   Saved
-   Tailoring
-   Ready
-   Applied
-   Recruiter Screen
-   Technical
-   Final
-   Offer
-   Rejected
-   Archived

------------------------------------------------------------------------

## TimelineEvent

Stores history.

Fields

-   id
-   application_id
-   type
-   title
-   notes
-   occurred_at

------------------------------------------------------------------------

# AI

## MemorySuggestion

Potential facts requiring approval.

-   id
-   user_id
-   source
-   confidence
-   proposed_fact
-   status

Status

-   Pending
-   Accepted
-   Rejected

------------------------------------------------------------------------

## KnowledgeSnapshot

Immutable snapshot used when generating AI artifacts.

-   id
-   user_id
-   created_at
-   checksum

------------------------------------------------------------------------

## GenerationLog

Every AI generation.

Fields

-   id
-   model
-   action
-   input_snapshot
-   output_document
-   duration_ms
-   success

------------------------------------------------------------------------

# Analytics

## CareerMetric

-   applications
-   interviews
-   offers
-   response_rate
-   interview_rate
-   offer_rate

------------------------------------------------------------------------

# Future Tables

Reserved for later phases.

-   browser_saved_jobs
-   email_threads
-   calendar_events
-   interview_questions
-   offer_comparisons
-   salary_history
-   networking_contacts
-   learning_goals

# Schema Rules

1.  Facts are immutable until edited by the user.
2.  AI suggestions are never promoted automatically.
3.  Every generated document references a Knowledge Snapshot.
4.  Every application references the exact submitted resume and cover
    letter.
5.  Documents are generated outputs, never the primary source of truth.

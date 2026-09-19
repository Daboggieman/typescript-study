# Skill Router

This file is the compact routing index for the project's 31 engineering
skills.

Do not load every skill for every task.

First classify the task, then load the smallest set of relevant skills.

---

# Routing Rules

## Universal Skills

Use these when appropriate:

- planning — non-trivial feature or change
- verification — final verification
- debugging — unexpected behavior or failure
- research — uncertain external or technical behavior
- code-quality — meaningful code changes
- code-review — final review when useful

---

# Architecture

Triggers:

- architecture
- system design
- module boundaries
- service boundaries
- major refactor
- new subsystem
- cross-layer feature

Load:

- architecture
- planning

Then load the relevant domain skills.

---

# Frontend

Triggers:

- page
- screen
- component
- UI
- form
- navigation
- dashboard
- modal
- button
- layout
- responsive design
- browser behavior

Load:

- frontend
- ui-ux
- accessibility

Usually also:

- e2e-testing
- api-design

If authentication is involved:

- authentication

If permissions are involved:

- authorization

---

# Backend

Triggers:

- FastAPI
- Python backend
- service
- business logic
- background task
- API implementation
- server-side logic

Load:

- backend
- api-design
- error-handling

Usually also:

- api-testing
- testing

If database access changes:

- database

If authentication changes:

- authentication
- security

If permissions change:

- authorization
- security

---

# API

Triggers:

- endpoint
- route
- REST API
- request
- response
- schema
- pagination
- filtering
- API contract

Load:

- api-design
- backend
- api-testing
- error-handling

If protected:

- authentication
- authorization
- security

---

# Database

Triggers:

- database
- PostgreSQL
- SQLAlchemy
- table
- column
- relationship
- foreign key
- index
- query
- ORM

Load:

- database
- backend

If schema changes:

- migrations

If performance-related:

- performance
- performance-testing

---

# Migrations

Triggers:

- migration
- Alembic
- schema change
- alter table
- database upgrade
- database downgrade

Load:

- migrations
- database

Also load:

- backend

when application models or behavior change.

---

# Authentication

Triggers:

- login
- logout
- registration
- signup
- password
- password reset
- JWT
- token
- session
- account verification
- identity

Load:

- authentication
- security

Usually also:

- backend
- frontend
- api-design
- api-testing
- e2e-testing

---

# Authorization

Triggers:

- permission
- role
- access control
- admin access
- ownership
- protected resource
- user permissions
- privilege

Load:

- authorization
- authentication
- security

Usually also:

- backend
- api-testing

---

# Security

Triggers:

- security
- vulnerability
- secret
- credential
- password
- token
- injection
- permission bypass
- data exposure
- upload security
- authorization bypass

Load:

- security

Then load the relevant domain skill.

Security-sensitive changes should also receive verification.

---

# Accessibility

Triggers:

- accessibility
- keyboard navigation
- screen reader
- ARIA
- focus
- labels
- semantic HTML
- accessible form
- contrast

Load:

- accessibility
- frontend

Usually:

- ui-ux

---

# UI/UX

Triggers:

- design
- layout
- visual
- user experience
- interaction
- animation
- spacing
- typography
- mobile UI
- responsive UI

Load:

- ui-ux
- frontend

Also:

- accessibility

for user-facing interactions.

---

# Performance

Triggers:

- slow
- latency
- memory
- CPU
- rendering performance
- bundle size
- optimization
- bottleneck
- N+1
- caching

Load:

- performance
- debugging

Then load the relevant domain:

- frontend
- backend
- database

For measured benchmarking:

- performance-testing

---

# Error Handling

Triggers:

- error
- exception
- failure response
- 500
- validation error
- crash
- retry
- error boundary

Load:

- error-handling
- debugging

Then load the relevant domain.

---

# Observability

Triggers:

- logging
- metrics
- tracing
- monitoring
- health check
- production diagnostics
- telemetry
- incident investigation

Load:

- observability

Usually:

- debugging

For deployment incidents:

- deployment
- devops

---

# Deployment

Triggers:

- deploy
- production
- release
- hosting
- environment variables
- production configuration
- deployment failure

Load:

- deployment
- devops
- verification

Also load:

- migrations

if database schema changes.

Also:

- observability

for production verification.

---

# DevOps

Triggers:

- CI
- CD
- GitHub Actions
- automation
- infrastructure
- Docker
- environment setup
- build pipeline

Load:

- devops
- deployment

Usually:

- github
- verification

---

# Dependencies

Triggers:

- npm package
- pip package
- dependency
- package update
- package removal
- lockfile
- version conflict
- dependency vulnerability

Load:

- dependency-management

Usually:

- security
- testing

---

# Refactoring

Triggers:

- refactor
- restructure
- cleanup
- extract
- reorganize
- duplicate code
- simplify architecture

Load:

- refactoring
- code-quality

Usually:

- architecture
- testing
- verification

Do not combine unrelated feature work with a refactor unless necessary.

---

# Code Quality

Triggers:

- code quality
- readability
- maintainability
- lint
- type safety
- cleanup
- dead code

Load:

- code-quality

Usually:

- testing
- verification

---

# Testing

Triggers:

- test
- testing
- regression
- test failure
- coverage
- fixture
- mock

Load:

- testing

Then load the relevant domain testing skill.

---

# API Testing

Triggers:

- API test
- endpoint test
- HTTP test
- request/response test
- FastAPI test

Load:

- api-testing
- testing

Usually:

- backend
- api-design

---

# E2E Testing

Triggers:

- E2E
- end-to-end
- browser test
- user journey
- complete workflow
- Playwright test

Load:

- e2e-testing
- testing

Usually:

- frontend
- accessibility

Use Playwright for actual browser verification.

---

# Performance Testing

Triggers:

- load test
- stress test
- benchmark
- throughput
- latency measurement
- performance benchmark

Load:

- performance-testing
- performance

Then load the relevant domain.

---

# Git

Triggers:

- branch
- commit
- merge
- rebase
- cherry-pick
- conflict
- stash
- diff
- reset
- push
- pull

Load:

- git

For GitHub operations also load:

- github

Never perform destructive Git operations without understanding the current
working tree and branch state.

---

# GitHub

Triggers:

- GitHub
- pull request
- PR
- issue
- repository
- Actions
- workflow
- release
- remote branch

Load:

- github

Usually:

- git
- verification

Use GitHub CLI when appropriate.

---

# Documentation

Triggers:

- README
- documentation
- technical docs
- API docs
- architecture docs
- comments
- guides

Load:

- documentation
- research
- verification

---

# Research

Triggers:

- investigate
- research
- current documentation
- unfamiliar library
- unfamiliar API
- version behavior
- external service

Load:

- research

Use:

- Context7 for library/framework documentation
- Fetch for official/public web resources
- Filesystem for repository evidence

---

# Verification

Triggers:

- verify
- validate
- confirm
- regression
- final check
- does it work

Load:

- verification

Then load the domain-specific verification skills.

---

# Debugging

Triggers:

- broken
- bug
- failure
- exception
- unexpected behavior
- crash
- doesn't work
- not working
- regression

Load:

- debugging
- verification

Then identify the affected domain.

---

# Compound Task Routing

Some tasks require several domains.

## Login Feature

Load:

- planning
- architecture
- frontend
- backend
- authentication
- security
- api-design
- api-testing
- e2e-testing
- accessibility
- verification

---

## Customer Registration

Load:

- planning
- frontend
- backend
- authentication
- security
- api-design
- api-testing
- e2e-testing
- accessibility
- verification

---

## Admin Dashboard

Load:

- planning
- frontend
- backend
- ui-ux
- accessibility
- authorization
- authentication
- api-design
- api-testing
- e2e-testing
- security
- verification

---

## New Database Feature

Load:

- planning
- architecture
- database
- migrations
- backend
- api-design
- api-testing
- verification

---

## Production Bug

Load:

- debugging
- observability
- relevant domain skill
- testing
- verification

Add:

- deployment

if deployment/environment related.

Add:

- security

if security-sensitive.

---

## Slow API

Load:

- debugging
- performance
- backend
- api-testing
- database

if database evidence indicates involvement.

For benchmarking:

- performance-testing

---

## Slow Page

Load:

- debugging
- performance
- frontend
- ui-ux

For browser measurements:

- performance-testing

---

## Security Bug

Load:

- debugging
- security
- relevant domain skill
- testing
- verification

Add:

- authentication

for identity problems.

Add:

- authorization

for permission problems.

---

## Deployment Failure

Load:

- debugging
- deployment
- devops
- observability
- verification

Add:

- github

if CI/CD is involved.

---
# Evidence Classification Discipline

Evidence labels must describe the strength of the evidence, not the confidence
of the agent.

VERIFIED:
A claim is directly demonstrated by executable behavior, tests, or an exact
repository artifact that establishes the claim.

OBSERVED:
A fact is directly visible in source, configuration, filesystem state, or
documentation, but does not establish runtime behavior.

INFERRED:
A conclusion logically derived from VERIFIED or OBSERVED evidence.

UNKNOWN:
The inspected evidence is insufficient to establish the claim.

Never use VERIFIED merely because:
- a dependency is installed
- a directory exists
- documentation says something should exist
- a file contains a related implementation
- no match was found in a limited search

Absence claims must state the inspected scope.
---

## Evidence Classification Rules

VERIFIED
Directly established by executable behavior, tests, or an exact repository
artifact that proves the claim.

OBSERVED
Directly visible in source, configuration, filesystem state, or documentation,
but does not by itself establish runtime behavior.

INFERRED
A conclusion derived from verified or observed evidence.

UNKNOWN
The inspected evidence is insufficient to establish the claim.

Important:
- A dependency being installed does not prove it is used.
- Documentation does not prove implementation.
- A directory existing does not prove it contains or executes the expected system.
- Absence claims must state their inspection scope.
- "Not found" is not automatically equivalent to "does not exist."
- Contradictions between documentation and implementation must be explicitly
  recorded.
- When documentation and implementation disagree, do not silently choose one.
  Record the conflict and resolve it during planning.
- Runtime evidence has higher priority than static inspection.
- Static inspection has higher priority than documentation.
---

# Skill Selection Principle

Prefer:

1. Directly relevant skill
2. Supporting domain skill
3. Testing skill
4. Verification skill

Avoid loading unrelated skills.

More instructions do not automatically produce better results.

The objective is:

RELEVANT CONTEXT
+
STRONG EVIDENCE
+
SMALL CHANGE
+
REAL VERIFICATION
---

# Skill Selection Principle

Prefer:

1. Directly relevant skill
2. Supporting domain skill
3. Testing skill
4. Verification skill

Avoid loading unrelated skills.

More instructions do not automatically produce better results.

The objective is:

RELEVANT CONTEXT
+
STRONG EVIDENCE
+
SMALL CHANGE
+
REAL VERIFICATION

---

# Final Routing Rule

When uncertain which skill applies:

1. Inspect the task.
2. Identify the affected system layer.
3. Select the domain skill.
4. Add testing.
5. Add verification.
6. Add security when trust boundaries or sensitive data are involved.
7. Add research when behavior is uncertain.

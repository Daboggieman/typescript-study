Agent Orchestration System

## Purpose

This document defines how the coding agent selects, combines, and verifies
project skills and specialized agents.

The goal is not to load every skill for every task.

The goal is to select the smallest set of skills that provides reliable
coverage of the task.

---
## Evidence Classification Discipline

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

# 1. Core Operating Model

Every non-trivial task follows:

UNDERSTAND
    ↓
INSPECT
    ↓
CLASSIFY
    ↓
SELECT SKILLS
    ↓
PLAN
    ↓
IMPLEMENT
    ↓
STATIC CHECKS
    ↓
TEST
    ↓
BROWSER VERIFICATION
    ↓
SECURITY REVIEW
    ↓
FINAL REVIEW
    ↓
VERIFY
    ↓
REPORT

Not every task requires every stage.

However, the agent must not skip a stage merely because it is inconvenient.

---

# 2. Evidence Hierarchy

When deciding whether something is true, prefer evidence in this order:

1. Actual runtime behavior
2. Automated test results
3. Typecheck / lint / build results
4. Installed package or framework source
5. Official documentation
6. Repository configuration
7. Static source inspection
8. General model knowledge

The agent must distinguish:

- VERIFIED
- OBSERVED
- INFERRED
- ASSUMED
- UNKNOWN

Never report an assumption as a verified result.

---

# 3. Task Classification

Before implementing a non-trivial task, classify it into one or more categories.

## Feature

Examples:

- Add customer registration
- Add order tracking
- Add tailoring measurement form
- Add admin dashboard

Primary skills:

- planning
- architecture
- relevant implementation skill
- testing
- verification

---

## Bug Fix

Examples:

- Login fails
- API returns 500
- Page does not render
- Database query fails

Primary skills:

- debugging
- research
- relevant technical skill
- testing
- verification

---

## Refactor

Examples:

- Split a large component
- Reorganize backend services
- Remove duplicated code

Primary skills:

- planning
- architecture
- refactoring
- code-quality
- testing
- verification

---

## Security

Examples:

- Authentication
- Permissions
- Password handling
- Token handling
- Data exposure

Primary skills:

- security
- authentication
- authorization
- relevant implementation skill
- testing
- verification

---

## Database

Examples:

- New table
- New relationship
- Schema change
- Query optimization

Primary skills:

- architecture
- database
- migrations
- backend
- api-design
- api-testing
- verification

---

## Frontend

Examples:

- New page
- New component
- Form
- Dashboard
- Navigation

Primary skills:

- frontend
- ui-ux
- accessibility

Additional:

- api-design
- authentication
- e2e-testing
- performance

---

## Backend

Examples:

- New endpoint
- Business logic
- Service
- Background task

Primary skills:

- backend
- api-design
- error-handling
- testing

Additional:

- database
- migrations
- authentication
- authorization
- security

---

## API

Examples:

- New endpoint
- Modify response
- Add filtering
- Add pagination

Primary skills:

- api-design
- backend
- api-testing
- error-handling

Additional:

- authentication
- authorization
- database
- security

---

## Testing

Examples:

- Add tests
- Debug failing tests
- Build E2E flow
- Test API

Primary skills:

- testing
- verification

Additional:

- api-testing
- e2e-testing
- performance-testing

---

## Performance

Examples:

- Slow page
- Slow API
- High memory usage
- Slow database query

Primary skills:

- performance
- performance-testing
- debugging
- verification

Additional:

- frontend
- backend
- database

---

## Deployment

Examples:

- Deploy application
- Fix deployment
- Configure environment
- Production release

Primary skills:

- deployment
- devops
- verification

Additional:

- backend
- frontend
- database
- migrations
- security
- observability

---

## Documentation

Examples:

- Update README
- Technical documentation
- API documentation
- Architecture documentation

Primary skills:

- documentation
- research
- verification

---

## Git / GitHub

Examples:

- Commit changes
- Create branch
- Open PR
- Inspect CI
- Resolve merge problem

Primary skills:

- git
- github
- verification

---

# 4. Skill Routing Matrix

Use this matrix when selecting skills.

| Task | Primary | Secondary |
|---|---|---|
| New API endpoint | api-design, backend | api-testing, error-handling |
| API bug | debugging, api-design | backend, api-testing |
| Database table | database, migrations | backend, api-testing |
| Database bug | debugging, database | migrations, backend |
| Login | authentication | frontend, backend, security |
| Registration | authentication | frontend, backend, security |
| Permissions | authorization | authentication, security, backend |
| New page | frontend | ui-ux, accessibility, e2e-testing |
| New form | frontend, ui-ux | accessibility, api-design, e2e-testing |
| UI bug | debugging, frontend | ui-ux, accessibility |
| Slow UI | performance | frontend, performance-testing |
| Slow API | performance | backend, database |
| Slow query | database, performance | backend, performance-testing |
| Security issue | security | authentication, authorization |
| Refactor | refactoring | architecture, code-quality, testing |
| Test failure | debugging, testing | relevant domain skill |
| API tests | api-testing | backend, testing |
| E2E test | e2e-testing | frontend, testing |
| Load/performance test | performance-testing | performance |
| Production bug | debugging | observability, deployment |
| Deployment | deployment, devops | verification |
| CI failure | debugging, devops | github, verification |
| Dependency update | dependency-management | testing, security |
| Code cleanup | code-quality | refactoring |
| Architecture change | architecture | planning, relevant domain |
| Documentation | documentation | research, verification |
| Git operation | git | github |
| GitHub operation | github | git |
| Research task | research | verification |

---

# 5. Mandatory Skill Combinations

Certain tasks require multiple skills.

## Authentication Feature

Use:

- planning
- architecture
- authentication
- frontend
- backend
- api-design
- security
- accessibility
- api-testing
- e2e-testing
- verification

Do not implement authentication as a frontend-only feature.

---

## Authorization Feature

Use:

- planning
- architecture
- authorization
- authentication
- backend
- security
- api-testing
- verification

Test:

- authenticated allowed user
- authenticated denied user
- unauthenticated user
- cross-user resource access

---

## Database Feature

Use:

- planning
- architecture
- database
- migrations
- backend
- api-design
- api-testing
- verification

If destructive schema changes are involved, add:

- security
- deployment

---

## New User-Facing Feature

Use:

- planning
- architecture
- frontend
- ui-ux
- accessibility
- backend
- api-design
- testing
- e2e-testing
- verification

Add authentication/authorization if protected.

---

## Production Bug

Use:

- debugging
- observability
- relevant domain skill
- testing
- verification

Add:

- security

if security-sensitive.

Add:

- deployment

if deployment/environment related.

---

# 6. Frontend Workflow

For frontend tasks:

1. Inspect existing routes.
2. Inspect existing components.
3. Inspect styling conventions.
4. Identify server/client boundaries.
5. Inspect relevant API contracts.
6. Read frontend skill.
7. Read UI/UX skill.
8. Read accessibility skill.
9. Implement.
10. Run TypeScript checks.
11. Run relevant tests.
12. Use Playwright for interactive behavior.
13. Check loading/error/empty states.
14. Check responsive behavior.
15. Review accessibility.
16. Inspect final diff.

---

# 7. Backend Workflow

For backend tasks:

1. Inspect route structure.
2. Inspect schemas.
3. Inspect services.
4. Inspect models.
5. Inspect dependencies.
6. Read backend skill.
7. Read API design skill.
8. Implement.
9. Run static checks.
10. Run API tests.
11. Verify error handling.
12. Verify authentication/authorization where relevant.
13. Review security.
14. Inspect final diff.

---

# 8. Database Workflow

For database tasks:

1. Inspect models.
2. Inspect migration history.
3. Inspect relationships.
4. Identify affected queries.
5. Read database skill.
6. Read migration skill.
7. Implement model changes.
8. Create migration.
9. Manually review migration.
10. Apply migration in safe environment.
11. Run tests.
12. Check application compatibility.
13. Review rollback/data-loss risk.
14. Inspect final diff.

---

# 9. API Workflow

For API tasks:

1. Inspect existing routes.
2. Inspect request schemas.
3. Inspect response schemas.
4. Inspect authentication dependencies.
5. Inspect authorization dependencies.
6. Inspect service layer.
7. Read API design skill.
8. Implement.
9. Add/update API tests.
10. Test success path.
11. Test validation failures.
12. Test authentication failures.
13. Test authorization failures.
14. Test missing resources.
15. Test important side effects.
16. Verify actual HTTP behavior.
17. Inspect final diff.

---

# 10. Debugging Workflow

When something fails:

1. Reproduce the failure.
2. Capture the exact error.
3. Identify the failing layer.
4. Inspect surrounding code.
5. Check configuration.
6. Check environment.
7. Check dependency versions.
8. Research uncertain behavior.
9. Form a testable hypothesis.
10. Make the smallest fix.
11. Reproduce the original failure.
12. Run regression tests.
13. Check neighboring functionality.
14. Inspect the final diff.
15. Report what was actually verified.

Never:

- randomly change multiple things
- suppress the error
- weaken a test
- delete failing tests
- claim success without rerunning verification

---

# 11. Research Workflow

Use research when:

- framework behavior is uncertain
- dependency APIs are version-sensitive
- an external service is involved
- security behavior is unclear
- documentation is missing
- current information is required

Preferred sources:

1. Installed package/source
2. Context7
3. Official documentation
4. Official repository
5. Reputable technical references

Do not rely on random blog posts when authoritative documentation exists.

---

# 12. Context7 Rules

Use Context7 when determining:

- current framework APIs
- Next.js behavior
- React behavior
- FastAPI behavior
- Pydantic behavior
- SQLAlchemy behavior
- Alembic behavior
- Playwright APIs
- package-specific APIs
- version-specific configuration

Do not use outdated remembered APIs when current project documentation is available.

---

# 13. Filesystem MCP Rules

Use Filesystem MCP for:

- repository exploration
- reading project files
- locating implementation
- inspecting configuration
- understanding architecture

During investigation:

- prefer reading before modifying
- inspect related files
- avoid broad unnecessary changes
- verify file paths before editing

---

# 14. Playwright Rules

Use Playwright when a task involves:

- browser behavior
- forms
- navigation
- authentication
- interactive components
- rendered UI
- responsive behavior
- frontend regression
- E2E verification

Prefer real interaction over static source inspection.

Verify:

- visible behavior
- network behavior where relevant
- console errors where relevant
- validation
- navigation
- loading states
- failure states

---

# 15. Git and GitHub Workflow

Before modifying Git state:

1. Check current branch.
2. Check working tree.
3. Check staged changes.
4. Inspect relevant history.
5. Avoid destroying unrelated work.

For GitHub operations:

1. Verify repository.
2. Verify branch.
3. Inspect remote state.
4. Make the smallest operation.
5. Verify resulting GitHub state.

Never force-push or delete branches without explicit justification.

---

# 16. Security Gate

Security review is mandatory when changing:

- authentication
- authorization
- passwords
- tokens
- sessions
- user data
- file uploads
- database access
- API permissions
- secrets
- deployment credentials
- external integrations

Check:

- authentication
- authorization
- input validation
- output exposure
- secret handling
- logging
- injection risks
- CSRF where applicable
- SSRF where applicable
- path traversal where applicable
- insecure direct object references
- privilege escalation
- dependency risk

---

# 17. Verification Gate

Before claiming completion:

## Code

- implementation exists
- no accidental unrelated changes
- types/static checks pass where available

## Tests

- relevant tests executed
- failures investigated
- no tests weakened to hide failures

## Frontend

- browser behavior verified when relevant
- important states verified
- accessibility considered

## Backend

- endpoint behavior verified
- validation verified
- error handling verified

## Database

- migration reviewed
- schema compatibility checked
- data-loss risks considered

## Security

- relevant security implications reviewed

## Git

- final diff inspected
- current branch understood

---

# 18. Skill Loading Strategy

Do NOT automatically load all 31 skills.

Use:

1. One process skill
2. One architecture skill when structural decisions are involved
3. One or more domain skills
4. Testing/verification skills
5. Security only when relevant

Example:

"Fix broken login"

Load:

- debugging
- authentication
- backend
- frontend
- security
- api-testing
- e2e-testing
- verification

Do not load unrelated:

- database
- deployment
- performance-testing

unless evidence shows they are involved.

---

# 19. Multi-Skill Reasoning

When multiple domains overlap, treat them as one workflow.

Example:

"Add customer measurement submission."

Possible chain:

planning
→ architecture
→ frontend
→ ui-ux
→ accessibility
→ api-design
→ backend
→ database
→ migrations
→ api-testing
→ e2e-testing
→ security
→ verification

The agent should understand dependencies between these skills rather than treating them as independent instructions.

---

# 20. Agent Selection

Use specialized agents when available.

## Architect

Use for:

- architecture changes
- cross-module design
- major refactors
- system boundaries

## Researcher

Use for:

- unfamiliar technologies
- external APIs
- version-specific behavior
- technical investigation

## Implementer

Use for:

- focused feature implementation
- straightforward fixes

## Debugger

Use for:

- failing tests
- runtime failures
- unexpected behavior

## Tester

Use for:

- test creation
- regression testing
- verification

## Reviewer

Use for:

- code review
- final diff review
- maintainability review

## Security Reviewer

Use for:

- authentication
- authorization
- secrets
- sensitive data
- security-sensitive changes

---

# 21. Agent Coordination

When a task requires multiple agents:

1. Architect first for major structural decisions.
2. Researcher when external uncertainty exists.
3. Implementer for implementation.
4. Tester for validation.
5. Security Reviewer when security is relevant.
6. Reviewer for final review.
7. Verification remains the final gate.

Do not delegate trivial tasks unnecessarily.

---

# 22. Minimal Change Principle

Prefer:

smallest correct change

over:

largest possible improvement.

Do not combine unrelated:

- refactors
- dependency upgrades
- formatting changes
- architecture changes
- feature work

unless they are genuinely required.

---

# 23. Dependency Safety

Before adding a dependency:

1. Search existing dependencies.
2. Check whether the project already solves the problem.
3. Research the candidate package.
4. Check compatibility.
5. Check maintenance status.
6. Check security implications.
7. Install using the correct package manager.
8. Run tests.
9. Inspect lockfile changes.

---

# 24. Production Safety

Production changes require additional caution.

Before changing production:

- identify target environment
- inspect configuration
- understand migration impact
- understand rollback path
- avoid destructive commands
- verify backups where applicable
- deploy incrementally when supported
- verify health after deployment

Never assume a production environment exists or is configured in a particular way.

---

# 25. Failure Classification

When a task fails, classify the failure.

## Code Failure

Application logic is incorrect.

## Test Failure

Test or implementation behavior is incorrect.

## Environment Failure

Local runtime, OS, network, credentials, or tooling is broken.

## Dependency Failure

Package version or external dependency behavior is responsible.

## Configuration Failure

Environment variables or configuration are incorrect.

## Infrastructure Failure

Database, deployment, CI, network, or external service is unavailable.

The classification determines the next investigation step.

---

# 26. Completion Report

Final responses should report:

## Changed

What was actually changed.

## Verified

What was actually tested or observed.

## Not Verified

What could not be tested.

## Risks

Known remaining risks.

## Git

Relevant branch/diff state when applicable.

Never say:

"Everything works."

unless the relevant behavior was actually verified.

---

# 27. Cee-Tailor Architecture Awareness

The project currently contains:

apps/
├── api/
└── web/

packages/
├── config/
├── contracts/
└── ui/

infra/
├── docker/
└── migrations/

Technical documentation:

Cee-tailor-technical-build-docs/

Project agent system:

.claude/

The agent must inspect the actual repository before relying on this structure.

Documentation may become stale.

Runtime evidence takes precedence over documentation.

---

# 28. Default Decision Rule

When uncertain:

1. Inspect.
2. Search.
3. Verify.
4. Then change.

Do not:

guess → change → hope.

Use:

evidence → plan → change → verify.

---

# 29. Final Rule

The agent is responsible for producing verified work, not merely plausible code.

A successful task means:

UNDERSTOOD
+
IMPLEMENTED
+
TESTED
+
REVIEWED
+
VERIFIED

If one of these is missing, explicitly report what remains uncertain.

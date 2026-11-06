**PRODUCT REQUIREMENTS DOCUMENT**

Smart Board  
Project Command Centre

A 75-inch, Chrome-first project command centre with cloud persistence, no in-app logins and configurable task urgency.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DESIGN INTENT</strong></p>
<p>An elegant shared operational display that makes ownership, progress and urgency immediately understandable from across a room—not a dense desktop project tracker.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **DOCUMENT STATUS** | **DETAIL**                                                                                              |
|---------------------|---------------------------------------------------------------------------------------------------------|
| **Version**         | 0.2 — six owner decisions incorporated; remaining details identified as open                            |
| **Date**            | 6 November 2026                                                                                         |
| **Audience**        | Project owner, UI/UX designer, AI coding agent and implementing developer                               |
| **Scope**           | Functional requirements, touch UX, visual system, engineering options, agent workflow, acceptance tests |
| **Sign-off**        | Approved scope baseline for prototyping; deployment-access details still open                           |

## Reading guide

“Must” means a first-release requirement. “Should” means strongly recommended. “Optional” is out of MVP unless selected. Confirmed choices are marked CONFIRMED; unresolved owner choices are marked OPEN. Quantitative UI values remain design recommendations pending testing on the physical panel.

Evidence references \[R1–R16\] distinguish published accessibility/design guidance from design proposals. Numeric UI settings described as “recommended” are project heuristics and must be validated on the actual smart board.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>OWNER DECISIONS CONFIRMED — 6 NOVEMBER 2026</strong></p>
<p>Single 75-inch smart board running Google Chrome; online/cloud data storage; fewer than 20 projects expected (not a hard maximum); task-specific deadline warning window; due DATE AND TIME required; task statuses: Not started, In progress, Blocked and Completed.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 1. Executive summary and research conclusions

The product is a full-screen shared project board. A category has a responsible person and contains projects; each project has a responsible person and contains time-bound tasks; each task also has a responsible person. Categories and projects can be added, edited and removed. Deadline proximity becomes visually apparent through progressive colour changes, supported by readable text labels. The interface must be usable through touch and must not require logins or user accounts.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>NON-NEGOTIABLE UX CHOICE</strong></p>
<p>Optimise for a large interactive display and real finger input. Readable hierarchy, large targets, low clutter, visible ownership and clear recovery from accidental taps take precedence over dashboard ornamentation.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## What the external research suggests

| **EVIDENCE**                                                                                                                        | **APPLICATION TO THIS PRODUCT**                                                                                                        |
|-------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| **WCAG 2.2 defines a 24×24 CSS px minimum target, with exceptions \[R1\]. Material guidance recommends 48×48 dp targets \[R2\].**   | Adopt primary tap targets of 56–64 CSS px on the board (project-specific recommendation), maintain generous gaps, and test physically. |
| **WCAG prohibits conveying information by colour alone \[R3\].**                                                                    | Pair warm-up colours with due-date text, urgency badges and/or icons.                                                                  |
| **Drag-based operations need a single-pointer alternative under WCAG 2.2 \[R4\].**                                                  | Reordering may be dragged, but also provide “Move up/down” and “Move to category” controls.                                            |
| **Anthropic recommends choosing a concrete aesthetic direction, typography and visual details before coding \[R6\].**               | Give coding agents a design brief and component/token constraints before the first implementation.                                     |
| **Vercel v0 supports screenshot/visual-reference-driven implementation; Figma supplies structured variables/components \[R7–R9\].** | Prepare one approved board reference screenshot/mockup plus a repeatable Figma/design token system.                                    |
| **Playwright supports screenshot comparison and touchscreen emulation \[R11–R12\].**                                                | Require iterative visual checks on the intended viewport with touch interactions, not only unit tests.                                 |

# 2. Goals, scope and proposed assumptions

## 2.1 Primary goals

- Show all active work in a visual hierarchy of Category → Project → Task.

- Reveal who is accountable at every level without opening detail views.

- Make approaching and missed deadlines immediately legible on a large display.

- Allow non-technical users to create, change, progress, block, complete and archive work in a few large taps.

- Work reliably from Chrome on the single smart board with cloud-hosted persistence, no in-app sign-in, and minimal ongoing administration.

## 2.2 Included in MVP

Custom category CRUD and category owner; project CRUD, category assignment and project owner; task CRUD, task assignee, REQUIRED due date + due time, four task statuses and per-task warning lead time; continuously calculated deadline colours; touch-first overview/details; safe destructive-action confirmations; cloud-backed persistence, backup and export/restore; full-screen Chrome mode. Search and basic filters are recommended P1 features.

## 2.3 Not assumed for MVP

No accounts, passwords, permissions by user, profiles, personal inboxes, messaging, comments, email/push notifications, calendar sync, attachments, AI task suggestions, subtasks, dependencies, Gantt charts, billing or detailed time tracking. These are possible future extensions, not implicit requirements.

## 2.4 Confirmed decisions and open defaults

| **AREA**              | **REQUIREMENT / DECISION**                                                                                                    |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------|
| **Deployment device** | CONFIRMED: one 75-inch touchscreen smart board, used with Google Chrome; landscape is assumed until checked on site.          |
| **Cloud persistence** | CONFIRMED: data stored online/cloud, not solely in Chrome storage; cloud backend is authoritative.                            |
| **Scale**             | CONFIRMED: fewer than 20 projects expected. Suggested QA set: up to 20 projects / 200 tasks; test overflow above normal load. |
| **Task status**       | CONFIRMED: Not started, In progress, Blocked, Completed. New task defaults to Not started.                                    |
| **Deadlines**         | CONFIRMED: exact due date AND due time required for every active task.                                                        |
| **Warning lead**      | CONFIRMED: independently adjustable per task (e.g. 1, 3, 7, 14 days or custom hours/days).                                    |
| **People**            | OPEN: reusable display-name directory without user accounts is recommended; add names inline.                                 |
| **Timezone**          | OPEN: configurable board timezone; propose Asia/Colombo as initial setting, not hardcoded.                                    |
| **Removal**           | OPEN: recommended archive/reassign with explicit confirmation; never silent cascade-delete.                                   |
| **Cloud access**      | OPEN: choose private network/VPN or allowlisted gateway; do not expose unauthenticated edit endpoints.                        |

# 3. Users and operating environment

## 3.1 Interaction model

No login and no role-based access control. “Responsible person” is an assignment label/data record and must never be confused with a user identity or authentication mechanism. Anyone who can reach the unlocked board/application can modify data; this is a deliberate consequence of no authentication, not an incidental implementation detail.

## 3.2 Context of use

- A presenter or team member stands at the 75-inch board, taps cards in Google Chrome, enters text using an on-screen keyboard, and returns to an overview.

- The Chrome board may remain on for long periods; suppress screen-idle animations, disruptive rotations and unnecessary background network polling.

- Optimise primarily for the single 75-inch landscape board running Chrome. Phone/laptop-specific UI and simultaneous editors are not MVP requirements.

- Operators may have wet hands, imprecise taps, or limited reach across a large screen; use high tolerance and forgiving actions.

## 3.3 Principal workflows

1.  Create a category → name it → select/add its responsible person → save → it appears on the board.

2.  Open category → add a project → give project name and owner → save.

3.  Open project → add task → title, assignee, exact due date/time, task-specific warning lead time → save → colour countdown begins at the specified warning threshold.

4.  At any later date → tap task → change status (Not started/In progress/Blocked/Completed), warning window or due timestamp → urgency and progress immediately update.

5.  Manage categories → rename/reorder/archive → explicitly handle projects before category removal.

# 4. Information architecture and data model

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>CATEGORY (id, name, ownerId, colour/accent, order, archivedAt)<br />
└── PROJECT (id, categoryId, name, ownerId, description?, order, archivedAt)<br />
└── TASK (id, projectId, title, assigneeId, dueAtUtc, warningLeadMinutes, status, notes?, completedAt?, order)<br />
PERSON (id, displayName, active) ← assignments only; NOT a login identity<br />
SETTINGS (boardTimezone, defaultWarningLeadMinutes, boardTitle, theme)</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 4.1 Core entities

| **ENTITY**   | **REQUIRED FIELDS**                                                           | **OPTIONAL / SYSTEM FIELDS**                                                      |
|--------------|-------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| **Category** | Unique ID; name; ownerId (responsible person)                                 | Accent colour; sort order; createdAt; updatedAt; archivedAt                       |
| **Project**  | Unique ID; categoryId; name; ownerId                                          | Description; stage; sort order; createdAt; updatedAt; archivedAt                  |
| **Task**     | Unique ID; projectId; title; assigneeId; dueAtUtc; warningLeadMinutes; status | Description/notes; createdAt; updatedAt; completedAt; sort order                  |
| **Person**   | Unique ID; displayName                                                        | Active flag; preferred short label; no password, email or access level by default |
| **Settings** | Board timezone; default warning lead time; view defaults                      | Board title; theme; font scaling; backups and cloud connection indicators         |

Referential integrity: a project belongs to one category, a task to one project, and each ownership link to a person record. Person names may be edited without losing their historical assignments. No deletion should leave broken references.

## 4.2 Relationships and deletion handling

Deleting/archiving a category with projects must offer: (A) reassign its projects to another category; or (B) archive the category and its contents together after confirmation. Never silently cascade-delete data. Deleting a person record with active assignments must be blocked until reassigned; alternatively mark inactive and retain the display name for historical records.

# 5. Functional requirements

P0 = mandatory for first release; P1 = recommended for first release if feasible; P2 = optional later. Each requirement has a concise, externally testable outcome.

## 5.1 Categories and projects

| **ID / P**   | **REQUIREMENT**                                                 | **ACCEPTANCE EVIDENCE**                                            |
|--------------|-----------------------------------------------------------------|--------------------------------------------------------------------|
| **FR-01 P0** | Create a category with a name and responsible person.           | New category appears immediately; blank name rejected.             |
| **FR-02 P0** | Rename, recolour (optional), reorder and archive categories.    | Updated category displays everywhere; cancellation preserves data. |
| **FR-03 P0** | Add projects directly within a chosen category.                 | Project is saved under exactly one category.                       |
| **FR-04 P0** | Create/edit project with mandatory name and responsible person. | Owner label visible on project card and detail.                    |
| **FR-05 P0** | Move project to another category without losing tasks.          | New category contains the project; task associations remain.       |
| **FR-06 P0** | Archive or delete projects with warning when tasks exist.       | No unconfirmed destructive cascade; archive can be restored.       |
| **FR-07 P1** | Reorder projects by tap controls; drag also permitted.          | Operable without a precise drag gesture.                           |
| **FR-08 P1** | Show category project count and simple completion summary.      | Numbers update when relevant records change.                       |

## 5.2 Tasks, responsibilities and deadlines

| **ID / P**   | **REQUIREMENT**                                                                                       | **ACCEPTANCE EVIDENCE**                                                              |
|--------------|-------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| **FR-09 P0** | Add a task with required exact due date+time and custom warning lead time.                            | Title, assignee, due timestamp, warningLeadMinutes and status persist in cloud.      |
| **FR-10 P0** | Assign/edit one primary responsible person to every task.                                             | Person visible without opening deep settings.                                        |
| **FR-11 P0** | Set status to Not started, In progress, Blocked or Completed.                                         | Completed saves completedAt and overrides urgency; Blocked retains deadline warning. |
| **FR-12 P0** | Edit due timestamp, warning lead, assignee/status; archive and restore tasks.                         | Urgency recalculates immediately after dueAtUtc or warningLeadMinutes changes.       |
| **FR-13 P0** | Interpolate urgency colour over EACH task’s own warning window.                                       | Same due timestamp with 1-day vs 14-day warning starts changing at different times.  |
| **FR-14 P0** | Show explicit remaining time or “Overdue” label alongside colour.                                     | Information remains understandable in monochrome.                                    |
| **FR-15 P0** | Distinguish before-warning, warming, due soon, overdue and Completed; show Blocked status separately. | Accessible text labels distinguish all states; active task cannot have no deadline.  |
| **FR-16 P0** | Require a date AND time input and convert using configured board timezone.                            | Reject missing/invalid date or time; correctly show local due time on reopen.        |
| **FR-17 P1** | Show project progress based on task completion.                                                       | Changing status updates progress counts immediately.                                 |
| **FR-18 P2** | Optional notes/checklists/subtasks/recurrence.                                                        | Not implemented without explicit approval.                                           |

## 5.3 Navigation, people, persistence and safety

| **ID / P**   | **REQUIREMENT**                                                            | **ACCEPTANCE EVIDENCE**                                                          |
|--------------|----------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| **FR-19 P0** | Full-screen overview, category expansion and project detail view.          | Back navigation returns to previous board position.                              |
| **FR-20 P0** | Add and reuse responsible-person display names without an account.         | Same person can own category, project and task.                                  |
| **FR-21 P0** | Provide large “Add category / project / task” actions in context.          | Complete common creation without searching menu.                                 |
| **FR-22 P0** | Persist edits across refresh and browser restart.                          | Tested with a cold restart and browser reopen.                                   |
| **FR-23 P0** | Confirm destructive operations and offer undo/recovery where practical.    | Accidental tap cannot erase category and all work.                               |
| **FR-24 P0** | Provide cloud backups plus owner-triggered export and import/restore.      | Restore retains IDs, links, statuses, due timestamps and custom warning windows. |
| **FR-25 P1** | Filter by category, person, due/overdue, status; clear filters visibly.    | Filter results and empty states are correct.                                     |
| **FR-26 P1** | Search category/project/task names.                                        | Relevant matches can be opened by one tap.                                       |
| **FR-27 P1** | Offer presentation/full-screen mode and condensed/expanded density option. | Display is readable without browser chrome and adaptable.                        |
| **FR-28 P2** | Optional simultaneous editing from additional devices.                     | Not required for single-board MVP; do not introduce multi-user complexity.       |

# 6. Deadline intelligence and colour behaviour

## 6.1 Required fields, task states and precedence

Each active task MUST have an exact due date and time, a responsible person, one of four statuses, and its OWN warning lead time. A task starts warming up only when its remaining time enters that configured lead window. Different tasks therefore change colour on different schedules. Deadline urgency is computed from absolute timestamps, not manually assigned colours. Every colour is backed by explicit due-time/overdue text and an accessible icon or label \[R3\].

6.  Completed → show completed state and completion date; suppress urgency/overdue presentation, but retain stored dueAtUtc and warning lead.

7.  Archived → hide from active view until Archived is opened.

8.  Not started or In progress → show both the status label and deadline urgency.

9.  Blocked → show prominent Blocked status AND independently preserve deadline/overdue urgency; do not hide overdue tasks.

10. If dueAtUtc \< current server-consistent time and not Completed → show Overdue, regardless of warning lead time.

11. If deadline is in the future and remaining time \> task warning lead → calm neutral style. Otherwise smoothly interpolate toward urgent.

## 6.2 Per-task warning lead time

| **SETTING**             | **SPECIFICATION / EXAMPLE**                                                                                                           |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| **Required per task**   | warningLeadMinutes is a positive integer; user picks presets or custom days/hours; initial default may pre-fill but must be editable. |
| **Preset examples**     | 1 day / 3 days / 7 days / 14 days / 30 days; custom allows hours and days (validation and max configurable).                          |
| **Task A: warning 14d** | Due in 10 days → is already in warming phase (remaining/lead = 10/14).                                                                |
| **Task B: warning 1d**  | Due in 10 days → remains calm; starts warming only 24 hours before deadline.                                                          |
| **Rescheduling**        | Moving due date or modifying the warning window immediately recalculates appearance.                                                  |
| **Zero/invalid window** | Reject zero, negative, NaN or unsupported values; show validation message rather than falling back silently.                          |

## 6.3 Recommended normalized colour progression

| **PROGRESS INTO WARNING WINDOW** | **VISUAL TREATMENT**                                | **PERSISTENT TEXT**      |
|----------------------------------|-----------------------------------------------------|--------------------------|
| **Before window (progress = 0)** | Calm neutral/teal accent; no alarm colour           | Due Fri 13 Nov, 2:30 PM  |
| **0%–40% elapsed**               | Subtle shift to warm gold via gradual interpolation | Due in 5 days            |
| **40%–75% elapsed**              | Gold shifts toward amber/orange                     | Due in 2 days            |
| **75%–100% elapsed**             | Orange intensifies to red approaching dueAt         | Due in 3 hours           |
| **After deadline**               | Stable high-contrast overdue treatment              | Overdue by 45 minutes    |
| **Completed**                    | Distinct quiet completed treatment plus check icon  | Completed                |
| **Blocked (additional status)**  | Blocked status label coexists with deadline urgency | Blocked · Due in 2 hours |

Progress = clamp(1 − remainingMs / (warningLeadMinutes × 60,000), 0, 1). Palette anchors are a design proposal; interpolate in OKLab/OKLCH \[R13\], but ensure contrast of text/icons on every step. Never rely on colour alone or flash the UI.

## 6.4 Reference deadline algorithm (implementation pseudocode)

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>if task.status == "completed": return COMPLETED<br />
if task.archivedAt: return HIDDEN<br />
remainingMs = parseUtc(task.dueAtUtc) - trustedNowUtc()<br />
if remainingMs &lt; 0: return {urgency: OVERDUE, status: task.status}<br />
leadMs = validatePositiveInt(task.warningLeadMinutes) * 60_000<br />
progress = clamp(1 - remainingMs / leadMs, 0, 1)<br />
colour = interpolateOklab([cool, gold, amber, orange, red], progress)<br />
return {status: task.status, progress, colour,<br />
dueLabel: formatRemaining(remainingMs, boardTimezone)}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Use server-synchronised time or a periodically recalibrated server clock offset to avoid misleading display alerts when the board clock drifts. Recalculate on open, status/due/lead edits, tab resume, minute ticks and midnight boundary. Animate only the resulting state update (about 150–250 ms); do not run a perpetual flashing or sweeping animation. Respect reduced-motion preferences \[R5\].

## 6.5 Date/time and timezone semantics

Require exact local date and time in the entry form. Convert to an absolute UTC instant on save; display in configured board timezone, with that timezone stored in application settings. The initial proposed timezone is Asia/Colombo and must be confirmed before deployment. Use 12- or 24-hour display consistently; do not silently create date-only deadlines. Test exact equality at dueAt, invalid inputs, clock drift, browser refresh and changing a dueAt across midnight.

# 7. Smart-board screen and touch interaction specification

## 7.1 Primary screen: operations cockpit

Use a single visual hierarchy on the 75-inch Chrome board. The default view contains a top utility bar, clear status totals, and a grid of category columns/sections. Each category shows its owner and contained projects. Project cards open large detail panels with tasks, four statuses, due date+time and individual warning lead times.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>┌──────────────────────────────────────────────────────────────────────────┐<br />
│ PROJECT COMMAND CENTRE [Search] [Overdue 4] [+ Category] [⋮] │<br />
│ All 12 projects • 5 due soon • 2 overdue • 58% completed │<br />
├────────────────────────────┬─────────────────────────────────────────────┤<br />
│ CATEGORY A • Owner: A │ CATEGORY B • Owner: B │<br />
│ 5 projects + │ 3 projects + │<br />
│ ┌──────────────────────┐ │ ┌─────────────────────────────────────┐ │<br />
│ │ Project X Owner: C │ │ │ Project Y Owner: D │ │<br />
│ │ 6/9 tasks • 1 due │ │ │ 2/5 tasks • 3 overdue │ │<br />
│ └──────────────────────┘ │ └─────────────────────────────────────┘ │<br />
└────────────────────────────┴─────────────────────────────────────────────┘<br />
Tap project → spacious side panel: owner + progress + tasks + add-task action</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

ASCII illustration communicates structure only, not final visual design. The screen size is confirmed as 75 inches, but CSS viewport resolution/zoom/OS are still unverified: verify layout in Chrome on the actual device before selecting a fixed column count.

## 7.2 Recommended touch geometry \[validate on device\]

| **ELEMENT**                     | **DRAFT SIZE / BEHAVIOUR**                                                                     |
|---------------------------------|------------------------------------------------------------------------------------------------|
| **Primary buttons**             | 56–64 CSS px minimum height; full finger-accessible target.                                    |
| **Secondary buttons and icons** | At least 48 CSS px target; 8–12 px clear separation.                                           |
| **Task rows**                   | Approx. 72–96 CSS px high with direct status control and readable date.                        |
| **Category headings**           | 24–30 px; board title 32–44 px; key metadata 16–20 px.                                         |
| **Dialogs / side panels**       | Wide, centered or edge-docked; 2–3 large actions maximum in footer.                            |
| **Keyboard interaction**        | Autofocus meaningful field; support OS on-screen keyboard; never cover primary Save.           |
| **Scrolling**                   | Large scroll areas with visible affordances; no essential horizontal scroll on the main board. |
| **Reachability**                | Keep frequent global actions in easy-to-reach regions; allow alternatives for distant corners. |

WCAG 2.2 minimum of 24×24 CSS px is a compliance baseline \[R1\], not a recommended target for a large board. Material’s historic guidance uses 48×48 dp \[R2\]. Exact real-world physical sizes depend on browser zoom and panel scaling.

## 7.3 Interaction rules

- Tap once to open a card; never require hover. Tap outside or a large close button to dismiss overlays.

- Prefer inline quick actions for “Done”, “Edit” and “Add task”; reserve deeper forms for less frequent changes.

- Do not require a drag to move categories/projects; provide visible move arrows or a “Move to …” menu \[R4\].

- For deletions, clearly state what will happen to nested records and provide Cancel as the safe default.

- Allow keyboard, mouse and screen reader operation as a secondary accessibility requirement.

- Avoid auto-disappearing toasts for essential information; use persistent save/error status when necessary.

## 7.4 Screen states that must be designed

Empty board; 12–19 projects; overflow of 20+ projects; project with zero tasks; multi-line task names; mixed statuses including Blocked; short/long warning windows; overdue and completed tasks; edit form; delete confirmation; cloud unreachable/save failed; backup restore; on-screen keyboard open; actual Chrome viewport and 1080p/4K if supported.

# 8. Visual identity and component system

## 8.1 Aesthetic direction

Recommended direction: “calm executive operations cockpit” — sophisticated editorial hierarchy with restrained depth, crisp cards, a limited signature accent and carefully designed urgency details. Visual quality should come from composition, typographic rhythm, accessible colour and high-quality states, not gratuitous gradients, decorative charts or excessive glass effects. This is an aesthetic proposal to validate with the project owner.

## 8.2 Proposed starting design tokens

| **TOKEN**             | **RECOMMENDED STARTING POINT / PURPOSE**                                                                   |
|-----------------------|------------------------------------------------------------------------------------------------------------|
| **Canvas / header**   | Warm-white or subtle cool-grey canvas (#F5F7FA); deep navy header (#112B42).                               |
| **Primary text**      | Ink/navy (#14283E) for headings and core content.                                                          |
| **Secondary text**    | Slate (#566B7C); preserve readable contrast.                                                               |
| **Brand accent**      | Teal (#0B7D83), applied sparingly to action buttons and selected states.                                   |
| **Surface / borders** | White cards; light hairline borders (#DFE7EC); subtle 1–2 layer shadows.                                   |
| **Urgency**           | Semantic colour ramp distinct from category accents; never use arbitrary category colours for urgency.     |
| **Typography**        | One precise display family + one readable UI family, e.g. Manrope + Inter (verify licensing/availability). |
| **Spacing**           | 8px base rhythm; 16–24px internal cards; 24–36px panel gaps.                                               |
| **Radii**             | Use limited radius tokens, e.g. 12px for controls and 18px for panels.                                     |
| **Animation**         | 120–220 ms for taps/panels; disable nonessential movement for reduced motion.                              |

## 8.3 Hierarchy and aesthetic quality checklist

- A strong, large title and status summary; ownership and urgency are obvious from board viewing distance within three seconds.

- Distinct category containers; task urgency is the primary use of saturated colour.

- One coherent icon language (e.g. Lucide) with no emoji in the main UI.

- A deliberately limited set of card variants: category, project, task, empty state; reusable design tokens.

- Big negative space and disciplined alignment; avoid cramped tables and tiny tags on the smart board.

- Typography contrast by weight and scale, not by scattering many unrelated font sizes.

- High-fidelity loading, no-data, errors, overdue, complete, hover, focus, selected and disabled states.

- Microinteractions reveal state changes, but avoid pulsing urgent items or high-motion decorative effects.

- Test the actual panel from 1–3 m and under meeting-room lighting; adjust text and colour to suit.

## 8.4 Visual anti-patterns for AI-generated applications

Reject default purple gradients, random glassmorphism, eight accent colours, emoji-as-icons, generic KPI tiles unrelated to work, illegible grey text, huge wasted hero sections, cramped 12px tables, inconsistent rounded corners, overly heavy shadows, hover-only menus, and dashboards that look attractive in a screenshot but fail when real text wraps. Anthropic’s design guidance explicitly aims to avoid generic AI aesthetic defaults \[R6\].

# 9. Technical architecture, hosting and data protection

## 9.1 Confirmed deployment topology: one Chrome board, cloud source of truth

The owner chose CLOUD storage and a single smart board. Therefore IndexedDB/localStorage must NOT be the system of record, and multiple editing clients are not an MVP requirement. Use a small browser frontend and a durable cloud API/database. A transient local cache may speed display but must never be mistaken for a successful cloud save.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>75-inch smart board / Chrome (no app login)<br />
| HTTPS; network/device access restricted outside the app<br />
v<br />
Cloud access gateway / reverse proxy / private tunnel<br />
|<br />
v<br />
Application API (validate, write, health check)<br />
|<br />
v<br />
Cloud persistent database + scheduled backups + restore testing</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 9.2 Secure cloud access without in-app users

No login means a board operator can use the app immediately; it does NOT mean the internet may edit the project database. An anonymous public write endpoint is unacceptable. Recommended approach: a privately reachable cloud service accessed through an always-on network-level VPN/private tunnel or site gateway configured for the board’s network. Device/network enrolment happens outside the web application, not through an in-app user account. A fixed-IP allowlist is a possible alternative only if that IP is genuinely stable. Cloudflare Access-style identity prompts would contradict the requested no-login experience unless the board/device can be pre-authorised invisibly; do not assume this is possible. Confirm deployment method with whoever manages the board/network.

The board must use HTTPS, narrow network ingress, restrictive CORS, request validation, bounded rate limits, least-privilege database credentials, backup encryption, and monitoring. Never place a service-role/admin database key in browser code. If the private gateway is unavailable, show “Cloud connection unavailable” and prevent misleading success messages. Because there is no login, a meaningful audit trail of WHICH human changed data is not possible.

## 9.3 Pragmatic build stack

Frontend: React + TypeScript + Vite, a small Tailwind/CSS-token design system, accessible dialog/picker primitives styled for large touch targets, Lucide icons and query-state handling. Backend: compact Node.js/Fastify or equivalent cloud API. Storage: PostgreSQL on a managed service is a strong default for automated backup/recovery; an encrypted, backed-up SQLite database on a persistent cloud volume is also valid at this tiny scale if deployment operations support it. Prefer the smallest maintainable stack with automatic database backups and tested restore procedures. No auth provider, real-time sync layer, microservices or multi-tenant account model for the MVP.

## 9.4 Nonfunctional requirements

| **ID**     | **SPECIFICATION / TEST TARGET**                                                                                                                               |
|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **NFR-01** | No login, passwords, accounts or user-specific access controls within the web app. Cloud perimeter access must still be restricted.                           |
| **NFR-02** | Support the actual Google Chrome version on the 75-inch interactive board; record OS, effective CSS viewport, devicePixelRatio and zoom during commissioning. |
| **NFR-03** | Aim for first usable board view in under ~3 s on measured board/network \[validate\], with clear loading indicators and no layout jumps.                      |
| **NFR-04** | Pressed feedback is immediate (~150 ms target); cloud writes report success only after server acknowledgement; errors remain visible.                         |
| **NFR-05** | All data persists across Chrome refresh, browser shutdown and board power cycle; cloud database is authoritative.                                             |
| **NFR-06** | Test at \<20 normal projects and ~200 tasks, plus 30-project/300-task overflow; scale numbers are test fixtures, not a limit.                                 |
| **NFR-07** | Use WCAG 2.2 AA goals where practical: contrast, non-colour urgency labels, large touch targets, keyboard focus and reduced motion \[R1,R3,R5\].              |
| **NFR-08** | Scheduled encrypted cloud backups with defined retention and restore rehearsal; offer manual JSON export/validated import.                                    |
| **NFR-09** | Respect board timezone and due-time precision; recalculate alert states after suspended tabs, clock drift and midnight.                                       |
| **NFR-10** | Do not promise offline editing/sync by default. Show an unambiguous read-only/disconnected state until connectivity returns.                                  |

## 9.5 Cloud reliability, recovery and scope control

At startup fetch server data and show last-successful-refresh time. Use optimistic UI only with explicit unsaved/pending indication and rollback if a write fails; simplest MVP may wait for server acknowledgement before updating. Keep a stable export schema version, migrations, and backup restore test. Online storage must not depend on clearing Chrome cache, and browser-local storage must never contain long-lived privileged API secrets. Simultaneous multi-device conflict handling is postponed because this is a single-board system.

# 10. AI coding agent visual-quality playbook

This section translates research into explicit instructions for AI coding agents. It is a workflow, not a guarantee: generated interfaces still need design review, functional testing and security checks. Relevant sources: Anthropic frontend-design \[R6\], Vercel v0 screenshots \[R7\], Figma MCP \[R8–R9\], repository instructions \[R10\], and Playwright visual comparison \[R11–R12\].

## Method 1 — Define a visual thesis before generating code

12. Write a one-paragraph product/audience statement: a public shared project board read at distance and controlled with fingers.

13. Select one visual direction: “calm executive operations cockpit”, not vague “modern SaaS.”

14. Specify design constraints: light canvas, navy typography, teal accent, 56px targets, bold category cards, limited shadows, strong task urgency.

15. Generate three visual explorations (not three implementations), critique density/contrast/hierarchy, then approve one.

16. Approve the first large-screen reference mockup before implementing the entire application.

## Method 2 — Provide actual visual references and design tokens

Attach a full-width approved mockup or Figma frame and explicitly say which parts to reproduce: spacing rhythm, column proportions, card elevation, typography, state treatment. Vercel v0 supports high-resolution screenshots and recommends giving behaviour/edge-case instructions as well as visual input \[R7\]. Figma MCP can expose variables, frames and components to compatible agents; Figma advises reusable components, semantic layer names, variables and Auto Layout \[R8–R9\].

## Method 3 — Give permanent, enforceable project instructions

Put durable requirements in an agent-readable project instruction file: \`AGENTS.md\` for Codex/cross-agent usage, \`CLAUDE.md\` for Claude Code, and \`.github/copilot-instructions.md\` for GitHub Copilot where supported. Support depends on the specific agent/harness, so verify how it reads instructions \[R10\]. They should specify visual design tokens, no-login rule, no hover-only interaction, test sizes and a definition of done.

## Method 4 — Build in vertical slices, not one giant prompt

17. Skeleton and tokenised components: AppShell, CategoryPanel, ProjectCard, TaskRow, UrgencyBadge, PersonChip, TouchDialog.

18. Static board with realistic seeded data and several edge cases; review screenshots before adding persistence.

19. Add one complete workflow (create category), then project, then task, then deadlines, then import/export.

20. Replace seeded data with persistence after the layout and behaviour are approved.

21. Refactor duplicated styling into tokens/components; no unexplained one-off CSS overrides.

## Method 5 — Visual screenshot → critique → iterate loop

At a baseline 1920×1080 CSS viewport and the measured Chrome viewport on the actual 75-inch board, capture screenshots of populated, empty, edit, blocked, overdue and keyboard-open screens. Compare against the design reference. Ask the agent to identify five concrete visual mismatches with approximate locations, fix them and capture again. Use Playwright’s \`toHaveScreenshot()\` for visual regression, noting that environment differences can affect pixel comparisons \[R11\].

22. Inspect typography at realistic viewing distance: smallest operational text should remain legible.

23. Check task/owner labels for truncation, wrap and unusual name lengths.

24. Audit accessible contrast at every urgency interpolation anchor, not just endpoints.

25. Test tap accuracy using Playwright \`hasTouch\` and \`touchscreen.tap\`, then on real hardware \[R12\].

26. Run manual UI review after every change to design tokens or task urgency logic.

## Method 6 — Protect quality with an objective scorecard

| **QUALITY DIMENSION**       | **ACCEPTANCE RUBRIC (0–5)**                                                  |
|-----------------------------|------------------------------------------------------------------------------|
| **Hierarchy / scanability** | Owner and urgency recognisable in 3 seconds; 5 = effortless.                 |
| **Touch comfort**           | All common actions are generous tap targets; zero hover-only blockers.       |
| **Polish / cohesion**       | Coherent type, radius, elevation, colour, icons and spacing throughout.      |
| **Density / scale**         | Useful information visible without tiny typography or unnecessary scrolling. |
| **Accessibility**           | Contrast, colour alternatives, focus, reduced motion, drag alternatives.     |
| **Real content robustness** | Handles long names, zero/large counts, overdue and empty states.             |
| **Performance**             | Fast initial load, responsive taps, no excessive repaint or motion.          |

Release gate suggestion: no dimension below 4/5 after human evaluation; fix functional and accessibility defects irrespective of the aesthetic score. The scorecard is an internal product rubric, not an industry-certified instrument.

# 11. Copy-ready prompt for the AI coding agent

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>HOW TO USE</strong></p>
<p>Give the agent this v0.2 document and an approved design screenshot. Start with a polished static dashboard at the actual smart-board viewport; implement cloud persistence only once visual quality and workflows have been reviewed.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>ROLE: Senior product designer + frontend engineer specialising in elegant touch-first dashboards.<br />
<br />
PRODUCT: Smart Board Project Command Centre, a full-screen web app for ONE 75-inch<br />
interactive touchscreen running Chrome. NO IN-APP LOGINS or user accounts. Data is stored<br />
ONLINE IN A CLOUD DATABASE, behind a protected backend/API and private network gateway.<br />
Never expose anonymous public write APIs or privileged credentials to browser code.<br />
<br />
MODEL: Category -&gt; Project -&gt; Task, with a responsible-person display name at each level.<br />
People are assignment records, NOT accounts. Expect FEWER THAN 20 projects ordinarily.<br />
A task REQUIRES exact due DATE + TIME, a primary assignee, status (Not started,<br />
In progress, Blocked, Completed), and an INDIVIDUAL warning lead time in days/hours.<br />
Start gradually warming colour only when within each task's lead window; interpolate<br />
smoothly through accessible semantic colours, show due text in all states, and show Blocked<br />
status independently. Completed overrides deadline urgency. Rescheduling and warning edits<br />
must recalculate immediately.<br />
<br />
VISUAL DIRECTION: Premium calm executive operations cockpit; confident typography,<br />
strong owner/due hierarchy, deliberate whitespace, clear category cards, fine borders,<br />
restrained navy and teal accents, elegant colour ramp. Avoid generic admin/SaaS grids,<br />
purple gradients, random glass, tiny tables and emoji icons.<br />
<br />
TOUCH: Primary targets 56–64 CSS px; no hover-only/drag-only actions; support physical<br />
board keyboard, accessible focus, reduced motion, fullscreen Chrome and 16:9 layout.<br />
The target screen is 75 inches; MEASURE actual effective Chrome CSS viewport/zoom/DPR.<br />
Use 1920x1080 as an initial screenshot baseline, not assumed physical resolution.<br />
<br />
PROCESS: (1) Write design concept + tokens + component hierarchy. (2) Build a STATIC board<br />
with realistic fixtures: 4 categories, 12 projects, 60 tasks, long titles, blocked,<br />
overdue, completed, 1-day and 14-day warning windows. (3) Capture baseline screenshots.<br />
(4) Critique spacing, hierarchy, legibility at distance and touch reachability. (5) Iterate.<br />
(6) Add CRUD, task-status logic and per-task urgency tests. (7) Add PRIVATE cloud API,<br />
persistent database, scheduled backups and explicit offline/error states. (8) Prove via<br />
Playwright tests and manual checks on real Chrome board.<br />
<br />
TECH: React + TypeScript + Vite + styled accessible primitives, reusable tokens and typed<br />
components; small Node API and cloud DB, or justified equivalent. No authentication flow.<br />
<br />
DELIVER: source, deployment/config runbook, design tokens, screenshots, cloud backup/restore<br />
procedure, test results and traceability from each P0 requirement to implemented tests.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 12. Proposed component-level design specification

| **COMPONENT**     | **CONTENT & BEHAVIOUR**                                                                                                     |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------|
| **AppShell**      | Title, overview counts, concise filters, search, add category, data controls, fullscreen switch.                            |
| **CategoryPanel** | Category name and owner chip, project count, summary strip, large add-project action, projects.                             |
| **ProjectCard**   | Name, responsible person, task completion ratio, closest due task, overdue count; tap to open.                              |
| **ProjectDrawer** | Large title, owner, project details, task list sorted by due date, add-task, edit/move/archive.                             |
| **TaskRow**       | Four-state picker/status, title, owner, exact local due time, configurable warning lead, urgency label/accent; tap to edit. |
| **UrgencyBadge**  | Accessible label, semantic icon, mixed tonal colour, due/overdue formatted text.                                            |
| **PersonPicker**  | Reusable name selection plus large add-new-person option; never email/password fields.                                      |
| **TouchDialog**   | Accessible large form, visible close, stable Save/Cancel; destructive confirmation as separate variant.                     |
| **EmptyState**    | Illustration-free or restrained illustration; large helpful create action; clear explanation.                               |
| **BackupPanel**   | Cloud connection state, last confirmed save, JSON export/validated import, backup metadata and restore instructions.        |

# 13. Acceptance tests and completion criteria

## 13.1 User acceptance scenarios

| **TEST**                      | **GIVEN / WHEN / THEN**                                                                                                        |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| **AT-01 Category CRUD**       | Given empty board, when category name+owner saved, then it appears; when renamed, all references update.                       |
| **AT-02 Project ownership**   | Given category A, when project created with person B, then A and B show correct distinct owner labels.                         |
| **AT-03 Task ownership**      | Given project, when task assigned to person C, then task row displays C and owner can be changed.                              |
| **AT-04 Per-task urgency**    | Given two tasks due in 5 days, with leads 14d and 1d, only the 14d task is warming; with less time both progress smoothly.     |
| **AT-05 Overdue / completed** | Given overdue task, show Overdue with date/time; marking Completed overrides urgency and saves completedAt.                    |
| **AT-06 Edit lead/due**       | Given urgent task, changing deadline or its warning lead updates colour and text immediately.                                  |
| **AT-07 Category removal**    | Given populated category, when remove selected, then confirm/reassign/archive options are shown; cancellation retains data.    |
| **AT-08 Cloud persistence**   | Given confirmed cloud save, refreshing Chrome, restarting it or power-cycling the board recovers identical records.            |
| **AT-09 Touch only**          | Given touchscreen/no mouse, then every essential task is possible by tap; no drag/hover prerequisite.                          |
| **AT-10 Data safety**         | Cloud backup/export-restore preserves all counts, IDs, owners, four statuses, exact due timestamps and per-task warning leads. |
| **AT-11 Accessibility**       | Given colour-vision deficiency simulation, then urgency remains readable using badge and date text.                            |
| **AT-12 Practical scale**     | With 12–19 projects (~200 tasks), plus 30-project overflow, no illegible data, clipped controls or blocked actions.            |
| **AT-13 Four statuses**       | Switch every task through all four statuses; Blocked is visible and urgency continues; Completed overrides urgency.            |
| **AT-14 Time validation**     | Missing due date/time and invalid warning periods cannot be saved; exact due threshold and timezone are correct.               |
| **AT-15 Cloud access**        | From an unapproved network/client the unauthenticated cloud edit API is unreachable; board private connection succeeds.        |
| **AT-16 Network outage**      | Disconnect cloud: board shows connection problem; failed writes never appear as confirmed saves; recovery works.               |

## 13.2 Definition of done

The app is ready for owner acceptance only when all P0 requirements are traceable to passing tests, critical touch flows pass on the actual board, contrast and copy are legible at normal use distance, realistic content looks polished, the unauthenticated cloud write service cannot be reached outside approved network/device access, data restores successfully, and the final state has been captured in screenshots for later regression comparison.

# 14. Implementation plan and handoff artifacts

| **PHASE**                 | **DELIVERABLE / EXIT CONDITION**                                                                                                    |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| **0 — Discovery**         | Confirm open network/timezone settings; inspect 75-inch Chrome board; record actual resolution, zoom, OS and realistic task volume. |
| **1 — Design**            | Three visual concepts, chosen direction, tokens, one reference screen, touch-size proof.                                            |
| **2 — UI prototype**      | Responsive static app with seeded edge-case content and approved 1080p screenshot.                                                  |
| **3 — Core CRUD**         | Categories, projects, person names, tasks, status, move/archive with safe confirmations.                                            |
| **4 — Deadline engine**   | Correct continuous colour interpolation, labels, due-time/timezone and completion override.                                         |
| **5 — Cloud persistence** | Private access gateway, cloud database/API, backup/restore, explicit disconnected-state handling.                                   |
| **6 — QA and deployment** | Playwright + on-board Chrome tests, network restriction test, cloud recovery demonstration, operations runbook.                     |

# 15. Decision register and remaining owner questions

All six choices supplied on 6 November 2026 are incorporated as fixed requirements. Do NOT reopen them merely because earlier versions of this draft called them assumptions. Remaining questions below are lower-level operational choices that may be settled during design/deployment; recommended defaults are included for uninterrupted prototyping.

## 15.1 Closed — confirmed by owner

| **ID**   | **CONFIRMED REQUIREMENT**                                         |
|----------|-------------------------------------------------------------------|
| **D-01** | Use on one 75-inch smart board only; Google Chrome browser.       |
| **D-02** | Store project data online/in the cloud.                           |
| **D-03** | Every task has its own custom-configurable deadline warning lead. |
| **D-04** | Exact due date and time are used; time is not optional.           |
| **D-05** | Task statuses are Not started, In progress, Blocked, Completed.   |
| **D-06** | Expect fewer than 20 active projects under normal usage.          |

## 15.2 Open — implementation refinements

| **ID**   | **QUESTION / DECISION**                                                                       | **SUGGESTED DEFAULT**                                                 |
|----------|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| **O-01** | How are responsible people entered: free typing each time or a reusable names directory?      | Reusable directory with “Add name” inline, no accounts.               |
| **O-02** | When removing a populated category, move projects or archive the hierarchy?                   | Offer both with clear confirmation; never silent delete.              |
| **O-03** | Should projects have their own dates/priorities/notes beyond task-based progress?             | Simple description + calculated task progress; defer priorities.      |
| **O-04** | Are screen colours enough, or are external notifications needed?                              | Only on-screen colour + text alerts; no external notification.        |
| **O-05** | English only or Sinhala/Tamil UI labels?                                                      | English first; structure text for later localisation.                 |
| **O-06** | Would a tap-to-hide edit controls “presentation mode” be useful?                              | Board remains fully functional; optional display-only toggle.         |
| **O-07** | What are the board OS, Chrome version, effective CSS resolution, zoom and screen orientation? | Measure on location; start design at 1920×1080.                       |
| **O-08** | How will board/network connect privately to cloud service without an in-app login?            | Always-on private tunnel or restricted site gateway, validated by IT. |
| **O-09** | Which timezone and 12-/24-hour time format should be shown?                                   | Configurable; start Asia/Colombo, 24-hour time if approved.           |
| **O-10** | Who maintains cloud hosting, scheduled backups, recovery and periodic updates?                | Assign technical maintainer and document backup/restore runbook.      |

# 16. Sources and research notes

Sources were reviewed for this draft on 6 November 2026. Official standards/vendor documentation is cited where available; implementation sizes, palettes, performance targets and UI flow decisions are proposals for this application rather than claims made by the sources.

**\[R1\] W3C WAI — Understanding WCAG 2.2 Target Size (Minimum) —** [<u>Open source</u>](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)

**\[R2\] Material Design — Accessibility / Touch Targets —** [<u>Open source</u>](https://m1.material.io/usability/accessibility.html)

**\[R3\] W3C — WCAG 2.2: Use of Color and Contrast —** [<u>Open source</u>](https://www.w3.org/TR/WCAG22/)

**\[R4\] W3C WAI — Understanding Dragging Movements —** [<u>Open source</u>](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)

**\[R5\] W3C WAI — Understanding Animation from Interactions —** [<u>Open source</u>](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)

**\[R6\] Anthropic — Frontend Design Plugin —** [<u>Open source</u>](https://claude.com/plugins/frontend-design)

**\[R7\] Vercel v0 — Screenshots and Files —** [<u>Open source</u>](https://v0.app/docs/screenshots)

**\[R8\] Figma — MCP Server Developer Introduction —** [<u>Open source</u>](https://developers.figma.com/docs/figma-mcp-server/)

**\[R9\] Figma — MCP Guide / Best Practices —** [<u>Open source</u>](https://github.com/figma/mcp-server-guide/)

**\[R10\] VS Code — Use Custom Instructions / Agent Files —** [<u>Open source</u>](https://code.visualstudio.com/docs/agent-customization/custom-instructions)

**\[R11\] Playwright — Visual Comparisons —** [<u>Open source</u>](https://playwright.dev/docs/test-snapshots)

**\[R12\] Playwright — Touchscreen Automation —** [<u>Open source</u>](https://playwright.dev/docs/api/class-touchscreen)

**\[R13\] MDN — CSS color-mix() —** [<u>Open source</u>](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix)

**\[R14\] MDN — PWA Offline and Background Operation —** [<u>Open source</u>](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)

**\[R15\] MDN — Web Storage API —** [<u>Open source</u>](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

**\[R16\] MDN — PWA Best Practices —** [<u>Open source</u>](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Best_practices)

## Appendix A — Minimum data payload (illustrative)

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
"schemaVersion": 1,<br />
"timezone": "Asia/Colombo",<br />
"people": [{"id":"p1","displayName":"A. Perera"}],<br />
"categories": [{"id":"c1","name":"Digital Health","ownerId":"p1","order":1}],<br />
"projects": [{"id":"pr1","categoryId":"c1","name":"Registry Integration",<br />
"ownerId":"p1","order":1}],<br />
"tasks": [{"id":"t1","projectId":"pr1","title":"Complete data mapping",<br />
"assigneeId":"p1","status":"in_progress",<br />
"dueAtUtc":"2026-11-13T09:00:00Z", "warningLeadMinutes":20160}]<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

This example is illustrative only. DueAt is an absolute UTC timestamp corresponding to exact local date and time; there is no date-only mode. Production API must validate dueAtUtc, positive warningLeadMinutes, status enum and all foreign keys.

## Appendix B — Suggested permanent agent instructions

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th># Smart Board Project Command Centre — agent instructions<br />
- Build for ONE 75-inch touchscreen in Chrome; measure actual viewport/zoom/DPR; 1920x1080 is reference only.<br />
- No in-app authentication/accounts; board cloud access via approved private network/device gateway.<br />
- Maintain Category -&gt; Project -&gt; Task integrity; never silently cascade-delete.<br />
- Primary touch targets &gt;=56px; secondary targets &gt;=48px; no hover-only or drag-only actions.<br />
- Every task has exact due date+time and an adjustable warningLeadMinutes; begin gradual colour ramp only within that task window.<br />
- Statuses: Not started, In progress, Blocked, Completed. Blocked keeps urgency; Completed overrides it.<br />
- Use design tokens, reusable components and a small coherent typography scale.<br />
- No default purple gradients, random emoji icons, uncontrolled glassmorphism or tiny tables.<br />
- Test realistic 12–19 projects + overflow; review screenshots at actual 75-inch Chrome scale.<br />
- Respect reduced motion and WCAG 2.2 AA where practical; verify contrast explicitly.<br />
- Test CRUD, cloud persistence, network failures, private API access, backups and export/import.<br />
- Cloud is system of record. Do not imply offline edits sync unless deliberately built and verified.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

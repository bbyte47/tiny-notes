# Agent Instructions

When implementing the base application, use `PLANS.md` as the execution plan.

When implementing post-v1 improvements, use `ENHANCEMENTS.md` as the execution plan.

Rules:

- The active plan file named in the prompt is the source of truth.
- Follow milestones in strict order.
- Implement only the milestones explicitly requested in the prompt.
- Never implement future milestones ahead of the requested range.
- Stop immediately after the requested milestone is complete.
- Do not skip validation commands.
- If validation fails, fix the issue before continuing.
- Keep diffs scoped to the current milestone.
- Do not add features outside the active plan.
- Prefer Server Components for reads.
- Prefer Server Actions for writes.
- After every milestone verify the application starts with:

  bun run dev

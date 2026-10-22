# Approved PRD additions

Reference: the supplied **Product Requirements Document — Trojan Marketplace** (`Reasoning (1).pdf`). Scope: the six approved additions to the local prototype, plus rebuilding the USC-area map from the supplied street reference. The original nine screens retain the 440 × 956 CSS-pixel reference frame.

| Approved addition | Implementation | Evidence |
| --- | --- | --- |
| Complete listing information | Required defect declaration and details when applicable, sell-by deadline, neighborhood, positive dimensions and coherent pickup window. Preview and details use the saved fields. | Browser publication/preview validation; independent listing and date rules. |
| Pickup-area filter | Dedicated neighborhood selector composes with text/category/price/condition/distance/width filters. Cards and map use the same filtered results. | Area filter, geographic pin, and map privacy browser checks. |
| Complete proposals | Date, start/end time, and proposed public meeting point are required up front. Both participants review one shared proposal. Changes increment its version and invalidate the other participant’s consent. | Proposal and rescheduling browser checks; version/confirmation rules. |
| Consistent transaction status | A live reservation derives Reserved across all views. Cancellation releases availability; mutually confirmed handoff produces Sold. Manual listing status edits cannot bypass an active/completed in-app transaction. | Cancellation, seller listing guard, card/detail/map assertions; transition rules. |
| Two-party completion and issues | Separate handoff responses and timestamps. Pending/issue/review-required records do not count as completed. Transaction-linked issues include actor, category, severity, description, and both parties’ resolution acknowledgments. A resolution resets handoff responses. Versioned event history is retained. | Full issue/resolution/handoff browser journey and independent invalid-transition, cancellation, post-completion issue, and migration tests. |
| Optional prototype metrics | Consent, participant code, role, task, start/end timestamps, elapsed time, completion, assistance, confidence, missing information, notes, per-task counts, and CSV export. | Cross-navigation/reload persistence, opt-in, summary, and downloaded CSV browser checks; CSV escaping rules. |
| USC street map | Original local SVG based on the reference geography: 10/110, Adams, Jefferson, Exposition, Vermont, Hoover, surrounding north-campus streets, USC Village, USC campus, and Exposition Park. Geographic neighborhood centers replace index-based pin positions. Zoom/pan/reset; no exact addresses or external map requests. | Pin hover stability, geographic labels, zoom/reset, area filtering, and public-location privacy checks; visual inspection. |

## Intended boundaries

- This is a single-device demonstration. Authentication, email ownership, messaging delivery, moderation, private cross-user access, durable shared storage, and concurrent reservation enforcement still require a server before a live pilot.
- “Demo” actions explicitly simulate the other person; they do not establish real agreement.
- A proposed meeting point is visible within the participants’ proposal flow so it can actually be reviewed before confirmation. Public listing maps remain approximate. Frontend visibility is not a substitute for server authorization.
- Legacy completions without per-party responses require review. Migration does not invent missing handoff confirmations.
- Task logs are optional, self-reported prototype research. Repeated attempts are distinct from participant counts. No unassisted-completion benchmark, confidence improvement, or live transaction outcome is claimed merely because automated tests pass.
- Pilot recruitment, named feature/milestone owners and dates, a support owner, and participant validation remain team decisions.

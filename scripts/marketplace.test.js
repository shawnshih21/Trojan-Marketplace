import test from "node:test";
import assert from "node:assert/strict";
import {
  INITIAL_ITEMS,
  INITIAL_PICKUPS,
  DEFAULT_PROFILE,
} from "../src/data.js";
import {
  normalizeState,
  listingError,
  termsError,
  proposePickup,
  pickupEvent,
  canChangeListingStatus,
  studyCSV,
} from "../src/marketplace.js";
const setup = () =>
  normalizeState({
    profile: { ...DEFAULT_PROFILE, verified: true },
    items: INITIAL_ITEMS,
    pickups: INITIAL_PICKUPS,
    reminders: true,
  });
const terms = {
  date: "2026-10-24",
  start: "10:00",
  end: "10:30",
  meeting: "Public seating at W 27th Street entrance",
};
const proposal = () => proposePickup(setup(), "chair", terms, "jordan");
const confirmed = () => {
  const r = proposal();
  return {
    state: pickupEvent(
      r.state,
      r.pickup.id,
      { type: "confirm_terms" },
      "seller",
    ),
    id: r.pickup.id,
  };
};
test("publication requires explicit defects, deadline, and a valid pickup before the deadline", () => {
  const item = structuredClone(INITIAL_ITEMS[0]);
  assert.equal(listingError(item), "");
  for (const change of [
    { deadline: "" },
    { defectState: "" },
    { defectState: "disclosed", defects: "" },
    { area: "" },
  ])
    assert.notEqual(listingError({ ...item, ...change }), "");
  assert.match(listingError({ ...item, date: "2026-10-29" }), /deadline/);
  assert.match(listingError({ ...item, width: "banana" }), /dimensions/);
  assert.match(listingError({ ...item, deadline: "2026-99-99" }), /deadline/);
  assert.equal(listingError({ ...item, defectState: "none", defects: "" }), "");
});
test("proposals require date/time/location and USC demo verification", () => {
  const state = setup(),
    item = state.items.find((i) => i.id === "chair");
  assert.match(termsError({ ...terms, meeting: "" }, item), /meeting/);
  assert.match(termsError({ ...terms, end: "09:00" }, item), /end time/);
  assert.match(termsError({ ...terms, date: "2026-10-28" }, item), /deadline/);
  state.profile.verified = false;
  assert.throws(() => proposePickup(state, "chair", terms, "jordan"), /Verify/);
});
test("one active reservation consistently reserves its listing and prevents another reservation", () => {
  const { state, pickup } = proposal();
  assert.equal(state.items.find((i) => i.id === "chair").status, "reserved");
  assert.equal(pickup.status, "requested");
  assert.throws(
    () => proposePickup(state, "chair", terms, "jordan"),
    /active reservation/,
  );
  assert.equal(
    canChangeListingStatus(
      state,
      state.items.find((i) => i.id === "chair"),
    ),
    false,
  );
});
test("handoff cannot complete before both participants confirm complete pickup terms", () => {
  const { state, pickup } = proposal();
  assert.throws(
    () => pickupEvent(state, pickup.id, { type: "confirm_handoff" }, "buyer"),
    /pickup details/,
  );
  assert.throws(
    () =>
      pickupEvent(
        state,
        pickup.id,
        { type: "confirm_terms" },
        "buyer",
        "2026-10-24T10:00:00Z",
      ) && pickupEvent(state, pickup.id, { type: "confirm_handoff" }, "buyer"),
    /pickup details/,
  );
});
test("changed terms require renewed confirmation and preserve a versioned response record", () => {
  const { state, id } = confirmed();
  const revised = pickupEvent(
    state,
    id,
    {
      type: "reschedule",
      terms: {
        ...terms,
        start: "11:00",
        end: "11:30",
        meeting: "Different public meeting place",
      },
    },
    "seller",
  );
  const p = revised.pickups.find((p) => p.id === id);
  assert.equal(p.buyerConfirmed, false);
  assert.equal(p.sellerConfirmed, true);
  assert.equal(p.version, 2);
  assert.equal(p.status, "requested");
  assert.equal(
    p.history.at(-1).terms.meeting,
    "Different public meeting place",
  );
  const agreed = pickupEvent(revised, id, { type: "confirm_terms" }, "buyer");
  assert.equal(agreed.pickups.find((p) => p.id === id).status, "confirmed");
});
test("one handoff response is pending, two confirmations complete the transaction and sell the listing", () => {
  const { state, id } = confirmed();
  const one = pickupEvent(state, id, { type: "confirm_handoff" }, "buyer");
  assert.equal(
    one.pickups.find((p) => p.id === id).status,
    "completion_pending",
  );
  assert.equal(one.items.find((i) => i.id === "chair").status, "reserved");
  assert.throws(
    () => pickupEvent(one, id, { type: "cancel" }, "buyer"),
    /resolved/,
  );
  const both = pickupEvent(one, id, { type: "confirm_handoff" }, "seller");
  assert.equal(both.pickups.find((p) => p.id === id).status, "completed");
  assert.equal(both.items.find((i) => i.id === "chair").status, "sold");
  assert.equal(
    canChangeListingStatus(
      both,
      both.items.find((i) => i.id === "chair"),
    ),
    false,
  );
  assert.equal(
    state.pickups.find((p) => p.id === id).handoff.buyer.response,
    "pending",
  );
});
test("transaction issues remain unresolved and block completion until both acknowledge resolution and reconfirm handoff", () => {
  let { state, id } = confirmed();
  state = pickupEvent(
    state,
    id,
    {
      type: "report_issue",
      category: "Condition or defects",
      severity: "High",
      description: "A damaged leg was not disclosed.",
    },
    "buyer",
  );
  let p = state.pickups.find((p) => p.id === id);
  const issueId = p.issues[0].id;
  assert.equal(p.status, "issue_open");
  assert.equal(p.issues[0].itemId, "chair");
  assert.equal(p.issues[0].pickupId, id);
  assert.throws(
    () => pickupEvent(state, id, { type: "confirm_handoff" }, "seller"),
    /resolve/,
  );
  assert.throws(
    () => pickupEvent(state, id, { type: "cancel" }, "seller"),
    /resolved/,
  );
  state = pickupEvent(
    state,
    id,
    {
      type: "resolve_issue",
      issueId,
      note: "Both agree to the repaired chair.",
    },
    "buyer",
  );
  assert.equal(state.pickups.find((p) => p.id === id).status, "issue_open");
  state = pickupEvent(
    state,
    id,
    { type: "resolve_issue", issueId, note: "Agreed." },
    "seller",
  );
  p = state.pickups.find((p) => p.id === id);
  assert.equal(p.issues[0].status, "resolved");
  assert.equal(p.status, "confirmed");
  assert.equal(p.handoff.buyer.response, "pending");
  state = pickupEvent(state, id, { type: "confirm_handoff" }, "buyer");
  state = pickupEvent(state, id, { type: "confirm_handoff" }, "seller");
  assert.equal(state.pickups.find((p) => p.id === id).status, "completed");
});
test("an issue reported after completion is excluded from confirmed completions", () => {
  let { state, id } = confirmed();
  state = pickupEvent(state, id, { type: "confirm_handoff" }, "buyer");
  state = pickupEvent(state, id, { type: "confirm_handoff" }, "seller");
  state = pickupEvent(
    state,
    id,
    {
      type: "report_issue",
      category: "Missing item",
      severity: "Medium",
      description: "The included part is missing.",
    },
    "seller",
  );
  assert.equal(state.pickups.find((p) => p.id === id).status, "issue_open");
  assert.equal(state.items.find((i) => i.id === "chair").status, "reserved");
});
test("cancellation releases the listing and retains the transaction history", () => {
  const { state, id } = confirmed();
  const canceled = pickupEvent(state, id, { type: "cancel" }, "buyer");
  assert.equal(
    canceled.items.find((i) => i.id === "chair").status,
    "available",
  );
  assert.equal(
    canceled.pickups.find((p) => p.id === id).history.at(-1).type,
    "cancel",
  );
});
test("older one-party completion records are flagged for review rather than upgraded to confirmed handoffs", () => {
  const old = setup();
  delete old.pickups[1].handoff;
  const migrated = normalizeState(old, INITIAL_ITEMS);
  assert.equal(migrated.pickups[1].status, "needs_review");
  assert.equal(
    migrated.items.find((i) => i.id === "bedside").status,
    "reserved",
  );
  assert.equal(migrated.pickups[1].handoff.buyer.response, "pending");
});
test("CSV preserves research fields and escapes formulas, quotes and newlines", () => {
  const csv = studyCSV([
    {
      participant: "=SUM(1,2)",
      role: "buyer",
      task: "find",
      startedAt: "start",
      endedAt: "end",
      durationSeconds: 12,
      outcome: "completed",
      assistance: 0,
      confidence: 4,
      missingInformation: '"wear"\nlocation',
      notes: "notes",
    },
  ]);
  assert.match(csv, /durationSeconds/);
  assert.match(csv, /'=SUM/);
  assert.match(csv, /""wear""/);
  assert.match(csv, /confidence/);
});
test("legacy handoffs cannot bypass complete meeting terms", () => {
  const state = setup();
  const p = state.pickups[0];
  p.status = "needs_review";
  p.meeting = "";
  assert.throws(
    () => pickupEvent(state, p.id, { type: "confirm_handoff" }, "buyer"),
    /meeting point/,
  );
});

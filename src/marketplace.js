// Local prototype rules. A live pilot must enforce these rules on a server.
export const AREAS = [
  "USC Village",
  "W 27th St",
  "West 28th St",
  "Ellendale Pl",
  "North University Park",
  "University Park",
  "West Adams",
];
export const FINAL_PICKUP_STATES = ["completed", "canceled"];
export const STUDY_TASKS = {
  find: "Find furniture matching your requirements",
  assess: "Review an item and decide whether to contact",
  publish: "Publish a complete listing",
  schedule: "Agree on pickup details",
  handoff: "Confirm a handoff or report an issue",
};
export const emptyStudy = () => ({ consent: false, active: null, records: [] });
export function measurement(value) {
  const text = String(value ?? "").trim();
  if (/^\d+(?:\.\d+)?$/.test(text)) return Number(text);
  const p = text.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
  return p && Number(p[3]) > 0
    ? Number(p[1] || 0) + Number(p[2]) / Number(p[3])
    : NaN;
}
const validDate = (d) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d || "")) return false;
  const date = new Date(d + "T12:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === d;
};
const validTime = (t) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t || "");
export function listingError(item) {
  if (!item.name?.trim()) return "Enter a listing title.";
  if (
    !Number.isFinite(Number(item.price)) ||
    item.price == null ||
    String(item.price).trim() === "" ||
    Number(item.price) < 0
  )
    return "Enter a valid price of $0 or more.";
  if (!item.photos?.length && !item.views)
    return "Add at least one photo before publishing.";
  if (
    [item.width, item.depth, item.height].some(
      (v) => !Number.isFinite(measurement(v)) || measurement(v) <= 0,
    )
  )
    return "Enter positive dimensions, such as 24, 19.5, or 41 3/8.";
  if (!item.description?.trim() || !item.condition || !item.category)
    return "Add a description, category, and condition.";
  if (!item.location?.trim() || !AREAS.includes(item.area))
    return "Select a pickup area and add an approximate location.";
  if (!["none", "disclosed"].includes(item.defectState))
    return "Declare any defects, or select No known defects.";
  if (item.defectState === "disclosed" && !item.defects?.trim())
    return "Describe the defects or wear buyers should know about.";
  if (!validDate(item.deadline)) return "Choose a sell-by deadline.";
  if (
    !validDate(item.date) ||
    !validTime(item.start) ||
    !validTime(item.end) ||
    item.end <= item.start
  )
    return "Choose a pickup date and an end time after the start time.";
  if (item.date > item.deadline)
    return "Pickup availability must be on or before the sell-by deadline.";
  return "";
}
export function termsError(terms, item) {
  if (
    !validDate(terms.date) ||
    !validTime(terms.start) ||
    !validTime(terms.end) ||
    terms.end <= terms.start
  )
    return "Choose a pickup date and an end time after the start time.";
  if (!item.deadline || terms.date > item.deadline)
    return "Choose a pickup on or before the seller’s sell-by deadline.";
  if (!terms.meeting?.trim() || terms.meeting.trim().length < 5)
    return "Propose a public meeting point so both participants can review it.";
  return "";
}
export const activePickup = (pickups, id) =>
  pickups.find((p) => p.item === id && !FINAL_PICKUP_STATES.includes(p.status));
export function listingStatus(item, pickups) {
  if (item.status === "deleted") return "deleted";
  if (activePickup(pickups, item.id)) return "reserved";
  if (pickups.some((p) => p.item === item.id && p.status === "completed"))
    return "sold";
  return item.soldExternally || item.status === "sold" ? "sold" : "available";
}
export const statusLabel = (status) =>
  ({
    available: "Available",
    reserved: "Reserved",
    sold: "Sold",
    deleted: "Deleted",
    requested: "Pickup requested",
    confirmed: "Pickup confirmed",
    completion_pending: "Awaiting handoff confirmation",
    issue_open: "Unresolved issue",
    needs_review: "Needs outcome review",
    completed: "Completed",
    canceled: "Canceled",
  })[status] || status;
const pendingHandoff = () => ({
  buyer: { response: "pending", at: null },
  seller: { response: "pending", at: null },
});
const openIssues = (p) => (p.issues || []).filter((i) => i.status === "open");
export function normalizeState(raw, seeds = []) {
  const state = structuredClone(raw);
  state.study = { ...emptyStudy(), ...state.study };
  state.pickups = (state.pickups || []).map((p) => {
    let result = {
      ...p,
      version: p.version || 1,
      history: p.history || [],
      issues: p.issues || [],
      handoff: p.handoff || pendingHandoff(),
    };
    if (
      result.status === "completed" &&
      (!result.handoff.buyer?.response ||
        result.handoff.buyer.response !== "confirmed" ||
        result.handoff.seller?.response !== "confirmed")
    )
      result.status = "needs_review";
    if (result.status === "confirmed" && !result.meeting?.trim())
      result = {
        ...result,
        status: "requested",
        buyerConfirmed: false,
        sellerConfirmed: false,
      };
    return result;
  });
  state.items = (state.items || []).map((item) => {
    const seed = seeds.find((s) => s.id === item.id);
    const full = {
      ...seed,
      ...item,
      area:
        item.area || seed?.area || AREAS.find((a) => a === item.location) || "",
      deadline: item.deadline || seed?.deadline || "",
      defectState: item.defectState || seed?.defectState || "",
      defects: item.defects ?? seed?.defects ?? "",
    };
    return { ...full, status: listingStatus(full, state.pickups) };
  });
  return state;
}
export function syncTransactions(state, pickups = state.pickups) {
  return {
    ...state,
    pickups,
    items: state.items.map((i) => ({
      ...i,
      status: listingStatus(
        { ...i, status: i.status === "reserved" ? "available" : i.status },
        pickups,
      ),
    })),
  };
}
export function proposePickup(
  state,
  itemId,
  terms,
  person,
  now = new Date().toISOString(),
) {
  if (!state.profile.verified)
    throw new Error("Verify your USC email before arranging a pickup.");
  const item = state.items.find((i) => i.id === itemId);
  if (!item) throw new Error("Listing not found.");
  if (activePickup(state.pickups, itemId))
    throw new Error("This item already has an active reservation.");
  if (listingStatus(item, state.pickups) !== "available")
    throw new Error("This item is no longer available.");
  const error = termsError(terms, item);
  if (error) throw new Error(error);
  const role = item.seller === "maya" ? "selling" : "buying",
    actor = role === "selling" ? "seller" : "buyer";
  const p = {
    id: "pickup-" + crypto.randomUUID(),
    item: itemId,
    person,
    date: terms.date,
    start: terms.start,
    end: terms.end,
    meeting: terms.meeting.trim(),
    buyerConfirmed: actor === "buyer",
    sellerConfirmed: actor === "seller",
    version: 1,
    status: "requested",
    role,
    reminder: state.reminders,
    handoff: pendingHandoff(),
    issues: [],
    history: [
      { type: "proposed", actor, at: now, version: 1, terms: { ...terms } },
    ],
  };
  return { state: syncTransactions(state, [p, ...state.pickups]), pickup: p };
}
export function pickupEvent(
  state,
  id,
  event,
  actor,
  now = new Date().toISOString(),
) {
  if (!state.profile.verified)
    throw new Error("Verify your USC email before updating a transaction.");
  if (!["buyer", "seller"].includes(actor))
    throw new Error("Choose a transaction participant.");
  const original = state.pickups.find((p) => p.id === id);
  if (!original) throw new Error("Pickup not found.");
  const p = structuredClone(original),
    item = state.items.find((i) => i.id === p.item);
  const record = { type: event.type, actor, at: now, version: p.version };
  const confirmKey = actor === "buyer" ? "buyerConfirmed" : "sellerConfirmed";
  if (event.type === "reschedule") {
    if (
      FINAL_PICKUP_STATES.includes(p.status) ||
      openIssues(p).length ||
      Object.values(p.handoff).some((r) => r.response !== "pending")
    )
      throw new Error(
        "Resolve the handoff or issue before changing pickup details.",
      );
    const error = termsError(event.terms, item);
    if (error) throw new Error(error);
    Object.assign(p, event.terms, {
      meeting: event.terms.meeting.trim(),
      version: p.version + 1,
      buyerConfirmed: actor === "buyer",
      sellerConfirmed: actor === "seller",
      status: "requested",
    });
    record.version = p.version;
    record.terms = { ...event.terms };
  } else if (event.type === "confirm_terms") {
    if (p.status !== "requested")
      throw new Error("This proposal is no longer awaiting confirmation.");
    const error = termsError(p, item);
    if (error) throw new Error(error);
    p[confirmKey] = true;
    p.status =
      p.buyerConfirmed && p.sellerConfirmed ? "confirmed" : "requested";
    record.terms = {
      date: p.date,
      start: p.start,
      end: p.end,
      meeting: p.meeting,
    };
  } else if (event.type === "confirm_handoff") {
    if (
      !["confirmed", "completion_pending", "needs_review"].includes(p.status) ||
      !p.buyerConfirmed ||
      !p.sellerConfirmed ||
      openIssues(p).length
    )
      throw new Error(
        "Confirm the pickup details and resolve all issues before confirming a handoff.",
      );
    const error = termsError(p, item);
    if (error) throw new Error(error);
    p.handoff[actor] = { response: "confirmed", at: now };
    p.status =
      p.handoff.buyer.response === "confirmed" &&
      p.handoff.seller.response === "confirmed"
        ? "completed"
        : "completion_pending";
  } else if (event.type === "report_issue") {
    if (p.status === "canceled")
      throw new Error("A canceled pickup cannot be reported as a handoff.");
    if (
      !event.description?.trim() ||
      ![
        "No-show",
        "Condition or defects",
        "Missing item",
        "Pickup coordination",
        "Other",
      ].includes(event.category) ||
      !["Low", "Medium", "High"].includes(event.severity)
    )
      throw new Error("Choose an issue type, severity, and description.");
    const issue = {
      id: "issue-" + crypto.randomUUID(),
      pickupId: id,
      itemId: item.id,
      actor,
      category: event.category,
      severity: event.severity,
      description: event.description.trim(),
      status: "open",
      createdAt: now,
      resolution: { buyer: null, seller: null },
    };
    p.issues.push(issue);
    p.handoff[actor] = { response: "issue", at: now };
    p.status = "issue_open";
    record.issueId = issue.id;
  } else if (event.type === "resolve_issue") {
    const issue = p.issues.find(
      (i) => i.id === event.issueId && i.status === "open",
    );
    if (!issue) throw new Error("Open issue not found.");
    if (!event.note?.trim()) throw new Error("Describe the agreed resolution.");
    issue.resolution[actor] = { note: event.note.trim(), at: now };
    record.issueId = issue.id;
    record.note = event.note.trim();
    if (issue.resolution.buyer && issue.resolution.seller) {
      issue.status = "resolved";
      issue.resolvedAt = now;
    }
    if (!openIssues(p).length) {
      p.handoff = pendingHandoff();
      p.status =
        p.buyerConfirmed && p.sellerConfirmed ? "confirmed" : "requested";
    }
  } else if (event.type === "cancel") {
    if (
      FINAL_PICKUP_STATES.includes(p.status) ||
      openIssues(p).length ||
      p.status === "needs_review" ||
      Object.values(p.handoff).some((r) => r.response !== "pending")
    )
      throw new Error(
        "A handoff or unresolved issue must be resolved before this reservation can be released.",
      );
    p.status = "canceled";
  } else throw new Error("Unknown transaction action.");
  p.history.push(record);
  return syncTransactions(
    state,
    state.pickups.map((x) => (x.id === id ? p : x)),
  );
}
export function canChangeListingStatus(state, item) {
  return (
    !activePickup(state.pickups, item.id) &&
    !state.pickups.some((p) => p.item === item.id && p.status === "completed")
  );
}
export const studyCSV = (records) => {
  const fields = [
    "participant",
    "role",
    "task",
    "startedAt",
    "endedAt",
    "durationSeconds",
    "outcome",
    "assistance",
    "confidence",
    "missingInformation",
    "notes",
  ];
  const cell = (v) =>
    '"' +
    String(v ?? "")
      .replace(/^[=+\-@\t\r]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  return [
    fields.map(cell).join(","),
    ...records.map((r) => fields.map((k) => cell(r[k])).join(",")),
  ].join("\r\n");
};

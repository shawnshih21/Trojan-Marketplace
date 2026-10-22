import React from "react";
import { Check, Flag, Clock } from "lucide-react";
const responseText = {
  pending: "Not confirmed",
  confirmed: "Handoff confirmed",
  issue: "Issue reported",
};
export default function TransactionOutcome({
  pickup,
  ownRole,
  onEvent,
  onComplete,
  onReport,
  onResolve,
  notify,
}) {
  const other = ownRole === "buyer" ? "seller" : "buyer",
    open = pickup.issues.filter((i) => i.status === "open");
  const canConfirm =
    ["confirmed", "completion_pending", "needs_review"].includes(
      pickup.status,
    ) &&
    pickup.buyerConfirmed &&
    pickup.sellerConfirmed &&
    pickup.meeting?.trim().length >= 5 &&
    !open.length;
  return (
    <section className="outcome-panel">
      <div className="section-title">
        <h2>Handoff outcome</h2>
        {pickup.status === "completed" ? (
          <span className="pill green">Both confirmed</span>
        ) : (
          <span className="pill yellow">
            {open.length ? "Issue open" : "Not completed"}
          </span>
        )}
      </div>
      {pickup.status === "needs_review" && (
        <p className="body-copy">
          This older demo record did not capture both handoff responses. Review
          the details and confirm separately; it is excluded from completed
          purchases.
        </p>
      )}
      {["buyer", "seller"].map((role) => (
        <div className="outcome-person" key={role}>
          <span className={"initials " + (role === "buyer" ? "pink" : "green")}>
            {role === "buyer" ? "B" : "S"}
          </span>
          <div>
            <b>
              {role === "buyer" ? "Buyer" : "Seller"}
              {role === ownRole ? " · You" : " · Demo participant"}
            </b>
            <span>
              {responseText[pickup.handoff[role]?.response] || "Not confirmed"}
              {pickup.handoff[role]?.at &&
                " · " +
                  new Date(pickup.handoff[role].at).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "America/Los_Angeles",
                    },
                  )}
            </span>
          </div>
          {pickup.handoff[role]?.response === "confirmed" ? (
            <Check size={17} />
          ) : (
            <Clock size={16} />
          )}
        </div>
      ))}
      {!["completed", "canceled"].includes(pickup.status) && (
        <>
          <button
            className="secondary full spaced"
            disabled={
              !canConfirm || pickup.handoff[ownRole]?.response === "confirmed"
            }
            onClick={onComplete}
          >
            {pickup.handoff[ownRole]?.response === "confirmed"
              ? "Your handoff is confirmed"
              : "Mark as picked up"}
          </button>
          {!canConfirm && (
            <p className="fine muted spaced">
              {open.length
                ? "Resolve the issue before recording a successful handoff."
                : "Both participants must confirm pickup terms before confirming the handoff."}
            </p>
          )}
          {canConfirm &&
            pickup.handoff[ownRole]?.response === "confirmed" &&
            pickup.handoff[other]?.response !== "confirmed" && (
              <button
                className="secondary full demo-confirm spaced"
                onClick={() => {
                  const result = onEvent({ type: "confirm_handoff" }, other);
                  if (result)
                    notify(
                      result.status === "completed"
                        ? "Both handoffs confirmed. Transaction completed."
                        : "Demo handoff confirmation recorded.",
                    );
                }}
              >
                Demo: confirm {other} handoff
              </button>
            )}
        </>
      )}
      {pickup.status !== "canceled" && (
        <button className="text-button full" onClick={onReport}>
          <Flag size={14} />
          Report a transaction issue
        </button>
      )}
      {pickup.issues.map((issue) => (
        <div className={"transaction-issue " + issue.status} key={issue.id}>
          <div>
            <b>{issue.category}</b>
            <span
              className={"pill " + (issue.status === "open" ? "rose" : "green")}
            >
              {issue.status === "open" ? "Unresolved" : "Resolved"}
            </span>
          </div>
          <small>
            {issue.severity} severity · Reported by {issue.actor}
          </small>
          <p>{issue.description}</p>
          {issue.status === "open" && (
            <>
              <p className="fine muted">
                Resolution acknowledgments: buyer{" "}
                {issue.resolution.buyer ? "✓" : "pending"} · seller{" "}
                {issue.resolution.seller ? "✓" : "pending"}
              </p>
              <button className="text-button" onClick={() => onResolve(issue)}>
                Review resolution <Check size={12} />
              </button>
            </>
          )}
        </div>
      ))}
      <details className="transaction-record">
        <summary>Transaction record · {pickup.history.length} events</summary>
        <ol>
          {pickup.history.map((event, n) => (
            <li key={n}>
              <b>
                {event.type.replaceAll("_", " ")} · {event.actor}
              </b>
              <span>
                {new Date(event.at).toLocaleString("en-US", {
                  timeZone: "America/Los_Angeles",
                })}{" "}
                · Terms v{event.version}
              </span>
              {event.note && <p>{event.note}</p>}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}

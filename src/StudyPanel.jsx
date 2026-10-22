import React, { useEffect, useState } from "react";
import { Download, Play, Square, Trash2 } from "lucide-react";
import { STUDY_TASKS, studyCSV } from "./marketplace";
export default function StudyPanel({ study, onChange, notify }) {
  const [participant, setParticipant] = useState("P001"),
    [role, setRole] = useState("buyer"),
    [task, setTask] = useState("find"),
    [outcome, setOutcome] = useState("completed"),
    [assistance, setAssistance] = useState(0),
    [confidence, setConfidence] = useState(""),
    [missing, setMissing] = useState(""),
    [notes, setNotes] = useState(""),
    [now, setNow] = useState(Date.now()),
    [confirmClear, setConfirmClear] = useState(false);
  useEffect(() => {
    if (!study.active) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [study.active]);
  const seconds = study.active
    ? Math.max(0, Math.round((now - Date.parse(study.active.startedAt)) / 1000))
    : 0;
  const exportCSV = () => {
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + studyCSV(study.records)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "trojan-prototype-task-results.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="study-panel">
      <h2>Prototype task testing</h2>
      <p className="body-copy">
        Optional, self-reported testing records. Use participant codes, not
        names or email addresses. Results stay on this device; share an export
        with your team.
      </p>
      <label className="check-field">
        <input
          type="checkbox"
          checked={study.consent}
          disabled={!!study.active}
          onChange={(e) => onChange({ ...study, consent: e.target.checked })}
        />
        I agree to record task results locally.
      </label>
      {!study.active ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!study.consent) {
              notify("Opt in before starting a test task.");
              return;
            }
            const startedAt = new Date().toISOString();
            onChange({
              ...study,
              active: {
                id: crypto.randomUUID(),
                participant: participant.trim(),
                role,
                task,
                startedAt,
              },
            });
            setNow(Date.now());
            setOutcome("completed");
            setAssistance(0);
            setConfidence("");
            setMissing("");
            setNotes("");
          }}
        >
          <div className="form-row">
            <label className="field">
              Participant code
              <input
                required
                maxLength={30}
                value={participant}
                onChange={(e) => setParticipant(e.target.value)}
              />
            </label>
            <label className="field">
              Test role
              <select
                aria-label="Test role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </label>
          </div>
          <label className="field">
            Task
            <select
              aria-label="Task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            >
              {Object.entries(STUDY_TASKS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button className="primary full" disabled={!study.consent}>
            <Play size={15} />
            Start task
          </button>
          <p className="fine muted spaced">
            Close this panel to perform the task. Return through Profile →
            Settings → Prototype task testing to record the result.
          </p>
        </form>
      ) : (
        <>
          <div className="study-running">
            <b>{STUDY_TASKS[study.active.task]}</b>
            <span>
              {study.active.participant} · {study.active.role} · {seconds}s
              elapsed
            </span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const endedAt = new Date().toISOString();
              const record = {
                ...study.active,
                endedAt,
                durationSeconds: Math.max(
                  0,
                  Math.round(
                    (Date.parse(endedAt) - Date.parse(study.active.startedAt)) /
                      1000,
                  ),
                ),
                outcome,
                assistance: Number(assistance),
                confidence: confidence ? Number(confidence) : "",
                missingInformation: missing.trim(),
                notes: notes.trim(),
              };
              onChange({
                ...study,
                active: null,
                records: [...study.records, record],
              });
              notify("Task result saved.");
            }}
          >
            <label className="field">
              Task outcome
              <select
                aria-label="Task outcome"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
              >
                <option value="completed">Completed</option>
                <option value="not_completed">Not completed</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </label>
            <div className="form-row">
              <label className="field">
                Assistance requests
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  value={assistance}
                  onChange={(e) => setAssistance(e.target.value)}
                />
              </label>
              <label className="field">
                Confidence (1–5)
                <select
                  aria-label="Confidence (1–5)"
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value)}
                >
                  <option value="">Not answered</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              Missing information
              <textarea
                value={missing}
                onChange={(e) => setMissing(e.target.value)}
                maxLength={1000}
              />
            </label>
            <label className="field">
              Observer notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
              />
            </label>
            <button className="primary full">
              <Square size={14} />
              Finish and save result
            </button>
          </form>
        </>
      )}
      <div className="section-title">
        <h3>Task results</h3>
        <span className="fine muted">
          {study.records.length} attempts ·{" "}
          {new Set(study.records.map((r) => r.participant)).size} participants
        </span>
      </div>
      {study.records.length ? (
        <>
          <div className="study-summary">
            {["buyer", "seller"].flatMap((r) =>
              Object.entries(STUDY_TASKS).map(([id, label]) => {
                const records = study.records.filter(
                  (v) => v.role === r && v.task === id,
                );
                if (!records.length) return null;
                const unassisted = records.filter(
                  (v) => v.outcome === "completed" && v.assistance === 0,
                ).length;
                return (
                  <div key={r + id}>
                    <b>
                      {r === "buyer" ? "Buyer" : "Seller"} · {label}
                    </b>
                    <span>
                      {unassisted}/{records.length} attempts completed
                      unassisted (
                      {Math.round((unassisted / records.length) * 100)}%) ·{" "}
                      {new Set(records.map((v) => v.participant)).size}{" "}
                      participants
                    </span>
                  </div>
                );
              }),
            )}
          </div>
          <button className="secondary full spaced" onClick={exportCSV}>
            <Download size={15} />
            Export task results (CSV)
          </button>
        </>
      ) : (
        <p className="body-copy">No test results recorded yet.</p>
      )}
      <p className="prototype-note">
        Repeated attempts are counted separately. The PRD’s proposed 80%
        threshold requires participant counts for each core task. These records
        do not measure live-marketplace outcomes or prove improvement.
      </p>
      {confirmClear ? (
        <div className="action-row spaced">
          <button className="secondary" onClick={() => setConfirmClear(false)}>
            Keep records
          </button>
          <button
            className="primary"
            onClick={() => {
              onChange({ ...study, records: [] });
              setConfirmClear(false);
              notify("Task results cleared.");
            }}
          >
            Confirm clear
          </button>
        </div>
      ) : (
        !!study.records.length && (
          <button
            className="text-button danger full"
            onClick={() => setConfirmClear(true)}
          >
            <Trash2 size={13} />
            Clear test results
          </button>
        )
      )}
    </div>
  );
}

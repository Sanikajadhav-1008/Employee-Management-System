import React, { useState } from "react";

const leaveHistory = [
  { id: 1, type: "Sick Leave", from: "2026-06-01", to: "2026-06-01", days: 1, reason: "Fever", status: "Approved", appliedOn: "2026-05-30" },
  { id: 2, type: "Casual Leave", from: "2026-04-15", to: "2026-04-15", days: 1, reason: "Personal work", status: "Approved", appliedOn: "2026-04-12" },
  { id: 3, type: "Annual Leave", from: "2026-03-10", to: "2026-03-12", days: 3, reason: "Family function", status: "Approved", appliedOn: "2026-03-05" },
  { id: 4, type: "Casual Leave", from: "2026-02-20", to: "2026-02-20", days: 1, reason: "Exam", status: "Rejected", appliedOn: "2026-02-18" },
];

const leaveBalance = [
  { type: "Annual Leave", total: 12, used: 3, remaining: 9, color: "#6366f1" },
  { type: "Sick Leave", total: 6, used: 1, remaining: 5, color: "#ef4444" },
  { type: "Casual Leave", total: 6, used: 1, remaining: 5, color: "#f59e0b" },
  { type: "Compensatory", total: 3, used: 0, remaining: 3, color: "#22c55e" },
];

const leaveTypes = ["Sick Leave", "Casual Leave", "Annual Leave", "Compensatory", "Paternity/Maternity Leave"];

const MyLeaves = () => {
  const [tab, setTab] = useState("history");
  const [applyForm, setApplyForm] = useState({ type: "", from: "", to: "", reason: "" });
  const [history, setHistory] = useState(leaveHistory);
  const [success, setSuccess] = useState(false);

  const handleApply = (e) => {
    e.preventDefault();
    const days = Math.max(1, Math.round((new Date(applyForm.to) - new Date(applyForm.from)) / 86400000) + 1);
    const newLeave = {
      id: history.length + 1,
      ...applyForm, days,
      status: "Pending",
      appliedOn: new Date().toISOString().split("T")[0],
    };
    setHistory([newLeave, ...history]);
    setApplyForm({ type: "", from: "", to: "", reason: "" });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setTab("history"); }, 2000);
  };

  return (
    <div>
      <div className="page-title">My Leaves</div>
      <div className="page-subtitle">Apply for leaves and track your leave history.</div>

      {/* Leave Balance Cards */}
      <div className="row g-3 mb-4">
        {leaveBalance.map((lb) => (
          <div className="col-md-3" key={lb.type}>
            <div style={{ background: "white", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: `3px solid ${lb.color}` }}>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{lb.type}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: lb.color, marginTop: 4 }}>{lb.remaining}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>remaining of {lb.total}</div>
              <div style={{ height: 4, background: "#f1f5f9", borderRadius: 99, marginTop: 8 }}>
                <div style={{ height: "100%", width: `${(lb.remaining / lb.total) * 100}%`, background: lb.color, borderRadius: 99 }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-3">
        <button className={`btn btn-sm ${tab === "history" ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => setTab("history")}>📋 Leave History</button>
        <button className={`btn btn-sm ${tab === "apply" ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setTab("apply")}>➕ Apply for Leave</button>
      </div>

      {tab === "apply" ? (
        <div className="form-card">
          <h5 className="mb-4" style={{ fontWeight: 700 }}>Apply for Leave</h5>
          {success && <div className="alert alert-success">Leave request submitted successfully!</div>}
          <form onSubmit={handleApply}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Leave Type *</label>
                <select className="form-select" required value={applyForm.type}
                  onChange={(e) => setApplyForm({ ...applyForm, type: e.target.value })}>
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">From Date *</label>
                <input type="date" className="form-control" required value={applyForm.from}
                  onChange={(e) => setApplyForm({ ...applyForm, from: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">To Date *</label>
                <input type="date" className="form-control" required value={applyForm.to}
                  onChange={(e) => setApplyForm({ ...applyForm, to: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Reason *</label>
                <textarea className="form-control" rows={3} required placeholder="Describe your reason..."
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })} />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-success w-100">Submit Leave Request</button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="custom-table">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0
                ? <tr><td colSpan="7" className="text-center py-4 text-muted">No leave records found.</td></tr>
                : history.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.type}</td>
                    <td>{l.from}</td>
                    <td>{l.to}</td>
                    <td style={{ fontWeight: 600 }}>{l.days}</td>
                    <td style={{ color: "#64748b" }}>{l.reason}</td>
                    <td style={{ color: "#94a3b8", fontSize: 13 }}>{l.appliedOn}</td>
                    <td>
                      <span className={`status-badge ${l.status === "Approved" ? "badge-approved" : l.status === "Rejected" ? "badge-rejected" : "badge-pending"}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyLeaves;

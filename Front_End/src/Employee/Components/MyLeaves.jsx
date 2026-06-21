import axios from "axios";
import React, { useEffect, useState } from "react";

const leaveTypes = ["Sick Leave", "Casual Leave", "Annual Leave", "Compensatory", "Paternity/Maternity Leave"];

const ANNUAL_QUOTA = { "Annual Leave": 12, "Sick Leave": 6, "Casual Leave": 6, "Compensatory": 3, "Paternity/Maternity Leave": 90 };

const MyLeaves = () => {
  const [tab, setTab] = useState("history");
  const [applyForm, setApplyForm] = useState({ type: "", from: "", to: "", reason: "" });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  axios.defaults.withCredentials = true;

  const employeeId = localStorage.getItem("employeeId");

  const fetchLeaves = () => {
    if (!employeeId) { setLoading(false); return; }
    setLoading(true);
    axios.get(`http://localhost:5000/employee/leaves/${employeeId}`)
      .then((result) => {
        if (result.data.Status) setHistory(result.data.Result);
        else setError(result.data.Error);
      })
      .catch(() => setError("Could not load leave history."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Derive leave balance from approved leaves taken this year, against fixed quotas
  const leaveBalance = Object.entries(ANNUAL_QUOTA).map(([type, total]) => {
    const used = history
      .filter(l => l.leave_type === type && l.status === "Approved")
      .reduce((a, l) => a + Number(l.days), 0);
    return { type, total, used, remaining: Math.max(total - used, 0) };
  });

  const colorFor = { "Annual Leave": "#6366f1", "Sick Leave": "#ef4444", "Casual Leave": "#f59e0b", "Compensatory": "#22c55e", "Paternity/Maternity Leave": "#0ea5e9" };

  const handleApply = (e) => {
    e.preventDefault();
    setError(null);
    const days = Math.max(1, Math.round((new Date(applyForm.to) - new Date(applyForm.from)) / 86400000) + 1);

    axios.post("http://localhost:5000/employee/apply_leave", {
      employee_id: employeeId,
      leave_type: applyForm.type,
      from_date: applyForm.from,
      to_date: applyForm.to,
      days,
      reason: applyForm.reason,
    })
      .then((result) => {
        if (result.data.Status) {
          setApplyForm({ type: "", from: "", to: "", reason: "" });
          setSuccess(true);
          fetchLeaves();
          setTimeout(() => { setSuccess(false); setTab("history"); }, 1500);
        } else {
          setError(result.data.Error);
        }
      })
      .catch(() => setError("Failed to submit leave request. Please try again."));
  };

  return (
    <div>
      <div className="page-title">My Leaves</div>
      <div className="page-subtitle">Apply for leaves and track your leave history.</div>

      {error && <div className="alert alert-warning py-2">{error}</div>}

      {/* Leave Balance Cards */}
      <div className="row g-3 mb-4">
        {leaveBalance.map((lb) => (
          <div className="col-md-3" key={lb.type}>
            <div style={{ background: "white", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: `3px solid ${colorFor[lb.type]}` }}>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{lb.type}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: colorFor[lb.type], marginTop: 4 }}>{lb.remaining}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>remaining of {lb.total}</div>
              <div style={{ height: 4, background: "#f1f5f9", borderRadius: 99, marginTop: 8 }}>
                <div style={{ height: "100%", width: `${(lb.remaining / lb.total) * 100}%`, background: colorFor[lb.type], borderRadius: 99 }}></div>
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
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">Loading leave history…</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No leave records found.</td></tr>
              ) : history.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.leave_type}</td>
                  <td>{l.from_date?.split?.("T")?.[0] || l.from_date}</td>
                  <td>{l.to_date?.split?.("T")?.[0] || l.to_date}</td>
                  <td style={{ fontWeight: 600 }}>{l.days}</td>
                  <td style={{ color: "#64748b" }}>{l.reason}</td>
                  <td style={{ color: "#94a3b8", fontSize: 13 }}>{l.applied_on?.split?.("T")?.[0] || l.applied_on}</td>
                  <td>
                    <span className={`status-badge ${l.status === "Approved" ? "badge-approved" : l.status === "Rejected" ? "badge-rejected" : "badge-pending"}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyLeaves;

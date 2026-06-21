import axios from "axios";
import React, { useEffect, useState } from "react";

const typeColors = {
  "Sick Leave": "#fee2e2",
  "Casual Leave": "#fef3c7",
  "Annual Leave": "#dbeafe",
  "Maternity Leave": "#fce7f3",
  "Paternity Leave": "#ede9fe",
};

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  axios.defaults.withCredentials = true;

  const fetchLeaves = (status) => {
    setLoading(true);
    setError(null);
    const query = status && status !== "All" ? `?status=${status}` : "";
    axios.get(`http://localhost:5000/auth/leaves${query}`)
      .then((result) => {
        if (result.data.Status) setLeaves(result.data.Result);
        else setError(result.data.Error);
      })
      .catch(() => setError("Could not connect to the server."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaves(filterStatus);
  }, [filterStatus]);

  const updateStatus = (id, newStatus) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: newStatus } : l));
    axios.put(`http://localhost:5000/auth/leaves/${id}`, { status: newStatus })
      .then((result) => {
        if (!result.data.Status) setError(result.data.Error);
      })
      .catch(() => setError("Failed to update leave status. Please try again."));
  };

  const counts = {
    Pending: leaves.filter(l => l.status === "Pending").length,
    Approved: leaves.filter(l => l.status === "Approved").length,
    Rejected: leaves.filter(l => l.status === "Rejected").length,
  };

  return (
    <div>
      <div className="page-title">Leave Management</div>
      <div className="page-subtitle">Review and approve or reject employee leave requests.</div>

      {error && <div className="alert alert-warning py-2">{error}</div>}

      {/* Summary */}
      <div className="row g-3 mb-4">
        {[
          { label: "Pending", value: counts.Pending, color: "#f59e0b", bg: "#fffbeb", icon: "⏳" },
          { label: "Approved", value: counts.Approved, color: "#22c55e", bg: "#f0fdf4", icon: "✅" },
          { label: "Rejected", value: counts.Rejected, color: "#ef4444", bg: "#fef2f2", icon: "❌" },
          { label: "Total Requests", value: leaves.length, color: "#6366f1", bg: "#eef2ff", icon: "📋" },
        ].map((c) => (
          <div className="col-md-3" key={c.label}>
            <div className="stat-card" style={{ borderLeftColor: c.color, background: c.bg }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
                </div>
                <div className="stat-icon">{c.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="d-flex gap-3 mb-3 flex-wrap align-items-end">
        <div>
          <label className="form-label fw-semibold mb-1" style={{ fontSize: 13 }}>Filter by Status</label>
          <select className="form-select" style={{ width: 180 }} value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Requests</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      <div className="custom-table">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="text-center py-4 text-muted">Loading leave requests…</td></tr>
            ) : leaves.length === 0 ? (
              <tr><td colSpan="9" className="text-center py-4 text-muted">No leave requests found.</td></tr>
            ) : leaves.map((l, i) => (
              <tr key={l.id}>
                <td style={{ color: "#94a3b8" }}>{i + 1}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{l.department}</div>
                </td>
                <td>
                  <span style={{ background: typeColors[l.leave_type] || "#f1f5f9", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                    {l.leave_type}
                  </span>
                </td>
                <td>{l.from_date?.split?.("T")?.[0] || l.from_date}</td>
                <td>{l.to_date?.split?.("T")?.[0] || l.to_date}</td>
                <td style={{ fontWeight: 600 }}>{l.days}</td>
                <td style={{ color: "#64748b", maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.reason}</td>
                <td>
                  <span className={`status-badge ${l.status === "Approved" ? "badge-approved" : l.status === "Rejected" ? "badge-rejected" : "badge-pending"}`}>
                    {l.status}
                  </span>
                </td>
                <td>
                  {l.status === "Pending" ? (
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-success" onClick={() => updateStatus(l.id, "Approved")}>
                        ✓ Approve
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => updateStatus(l.id, "Rejected")}>
                        ✗ Reject
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-sm btn-outline-secondary"
                      onClick={() => updateStatus(l.id, "Pending")}>Reset</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveManagement;

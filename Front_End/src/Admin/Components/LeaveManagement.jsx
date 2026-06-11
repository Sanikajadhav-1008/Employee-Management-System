import React, { useState } from "react";

const initialLeaves = [
  { id: 1, name: "Rahul Verma", department: "Finance", type: "Sick Leave", from: "2026-06-09", to: "2026-06-11", days: 3, reason: "Fever and rest", status: "Pending" },
  { id: 2, name: "Anjali Mehta", department: "Sales", type: "Casual Leave", from: "2026-06-15", to: "2026-06-15", days: 1, reason: "Personal work", status: "Pending" },
  { id: 3, name: "Vikas Nair", department: "IT", type: "Annual Leave", from: "2026-06-20", to: "2026-06-25", days: 6, reason: "Family vacation", status: "Approved" },
  { id: 4, name: "Sneha Joshi", department: "Marketing", type: "Maternity Leave", from: "2026-07-01", to: "2026-09-30", days: 91, reason: "Maternity", status: "Approved" },
  { id: 5, name: "Kunal Desai", department: "Engineering", type: "Casual Leave", from: "2026-05-20", to: "2026-05-20", days: 1, reason: "Festival", status: "Rejected" },
];

const typeColors = {
  "Sick Leave": "#fee2e2",
  "Casual Leave": "#fef3c7",
  "Annual Leave": "#dbeafe",
  "Maternity Leave": "#fce7f3",
  "Paternity Leave": "#ede9fe",
};

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [filterStatus, setFilterStatus] = useState("All");

  const updateStatus = (id, newStatus) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const filtered = filterStatus === "All" ? leaves : leaves.filter(l => l.status === filterStatus);

  const counts = {
    Pending: leaves.filter(l => l.status === "Pending").length,
    Approved: leaves.filter(l => l.status === "Approved").length,
    Rejected: leaves.filter(l => l.status === "Rejected").length,
  };

  return (
    <div>
      <div className="page-title">Leave Management</div>
      <div className="page-subtitle">Review and approve or reject employee leave requests.</div>

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
            {filtered.map((l, i) => (
              <tr key={l.id}>
                <td style={{ color: "#94a3b8" }}>{i + 1}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{l.department}</div>
                </td>
                <td>
                  <span style={{ background: typeColors[l.type] || "#f1f5f9", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                    {l.type}
                  </span>
                </td>
                <td>{l.from}</td>
                <td>{l.to}</td>
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

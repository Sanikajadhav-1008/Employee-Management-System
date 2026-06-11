import React, { useState } from "react";

const initialRecords = [
  { id: 1, name: "Aarav Sharma", department: "Engineering", date: "2026-06-10", checkIn: "09:05", checkOut: "18:10", status: "Present" },
  { id: 2, name: "Priya Patel", department: "HR", date: "2026-06-10", checkIn: "09:15", checkOut: "18:00", status: "Present" },
  { id: 3, name: "Rahul Verma", department: "Finance", date: "2026-06-10", checkIn: "—", checkOut: "—", status: "On Leave" },
  { id: 4, name: "Sneha Joshi", department: "Marketing", date: "2026-06-10", checkIn: "09:45", checkOut: "18:05", status: "Late" },
  { id: 5, name: "Kunal Desai", department: "Engineering", date: "2026-06-10", checkIn: "—", checkOut: "—", status: "Absent" },
  { id: 6, name: "Anjali Mehta", department: "Sales", date: "2026-06-10", checkIn: "08:55", checkOut: "17:55", status: "Present" },
  { id: 7, name: "Vikas Nair", department: "IT", date: "2026-06-10", checkIn: "09:02", checkOut: "18:20", status: "Present" },
];

const statusClass = {
  Present: "badge-present",
  Absent: "badge-absent",
  Late: "badge-late",
  "On Leave": "badge-pending",
};

const AttendanceManagement = () => {
  const [records, setRecords] = useState(initialRecords);
  const [date, setDate] = useState("2026-06-10");
  const [filterStatus, setFilterStatus] = useState("All");

  const counts = {
    Present: records.filter(r => r.status === "Present").length,
    Absent: records.filter(r => r.status === "Absent").length,
    Late: records.filter(r => r.status === "Late").length,
    "On Leave": records.filter(r => r.status === "On Leave").length,
  };

  const filtered = records.filter(r =>
    r.date === date && (filterStatus === "All" || r.status === filterStatus)
  );

  const updateStatus = (id, newStatus) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div>
      <div className="page-title">Attendance Management</div>
      <div className="page-subtitle">Track and manage daily employee attendance records.</div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Present", value: counts.Present, color: "#22c55e", bg: "#f0fdf4", icon: "✅" },
          { label: "Absent", value: counts.Absent, color: "#ef4444", bg: "#fef2f2", icon: "❌" },
          { label: "Late", value: counts.Late, color: "#f59e0b", bg: "#fffbeb", icon: "⏰" },
          { label: "On Leave", value: counts["On Leave"], color: "#0ea5e9", bg: "#f0f9ff", icon: "🏖️" },
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

      {/* Filters */}
      <div className="d-flex gap-3 mb-3 flex-wrap">
        <div>
          <label className="form-label fw-semibold mb-1" style={{ fontSize: 13 }}>Filter by Date</label>
          <input type="date" className="form-control" value={date}
            onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="form-label fw-semibold mb-1" style={{ fontSize: 13 }}>Filter by Status</label>
          <select className="form-select" value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All</option>
            <option>Present</option>
            <option>Absent</option>
            <option>Late</option>
            <option>On Leave</option>
          </select>
        </div>
      </div>

      <div className="custom-table">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-4 text-muted">No records found for selected date/filter.</td></tr>
            ) : filtered.map((r, i) => (
              <tr key={r.id}>
                <td style={{ color: "#94a3b8" }}>{i + 1}</td>
                <td><strong>{r.name}</strong></td>
                <td>{r.department}</td>
                <td>{r.date}</td>
                <td>{r.checkIn}</td>
                <td>{r.checkOut}</td>
                <td><span className={`status-badge ${statusClass[r.status]}`}>{r.status}</span></td>
                <td>
                  <select className="form-select form-select-sm" style={{ width: 130 }}
                    value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)}>
                    <option>Present</option>
                    <option>Absent</option>
                    <option>Late</option>
                    <option>On Leave</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceManagement;

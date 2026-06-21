import axios from "axios";
import React, { useEffect, useState } from "react";

const statusClass = {
  Present: "badge-present",
  Absent: "badge-absent",
  Late: "badge-late",
  "On Leave": "badge-pending",
};

const todayStr = () => new Date().toISOString().split("T")[0];

const AttendanceManagement = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(todayStr());
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  axios.defaults.withCredentials = true;

  const fetchAttendance = (forDate) => {
    setLoading(true);
    setError(null);
    axios.get(`http://localhost:5000/auth/attendance?date=${forDate}`)
      .then((result) => {
        if (result.data.Status) setRecords(result.data.Result);
        else setError(result.data.Error);
      })
      .catch(() => setError("Could not connect to the server."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Employee list lets the admin mark attendance even for employees
    // who don't have a record for the selected date yet.
    axios.get("http://localhost:5000/auth/employee")
      .then((result) => {
        if (result.data.Status) setEmployees(result.data.Result);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchAttendance(date);
  }, [date]);

  const counts = {
    Present: records.filter(r => r.status === "Present").length,
    Absent: records.filter(r => r.status === "Absent").length,
    Late: records.filter(r => r.status === "Late").length,
    "On Leave": records.filter(r => r.status === "On Leave").length,
  };

  const filtered = filterStatus === "All" ? records : records.filter(r => r.status === filterStatus);

  // Employees who don't yet have an attendance row for this date
  const markedIds = new Set(records.map(r => r.employee_id ?? r.id));
  const unmarked = employees.filter(e => !records.some(r => r.name === e.name && r.department === e.department));

  const updateStatus = (id, newStatus) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
    axios.put(`http://localhost:5000/auth/attendance/${id}`, {
      status: newStatus,
      check_in: null,
      check_out: null,
    }).catch(() => setError("Failed to update attendance. Please try again."));
  };

  const markAttendance = (employee_id, status) => {
    axios.post("http://localhost:5000/auth/attendance", {
      employee_id,
      date,
      status,
      check_in: status === "Present" || status === "Late" ? new Date().toTimeString().slice(0, 5) : null,
      check_out: null,
    })
      .then((result) => {
        if (result.data.Status) fetchAttendance(date);
        else setError(result.data.Error);
      })
      .catch(() => setError("Failed to mark attendance. Please try again."));
  };

  return (
    <div>
      <div className="page-title">Attendance Management</div>
      <div className="page-subtitle">Track and manage daily employee attendance records.</div>

      {error && <div className="alert alert-warning py-2">{error}</div>}

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
            {loading ? (
              <tr><td colSpan="8" className="text-center py-4 text-muted">Loading attendance…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-4 text-muted">No records found for selected date/filter.</td></tr>
            ) : filtered.map((r, i) => (
              <tr key={r.id}>
                <td style={{ color: "#94a3b8" }}>{i + 1}</td>
                <td><strong>{r.name}</strong></td>
                <td>{r.department}</td>
                <td>{r.date?.split?.("T")?.[0] || r.date}</td>
                <td>{r.check_in || "—"}</td>
                <td>{r.check_out || "—"}</td>
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

      {/* Employees not yet marked for this date */}
      {!loading && unmarked.length > 0 && (
        <div className="mt-4">
          <h6 className="fw-semibold mb-2">Not Yet Marked for {date}</h6>
          <div className="custom-table">
            <table className="table mb-0">
              <thead>
                <tr><th>Employee</th><th>Department</th><th>Mark As</th></tr>
              </thead>
              <tbody>
                {unmarked.map((e) => (
                  <tr key={e.id}>
                    <td><strong>{e.name}</strong></td>
                    <td>{e.department}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-success" onClick={() => markAttendance(e.id, "Present")}>Present</button>
                        <button className="btn btn-sm btn-danger" onClick={() => markAttendance(e.id, "Absent")}>Absent</button>
                        <button className="btn btn-sm btn-warning" onClick={() => markAttendance(e.id, "Late")}>Late</button>
                        <button className="btn btn-sm btn-info" onClick={() => markAttendance(e.id, "On Leave")}>On Leave</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;

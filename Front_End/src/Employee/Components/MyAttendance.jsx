import axios from "axios";
import React, { useEffect, useState } from "react";

const statusClass = {
  Present: "badge-present",
  Absent: "badge-absent",
  Late: "badge-late",
  "On Leave": "badge-pending",
};

const dayName = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" });
};

const hoursBetween = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return "—";
  const [h1, m1] = checkIn.split(":").map(Number);
  const [h2, m2] = checkOut.split(":").map(Number);
  let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (mins < 0) return "—";
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const id = localStorage.getItem("employeeId");
    if (!id) { setLoading(false); return; }
    axios.get(`http://localhost:5000/employee/attendance/${id}`)
      .then((result) => {
        if (result.data.Status) {
          const withDay = result.data.Result.map(r => ({
            ...r,
            date: r.date?.split?.("T")?.[0] || r.date,
            day: dayName(r.date),
            hours: hoursBetween(r.check_in, r.check_out),
          }));
          setRecords(withDay);
        } else setError(result.data.Error);
      })
      .catch(() => setError("Could not load attendance records."))
      .finally(() => setLoading(false));
  }, []);

  const present = records.filter(d => d.status === "Present").length;
  const late = records.filter(d => d.status === "Late").length;
  const absent = records.filter(d => d.status === "Absent").length;
  const onLeave = records.filter(d => d.status === "On Leave").length;
  const trackedDays = records.length || 1;
  const pct = Math.round(((present + late) / trackedDays) * 100);

  const filtered = filter === "All" ? records : records.filter(d => d.status === filter);

  return (
    <div>
      <div className="page-title">My Attendance</div>
      <div className="page-subtitle">View your daily attendance records and working hours.</div>

      {error && <div className="alert alert-warning py-2">{error}</div>}

      {/* Summary */}
      <div className="row g-3 mb-4">
        {[
          { label: "Attendance Rate", value: `${pct}%`, color: "#22c55e", bg: "#f0fdf4", icon: "📊" },
          { label: "Days Present", value: present + late, color: "#6366f1", bg: "#eef2ff", icon: "✅" },
          { label: "Days Absent", value: absent, color: "#ef4444", bg: "#fef2f2", icon: "❌" },
          { label: "On Leave", value: onLeave, color: "#f59e0b", bg: "#fffbeb", icon: "🏖️" },
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

      {/* Progress Bar */}
      <div style={{ background: "white", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <div className="d-flex justify-content-between mb-1">
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Attendance Progress</span>
          <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #6366f1, #22c55e)", borderRadius: 99, transition: "width 0.5s" }}></div>
        </div>
      </div>

      {/* Filter */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {["All", "Present", "Late", "Absent", "On Leave"].map(f => (
          <button key={f}
            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="custom-table">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-4 text-muted">Loading your attendance…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4 text-muted">No attendance records found.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 500 }}>{r.date}</td>
                <td style={{ color: "#64748b" }}>{r.day}</td>
                <td>{r.check_in || "—"}</td>
                <td>{r.check_out || "—"}</td>
                <td style={{ fontWeight: r.hours !== "—" ? 600 : 400 }}>{r.hours}</td>
                <td><span className={`status-badge ${statusClass[r.status]}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyAttendance;

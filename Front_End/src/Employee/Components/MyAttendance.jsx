import React, { useState } from "react";

const attendanceData = [
  { date: "2026-06-10", day: "Wed", checkIn: "09:05", checkOut: "18:10", hours: "9h 5m", status: "Present" },
  { date: "2026-06-09", day: "Tue", checkIn: "09:15", checkOut: "18:00", hours: "8h 45m", status: "Present" },
  { date: "2026-06-08", day: "Mon", checkIn: "09:45", checkOut: "18:05", hours: "8h 20m", status: "Late" },
  { date: "2026-06-07", day: "Sun", checkIn: "—", checkOut: "—", hours: "—", status: "Weekend" },
  { date: "2026-06-06", day: "Sat", checkIn: "—", checkOut: "—", hours: "—", status: "Weekend" },
  { date: "2026-06-05", day: "Fri", checkIn: "08:58", checkOut: "18:02", hours: "9h 4m", status: "Present" },
  { date: "2026-06-04", day: "Thu", checkIn: "—", checkOut: "—", hours: "—", status: "Absent" },
  { date: "2026-06-03", day: "Wed", checkIn: "09:10", checkOut: "18:15", hours: "9h 5m", status: "Present" },
  { date: "2026-06-02", day: "Tue", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m", status: "Present" },
  { date: "2026-06-01", day: "Mon", checkIn: "—", checkOut: "—", hours: "—", status: "On Leave" },
  { date: "2026-05-31", day: "Sun", checkIn: "—", checkOut: "—", hours: "—", status: "Weekend" },
  { date: "2026-05-30", day: "Sat", checkIn: "—", checkOut: "—", hours: "—", status: "Weekend" },
  { date: "2026-05-29", day: "Fri", checkIn: "09:05", checkOut: "18:05", hours: "9h 0m", status: "Present" },
  { date: "2026-05-28", day: "Thu", checkIn: "09:20", checkOut: "18:10", hours: "8h 50m", status: "Late" },
  { date: "2026-05-27", day: "Wed", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m", status: "Present" },
];

const statusClass = {
  Present: "badge-present",
  Absent: "badge-absent",
  Late: "badge-late",
  "On Leave": "badge-pending",
  Weekend: "",
};

const MyAttendance = () => {
  const [filter, setFilter] = useState("All");

  const working = attendanceData.filter(d => d.status !== "Weekend");
  const present = working.filter(d => d.status === "Present").length;
  const late = working.filter(d => d.status === "Late").length;
  const absent = working.filter(d => d.status === "Absent").length;
  const onLeave = working.filter(d => d.status === "On Leave").length;
  const pct = Math.round(((present + late) / working.length) * 100);

  const filtered = filter === "All" ? attendanceData : attendanceData.filter(d => d.status === filter);

  return (
    <div>
      <div className="page-title">My Attendance</div>
      <div className="page-subtitle">View your daily attendance records and working hours.</div>

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
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Monthly Attendance Progress</span>
          <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #6366f1, #22c55e)", borderRadius: 99, transition: "width 0.5s" }}></div>
        </div>
      </div>

      {/* Filter */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {["All", "Present", "Late", "Absent", "On Leave", "Weekend"].map(f => (
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
            {filtered.map((r) => (
              <tr key={r.date} style={{ opacity: r.status === "Weekend" ? 0.5 : 1 }}>
                <td style={{ fontWeight: 500 }}>{r.date}</td>
                <td style={{ color: "#64748b" }}>{r.day}</td>
                <td>{r.checkIn}</td>
                <td>{r.checkOut}</td>
                <td style={{ fontWeight: r.hours !== "—" ? 600 : 400 }}>{r.hours}</td>
                <td>
                  {r.status === "Weekend"
                    ? <span style={{ color: "#94a3b8", fontSize: 13 }}>Weekend</span>
                    : <span className={`status-badge ${statusClass[r.status]}`}>{r.status}</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyAttendance;

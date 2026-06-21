import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const statusBadge = (status) => {
  const map = {
    Present: "badge-present",
    Absent: "badge-absent",
    Late: "badge-late",
    "On Leave": "badge-pending",
    Pending: "badge-pending",
    Approved: "badge-approved",
    Rejected: "badge-rejected",
  };
  return `status-badge ${map[status] || "badge-pending"}`;
};

const todayStr = () => new Date().toISOString().split("T")[0];

const AdminHome = () => {
  const [stats, setStats] = useState({ employees: 0, present: 0, onLeave: 0, payroll: 0 });
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState(null);
  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios.get("http://localhost:5000/auth/employee_count")
      .then(r => { if (r.data.Status) setStats(s => ({ ...s, employees: r.data.Result[0].employee })); })
      .catch(() => setError("Could not connect to the server."));

    axios.get("http://localhost:5000/auth/salary_count")
      .then(r => { if (r.data.Status) setStats(s => ({ ...s, payroll: r.data.Result[0].salaryOFEmp })); })
      .catch(() => {});

    axios.get("http://localhost:5000/auth/employee")
      .then(r => { if (r.data.Status) setEmployees(r.data.Result.slice(0, 5)); })
      .catch(() => {});

    axios.get(`http://localhost:5000/auth/attendance?date=${todayStr()}`)
      .then(r => {
        if (r.data.Status) {
          const present = r.data.Result.filter(a => a.status === "Present" || a.status === "Late").length;
          const onLeave = r.data.Result.filter(a => a.status === "On Leave").length;
          setStats(s => ({ ...s, present, onLeave }));
        }
      })
      .catch(() => {});

    axios.get("http://localhost:5000/auth/leaves?status=Pending")
      .then(r => { if (r.data.Status) setLeaves(r.data.Result.slice(0, 5)); })
      .catch(() => {});
  }, []);

  const statCards = [
    { label: "Total Employees", value: stats.employees, icon: "👥", color: "#6366f1", bg: "#eef2ff" },
    { label: "Present Today", value: stats.present, icon: "✅", color: "#22c55e", bg: "#f0fdf4" },
    { label: "On Leave Today", value: stats.onLeave, icon: "🏖️", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Monthly Payroll", value: `₹${Number(stats.payroll).toLocaleString()}`, icon: "💰", color: "#0ea5e9", bg: "#f0f9ff" },
  ];

  return (
    <div>
      <div className="page-title">Dashboard Overview</div>
      <div className="page-subtitle">Welcome back, Administrator! Here's what's happening today.</div>

      {error && <div className="alert alert-warning py-2">{error}</div>}

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div className="col-md-3" key={card.label}>
            <div className="stat-card" style={{ borderLeftColor: card.color, background: card.bg }}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-label">{card.label}</div>
                  <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                </div>
                <div className="stat-icon">{card.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Recent Employees */}
        <div className="col-md-7">
          <div className="custom-table">
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
              <h6 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Recent Employees</h6>
              <Link to="/dashboard/employee" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-4 text-muted">No employees yet.</td></tr>
                ) : employees.map((e) => (
                  <tr key={e.id}>
                    <td><strong>{e.name}</strong></td>
                    <td>{e.department || "—"}</td>
                    <td style={{ color: "#94a3b8" }}>{e.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Requests */}
        <div className="col-md-5">
          <div className="custom-table">
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
              <h6 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Pending Leave Requests</h6>
              <Link to="/dashboard/leaves" className="btn btn-sm btn-outline-warning">Manage</Link>
            </div>
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-4 text-muted">No pending requests.</td></tr>
                ) : leaves.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.name}</strong></td>
                    <td style={{ fontSize: "13px", color: "#64748b" }}>{l.leave_type}</td>
                    <td><span className={statusBadge(l.status)}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;

import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Mock data for demonstration when backend is unavailable
const mockStats = {
  employees: 24,
  present: 19,
  onLeave: 3,
  payroll: 148500,
};

const mockRecent = [
  { id: 1, name: "Aarav Sharma", department: "Engineering", status: "Present", joinDate: "2023-01-15" },
  { id: 2, name: "Priya Patel", department: "HR", status: "Present", joinDate: "2022-06-10" },
  { id: 3, name: "Rahul Verma", department: "Finance", status: "On Leave", joinDate: "2021-03-22" },
  { id: 4, name: "Sneha Joshi", department: "Marketing", status: "Present", joinDate: "2023-08-01" },
  { id: 5, name: "Kunal Desai", department: "Engineering", status: "Absent", joinDate: "2022-11-14" },
];

const mockLeaveRequests = [
  { id: 1, name: "Rahul Verma", type: "Sick Leave", from: "2026-06-09", to: "2026-06-11", status: "Pending" },
  { id: 2, name: "Anjali Mehta", type: "Casual Leave", from: "2026-06-15", to: "2026-06-15", status: "Pending" },
  { id: 3, name: "Vikas Nair", type: "Annual Leave", from: "2026-06-20", to: "2026-06-25", status: "Approved" },
];

const statusBadge = (status) => {
  const map = {
    Present: "badge-present",
    Absent: "badge-absent",
    "On Leave": "badge-late",
    Pending: "badge-pending",
    Approved: "badge-approved",
    Rejected: "badge-rejected",
  };
  return `status-badge ${map[status] || "badge-pending"}`;
};

const AdminHome = () => {
  const [stats, setStats] = useState(mockStats);
  const [employees, setEmployees] = useState(mockRecent);
  const [leaves, setLeaves] = useState(mockLeaveRequests);

  useEffect(() => {
    // Try to fetch from backend — fall back to mock data silently
    axios.get("http://localhost:5000/auth/employee_count").then(r => {
      if (r.data.Status) setStats(s => ({ ...s, employees: r.data.Result[0].employee }));
    }).catch(() => {});
    axios.get("http://localhost:5000/auth/salary_count").then(r => {
      if (r.data.Status) setStats(s => ({ ...s, payroll: r.data.Result[0].salaryOFEmp }));
    }).catch(() => {});
    axios.get("http://localhost:5000/auth/employee").then(r => {
      if (r.data.Status) setEmployees(r.data.Result.slice(0, 5));
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: "Total Employees", value: stats.employees, icon: "👥", color: "#6366f1", bg: "#eef2ff" },
    { label: "Present Today", value: stats.present, icon: "✅", color: "#22c55e", bg: "#f0fdf4" },
    { label: "On Leave", value: stats.onLeave, icon: "🏖️", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Monthly Payroll", value: `₹${stats.payroll.toLocaleString()}`, icon: "💰", color: "#0ea5e9", bg: "#f0f9ff" },
  ];

  return (
    <div>
      <div className="page-title">Dashboard Overview</div>
      <div className="page-subtitle">Welcome back, Administrator! Here's what's happening today.</div>

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
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td><strong>{e.name}</strong></td>
                    <td>{e.department || "—"}</td>
                    <td><span className={statusBadge(e.status || "Present")}>{e.status || "Present"}</span></td>
                    <td style={{ color: "#94a3b8" }}>{e.joinDate || e.email || "—"}</td>
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
                {leaves.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.name}</strong></td>
                    <td style={{ fontSize: "13px", color: "#64748b" }}>{l.type}</td>
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

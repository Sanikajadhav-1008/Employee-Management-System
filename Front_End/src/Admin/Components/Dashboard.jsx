import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";

const navItems = [
  { to: "/dashboard", icon: "bi-speedometer2", label: "Dashboard", exact: true },
  { to: "/dashboard/employee", icon: "bi-people-fill", label: "Employees" },
  { to: "/dashboard/attendance", icon: "bi-calendar-check-fill", label: "Attendance" },
  { to: "/dashboard/leaves", icon: "bi-calendar2-x-fill", label: "Leave Management" },
  { to: "/dashboard/payroll", icon: "bi-cash-stack", label: "Payroll" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  axios.defaults.withCredentials = true;

  const handleLogout = () => {
    axios.get("http://localhost:5000/auth/logout")
      .then(result => {
        if (result.data.Status) {
          localStorage.removeItem("valid");
          navigate("/");
        }
      });
  };

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className="sidebar d-flex flex-column">
        <div className="sidebar-brand">
          <h5>⚙️ Admin Portal</h5>
          <small>Employee Management System</small>
        </div>
        <nav className="sidebar-nav flex-grow-1">
          <ul className="nav flex-column">
            {navItems.map((item) => (
              <li className="w-100" key={item.to}>
                <Link
                  to={item.to}
                  className={`nav-link ${isActive(item.to, item.exact) ? "active" : ""}`}
                >
                  <i className={`bi ${item.icon}`}></i>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-logout">
          <button className="btn btn-sm btn-outline-danger w-100" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left me-2"></i>Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-grow-1 d-flex flex-column">
        <div className="main-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Employee Management System</h5>
          <span style={{ color: "#64748b", fontSize: "13px" }}>
            <i className="bi bi-person-circle me-1"></i>Administrator
          </span>
        </div>
        <div className="content-area flex-grow-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

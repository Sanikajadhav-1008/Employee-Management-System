import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";

const navItems = [
  { to: "/employee", icon: "bi-person-circle", label: "My Profile", exact: true },
  { to: "/employee/attendance", icon: "bi-calendar-check", label: "My Attendance" },
  { to: "/employee/leaves", icon: "bi-calendar2-x", label: "My Leaves" },
  { to: "/employee/salary", icon: "bi-wallet2", label: "Salary History" },
];

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  axios.defaults.withCredentials = true;

  const handleLogout = () => {
    axios.get("http://localhost:5000/employee/logout")
      .then(() => {
        localStorage.removeItem("valid");
        localStorage.removeItem("employeeId");
        navigate("/");
      })
      .catch(() => {
        localStorage.removeItem("valid");
        localStorage.removeItem("employeeId");
        navigate("/");
      });
  };

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to || location.pathname === "/employee/profile";
    return location.pathname.startsWith(to) && !exact;
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className="emp-sidebar d-flex flex-column">
        <div className="sidebar-brand">
          <h5>🌿 Employee Portal</h5>
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
          <button className="btn btn-sm btn-outline-light w-100" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left me-2"></i>Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-grow-1 d-flex flex-column">
        <div className="main-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Employee Management System</h5>
          <span style={{ color: "#64748b", fontSize: "13px" }}>
            <i className="bi bi-circle-fill me-1" style={{ color: "#22c55e", fontSize: 8 }}></i>
            Employee Portal
          </span>
        </div>
        <div className="content-area flex-grow-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

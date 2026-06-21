import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";

const features = [
  {
    icon: "bi-people-fill",
    title: "Employee Records",
    text: "Centralized profiles, departments, and contact details, all in one place.",
  },
  {
    icon: "bi-calendar-check-fill",
    title: "Attendance Tracking",
    text: "Daily check-ins and check-outs, logged accurately and visible instantly.",
  },
  {
    icon: "bi-calendar2-x-fill",
    title: "Leave Management",
    text: "Employees apply, admins approve, everyone sees where things stand.",
  },
  {
    icon: "bi-cash-coin",
    title: "Payroll & Payslips",
    text: "Monthly salary breakdowns with allowances, deductions, and net pay.",
  },
];

const Start = () => {
  const navigate = useNavigate();

  useEffect(() => {
    axios.defaults.withCredentials = true;

    const verifyUser = async () => {
      try {
        const result = await axios.get(
          "http://localhost:5000/auth/verify"
        );

        if (result.data.Status) {
          if (result.data.role === "admin") {
            navigate("/dashboard");
          } else {
            navigate("/employee");
          }
        }
      } catch (error) {
        console.error("Verification Error:", error);
      }
    };

    verifyUser();
  }, [navigate]);

  return (
    <div className="mainPage">
      {/* Hero Section */}
      <div className="heroSection">
        <div className="heroGrid">
          {/* Left: thesis */}
          <div className="heroLeft">
            <span className="heroEyebrow">Employee Management System</span>
            <h1>
              Run your workforce<br />from one screen.
            </h1>
            <p className="heroSub">
              Attendance, leave, and payroll — tracked accurately and visible
              to the people who need them, the moment they need them.
            </p>
          </div>

          {/* Right: portal picker */}
          <div className="heroRight">
            <button className="portalCard adminCard" onClick={() => navigate("/adminlogin")}>
              <span className="portalIcon"><i className="bi bi-shield-lock-fill"></i></span>
              <span className="portalBody">
                <span className="portalLabel">Admin Portal</span>
                <span className="portalWho">For HR & administrators</span>
                <span className="portalDesc">Manage employees, attendance, leave requests, and payroll.</span>
              </span>
              <span className="portalArrow"><i className="bi bi-arrow-right"></i></span>
            </button>

            <button className="portalCard employeeCard" onClick={() => navigate("/employee_login")}>
              <span className="portalIcon"><i className="bi bi-person-fill"></i></span>
              <span className="portalBody">
                <span className="portalLabel">Employee Portal</span>
                <span className="portalWho">For staff & team members</span>
                <span className="portalDesc">View your profile, mark leave, and check your payslips.</span>
              </span>
              <span className="portalArrow"><i className="bi bi-arrow-right"></i></span>
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="featuresSection">
        <h2 className="sectionTitle">Everything HR needs, nothing it doesn't</h2>
        <div className="featuresGrid">
          {features.map((f) => (
            <div className="featureCard" key={f.title}>
              <div className="icon"><i className={`bi ${f.icon}`}></i></div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="aboutSection">
        <h2>Built for small and growing teams</h2>
        <p>
          One login for administrators, one for employees — each sees exactly
          what's relevant to their role. No spreadsheets, no email chains,
          no guessing where the latest leave request went.
        </p>
      </div>

      <div className="footerText">
        <span>
          © 2026 Employee Management System | Developed by Sanika Bajarang Jadhav
        </span>
      </div>
    </div>
  );
};

export default Start;

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
        <div className="overlay">
          <h1>Employee Management System</h1>

          <div className="heroButtons">
            <button
              className="employeeBtn"
              onClick={() => navigate("/employee_login")}
            >
              👤 Employee Login
            </button>

            <button
              className="adminBtn"
              onClick={() => navigate("/adminlogin")}
            >
              🛡️ Admin Login
            </button>
          </div>
        </div>
      </div>

      <div className="footerText">
  <span>
    © 2026 Employee Management System | Developed by Sanika Bajarang Jadhav
  </span>
      </div>
      
    </div>
  );
};
try {
  const result = await axios.get(
    "http://localhost:5000/auth/verify",
    { withCredentials: true }
  );

  if (result.data.Status) {
    navigate(
      result.data.role === "admin"
        ? "/dashboard"
        : "/employee"
    );
  }
} catch (error) {
  console.log("User not logged in");
}

export default Start;
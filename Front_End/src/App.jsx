import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Shared
import Start from "./Admin/Components/Start";
import PrivateRoute from "./Admin/Components/PrivateRoute";

// Admin
import Login from "./Admin/Components/Login";
import Dashboard from "./Admin/Components/Dashboard";
import AdminHome from "./Admin/Components/AdminHome";
import Employee from "./Admin/Components/Employee";
import AddEmployee from "./Admin/Components/AddEmployee";
import EditEmployee from "./Admin/Components/EditEmployee";
import AttendanceManagement from "./Admin/Components/AttendanceManagement";
import LeaveManagement from "./Admin/Components/LeaveManagement";
import PayrollManagement from "./Admin/Components/PayrollManagement";

// Employee
import EmployeeLogin from "./Employee/EmployeeLogin";
import EmployeeDashboard from "./Employee/Components/EmployeeDashboard";
import MyProfile from "./Employee/Components/MyProfile";
import MyAttendance from "./Employee/Components/MyAttendance";
import MyLeaves from "./Employee/Components/MyLeaves";
import SalaryHistory from "./Employee/Components/SalaryHistory";

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/adminlogin" element={<Login />} />
        <Route path="/employee_login" element={<EmployeeLogin />} />

        {/* Admin Portal */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute role="admin">
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="" element={<AdminHome />} />
          <Route path="/dashboard/employee" element={<Employee />} />
          <Route path="/dashboard/add_employee" element={<AddEmployee />} />
          <Route path="/dashboard/edit_employee/:id" element={<EditEmployee />} />
          <Route path="/dashboard/attendance" element={<AttendanceManagement />} />
          <Route path="/dashboard/leaves" element={<LeaveManagement />} />
          <Route path="/dashboard/payroll" element={<PayrollManagement />} />
        </Route>

        {/* Employee Portal */}
        <Route
          path="/employee"
          element={
            <PrivateRoute role="employee">
              <EmployeeDashboard />
            </PrivateRoute>
          }
        >
          <Route path="" element={<MyProfile />} />
          <Route path="/employee/profile" element={<MyProfile />} />
          <Route path="/employee/attendance" element={<MyAttendance />} />
          <Route path="/employee/leaves" element={<MyLeaves />} />
          <Route path="/employee/salary" element={<SalaryHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

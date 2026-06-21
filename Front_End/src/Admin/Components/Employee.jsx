import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const mockEmployees = [
  { id: 1, name: "Aarav Sharma", email: "aarav@company.com", address: "Mumbai, MH", salary: 55000, department: "Engineering", phone: "9876543210", image: null },
  { id: 2, name: "Priya Patel", email: "priya@company.com", address: "Pune, MH", salary: 48000, department: "HR", phone: "9876543211", image: null },
  { id: 3, name: "Rahul Verma", email: "rahul@company.com", address: "Delhi, DL", salary: 62000, department: "Finance", phone: "9876543212", image: null },
  { id: 4, name: "Sneha Joshi", email: "sneha@company.com", address: "Bangalore, KA", salary: 51000, department: "Marketing", phone: "9876543213", image: null },
  { id: 5, name: "Kunal Desai", email: "kunal@company.com", address: "Ahmedabad, GJ", salary: 58000, department: "Engineering", phone: "9876543214", image: null },
];

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/auth/employee")
      .then((result) => {
        if (result.data.Status) setEmployees(result.data.Result);
        else setEmployees(mockEmployees);
      })
      .catch(() => setEmployees(mockEmployees));
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    axios.delete("http://localhost:5000/auth/delete_employee/" + id)
      .then((result) => {
        if (result.data.Status) setEmployees(employees.filter(e => e.id !== id));
        else alert(result.data.Error);
      })
      .catch(() => setEmployees(employees.filter(e => e.id !== id)));
  };

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  const avatarColor = (name) => {
    const colors = ["#6366f1","#22c55e","#f59e0b","#0ea5e9","#ec4899","#8b5cf6"];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  return (
    <div>
      <div className="page-title">Employee Management</div>
      <div className="page-subtitle">Manage all employee records — add, edit, view, and remove employees.</div>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="input-group" style={{ maxWidth: "320px" }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search" style={{ color: "#94a3b8" }}></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link to="/dashboard/add_employee" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>Add Employee
        </Link>
      </div>

      <div className="custom-table">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Employee</th>
              <th>Email</th>
              <th>Department</th>
              <th>Address</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4 text-muted">No employees found.</td></tr>
            ) : (
              filtered.map((e, i) => (
                <tr key={e.id}>
                  <td style={{ color: "#94a3b8" }}>{i + 1}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {e.image ? (
                        <img src={`http://localhost:5000/Images/${e.image}`} className="employee_image" />
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: avatarColor(e.name),
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0
                        }}>
                          {e.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{e.name}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{e.phone || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td>{e.email}</td>
                  <td>
                    <span style={{
                      background: "#eef2ff", color: "#6366f1",
                      padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600
                    }}>
                      {e.department || "—"}
                    </span>
                  </td>
                  <td style={{ color: "#64748b" }}>{e.address}</td>
                  <td style={{ fontWeight: 600, color: "#16a34a" }}>₹{Number(e.salary).toLocaleString()}</td>
                  <td>
                    <Link to={`/dashboard/edit_employee/${e.id}`} className="btn btn-sm btn-outline-primary me-2">
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(e.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-2" style={{ fontSize: "13px", color: "#94a3b8" }}>
        Showing {filtered.length} of {employees.length} employees
      </div>
    </div>
  );
};

export default Employee;

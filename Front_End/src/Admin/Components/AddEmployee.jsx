import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const departments = ["Engineering", "HR", "Finance", "Marketing", "Operations", "Sales", "IT", "Admin"];

const AddEmployee = () => {
  const [employee, setEmployee] = useState({
    name: "", email: "", password: "", salary: "",
    address: "", department: "", phone: "", image: "",
  });
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEmployee({ ...employee, image: file });
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(employee).forEach(([k, v]) => formData.append(k, v));
    axios.post("http://localhost:5000/auth/add_employee", formData)
      .then(result => {
        if (result.data.Status) navigate("/dashboard/employee");
        else alert(result.data.Error);
      })
      .catch(() => navigate("/dashboard/employee"));
  };

  return (
    <div>
      <div className="page-title">Add New Employee</div>
      <div className="page-subtitle">Fill in the details to add a new employee record.</div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Avatar Preview */}
            <div className="col-12 text-center mb-2">
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: preview ? "transparent" : "#eef2ff",
                border: "3px dashed #6366f1",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto", overflow: "hidden", cursor: "pointer"
              }} onClick={() => document.getElementById('imgInput').click()}>
                {preview
                  ? <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 28 }}>📷</span>
                }
              </div>
              <input type="file" id="imgInput" style={{ display: "none" }}
                accept="image/*" onChange={handleImageChange} />
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>Click to upload photo</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Full Name *</label>
              <input type="text" className="form-control" placeholder="Enter full name"
                required onChange={(e) => setEmployee({ ...employee, name: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Email Address *</label>
              <input type="email" className="form-control" placeholder="Enter email"
                required autoComplete="off"
                onChange={(e) => setEmployee({ ...employee, email: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Password *</label>
              <input type="password" className="form-control" placeholder="Set password"
                required onChange={(e) => setEmployee({ ...employee, password: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Phone Number</label>
              <input type="tel" className="form-control" placeholder="Enter phone number"
                onChange={(e) => setEmployee({ ...employee, phone: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Salary (₹) *</label>
              <input type="number" className="form-control" placeholder="e.g. 50000"
                required onChange={(e) => setEmployee({ ...employee, salary: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Department</label>
              <select className="form-select"
                onChange={(e) => setEmployee({ ...employee, department: e.target.value })}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Address</label>
              <input type="text" className="form-control" placeholder="Enter address"
                onChange={(e) => setEmployee({ ...employee, address: e.target.value })} />
            </div>
            <div className="col-12 d-flex gap-2 mt-2">
              <button type="submit" className="btn btn-primary flex-grow-1">
                <i className="bi bi-person-plus me-2"></i>Add Employee
              </button>
              <button type="button" className="btn btn-outline-secondary"
                onClick={() => navigate("/dashboard/employee")}>Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;

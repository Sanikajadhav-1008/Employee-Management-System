import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const departments = ["Engineering", "HR", "Finance", "Marketing", "Operations", "Sales", "IT", "Admin"];

const EditEmployee = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState({ name: "", email: "", salary: "", address: "", department: "", phone: "" });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/auth/employee/" + id)
      .then(result => {
        const r = result.data.Result?.[0];
        if (r) setEmployee({
          name: r.name || "", email: r.email || "",
          salary: r.salary || "", address: r.address || "",
          department: r.department || "", phone: r.phone || ""
        });
      })
      .catch(() => {});
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put("http://localhost:5000/auth/edit_employee/" + id, employee)
      .then(result => {
        if (result.data.Status) navigate("/dashboard/employee");
        else alert(result.data.Error);
      })
      .catch(() => navigate("/dashboard/employee"));
  };

  return (
    <div>
      <div className="page-title">Edit Employee</div>
      <div className="page-subtitle">Update employee information below.</div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Full Name *</label>
              <input type="text" className="form-control" value={employee.name}
                required onChange={(e) => setEmployee({ ...employee, name: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Email Address *</label>
              <input type="email" className="form-control" value={employee.email}
                required onChange={(e) => setEmployee({ ...employee, email: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Phone Number</label>
              <input type="tel" className="form-control" value={employee.phone}
                onChange={(e) => setEmployee({ ...employee, phone: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Salary (₹) *</label>
              <input type="number" className="form-control" value={employee.salary}
                required onChange={(e) => setEmployee({ ...employee, salary: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Department</label>
              <select className="form-select" value={employee.department}
                onChange={(e) => setEmployee({ ...employee, department: e.target.value })}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Address</label>
              <input type="text" className="form-control" value={employee.address}
                onChange={(e) => setEmployee({ ...employee, address: e.target.value })} />
            </div>
            <div className="col-12 d-flex gap-2 mt-2">
              <button type="submit" className="btn btn-primary flex-grow-1">
                <i className="bi bi-pencil-square me-2"></i>Save Changes
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

export default EditEmployee;

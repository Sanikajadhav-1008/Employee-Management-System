import axios from "axios";
import React, { useEffect, useState } from "react";

const currentMonthLabel = () => {
  const d = new Date();
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
};

const lastNMonths = (n) => {
  const out = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(d.toLocaleString("en-US", { month: "long", year: "numeric" }));
    d.setMonth(d.getMonth() - 1);
  }
  return out;
};

const PayrollManagement = () => {
  const [payroll, setPayroll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthLabel());
  const [showEdit, setShowEdit] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showGenerate, setShowGenerate] = useState(null);
  const [genForm, setGenForm] = useState({ basic: "", hra: "", ta: "", deductions: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  axios.defaults.withCredentials = true;

  const months = lastNMonths(6);

  const fetchPayroll = (month) => {
    setLoading(true);
    setError(null);
    axios.get(`http://localhost:5000/auth/payroll?month=${encodeURIComponent(month)}`)
      .then((result) => {
        if (result.data.Status) setPayroll(result.data.Result);
        else setError(result.data.Error);
      })
      .catch(() => setError("Could not connect to the server."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    axios.get("http://localhost:5000/auth/employee")
      .then((result) => { if (result.data.Status) setEmployees(result.data.Result); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPayroll(selectedMonth);
  }, [selectedMonth]);

  const totalNet = payroll.reduce((a, p) => a + Number(p.net), 0);
  const paid = payroll.filter(p => p.status === "Paid").length;
  const pending = payroll.filter(p => p.status === "Pending").length;

  // Employees with no payroll record yet for the selected month
  const notGenerated = employees.filter(e => !payroll.some(p => p.name === e.name && p.department === e.department));

  const markPaid = (p) => {
    axios.put(`http://localhost:5000/auth/payroll/${p.id}`, {
      basic: p.basic, hra: p.hra, ta: p.ta, deductions: p.deductions, status: "Paid",
    })
      .then((result) => {
        if (result.data.Status) fetchPayroll(selectedMonth);
        else setError(result.data.Error);
      })
      .catch(() => setError("Failed to mark as paid. Please try again."));
  };

  const openEdit = (emp) => {
    setEditForm({ ...emp });
    setShowEdit(emp.id);
  };

  const saveEdit = () => {
    const f = editForm;
    axios.put(`http://localhost:5000/auth/payroll/${f.id}`, {
      basic: f.basic, hra: f.hra, ta: f.ta, deductions: f.deductions, status: f.status,
    })
      .then((result) => {
        if (result.data.Status) {
          fetchPayroll(selectedMonth);
          setShowEdit(null);
        } else setError(result.data.Error);
      })
      .catch(() => setError("Failed to save changes. Please try again."));
  };

  const openGenerate = (emp) => {
    setGenForm({ basic: emp.salary || "", hra: "", ta: "", deductions: "" });
    setShowGenerate(emp);
  };

  const generatePayroll = () => {
    axios.post("http://localhost:5000/auth/payroll", {
      employee_id: showGenerate.id,
      basic: genForm.basic || 0,
      hra: genForm.hra || 0,
      ta: genForm.ta || 0,
      deductions: genForm.deductions || 0,
      month: selectedMonth,
    })
      .then((result) => {
        if (result.data.Status) {
          fetchPayroll(selectedMonth);
          setShowGenerate(null);
        } else setError(result.data.Error);
      })
      .catch(() => setError("Failed to generate payroll. Please try again."));
  };

  return (
    <div>
      <div className="page-title">Payroll Management</div>
      <div className="page-subtitle">Manage monthly salary, allowances, and payslip generation.</div>

      {error && <div className="alert alert-warning py-2">{error}</div>}

      {/* Summary */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Payroll", value: `₹${totalNet.toLocaleString()}`, color: "#6366f1", bg: "#eef2ff", icon: "💰" },
          { label: "Employees Paid", value: paid, color: "#22c55e", bg: "#f0fdf4", icon: "✅" },
          { label: "Pending Payments", value: pending, color: "#f59e0b", bg: "#fffbeb", icon: "⏳" },
          { label: "Total Employees", value: payroll.length, color: "#0ea5e9", bg: "#f0f9ff", icon: "👥" },
        ].map((c) => (
          <div className="col-md-3" key={c.label}>
            <div className="stat-card" style={{ borderLeftColor: c.color, background: c.bg }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
                </div>
                <div className="stat-icon">{c.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Month Filter */}
      <div className="d-flex gap-3 mb-3">
        <div>
          <label className="form-label fw-semibold mb-1" style={{ fontSize: 13 }}>Select Month</label>
          <select className="form-select" style={{ width: 180 }} value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}>
            {months.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="custom-table">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Basic</th>
              <th>HRA</th>
              <th>TA</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center py-4 text-muted">Loading payroll…</td></tr>
            ) : payroll.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-4 text-muted">No payroll records for {selectedMonth} yet.</td></tr>
            ) : payroll.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{p.department}</div>
                </td>
                <td>₹{Number(p.basic).toLocaleString()}</td>
                <td>₹{Number(p.hra).toLocaleString()}</td>
                <td>₹{Number(p.ta).toLocaleString()}</td>
                <td style={{ color: "#ef4444" }}>-₹{Number(p.deductions).toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: "#16a34a" }}>₹{Number(p.net).toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${p.status === "Paid" ? "badge-approved" : "badge-pending"}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(p)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    {p.status === "Pending" && (
                      <button className="btn btn-sm btn-success" onClick={() => markPaid(p)}>
                        Pay
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {payroll.length > 0 && (
            <tfoot>
              <tr style={{ background: "#f8fafc" }}>
                <td colSpan={5} style={{ fontWeight: 700, textAlign: "right" }}>Total Net Payroll:</td>
                <td style={{ fontWeight: 700, color: "#16a34a", fontSize: 16 }}>₹{totalNet.toLocaleString()}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Employees without a payroll record this month */}
      {!loading && notGenerated.length > 0 && (
        <div className="mt-4">
          <h6 className="fw-semibold mb-2">Not Yet Generated for {selectedMonth}</h6>
          <div className="custom-table">
            <table className="table mb-0">
              <thead><tr><th>Employee</th><th>Department</th><th>Action</th></tr></thead>
              <tbody>
                {notGenerated.map((e) => (
                  <tr key={e.id}>
                    <td><strong>{e.name}</strong></td>
                    <td>{e.department}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => openGenerate(e)}>
                        Generate Payroll
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ background: "white", borderRadius: 16, padding: 32, width: 420 }}>
            <h5 className="mb-4">Edit Salary — {editForm.name}</h5>
            <div className="row g-3">
              {[
                { label: "Basic Salary", key: "basic" },
                { label: "HRA", key: "hra" },
                { label: "Travel Allowance", key: "ta" },
                { label: "Deductions", key: "deductions" },
              ].map(({ label, key }) => (
                <div className="col-6" key={key}>
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>{label} (₹)</label>
                  <input type="number" className="form-control" value={editForm[key]}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} />
                </div>
              ))}
              <div className="col-12">
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 16px" }}>
                  <span style={{ color: "#64748b" }}>Net Salary: </span>
                  <strong style={{ color: "#16a34a", fontSize: 18 }}>
                    ₹{(Number(editForm.basic) + Number(editForm.hra) + Number(editForm.ta) - Number(editForm.deductions)).toLocaleString()}
                  </strong>
                </div>
              </div>
              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary flex-grow-1" onClick={saveEdit}>Save Changes</button>
                <button className="btn btn-outline-secondary" onClick={() => setShowEdit(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerate && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ background: "white", borderRadius: 16, padding: 32, width: 420 }}>
            <h5 className="mb-4">Generate Payroll — {showGenerate.name}</h5>
            <div className="row g-3">
              {[
                { label: "Basic Salary", key: "basic" },
                { label: "HRA", key: "hra" },
                { label: "Travel Allowance", key: "ta" },
                { label: "Deductions", key: "deductions" },
              ].map(({ label, key }) => (
                <div className="col-6" key={key}>
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>{label} (₹)</label>
                  <input type="number" className="form-control" value={genForm[key]}
                    onChange={(e) => setGenForm({ ...genForm, [key]: e.target.value })} />
                </div>
              ))}
              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary flex-grow-1" onClick={generatePayroll}>Generate</button>
                <button className="btn btn-outline-secondary" onClick={() => setShowGenerate(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagement;

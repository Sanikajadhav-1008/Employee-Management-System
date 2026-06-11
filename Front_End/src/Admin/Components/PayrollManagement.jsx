import React, { useState } from "react";

const initialPayroll = [
  { id: 1, name: "Aarav Sharma", department: "Engineering", basic: 55000, hra: 11000, ta: 3000, deductions: 5500, net: 63500, month: "June 2026", status: "Paid" },
  { id: 2, name: "Priya Patel", department: "HR", basic: 48000, hra: 9600, ta: 2500, deductions: 4800, net: 55300, month: "June 2026", status: "Pending" },
  { id: 3, name: "Rahul Verma", department: "Finance", basic: 62000, hra: 12400, ta: 3500, deductions: 6200, net: 71700, month: "June 2026", status: "Paid" },
  { id: 4, name: "Sneha Joshi", department: "Marketing", basic: 51000, hra: 10200, ta: 2800, deductions: 5100, net: 58900, month: "June 2026", status: "Pending" },
  { id: 5, name: "Kunal Desai", department: "Engineering", basic: 58000, hra: 11600, ta: 3200, deductions: 5800, net: 67000, month: "June 2026", status: "Paid" },
  { id: 6, name: "Anjali Mehta", department: "Sales", basic: 44000, hra: 8800, ta: 2200, deductions: 4400, net: 50600, month: "June 2026", status: "Pending" },
];

const months = ["June 2026", "May 2026", "April 2026", "March 2026"];

const PayrollManagement = () => {
  const [payroll, setPayroll] = useState(initialPayroll);
  const [selectedMonth, setSelectedMonth] = useState("June 2026");
  const [showEdit, setShowEdit] = useState(null);
  const [editForm, setEditForm] = useState({});

  const filtered = payroll.filter(p => p.month === selectedMonth);
  const totalNet = filtered.reduce((a, p) => a + p.net, 0);
  const paid = filtered.filter(p => p.status === "Paid").length;
  const pending = filtered.filter(p => p.status === "Pending").length;

  const markPaid = (id) => setPayroll(payroll.map(p => p.id === id ? { ...p, status: "Paid" } : p));

  const openEdit = (emp) => {
    setEditForm({ ...emp });
    setShowEdit(emp.id);
  };

  const saveEdit = () => {
    const f = editForm;
    const net = Number(f.basic) + Number(f.hra) + Number(f.ta) - Number(f.deductions);
    setPayroll(payroll.map(p => p.id === f.id ? { ...f, net } : p));
    setShowEdit(null);
  };

  return (
    <div>
      <div className="page-title">Payroll Management</div>
      <div className="page-subtitle">Manage monthly salary, allowances, and payslip generation.</div>

      {/* Summary */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Payroll", value: `₹${totalNet.toLocaleString()}`, color: "#6366f1", bg: "#eef2ff", icon: "💰" },
          { label: "Employees Paid", value: paid, color: "#22c55e", bg: "#f0fdf4", icon: "✅" },
          { label: "Pending Payments", value: pending, color: "#f59e0b", bg: "#fffbeb", icon: "⏳" },
          { label: "Total Employees", value: filtered.length, color: "#0ea5e9", bg: "#f0f9ff", icon: "👥" },
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
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{p.department}</div>
                </td>
                <td>₹{p.basic.toLocaleString()}</td>
                <td>₹{p.hra.toLocaleString()}</td>
                <td>₹{p.ta.toLocaleString()}</td>
                <td style={{ color: "#ef4444" }}>-₹{p.deductions.toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: "#16a34a" }}>₹{p.net.toLocaleString()}</td>
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
                      <button className="btn btn-sm btn-success" onClick={() => markPaid(p.id)}>
                        Pay
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline-secondary" title="Download Payslip">
                      <i className="bi bi-download"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f8fafc" }}>
              <td colSpan={5} style={{ fontWeight: 700, textAlign: "right" }}>Total Net Payroll:</td>
              <td style={{ fontWeight: 700, color: "#16a34a", fontSize: 16 }}>₹{totalNet.toLocaleString()}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

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
    </div>
  );
};

export default PayrollManagement;

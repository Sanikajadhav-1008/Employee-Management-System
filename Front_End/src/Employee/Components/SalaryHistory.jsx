import axios from "axios";
import React, { useEffect, useState } from "react";

const SalaryHistory = () => {
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const id = localStorage.getItem("employeeId");
    if (!id) { setLoading(false); return; }
    axios.get(`http://localhost:5000/employee/salary/${id}`)
      .then((result) => {
        if (result.data.Status) setRecords(result.data.Result);
        else setError(result.data.Error);
      })
      .catch(() => setError("Could not load salary history."))
      .finally(() => setLoading(false));
  }, []);

  const currentSalary = records[0]?.basic || 0;
  const totalEarned = records.filter(r => r.status === "Paid").reduce((a, r) => a + Number(r.net), 0);
  const totalDeductions = records.reduce((a, r) => a + Number(r.deductions), 0);

  return (
    <div>
      <div className="page-title">Salary History</div>
      <div className="page-subtitle">View your monthly salary breakdown and payment status.</div>

      {error && <div className="alert alert-warning py-2">{error}</div>}

      {/* Summary */}
      <div className="row g-3 mb-4">
        {[
          { label: "Current Basic", value: `₹${Number(currentSalary).toLocaleString()}`, color: "#6366f1", bg: "#eef2ff", icon: "💼" },
          { label: "Total Earned", value: `₹${totalEarned.toLocaleString()}`, color: "#22c55e", bg: "#f0fdf4", icon: "💰" },
          { label: "Records", value: records.length, color: "#f59e0b", bg: "#fffbeb", icon: "🗂️" },
          { label: "Total Deductions", value: `₹${totalDeductions.toLocaleString()}`, color: "#ef4444", bg: "#fef2f2", icon: "📉" },
        ].map((c) => (
          <div className="col-md-3" key={c.label}>
            <div className="stat-card" style={{ borderLeftColor: c.color, background: c.bg }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value" style={{ color: c.color, fontSize: 20 }}>{c.value}</div>
                </div>
                <div className="stat-icon">{c.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Table */}
        <div className="col-md-7">
          <div className="custom-table">
            <div className="px-4 py-3 border-bottom">
              <h6 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Monthly Salary Records</h6>
            </div>
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Basic</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-4 text-muted">Loading salary records…</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-4 text-muted">No salary records found yet.</td></tr>
                ) : records.map((r) => (
                  <tr key={r.id} style={{ cursor: "pointer" }}
                    onClick={() => setSelected(r)}
                    className={selected?.id === r.id ? "table-active" : ""}>
                    <td style={{ fontWeight: 600 }}>{r.month}</td>
                    <td>₹{Number(r.basic).toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: "#16a34a" }}>₹{Number(r.net).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${r.status === "Paid" ? "badge-approved" : "badge-pending"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {records.length > 0 && (
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>Click a row to see detailed breakdown</div>
          )}
        </div>

        {/* Breakdown */}
        <div className="col-md-5">
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", height: "100%" }}>
            {selected ? (
              <>
                <h6 className="fw-bold mb-4" style={{ color: "#1e293b" }}>Payslip — {selected.month}</h6>
                <div>
                  {[
                    { label: "Basic Salary", value: selected.basic, color: "#1e293b" },
                    { label: "House Rent Allowance", value: selected.hra, color: "#1e293b" },
                    { label: "Travel Allowance", value: selected.ta, color: "#1e293b" },
                  ].map(({ label, value, color }) => (
                    <div className="d-flex justify-content-between mb-2" key={label}>
                      <span style={{ color: "#64748b", fontSize: 14 }}>{label}</span>
                      <span style={{ color, fontWeight: 600 }}>+₹{Number(value).toLocaleString()}</span>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: "#64748b", fontSize: 14 }}>Total Earnings</span>
                    <span style={{ fontWeight: 700 }}>
                      ₹{(Number(selected.basic) + Number(selected.hra) + Number(selected.ta)).toLocaleString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span style={{ color: "#ef4444", fontSize: 14 }}>Deductions</span>
                    <span style={{ color: "#ef4444", fontWeight: 600 }}>-₹{Number(selected.deductions).toLocaleString()}</span>
                  </div>
                  <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#1e293b" }}>Net Pay</span>
                    <span style={{ fontWeight: 800, color: "#16a34a", fontSize: 22 }}>₹{Number(selected.net).toLocaleString()}</span>
                  </div>
                  {selected.status === "Paid" && selected.pay_date && (
                    <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
                      Paid on {selected.pay_date?.split?.("T")?.[0] || selected.pay_date}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                <div style={{ fontWeight: 600 }}>Select a month</div>
                <div style={{ fontSize: 13 }}>Click any row to see salary breakdown</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryHistory;

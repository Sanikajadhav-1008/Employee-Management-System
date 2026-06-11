import React, { useEffect, useState } from "react";
import axios from "axios";

const mockProfile = {
  id: 1,
  name: "Aarav Sharma",
  email: "aarav@company.com",
  phone: "9876543210",
  address: "Mumbai, Maharashtra",
  department: "Engineering",
  designation: "Senior Developer",
  joinDate: "2023-01-15",
  salary: 55000,
  image: null,
  employeeId: "EMP-001",
  manager: "Ravi Kumar",
};

const mockStats = [
  { label: "Attendance %", value: "92%", icon: "✅", color: "#22c55e", bg: "#f0fdf4" },
  { label: "Leaves Taken", value: "4", icon: "📋", color: "#f59e0b", bg: "#fffbeb" },
  { label: "Leaves Balance", value: "8", icon: "🏖️", color: "#0ea5e9", bg: "#f0f9ff" },
  { label: "Years of Service", value: "3", icon: "🏆", color: "#6366f1", bg: "#eef2ff" },
];

const MyProfile = () => {
  const [profile, setProfile] = useState(mockProfile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const id = localStorage.getItem("employeeId") || 1;
    axios.get(`http://localhost:5000/employee/detail/${id}`)
      .then(r => { if (r.data?.[0]) setProfile(r.data[0]); })
      .catch(() => {});
  }, []);

  const avatarColor = "#6366f1";

  const startEdit = () => {
    setForm({ phone: profile.phone, address: profile.address });
    setEditing(true);
  };

  const saveEdit = () => {
    setProfile({ ...profile, ...form });
    setEditing(false);
  };

  return (
    <div>
      <div className="page-title">My Profile</div>
      <div className="page-subtitle">View and update your personal information.</div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {mockStats.map((s) => (
          <div className="col-md-3" key={s.label}>
            <div className="stat-card" style={{ borderLeftColor: s.color, background: s.bg }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                </div>
                <div className="stat-icon">{s.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Profile Card */}
        <div className="col-md-4">
          <div style={{ background: "white", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", textAlign: "center" }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: avatarColor, display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 16px",
              fontSize: 40, color: "white", fontWeight: 700
            }}>
              {profile.name?.charAt(0)}
            </div>
            <h5 style={{ fontWeight: 700, color: "#1e293b" }}>{profile.name}</h5>
            <div style={{ color: "#6366f1", fontWeight: 600, marginBottom: 4 }}>{profile.designation || "Employee"}</div>
            <div style={{ color: "#64748b", fontSize: 14 }}>{profile.department}</div>
            <hr />
            <div style={{ fontSize: 13, color: "#64748b" }}>
              <div className="d-flex justify-content-between mb-1">
                <span>Employee ID:</span><strong style={{ color: "#1e293b" }}>{profile.employeeId || `EMP-00${profile.id}`}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Join Date:</span><strong style={{ color: "#1e293b" }}>{profile.joinDate || "—"}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Manager:</span><strong style={{ color: "#1e293b" }}>{profile.manager || "—"}</strong>
              </div>
            </div>
            <button className="btn btn-outline-primary btn-sm mt-3 w-100" onClick={startEdit}>
              <i className="bi bi-pencil me-1"></i>Edit Profile
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="col-md-8">
          <div style={{ background: "white", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <h6 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>Personal Information</h6>
            {editing ? (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Phone</label>
                  <input className="form-control" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Address</label>
                  <input className="form-control" value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {[
                  { label: "Full Name", value: profile.name },
                  { label: "Email Address", value: profile.email },
                  { label: "Phone Number", value: profile.phone },
                  { label: "Address", value: profile.address },
                  { label: "Department", value: profile.department },
                  { label: "Designation", value: profile.designation },
                ].map(({ label, value }) => (
                  <div className="col-md-6" key={label}>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 3 }}>{label}</div>
                    <div style={{ color: "#1e293b", fontWeight: 500 }}>{value || "—"}</div>
                  </div>
                ))}
              </div>
            )}

            <hr className="my-4" />
            <h6 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>Work Information</h6>
            <div className="row g-3">
              {[
                { label: "Employee ID", value: profile.employeeId || `EMP-00${profile.id}` },
                { label: "Department", value: profile.department },
                { label: "Salary", value: `₹${Number(profile.salary).toLocaleString()}/month` },
                { label: "Joining Date", value: profile.joinDate },
              ].map(({ label, value }) => (
                <div className="col-md-6" key={label}>
                  <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 3 }}>{label}</div>
                  <div style={{ color: "#1e293b", fontWeight: 500 }}>{value || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;

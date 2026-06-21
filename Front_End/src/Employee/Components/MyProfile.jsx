import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ attendanceRate: "—", leavesTaken: "—", leavesBalance: "—" });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  axios.defaults.withCredentials = true;

  const employeeId = localStorage.getItem("employeeId");

  useEffect(() => {
    if (!employeeId) { setLoading(false); return; }

    axios.get(`http://localhost:5000/employee/detail/${employeeId}`)
      .then((r) => {
        if (r.data?.[0]) setProfile(r.data[0]);
        else setError("Profile not found.");
      })
      .catch(() => setError("Could not load your profile."))
      .finally(() => setLoading(false));

    axios.get(`http://localhost:5000/employee/attendance/${employeeId}`)
      .then((r) => {
        if (r.data.Status) {
          const records = r.data.Result;
          const present = records.filter(a => a.status === "Present" || a.status === "Late").length;
          const rate = records.length ? Math.round((present / records.length) * 100) : 0;
          setStats(s => ({ ...s, attendanceRate: `${rate}%` }));
        }
      })
      .catch(() => {});

    axios.get(`http://localhost:5000/employee/leaves/${employeeId}`)
      .then((r) => {
        if (r.data.Status) {
          const approved = r.data.Result.filter(l => l.status === "Approved");
          const daysUsed = approved.reduce((a, l) => a + Number(l.days), 0);
          setStats(s => ({ ...s, leavesTaken: daysUsed, leavesBalance: Math.max(27 - daysUsed, 0) }));
        }
      })
      .catch(() => {});
  }, [employeeId]);

  const startEdit = () => {
    setForm({ phone: profile.phone || "", address: profile.address || "" });
    setImageFile(null);
    setPreview(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(null);
    setPreview(null);
    setEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }
    setError(null);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const saveEdit = () => {
    const formData = new FormData();
    formData.append("phone", form.phone || "");
    formData.append("address", form.address || "");
    if (imageFile) formData.append("image", imageFile);

    axios.put(`http://localhost:5000/employee/update_profile/${employeeId}`, formData)
      .then((result) => {
        if (result.data.Status) {
          setProfile({ ...profile, ...form, image: result.data.image || profile.image });
          if (preview) URL.revokeObjectURL(preview);
          setImageFile(null);
          setPreview(null);
          setEditing(false);
        } else {
          setError(result.data.Error);
        }
      })
      .catch(() => setError("Failed to update profile. Please try again."));
  };

  if (loading) {
    return <div className="text-center py-5 text-muted">Loading your profile…</div>;
  }

  if (!profile) {
    return (
      <div>
        <div className="page-title">My Profile</div>
        {error && <div className="alert alert-warning py-2">{error}</div>}
      </div>
    );
  }

  const statCards = [
    { label: "Attendance Rate", value: stats.attendanceRate, icon: "✅", color: "#22c55e", bg: "#f0fdf4" },
    { label: "Leaves Taken", value: stats.leavesTaken, icon: "📋", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Leaves Balance", value: stats.leavesBalance, icon: "🏖️", color: "#0ea5e9", bg: "#f0f9ff" },
  ];

  return (
    <div>
      <div className="page-title">My Profile</div>
      <div className="page-subtitle">View and update your personal information.</div>

      {error && <div className="alert alert-warning py-2">{error}</div>}

      {/* Stats */}
      <div className="row g-3 mb-4">
        {statCards.map((s) => (
          <div className="col-md-4" key={s.label}>
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
            <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 16px" }}>
              {preview || profile.image ? (
                <img
                  src={preview || `http://localhost:5000/Images/${profile.image}`}
                  alt={profile.name}
                  style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div style={{
                  width: 100, height: 100, borderRadius: "50%",
                  background: "#6366f1", display: "flex", alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40, color: "white", fontWeight: 700
                }}>
                  {profile.name?.charAt(0)}
                </div>
              )}
              {editing && (
                <label
                  htmlFor="profile-image-input"
                  title="Change photo"
                  style={{
                    position: "absolute", bottom: -2, right: -2,
                    width: 32, height: 32, borderRadius: "50%",
                    background: "#6366f1", color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", border: "2px solid white",
                  }}
                >
                  <i className="bi bi-camera-fill" style={{ fontSize: 14 }}></i>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
            <h5 style={{ fontWeight: 700, color: "#1e293b" }}>{profile.name}</h5>
            <div style={{ color: "#64748b", fontSize: 14 }}>{profile.department || "—"}</div>
            <hr />
            <div style={{ fontSize: 13, color: "#64748b" }}>
              <div className="d-flex justify-content-between mb-1">
                <span>Employee ID:</span><strong style={{ color: "#1e293b" }}>EMP-{String(profile.id).padStart(3, "0")}</strong>
              </div>
            </div>
            {!editing && (
              <button className="btn btn-outline-primary btn-sm mt-3 w-100" onClick={startEdit}>
                <i className="bi bi-pencil me-1"></i>Edit Profile
              </button>
            )}
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
                  <button className="btn btn-outline-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
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
                { label: "Employee ID", value: `EMP-${String(profile.id).padStart(3, "0")}` },
                { label: "Department", value: profile.department },
                { label: "Salary", value: `₹${Number(profile.salary || 0).toLocaleString()}/month` },
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

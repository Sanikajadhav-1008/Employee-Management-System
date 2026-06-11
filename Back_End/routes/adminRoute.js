import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/connection.js";
import verifyToken from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "ems_secret_key";

// ═══════════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /auth/adminlogin
 * Body: { email, password }
 */
router.post("/adminlogin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.json({ loginStatus: false, Error: "Email and password required" });

    const [rows] = await pool.query("SELECT * FROM admin WHERE email = ?", [email]);
    if (!rows.length)
      return res.json({ loginStatus: false, Error: "Invalid credentials" });

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.json({ loginStatus: false, Error: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ loginStatus: true, token });
  } catch (err) {
    console.error(err);
    res.json({ loginStatus: false, Error: "Server error" });
  }
});

/**
 * GET /auth/logout
 */
router.get("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ Status: true, message: "Logged out successfully" });
});

/**
 * GET /auth/verify  – verify admin JWT
 */
router.get("/verify", verifyToken, (req, res) => {
  res.json({ Status: true, role: req.user.role, id: req.user.id });
});

// ═══════════════════════════════════════════════════════════════════
//  EMPLOYEES
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /auth/employee  – list all employees
 */
router.get("/employee", verifyToken, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, salary, address, department, phone, image FROM employees ORDER BY id DESC"
    );
    res.json({ Status: true, Result: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch employees" });
  }
});

/**
 * GET /auth/employee/:id  – single employee
 */
router.get("/employee/:id", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM employees WHERE id = ?", [req.params.id]);
    res.json({ Status: true, Result: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Employee not found" });
  }
});

/**
 * POST /auth/add_employee  – create employee (with optional photo upload)
 */
router.post("/add_employee", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { name, email, password, salary, address, department, phone } = req.body;
    if (!name || !email || !password)
      return res.json({ Status: false, Error: "Name, email and password are required" });

    const hashedPwd = await bcrypt.hash(password, 10);
    const image = req.file ? req.file.filename : null;

    await pool.query(
      `INSERT INTO employees (name, email, password, salary, address, department, phone, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPwd, salary || 0, address || "", department || "", phone || "", image]
    );

    res.json({ Status: true, message: "Employee added successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.json({ Status: false, Error: "Email already exists" });
    console.error(err);
    res.json({ Status: false, Error: "Failed to add employee" });
  }
});

/**
 * PUT /auth/edit_employee/:id  – update employee
 */
router.put("/edit_employee/:id", verifyToken, async (req, res) => {
  try {
    const { name, email, salary, address, department, phone } = req.body;
    await pool.query(
      `UPDATE employees SET name=?, email=?, salary=?, address=?, department=?, phone=? WHERE id=?`,
      [name, email, salary, address, department, phone, req.params.id]
    );
    res.json({ Status: true, message: "Employee updated" });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Update failed" });
  }
});

/**
 * DELETE /auth/delete_employee/:id
 */
router.delete("/delete_employee/:id", verifyToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM employees WHERE id = ?", [req.params.id]);
    res.json({ Status: true, message: "Employee deleted" });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Delete failed" });
  }
});

// ═══════════════════════════════════════════════════════════════════
//  DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════

/** GET /auth/employee_count */
router.get("/employee_count", verifyToken, async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS employee FROM employees");
    res.json({ Status: true, Result: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Query failed" });
  }
});

/** GET /auth/salary_count */
router.get("/salary_count", verifyToken, async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT COALESCE(SUM(salary), 0) AS salaryOFEmp FROM employees");
    res.json({ Status: true, Result: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Query failed" });
  }
});

/** GET /auth/admin_count */
router.get("/admin_count", verifyToken, async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS admin FROM admin");
    res.json({ Status: true, Result: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Query failed" });
  }
});

// ═══════════════════════════════════════════════════════════════════
//  ATTENDANCE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /auth/attendance?date=YYYY-MM-DD
 */
router.get("/attendance", verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    const condition = date ? "WHERE a.date = ?" : "";
    const params = date ? [date] : [];
    const [rows] = await pool.query(
      `SELECT a.id, e.name, e.department, a.date, a.check_in, a.check_out, a.status
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       ${condition}
       ORDER BY a.date DESC, e.name`,
      params
    );
    res.json({ Status: true, Result: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch attendance" });
  }
});

/**
 * POST /auth/attendance  – mark attendance for an employee
 * Body: { employee_id, date, check_in, check_out, status }
 */
router.post("/attendance", verifyToken, async (req, res) => {
  try {
    const { employee_id, date, check_in, check_out, status } = req.body;
    // Upsert: if record exists for employee+date, update it
    await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in, check_out, status)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE check_in=VALUES(check_in), check_out=VALUES(check_out), status=VALUES(status)`,
      [employee_id, date, check_in || null, check_out || null, status]
    );
    res.json({ Status: true, message: "Attendance saved" });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to save attendance" });
  }
});

/**
 * PUT /auth/attendance/:id  – update single attendance record status
 * Body: { status }
 */
router.put("/attendance/:id", verifyToken, async (req, res) => {
  try {
    const { status, check_in, check_out } = req.body;
    await pool.query(
      "UPDATE attendance SET status=?, check_in=?, check_out=? WHERE id=?",
      [status, check_in || null, check_out || null, req.params.id]
    );
    res.json({ Status: true, message: "Attendance updated" });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Update failed" });
  }
});

// ═══════════════════════════════════════════════════════════════════
//  LEAVE MANAGEMENT  (admin side)
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /auth/leaves?status=Pending|Approved|Rejected
 */
router.get("/leaves", verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const condition = status && status !== "All" ? "WHERE l.status = ?" : "";
    const params = condition ? [status] : [];
    const [rows] = await pool.query(
      `SELECT l.id, e.name, e.department, l.leave_type, l.from_date, l.to_date,
              l.days, l.reason, l.status, l.applied_on
       FROM leaves l
       JOIN employees e ON l.employee_id = e.id
       ${condition}
       ORDER BY l.applied_on DESC`,
      params
    );
    res.json({ Status: true, Result: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch leaves" });
  }
});

/**
 * PUT /auth/leaves/:id  – approve / reject a leave
 * Body: { status }
 */
router.put("/leaves/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected", "Pending"].includes(status))
      return res.json({ Status: false, Error: "Invalid status" });

    await pool.query("UPDATE leaves SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ Status: true, message: `Leave ${status}` });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Update failed" });
  }
});

// ═══════════════════════════════════════════════════════════════════
//  PAYROLL MANAGEMENT  (admin side)
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /auth/payroll?month=June+2026
 */
router.get("/payroll", verifyToken, async (req, res) => {
  try {
    const { month } = req.query;
    const condition = month ? "WHERE p.month = ?" : "";
    const params = month ? [month] : [];
    const [rows] = await pool.query(
      `SELECT p.id, e.name, e.department, p.basic, p.hra, p.ta, p.deductions,
              p.net_salary AS net, p.month, p.status, p.pay_date
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       ${condition}
       ORDER BY e.name`,
      params
    );
    res.json({ Status: true, Result: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch payroll" });
  }
});

/**
 * POST /auth/payroll  – generate payroll record for an employee
 * Body: { employee_id, basic, hra, ta, deductions, month }
 */
router.post("/payroll", verifyToken, async (req, res) => {
  try {
    const { employee_id, basic, hra, ta, deductions, month } = req.body;
    const net = Number(basic) + Number(hra) + Number(ta) - Number(deductions);

    await pool.query(
      `INSERT INTO payroll (employee_id, basic, hra, ta, deductions, net_salary, month, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
       ON DUPLICATE KEY UPDATE basic=VALUES(basic), hra=VALUES(hra), ta=VALUES(ta),
         deductions=VALUES(deductions), net_salary=VALUES(net_salary)`,
      [employee_id, basic, hra, ta, deductions, net, month]
    );
    res.json({ Status: true, message: "Payroll record saved" });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to save payroll" });
  }
});

/**
 * PUT /auth/payroll/:id  – edit salary components or mark as Paid
 * Body: { basic, hra, ta, deductions, status }
 */
router.put("/payroll/:id", verifyToken, async (req, res) => {
  try {
    const { basic, hra, ta, deductions, status } = req.body;
    const net = Number(basic) + Number(hra) + Number(ta) - Number(deductions);
    const payDate = status === "Paid" ? new Date().toISOString().split("T")[0] : null;

    await pool.query(
      `UPDATE payroll SET basic=?, hra=?, ta=?, deductions=?, net_salary=?, status=?, pay_date=? WHERE id=?`,
      [basic, hra, ta, deductions, net, status || "Pending", payDate, req.params.id]
    );
    res.json({ Status: true, message: "Payroll updated" });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Update failed" });
  }
});

export default router;

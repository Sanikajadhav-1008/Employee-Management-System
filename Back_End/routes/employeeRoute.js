import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/connection.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "ems_secret_key";

// ═══════════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /employee/employee_login
 * Body: { email, password }
 */
router.post("/employee_login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.json({ loginStatus: false, Error: "Email and password required" });

    const [rows] = await pool.query("SELECT * FROM employees WHERE email = ?", [email]);
    if (!rows.length)
      return res.json({ loginStatus: false, Error: "Invalid credentials" });

    const employee = rows[0];
    const match = await bcrypt.compare(password, employee.password);
    if (!match)
      return res.json({ loginStatus: false, Error: "Invalid credentials" });

    const token = jwt.sign(
      { id: employee.id, email: employee.email, role: "employee" },
      SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ loginStatus: true, token, id: employee.id });
  } catch (err) {
    console.error(err);
    res.json({ loginStatus: false, Error: "Server error" });
  }
});

/**
 * GET /employee/logout
 */
router.get("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ Status: true });
});

// ═══════════════════════════════════════════════════════════════════
//  PROFILE
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /employee/detail/:id  – employee profile
 */
router.get("/detail/:id", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, salary, address, department, phone, image FROM employees WHERE id = ?",
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

/**
 * PUT /employee/update_profile/:id
 * Body: { phone, address }
 */
router.put("/update_profile/:id", verifyToken, async (req, res) => {
  try {
    const { phone, address } = req.body;
    await pool.query(
      "UPDATE employees SET phone=?, address=? WHERE id=?",
      [phone, address, req.params.id]
    );
    res.json({ Status: true, message: "Profile updated" });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Update failed" });
  }
});

// ═══════════════════════════════════════════════════════════════════
//  ATTENDANCE  (employee view)
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /employee/attendance/:id   – my attendance records
 * Query: ?month=2026-06  (optional, defaults to current month)
 */
router.get("/attendance/:id", verifyToken, async (req, res) => {
  try {
    const { month } = req.query;
    let condition = "WHERE a.employee_id = ?";
    const params = [req.params.id];

    if (month) {
      condition += " AND DATE_FORMAT(a.date, '%Y-%m') = ?";
      params.push(month);
    }

    const [rows] = await pool.query(
      `SELECT id, date, check_in, check_out, status
       FROM attendance a
       ${condition}
       ORDER BY date DESC`,
      params
    );
    res.json({ Status: true, Result: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch attendance" });
  }
});

// ═══════════════════════════════════════════════════════════════════
//  LEAVES  (employee view)
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /employee/leaves/:id  – my leave history
 */
router.get("/leaves/:id", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, leave_type, from_date, to_date, days, reason, status, applied_on
       FROM leaves
       WHERE employee_id = ?
       ORDER BY applied_on DESC`,
      [req.params.id]
    );
    res.json({ Status: true, Result: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch leaves" });
  }
});

/**
 * POST /employee/apply_leave  – apply for a leave
 * Body: { employee_id, leave_type, from_date, to_date, days, reason }
 */
router.post("/apply_leave", verifyToken, async (req, res) => {
  try {
    const { employee_id, leave_type, from_date, to_date, days, reason } = req.body;
    const appliedOn = new Date().toISOString().split("T")[0];

    await pool.query(
      `INSERT INTO leaves (employee_id, leave_type, from_date, to_date, days, reason, status, applied_on)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [employee_id, leave_type, from_date, to_date, days, reason, appliedOn]
    );
    res.json({ Status: true, message: "Leave request submitted" });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to apply for leave" });
  }
});

// ═══════════════════════════════════════════════════════════════════
//  SALARY  (employee view)
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /employee/salary/:id  – my payroll history
 */
router.get("/salary/:id", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, basic, hra, ta, deductions, net_salary AS net, month, status, pay_date
       FROM payroll
       WHERE employee_id = ?
       ORDER BY id DESC`,
      [req.params.id]
    );
    res.json({ Status: true, Result: rows });
  } catch (err) {
    console.error(err);
    res.json({ Status: false, Error: "Failed to fetch salary history" });
  }
});

export default router;

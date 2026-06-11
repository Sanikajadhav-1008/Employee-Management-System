-- ============================================================
--  Employee Management System — Database Schema
--  Run this file once to set up the database:
--    mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS employee_ms;
USE employee_ms;

-- ── Admin table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin (
  id       INT          AUTO_INCREMENT PRIMARY KEY,
  email    VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
);

-- Default admin: email = admin@ems.com | password = admin123
-- (bcrypt hash of "admin123" with salt 10)
INSERT IGNORE INTO admin (email, password)
VALUES (
  'admin@ems.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh9S'
'
);

-- ── Employees table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  id         INT           AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(100)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  salary     DECIMAL(10,2) DEFAULT 0,
  address    VARCHAR(255)  DEFAULT '',
  department VARCHAR(50)   DEFAULT '',
  phone      VARCHAR(20)   DEFAULT '',
  image      VARCHAR(255)  DEFAULT NULL,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── Attendance table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id          INT         AUTO_INCREMENT PRIMARY KEY,
  employee_id INT         NOT NULL,
  date        DATE        NOT NULL,
  check_in    TIME        DEFAULT NULL,
  check_out   TIME        DEFAULT NULL,
  status      ENUM('Present','Absent','Late','On Leave') DEFAULT 'Absent',
  UNIQUE KEY uniq_emp_date (employee_id, date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ── Leaves table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leaves (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  employee_id INT          NOT NULL,
  leave_type  VARCHAR(50)  NOT NULL,
  from_date   DATE         NOT NULL,
  to_date     DATE         NOT NULL,
  days        INT          DEFAULT 1,
  reason      TEXT,
  status      ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  applied_on  DATE         NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ── Payroll table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payroll (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  employee_id INT           NOT NULL,
  basic       DECIMAL(10,2) DEFAULT 0,
  hra         DECIMAL(10,2) DEFAULT 0,
  ta          DECIMAL(10,2) DEFAULT 0,
  deductions  DECIMAL(10,2) DEFAULT 0,
  net_salary  DECIMAL(10,2) DEFAULT 0,
  month       VARCHAR(20)   NOT NULL,
  status      ENUM('Pending','Paid') DEFAULT 'Pending',
  pay_date    DATE          DEFAULT NULL,
  UNIQUE KEY uniq_emp_month (employee_id, month),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

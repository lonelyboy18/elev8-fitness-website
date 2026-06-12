# ELEV8 Website Database Setup and Documentation

## Table of Contents
1. [Database Overview](#database-overview)
2. [How Database Works](#how-database-works)
3. [Where Database Is Shown](#where-database-is-shown)
4. [CRUD Operations](#crud-operations)
5. [Database Tables](#database-tables)
6. [How to Run with XAMPP](#how-to-run-with-xampp)
7. [Troubleshooting](#troubleshooting)

---

## Database Overview

This project now uses **MySQL (MariaDB) via XAMPP phpMyAdmin**.

- Database name: `elev8_db`
- Config file: `php/db_config.php`
- Optional SQL import file: `elev8_mysql.sql`

`php/db_config.php` does this automatically:
1. Connects to MySQL server (`127.0.0.1:3306`)
2. Creates database `elev8_db` if missing
3. Creates `submissions` and `users` tables if missing

---

## How Database Works

### Flow
1. User submits form from `feedback.html`
2. Request goes to `php/create_submission.php`
3. PHP uses `getDbConnection()` from `php/db_config.php`
4. Data is inserted into `elev8_db.submissions`
5. JSON response is returned to frontend

The same DB connection is used by read, update, and delete endpoints.

---

## Where Database Is Shown

### 1) In phpMyAdmin (actual DB view)
1. Start **Apache** and **MySQL** in XAMPP
2. Open `http://localhost/phpmyadmin`
3. Click database `elev8_db`
4. Open table `submissions` to see all records

### 2) In project pages
- `status.php`: shows DB connection status and total submissions
- `submissions.php`: shows submitted feedback rows in table format

---

## CRUD Operations

All CRUD endpoints are available in `php/`:

1. **CREATE**: `php/create_submission.php` (POST)
2. **READ**: `php/read_submissions.php` (GET)
3. **UPDATE**: `php/update_submission.php` (POST with `_method=PUT`)
4. **DELETE**: `php/delete_submission.php` (POST with `_method=DELETE`)

---

## Database Tables

### `submissions`
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `firstName`, `middleName`, `lastName`
- `dob` DATE
- `email`, `phone`
- `feedback` TEXT
- `category` VARCHAR
- `rating` INT
- `created_at`, `updated_at` TIMESTAMP

### `users`
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `name`, `email`, `mobile`
- `password`, `gender`
- `created_at`, `updated_at` TIMESTAMP

---

## How to Run with XAMPP

1. Start XAMPP Control Panel
2. Start **Apache** and **MySQL**
3. Place project in `C:/xampp/htdocs/Elev8 assignment`
4. Open `http://localhost/Elev8%20assignment/status.php`
5. Submit data from `feedback.html`
6. Verify records in:
	- `submissions.php`
	- `http://localhost/phpmyadmin` -> `elev8_db` -> `submissions`

---

## Troubleshooting

### Database connection failed
1. Ensure MySQL is running in XAMPP
2. Check `php/db_config.php` credentials:
	- host: `127.0.0.1`
	- port: `3306`
	- user: `root`
	- password: empty by default in XAMPP
3. Ensure no other service is blocking port `3306`

### Database not visible in phpMyAdmin
1. Open `status.php` once to trigger auto-create logic
2. Refresh phpMyAdmin and check for `elev8_db`
3. If needed, import `elev8_mysql.sql` manually via phpMyAdmin Import tab

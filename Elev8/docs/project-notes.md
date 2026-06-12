# ELEV8 Calisthenics & Fitness Studio — Project Notes

## Project Overview

ELEV8 is a premium calisthenics and fitness studio website based in Goa, India. The site is built with HTML5, CSS3, JavaScript, Bootstrap 5, PHP 8, and MySQL, featuring a complete member registration system, feedback submission, and database-driven content management.

**Live contact:** WhatsApp: +91 70661 31474 | Instagram: @elev8.goa

---

## Folder Structure

```
Elev8/
├── index.html               Homepage
├── about.html               About page
├── programs.html            Programs & pricing
├── gallery.html             Videos & photos
├── feedback.html            Feedback form
├── sign_in.html             User login
├── sign_up.html             User registration
├── delete_account.html      Account deletion
├── submissions.php          View all submissions
├── status.php               Database status dashboard
│
├── assets/
│   ├── css/
│   │   ├── main.css         All custom styles (organized by section)
│   │   └── bootstrap.min.css
│   ├── js/
│   │   ├── main.js          All custom JS (validations + enhancements)
│   │   └── bootstrap.bundle.min.js
│   ├── images/
│   │   ├── common/          logo.png (used site-wide)
│   │   ├── gallery/         Achieve.jpg, We_grow.jpg, cali_family.jpg, training_sessions.png
│   │   ├── home/            (reserved for home-specific images)
│   │   ├── about/           (reserved for about-specific images)
│   │   └── programs/        (reserved for program-specific images)
│   └── videos/
│       ├── background.mp4   Subtle full-page background (all pages)
│       ├── ELEV8_cali.mp4   About page — calisthenics showcase
│       ├── Start_journey.mp4 Homepage — journey testimonial
│       ├── flex_on.mp4      About & Gallery — strength showcase
│       ├── frontlever.mp4   About page — skill demo
│       ├── handstand-pu.mp4 Gallery — progressive training
│       ├── many_forms.mp4   Gallery — movement variety
│       └── one-finger.mp4   Gallery — grip strength drill
│
├── php/
│   ├── db_config.php        Database connection & auto-initialization
│   ├── register_user.php    POST — user registration
│   ├── login_user.php       POST — user login
│   ├── delete_user.php      POST — account deletion
│   ├── create_submission.php POST — create feedback
│   ├── read_submissions.php  GET  — read feedback
│   ├── update_submission.php POST (_method=PUT) — update feedback
│   └── delete_submission.php POST (_method=DELETE) — delete feedback
│
└── docs/
    └── project-notes.md     This file
```

---

## Database Setup (XAMPP / MySQL)

### Connection Details (db_config.php)
```
Host:     127.0.0.1
Port:     3306
Database: elev8_db
User:     root
Password: (empty — default XAMPP)
```

The database and tables are **auto-created** on first connection. No manual SQL import required.

### Tables

**`users`** — Registered members
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT | Primary key |
| name | VARCHAR(120) | Full name |
| email | VARCHAR(255) UNIQUE | Login identifier |
| mobile | VARCHAR(20) | 10-digit number |
| password | VARCHAR(255) | Hashed (PASSWORD_DEFAULT) |
| gender | VARCHAR(20) | 'male' or 'female' |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

**`submissions`** — Feedback entries
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT | Primary key |
| firstName, middleName, lastName | VARCHAR(100) | Name parts |
| dob | DATE | Date of birth |
| email | VARCHAR(255) | |
| phone | VARCHAR(20) | 10-digit number |
| feedback | TEXT | Min 10 chars |
| category | VARCHAR(100) | training/coaching/facility/schedule/other |
| rating | INT | 1–5 |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### XAMPP Setup
1. Start Apache and MySQL in XAMPP Control Panel
2. Open `http://localhost/elev8-fitness-website/Elev8/` in browser
3. Database `elev8_db` and tables are created automatically on first page load

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript (ES6) |
| Framework | Bootstrap 5.3.2 (local) |
| Fonts | Google Fonts — Bebas Neue, Sora, Inter |
| Backend | PHP 8+ |
| Database | MySQL via XAMPP |
| API style | RESTful JSON endpoints |
| Security | password_hash(), PDO prepared statements |

---

## Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| Teal | `#0F5368` | Primary, borders, headings |
| Navy | `#03141A` | Background |
| Orange | `#FF4B1F` | CTAs, accents, stars |
| Steel | `#7fa4b4` | Secondary text |
| Silver | `#c8d8e0` | Body text |
| Chalk | `#FFFFFF` | Headings on dark |

## Fonts
- **Display (h1, section titles):** Bebas Neue (Google Fonts)
- **Headings:** Sora (Google Fonts)
- **Body:** Inter (Google Fonts)

---

## Programs & Pricing

### Bodyweight Functional Training
| Duration | Original | Offer | Save |
|----------|----------|-------|------|
| Monthly | ₹2,300 | ₹2,100 | ₹200 |
| 3 Months | ₹6,900 | ₹5,800 | ₹1,100 |
| 6 Months | ₹13,000 | ₹10,800 | ₹3,000 |
| 12 Months | ₹27,600 | ₹20,000 | ₹7,600 |

### Calisthenics Skill Training
| Duration | Original | Offer | Save |
|----------|----------|-------|------|
| Monthly | ₹2,500 | ₹2,300 | ₹200 |
| 3 Months | ₹7,500 | ₹6,000 | ₹1,500 |
| 6 Months ⭐ | ₹15,000 | ₹11,500 | ₹3,500 |
| 12 Months | ₹30,000 | ₹22,000 | ₹8,000 |

### Class Schedule
- **Morning:** 5:30–6:30 AM · 6:30–7:30 AM · 7:30–8:30 AM
- **Evening:** 5:00–6:00 PM · 6:00–7:00 PM · 7:00–8:00 PM

---

## Restructure Log (June 2026)

### Files Moved
- `imgs&vid/logo.png` → `assets/images/common/logo.png`
- `imgs&vid/Achieve.jpg` → `assets/images/gallery/Achieve.jpg`
- `imgs&vid/We_grow.jpg` → `assets/images/gallery/We_grow.jpg`
- `imgs&vid/cali_family.jpg` → `assets/images/gallery/cali_family.jpg`
- `imgs&vid/training_sessions.png` → `assets/images/gallery/training_sessions.png`
- `imgs&vid/background.mp4` → `assets/videos/background.mp4`
- `imgs&vid/ELEV8_cali.mp4` → `assets/videos/ELEV8_cali.mp4`
- `imgs&vid/Start_journey.mp4` → `assets/videos/Start_journey.mp4`
- `imgs&vid/flex_on.mp4` → `assets/videos/flex_on.mp4`
- `imgs&vid/frontlever.mp4` → `assets/videos/frontlever.mp4`
- `imgs&vid/handstand-pu.mp4` → `assets/videos/handstand-pu.mp4`
- `imgs&vid/many_forms.mp4` → `assets/videos/many_forms.mp4`
- `imgs&vid/one-finger.mp4` → `assets/videos/one-finger.mp4`
- `css/bootstrap.min.css` → `assets/css/bootstrap.min.css`
- `js/bootstrap.bundle.min.js` → `assets/js/bootstrap.bundle.min.js`

### Files Merged / Renamed
- `style.css` → `assets/css/main.css` (reorganized with standard section headers)
- `validations.js` + `enhance.js` → `assets/js/main.js` (combined, organized by section)

### Files Deleted
- `style.css`, `validations.js`, `enhance.js` (superseded by assets/)
- `css/` folder — 31 unused Bootstrap variant files removed
- `js/` folder — 11 unused Bootstrap variant files removed
- `imgs&vid/` folder — all media relocated
- `DATABASE_SETUP.md`, `CHANGES.md` — consolidated into this file
- `ELEV8 Website - Technical Overview.txt`, `Elev8_project_overview.txt` — consolidated

### All Broken Paths Fixed
Every `imgs&vid/`, `css/`, `js/`, `style.css`, `validations.js`, `enhance.js` reference
updated to the new `assets/` paths in all 10 HTML/PHP files.

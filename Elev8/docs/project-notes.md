# ELEV8 Calisthenics & Fitness Studio — Project Notes

**Live contact:** WhatsApp: +91 70661 31474 · Instagram: @elev8.goa

---

## Folder Structure

```
Elev8/
│
├── .htaccess                   Apache: DirectoryIndex, security headers, gzip, caching
├── elev8_mysql.sql             Full schema reset script (DROP + CREATE). PHP auto-creates on boot.
│
├── html/                       All public HTML pages
│   ├── index.html              Homepage
│   ├── about.html              About page
│   ├── programs.html           Programs & pricing
│   ├── gallery.html            Videos & photos
│   ├── feedback.html           Feedback form (AJAX, live rating stats)
│   ├── sign_up.html            Registration (glassmorphism, AJAX, CSRF)
│   ├── sign_in.html            Login (AJAX, CSRF)
│   ├── delete_account.html     Account deletion form
│   └── dashboard.html          Member dashboard (protected, tabs: Bookings / Payments / Profile)
│
├── css/
│   ├── main.css                All custom styles (~1700 lines, organized by section)
│   └── bootstrap.min.css       Bootstrap 5.3.2 (local copy)
│
├── js/
│   ├── main.js                 All custom JS (~900 lines): enhancements + AJAX forms + dashboard
│   └── bootstrap.bundle.min.js Bootstrap JS + Popper (local copy)
│
├── assets/
│   ├── images/
│   │   ├── common/
│   │   │   ├── elev8-brand-logo.png   Navbar logo (all pages)
│   │   │   └── elev8-icon-symbol.png  Favicon
│   │   └── gallery/
│   │       ├── beach-community-workout-group.jpg
│   │       ├── indoor-group-training-session.png
│   │       ├── athlete-physique-showcase.jpg
│   │       └── calisthenics-team-beach-group.jpg
│   └── videos/
│       ├── hero-background-loop.mp4          Full-page ambient background (all pages)
│       ├── elev8-calisthenics-promo.mp4      About page — brand promo
│       ├── start-your-journey-promo.mp4      Homepage — journey section
│       ├── mobility-explosive-movement.mp4   About & Gallery
│       ├── front-lever-skill-demo.mp4        About page — skill demo
│       ├── handstand-pushup-progression.mp4  Gallery — progressive training
│       ├── calisthenics-multi-form-showcase.mp4  Gallery — movement variety
│       └── one-finger-strength-drill.mp4     Gallery — grip strength
│
├── config/
│   ├── database.php            PDO singleton, auto-creates DB + all tables on first boot
│   └── razorpay.php            API keys, INR pricing table, slot capacity constant
│
├── php/                        JSON API endpoints
│   ├── helpers.php             Shared: session, CSRF, JSON response, validation helpers
│   ├── csrf.php                GET  — return CSRF token for JS
│   ├── register.php            POST — create account, auto-login → redirect dashboard.html
│   ├── login.php               POST — authenticate → redirect dashboard.html
│   ├── logout.php              POST — destroy session
│   ├── delete_account.php      POST — re-verify credentials, delete user row
│   ├── submit_feedback.php     POST — insert feedback + rating
│   ├── rating_stats.php        GET  — AVG(rating) + COUNT(*) for live stats bar
│   ├── session_status.php      GET  — return session user or 401 (dashboard auth gate)
│   ├── update_profile.php      POST — update name + mobile
│   ├── get_bookings.php        GET  — user's bookings (last 60)
│   ├── get_payments.php        GET  — user's payment history (last 20)
│   ├── create_booking.php      POST — book a class slot (capacity + duplicate check)
│   ├── cancel_booking.php      POST — soft-cancel a booking
│   ├── slot_availability.php   GET  — available seats per time slot for a date
│   ├── razorpay_order.php      POST — create Razorpay order via API
│   └── razorpay_verify.php     POST — HMAC verify + activate subscription
│
└── docs/
    └── project-notes.md        This file
```

---

## Local Development Setup (XAMPP)

1. Start Apache + MySQL in XAMPP Control Panel
2. Place the `Elev8/` folder inside `C:\xampp\htdocs\elev8-fitness-website\`
3. Open `http://localhost/elev8-fitness-website/Elev8/` — Apache serves `html/index.html` via `.htaccess`
4. Database `elev8_db` and all tables are created automatically on first PHP request

**DB defaults (change via env vars in production):**
```
Host:     127.0.0.1
Port:     3306
Database: elev8_db
User:     root
Password: (empty — XAMPP default)
```

---

## Razorpay Setup

1. Create a free account at razorpay.com
2. Copy your **Test Key ID** and **Test Key Secret** from Dashboard → Settings → API Keys
3. Paste them in `config/razorpay.php` (or set env vars `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`)
4. Switch to Live keys when deploying to production

---

## Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | INT UNSIGNED AI | PK |
| name | VARCHAR(120) | |
| email | VARCHAR(255) UNIQUE | Login identifier |
| mobile | VARCHAR(20) | 10-digit, no country code |
| password | VARCHAR(255) | bcrypt via PASSWORD_DEFAULT |
| plan | VARCHAR(20) | `'bft'` or `'cst'` |
| program | VARCHAR(20) NULL | `'bw'` or `'ct'` — schema prep only, not set anywhere yet (see docs/future-modules.md) |
| subscription_status | VARCHAR(20) | `'inactive'` / `'active'` / `'expired'` (currently disabled — payments off) |
| subscription_expires | DATE NULL | Set by razorpay_verify.php |
| created_at / updated_at | TIMESTAMP | Auto |

### `submissions`
| Column | Type | Notes |
|--------|------|-------|
| id | INT UNSIGNED AI | PK |
| name | VARCHAR(120) | |
| email | VARCHAR(255) | |
| feedback | TEXT | Min 10 chars |
| rating | TINYINT UNSIGNED | 1–5 |
| created_at | TIMESTAMP | Auto |

### `bookings`
| Column | Type | Notes |
|--------|------|-------|
| id | INT UNSIGNED AI | PK |
| user_id | INT UNSIGNED | FK → users.id |
| class_type | VARCHAR(20) | `'bft'` or `'cst'` |
| class_date | DATE | YYYY-MM-DD |
| time_slot | VARCHAR(10) | `'05:30'` `'06:30'` `'07:30'` `'09:00'` `'17:00'` `'18:00'` `'19:00'` |
| status | VARCHAR(20) | `'confirmed'` or `'cancelled'` |
| created_at | TIMESTAMP | Auto |

Capacity limit: **15 confirmed bookings per class_date + time_slot + class_type** (set in `config/razorpay.php → MAX_SLOT_CAPACITY`).

### `payments`
| Column | Type | Notes |
|--------|------|-------|
| id | INT UNSIGNED AI | PK |
| user_id | INT UNSIGNED | FK → users.id |
| plan | VARCHAR(20) | `'bft'` or `'cst'` |
| duration_months | TINYINT | 1, 3, 6, or 12 |
| amount_paise | INT | INR × 100 |
| currency | VARCHAR(10) | `'INR'` |
| razorpay_order_id | VARCHAR(100) | From Razorpay API |
| razorpay_payment_id | VARCHAR(100) NULL | Set after payment success |
| status | VARCHAR(20) | `'pending'` → `'paid'` or `'failed'` |
| created_at / paid_at | TIMESTAMP | Auto / set on verify |

---

## Pricing (INR)

### BFT — Bodyweight Functional Training
| Duration | Offer Price | Save |
|----------|-------------|------|
| 1 Month  | ₹2,100 | ₹200 |
| 3 Months | ₹5,800 | ₹1,100 |
| 6 Months | ₹10,800 | ₹3,000 |
| 12 Months | ₹20,000 | ₹7,600 |

### CST — Calisthenics Skill Training
| Duration | Offer Price | Save |
|----------|-------------|------|
| 1 Month  | ₹2,300 | ₹200 |
| 3 Months | ₹6,000 | ₹1,500 |
| 6 Months ★ | ₹11,500 | ₹3,500 |
| 12 Months | ₹22,000 | ₹8,000 |

---

## Class Schedule
- **Morning:** 5:30 AM · 6:30 AM · 7:30 AM · 9:00 AM
- **Evening:** 5:00 PM · 6:00 PM · 7:00 PM

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, vanilla JS (ES2020) |
| CSS framework | Bootstrap 5.3.2 (local) |
| Fonts | Google Fonts — Bebas Neue, Sora, Inter |
| Backend | PHP 8+ with PDO |
| Database | MySQL 8 via XAMPP |
| Payments | Razorpay (INR, UPI / Cards / Net Banking) |
| Security | bcrypt, PDO prepared statements, CSRF tokens, SameSite cookies |

## Brand Tokens (CSS custom properties in main.css)

| Token | Value | Usage |
|-------|-------|-------|
| `--teal` | `#0F5368` | Primary, borders, headings |
| `--navy` | `#03141A` | Page background |
| `--orange` | `#FF4B1F` | CTAs, accents |
| `--steel` | `#7fa4b4` | Secondary text |
| `--silver` | `#c8d8e0` | Body text |
| `--chalk` | `#FFFFFF` | Headings on dark |
| `--font-display` | Bebas Neue | h1, section counters |
| `--font-heading` | Sora | h2–h4, nav, labels |
| `--font-body` | Inter | Paragraphs, forms |

---

## Coaches (fictional — index.html trainer section)

| Name | Role | Background |
|------|------|------------|
| Rohan Naik | Head Coach | 8 years calisthenics, handstand/lever specialist |
| Priya Dessai | Strength & Mobility | Certified FMS specialist, injury prevention focus |
| Dev Kamat | Community & Classes | CrossFit L-1 → calisthenics, energetic group sessions |

---

## Tasks Completed

| Task | Status | Notes |
|------|--------|-------|
| Task 1 — PHP + MySQL backend | ✅ | register, login, logout, feedback, delete account, CSRF, sessions |
| Task 2 — Dashboard + Booking + Payments | ✅ | dashboard.html, 9 new PHP endpoints, Razorpay integration |
| Task 3 — Bug fixes | ✅ | Active nav, lazy loading, trainer names, UTF-8, meta refresh |
| Task 4 — Blog, Contact, Membership pages | ⏳ | Pending |
| Task 5 — UI/UX enhancements | ⏳ | Pending |
| Task 6 — AI chatbot widget | ⏳ | Pending |
| Task 7 — SEO & deployment | ⏳ | Pending |

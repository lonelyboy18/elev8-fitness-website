-- =============================================================================
-- ELEV8 Calisthenics & Fitness Studio — Database Schema (Task 2 update)
-- Run this ONLY to reset the database from scratch.
-- The PHP backend auto-creates tables on first boot (no manual import needed).
-- =============================================================================

-- Drop and recreate the database for a clean slate
DROP DATABASE IF EXISTS elev8_db;
CREATE DATABASE elev8_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE elev8_db;

-- ─── users ───────────────────────────────────────────────────────────────────
-- Registered members. Passwords stored as bcrypt hashes (never plain text).
CREATE TABLE users (
    id                   INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
    name                 VARCHAR(120)    NOT NULL,
    email                VARCHAR(255)    NOT NULL,
    mobile               VARCHAR(20)     NOT NULL,          -- 10-digit, stored without country code
    password             VARCHAR(255)    NOT NULL,          -- bcrypt via password_hash(PASSWORD_DEFAULT)
    plan                 VARCHAR(20)     NOT NULL DEFAULT 'bft',   -- 'bft' | 'cst'
    program              VARCHAR(20)     NULL,                     -- 'bw' | 'ct' — schema prep only, not
                                                                    -- yet set by any page/endpoint. See
                                                                    -- docs/future-modules.md. Distinct from
                                                                    -- `plan` (the membership/pricing tier) —
                                                                    -- this is the operational training track
                                                                    -- for future gym-management features.
    subscription_status  VARCHAR(20)     NOT NULL DEFAULT 'inactive',  -- 'inactive' | 'active' | 'expired'
    subscription_expires DATE            NULL,
    created_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_email  (email),
    INDEX idx_plan       (plan),
    INDEX idx_sub_status (subscription_status),
    INDEX idx_created    (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── submissions ─────────────────────────────────────────────────────────────
-- Member feedback. Simplified to 4 fields matching the redesigned form.
CREATE TABLE submissions (
    id         INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(120)    NOT NULL,
    email      VARCHAR(255)    NOT NULL,
    feedback   TEXT            NOT NULL,
    rating     TINYINT UNSIGNED NOT NULL,        -- 1–5
    created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_rating  (rating),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── bookings ────────────────────────────────────────────────────────────────
-- Class slot reservations. Each row is one student's booking for one session.
CREATE TABLE bookings (
    id         INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED    NOT NULL,
    class_type VARCHAR(20)     NOT NULL,       -- 'bft' | 'cst'
    class_date DATE            NOT NULL,
    time_slot  VARCHAR(10)     NOT NULL,       -- '05:30' | '06:30' | '07:30' | '09:00' | '17:00' | '18:00' | '19:00'
    status     VARCHAR(20)     NOT NULL DEFAULT 'confirmed',  -- 'confirmed' | 'cancelled'
    created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_date (class_date),
    INDEX idx_slot (class_date, time_slot, class_type, status)  -- capacity check
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── payments ────────────────────────────────────────────────────────────────
-- Razorpay transaction records.  amount_paise = INR × 100.
CREATE TABLE payments (
    id                  INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
    user_id             INT UNSIGNED    NOT NULL,
    plan                VARCHAR(20)     NOT NULL,
    duration_months     TINYINT         NOT NULL DEFAULT 1,
    amount_paise        INT             NOT NULL,
    currency            VARCHAR(10)     NOT NULL DEFAULT 'INR',
    razorpay_order_id   VARCHAR(100)    NOT NULL,
    razorpay_payment_id VARCHAR(100)    DEFAULT NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'pending',  -- 'pending' | 'paid' | 'failed'
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at             TIMESTAMP       NULL DEFAULT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user      (user_id),
    INDEX idx_order     (razorpay_order_id),
    UNIQUE KEY uq_payment (razorpay_payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── blog_posts ──────────────────────────────────────────────────────────────
CREATE TABLE blog_posts (
    id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255)    NOT NULL,
    slug        VARCHAR(255)    NOT NULL,
    category    VARCHAR(80)     NOT NULL DEFAULT 'Fitness',
    excerpt     TEXT,
    content     LONGTEXT,
    author      VARCHAR(120)    NOT NULL DEFAULT 'ELEV8 Team',
    status      ENUM('published','draft') NOT NULL DEFAULT 'draft',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_slug (slug),
    KEY idx_status    (status),
    KEY idx_category  (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── blog_comments ───────────────────────────────────────────────────────────
CREATE TABLE blog_comments (
    id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
    post_id     INT UNSIGNED    NOT NULL,
    name        VARCHAR(120)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    comment     TEXT            NOT NULL,
    status      ENUM('approved','pending','spam') NOT NULL DEFAULT 'approved',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_post_id (post_id),
    KEY idx_status  (status),
    CONSTRAINT fk_bc_post FOREIGN KEY (post_id) REFERENCES blog_posts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── contacts ────────────────────────────────────────────────────────────────
CREATE TABLE contacts (
    id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(120)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    phone       VARCHAR(20),
    message     TEXT            NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── Seed blog posts ─────────────────────────────────────────────────────────
INSERT INTO blog_posts (title, slug, category, excerpt, content, author, status) VALUES

('5 Calisthenics Fundamentals Every Beginner Must Master',
 '5-calisthenics-fundamentals-every-beginner-must-master',
 'Beginner Tips',
 'Starting calisthenics can feel overwhelming. Here are the five foundational movement patterns you need to nail before anything else.',
 '<p>Calisthenics is one of the most accessible and effective training methodologies on the planet — all you need is your body and the will to push. But like any discipline, the fundamentals matter most in the beginning. Rush past them and you''ll plateau early, or worse, get injured.</p>
<p>Here are the five fundamentals every beginner at ELEV8 works on first:</p>
<h2>1. The Dead Hang</h2>
<p>Before you pull yourself up, you need to own the hang. Dead hangs build grip strength, decompress the spine, and teach shoulder packing — the foundation of every overhead movement. Aim for 60 seconds before you touch a pull-up bar with intent.</p>
<h2>2. The Perfect Push-Up</h2>
<p>Not the half-rep chest-touch-and-bounce version. We mean full range of motion, locked core, elbows at 45 degrees, chest touching the floor. If you can''t do 20 clean push-ups, that''s your priority.</p>
<h2>3. The Hollow Body Hold</h2>
<p>This is the secret weapon of calisthenics. The hollow body position — posterior pelvic tilt, lower back pressed to floor, arms and legs extended — is the core of every skill from the L-sit to the front lever. 30 seconds feels impossible at first. Then it becomes easy. Then everything else gets easier too.</p>
<h2>4. The Squat</h2>
<p>Full depth, heels on the floor, knees tracking toes. Your hips should be below your knees. If you can''t squat properly, you have mobility work to do. We programme this from day one in BFT.</p>
<h2>5. The Bridge</h2>
<p>Shoulder and thoracic mobility are massively underrated in calisthenics. A solid bridge — shoulders over wrists, arms straight, chest open — prepares you for handstands and back levers down the line.</p>
<p>Master these five and you''ve already built a stronger foundation than 90% of gym-goers. Come in for a free trial and we''ll show you exactly where you are with each.</p>',
 'ELEV8 Team',
 'published'),

('BFT vs CST: Which Program Is Right for You?',
 'bft-vs-cst-which-program-is-right-for-you',
 'Programs',
 'Bodyweight Functional Training or Calisthenics Skill Training? We break down the differences so you can make the right call.',
 '<p>One of the most common questions we get at ELEV8: <strong>"Should I join BFT or CST?"</strong> The honest answer is — it depends on where you are and where you want to go. Here''s how to think about it.</p>
<h2>BFT — Bodyweight Functional Training</h2>
<p>BFT is built around movement quality and functional strength. Every session combines compound movements — push, pull, squat, hinge, carry — with conditioning work. You''ll build real-world strength, cardiovascular fitness, and body composition simultaneously.</p>
<p><strong>BFT is for you if:</strong></p>
<ul>
<li>You''re new to structured training</li>
<li>Your goal is fat loss, muscle tone, or general fitness</li>
<li>You want to move better in everyday life</li>
<li>You enjoy varied, high-energy group sessions</li>
</ul>
<h2>CST — Calisthenics Skill Training</h2>
<p>CST is the specialist program. We''re talking muscle-ups, handstands, front levers, planche progressions — the skills that take time, technique, and patience. Sessions are more technical, more focused, and follow a deliberate progression framework.</p>
<p><strong>CST is for you if:</strong></p>
<ul>
<li>You already have a base of strength (push-ups, pull-ups, dips comfortable)</li>
<li>You want to learn specific calisthenics skills</li>
<li>You''re drawn to gymnastics-style movements</li>
<li>You enjoy a longer-term, mastery-focused approach</li>
</ul>
<h2>The Good News</h2>
<p>Many of our members do both — BFT for conditioning and CST for skill work. And if you''re genuinely unsure, just book a free trial. Our coaches will assess you and give you an honest recommendation.</p>',
 'Coach Rohan Naik',
 'published'),

('How Goa''s Climate Can Work For (and Against) Your Training',
 'how-goas-climate-can-work-for-and-against-your-training',
 'Lifestyle',
 'Training outdoors in Goa sounds idyllic. Here''s what you actually need to know about heat, humidity, and how to train smart in a tropical environment.',
 '<p>There''s a reason people dream about training in Goa. The sun, the sea breeze, the open spaces. But the climate here is also legitimately demanding — especially in summer. Understanding how it affects your performance can be the difference between progress and burnout.</p>
<h2>Heat and Humidity: The Real Challenge</h2>
<p>Goa''s humidity is the bigger factor, not just the temperature. High humidity impairs sweat evaporation, which is your body''s primary cooling mechanism. This means your heart rate climbs faster at the same effort level, and perceived exertion is significantly higher than the numbers suggest.</p>
<p>In practical terms: your 5km pace in Goa in May is genuinely harder than the same pace in October. Give yourself permission to slow down.</p>
<h2>Morning Sessions Win</h2>
<p>This is why we open at 5:30 AM. The temperature differential between 5:30 and 9:00 AM is significant — and training in cooler conditions directly improves your output quality and recovery. If you''re serious about performance, you train early.</p>
<h2>Hydration is Non-Negotiable</h2>
<p>You need more water than you think. We recommend at least 3–4 litres on training days in summer, starting hydration the night before. Electrolytes matter too — coconut water is your friend, and it''s everywhere in Goa.</p>
<h2>The Upside</h2>
<p>Training in heat does build cardiovascular adaptation over time. Studies show that heat acclimatisation improves plasma volume, lactate threshold, and even performance in temperate conditions. Training in Goa is actually a form of altitude training for your cardiovascular system.</p>
<p>Embrace the challenge. Just do it smart.</p>',
 'Coach Priya Dessai',
 'published');


-- =============================================================================
-- Schema notes
-- =============================================================================
-- • users.plan values:          'bft' = Bodyweight Functional Training,
--                               'cst' = Calisthenics Skill Training
-- • users.program values:       'bw' | 'ct' — schema prep only for future gym-management
--                               modules (see docs/future-modules.md); not set anywhere yet
-- • users.subscription_status:  set to 'active' by razorpay_verify.php on paid payment
--                               (currently disabled — see razorpay_verify.php's TODO(payments))
-- • submissions.rating:         1–5, enforced at application layer
-- • bookings.time_slot values:  '05:30' '06:30' '07:30' '09:00' '17:00' '18:00' '19:00'
-- • bookings capacity:          MAX_SLOT_CAPACITY = 15 per class_date + time_slot + class_type
-- • payments.amount_paise:      BFT 1mo=210000, CST 6mo=1150000, etc. (see config/razorpay.php)
-- • blog_posts.status:          'published' visible on site, 'draft' admin-only
-- • blog_comments.status:       auto-approved (submit_blog_comment.php sets 'approved')
-- • contacts:                   stored for admin reference, no email sent (add SMTP later)
-- =============================================================================

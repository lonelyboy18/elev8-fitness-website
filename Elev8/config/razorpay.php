<?php
declare(strict_types=1);

// ---------------------------------------------------------------------------
// Razorpay credentials
// Replace with your actual keys from https://dashboard.razorpay.com/app/keys
// Use rzp_test_* keys during development; rzp_live_* in production.
// ---------------------------------------------------------------------------

define('RAZORPAY_KEY_ID',     (string)(getenv('RAZORPAY_KEY_ID')     ?: 'rzp_test_YOUR_KEY_ID_HERE'));
define('RAZORPAY_KEY_SECRET', (string)(getenv('RAZORPAY_KEY_SECRET') ?: 'YOUR_KEY_SECRET_HERE'));

// Pricing in paise (INR × 100).  Keep in sync with programs.html pricing table.
const PLAN_PRICING = [
    'bft' => [
        1  => ['paise' => 210000,  'label' => '₹2,100',  'save' => 'Save ₹200'],
        3  => ['paise' => 580000,  'label' => '₹5,800',  'save' => 'Save ₹1,100'],
        6  => ['paise' => 1080000, 'label' => '₹10,800', 'save' => 'Save ₹3,000'],
        12 => ['paise' => 2000000, 'label' => '₹20,000', 'save' => 'Save ₹7,600'],
    ],
    'cst' => [
        1  => ['paise' => 230000,  'label' => '₹2,300',  'save' => 'Save ₹200'],
        3  => ['paise' => 600000,  'label' => '₹6,000',  'save' => 'Save ₹1,500'],
        6  => ['paise' => 1150000, 'label' => '₹11,500', 'save' => 'Save ₹3,500'],
        12 => ['paise' => 2200000, 'label' => '₹22,000', 'save' => 'Save ₹8,000'],
    ],
];

// Maximum students confirmed per class slot
define('MAX_SLOT_CAPACITY', 15);

// All valid time slots (24-hour format stored in DB)
const TIME_SLOTS = ['05:30', '06:30', '07:30', '17:00', '18:00', '19:00'];

// Blog admin key — change this before going live
// Can also be set via BLOG_ADMIN_KEY environment variable
define('BLOG_ADMIN_KEY', (string)(getenv('BLOG_ADMIN_KEY') ?: 'elev8blog2026'));

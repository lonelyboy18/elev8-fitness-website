import { useState } from "react";
import { useReveal } from "@shared/hooks/useReveal";
import { useDocumentTitle } from "@shared/hooks/useDocumentTitle";
import { TransitionLink } from "@shared/ui/TransitionLink";
import { CoachSelectionModal } from "@shared/ui/CoachSelectionModal";
import { ROUTES } from "@shared/constants/routes";
import { buildFreeTrialMessage } from "@shared/lib/whatsapp";

const TRIAL_MODAL_ID = "membershipTrialCoachModal";

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqEntry[] = [
  {
    id: "faq1",
    question: "Do I need prior fitness experience to join ELEV8?",
    answer:
      "Not at all. Both BFT and CST programs are structured from the ground up. Our coaches assess you in your first session and tailor progressions to where you actually are — not where you think you should be. Many of our strongest athletes started with zero fitness background.",
  },
  {
    id: "faq2",
    question: "What is the difference between BFT and CST?",
    answer:
      "BFT (Bodyweight Functional Training) focuses on building real-world strength, mobility and conditioning — the athletic foundation everyone needs. CST (Calisthenics Skill Training) includes everything in BFT but adds a dedicated skill track: handstands, levers, muscle-ups and planche work. If you want to learn those impressive skills, CST is for you.",
  },
  {
    id: "faq3",
    question: "Can I try a class before committing to a plan?",
    answer:
      "Yes — your first session is completely free. Just WhatsApp us on +91 70661 31474 or book via the button above. Show up, train hard, and decide afterwards. No pressure, no sales pitch.",
  },
  {
    id: "faq4",
    question: "Is there a long-term contract or lock-in period?",
    answer:
      "No contracts. Monthly plans renew at the end of each cycle — you can stop any time. Longer-duration plans (3, 6, 12 months) give you a discount upfront but are non-refundable once started, since the saving comes from the commitment.",
  },
  {
    id: "faq5",
    question: "Can I switch from BFT to CST (or vice versa)?",
    answer:
      "Yes, at the end of your current billing cycle. Talk to a coach — they'll assess where you are and tell you honestly if CST is the right next step. Jumping into CST too early without a solid foundation slows you down.",
  },
  {
    id: "faq6",
    question: "When are classes held?",
    answer:
      "Seven slots, every day: 5:30 AM, 6:30 AM, 7:30 AM and 9:00 AM in the morning; 5:00 PM, 6:00 PM and 7:00 PM in the evening. Each session is 60 minutes. Book your slot in advance via the member dashboard.",
  },
  {
    id: "faq7",
    question: "How do I book a class?",
    answer:
      "Create an account, subscribe to a plan, and use the member dashboard to book any slot up to 30 days in advance. Each slot has a maximum of 15 students to keep coaching quality high. You'll see live availability when you choose your date.",
  },
  {
    id: "faq8",
    question: "Do you offer personal training?",
    answer:
      "Personal training sessions can be arranged separately — reach out on WhatsApp and we'll discuss availability and pricing with your coach directly. One-on-one sessions are especially useful for skill-specific goals like handstands or front levers.",
  },
];

export function MembershipPage() {
  useDocumentTitle("Membership Plans — ELEV8 Calisthenics & Fitness Studio");

  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const heroHead = useReveal<HTMLDivElement>();

  const trialCard = useReveal<HTMLDivElement>();
  const bftCard = useReveal<HTMLDivElement>();
  const cstCard = useReveal<HTMLDivElement>();

  const compareHead = useReveal<HTMLDivElement>();
  const compareWrap = useReveal<HTMLDivElement>();

  const faqHead = useReveal<HTMLDivElement>();
  const faqWrap = useReveal<HTMLDivElement>();

  const ctaBand = useReveal<HTMLDivElement>();

  function toggleFaq(id: string) {
    setOpenFaq((current) => (current === id ? null : id));
  }

  return (
    <>
      {/* Hero */}
      <section className="section" style={{ paddingTop: 160, paddingBottom: 64 }}>
        <div className="container">
          <div ref={heroHead.ref} className={`section-head-center ${heroHead.className}`}>
            <span className="eyebrow">No Hidden Fees</span>
            <h1 className="section-title">Membership Plans</h1>
            <p className="section-lead">
              Try a free class. Then choose a program. No long-term contracts, no lock-in periods — just structured
              training that works.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="mem-cards-grid">
            {/* Free Trial */}
            <div ref={trialCard.ref} className={`mem-card ${trialCard.className}`}>
              <div className="mem-card-badge">Start Here</div>
              <div className="mem-card-header">
                <h3 className="mem-card-plan">Free Trial</h3>
                <div className="mem-card-price">
                  <span className="mem-price-num">₹0</span>
                  <span className="mem-price-per">one session</span>
                </div>
              </div>
              <ul className="mem-feature-list">
                <li className="mem-feat yes">1 full class session</li>
                <li className="mem-feat yes">Any morning or evening slot</li>
                <li className="mem-feat yes">Coach-guided introduction</li>
                <li className="mem-feat yes">All experience levels welcome</li>
                <li className="mem-feat no">Ongoing structured program</li>
                <li className="mem-feat no">Progress tracking</li>
                <li className="mem-feat no">Skill-specific coaching</li>
              </ul>
              <button
                type="button"
                className="btn btn-outline-success w-100"
                data-bs-toggle="modal"
                data-bs-target={`#${TRIAL_MODAL_ID}`}
              >
                Book on WhatsApp
              </button>
            </div>

            {/* BFT */}
            <div ref={bftCard.ref} className={`mem-card ${bftCard.className}`} data-delay="1">
              <div className="mem-card-header">
                <h3 className="mem-card-plan">BFT</h3>
                <p className="mem-card-subtitle">Bodyweight Functional Training</p>
                <div className="mem-card-price">
                  <span className="mem-price-num">₹2,100</span>
                  <span className="mem-price-per">/ month</span>
                </div>
                <p className="mem-card-savings">Save up to ₹7,600 on annual plan</p>
              </div>
              <ul className="mem-feature-list">
                <li className="mem-feat yes">Unlimited daily classes</li>
                <li className="mem-feat yes">Structured strength progressions</li>
                <li className="mem-feat yes">Functional movement coaching</li>
                <li className="mem-feat yes">Mobility &amp; joint health</li>
                <li className="mem-feat yes">Body composition guidance</li>
                <li className="mem-feat yes">Priority class booking</li>
                <li className="mem-feat no">Handstand progressions</li>
                <li className="mem-feat no">Lever &amp; planche work</li>
                <li className="mem-feat no">Muscle-up technique</li>
              </ul>
              <TransitionLink to={ROUTES.signUp} className="btn btn-outline-success w-100">
                Get Started
              </TransitionLink>
            </div>

            {/* CST — Featured */}
            <div ref={cstCard.ref} className={`mem-card mem-card--featured ${cstCard.className}`} data-delay="2">
              <div className="mem-card-badge mem-card-badge--gold">Most Popular</div>
              <div className="mem-card-header">
                <h3 className="mem-card-plan">CST</h3>
                <p className="mem-card-subtitle">Calisthenics Skill Training</p>
                <div className="mem-card-price">
                  <span className="mem-price-num">₹2,300</span>
                  <span className="mem-price-per">/ month</span>
                </div>
                <p className="mem-card-savings">Save up to ₹8,000 on annual plan</p>
              </div>
              <ul className="mem-feature-list">
                <li className="mem-feat yes">Everything in BFT</li>
                <li className="mem-feat yes">Skill-specific progressions</li>
                <li className="mem-feat yes">Handstand &amp; HSPU training</li>
                <li className="mem-feat yes">Front &amp; back lever work</li>
                <li className="mem-feat yes">Muscle-up technique</li>
                <li className="mem-feat yes">Planche progressions</li>
                <li className="mem-feat yes">Priority class booking</li>
                <li className="mem-feat yes">Advanced athlete program</li>
              </ul>
              <TransitionLink to={ROUTES.signUp} className="btn btn-success w-100">
                Get Started
              </TransitionLink>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={compareHead.ref} className={`section-head-center ${compareHead.className}`}>
            <span className="eyebrow">Side by Side</span>
            <h2 className="section-title">BFT vs CST</h2>
            <p className="section-lead">Not sure which to pick? Here's every feature compared.</p>
          </div>
          <div ref={compareWrap.ref} className={`compare-wrap mt-5 ${compareWrap.className}`}>
            <table className="compare-table" role="table" aria-label="BFT vs CST feature comparison">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col" className="text-center">
                    BFT
                  </th>
                  <th scope="col" className="text-center cst-col">
                    CST
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Unlimited daily classes</td>
                  <td className="text-center">&#10003;</td>
                  <td className="text-center cst-col">&#10003;</td>
                </tr>
                <tr>
                  <td>Structured strength progressions</td>
                  <td className="text-center">&#10003;</td>
                  <td className="text-center cst-col">&#10003;</td>
                </tr>
                <tr>
                  <td>Functional movement coaching</td>
                  <td className="text-center">&#10003;</td>
                  <td className="text-center cst-col">&#10003;</td>
                </tr>
                <tr>
                  <td>Mobility &amp; injury prevention</td>
                  <td className="text-center">&#10003;</td>
                  <td className="text-center cst-col">&#10003;</td>
                </tr>
                <tr>
                  <td>Body composition guidance</td>
                  <td className="text-center">&#10003;</td>
                  <td className="text-center cst-col">&#10003;</td>
                </tr>
                <tr>
                  <td>ELEV8 community access</td>
                  <td className="text-center">&#10003;</td>
                  <td className="text-center cst-col">&#10003;</td>
                </tr>
                <tr>
                  <td>Priority class booking (dashboard)</td>
                  <td className="text-center">&#10003;</td>
                  <td className="text-center cst-col">&#10003;</td>
                </tr>
                <tr>
                  <td>Skill-specific coaching</td>
                  <td className="text-center compare-no">&#8212;</td>
                  <td className="text-center cst-col">&#10003;</td>
                </tr>
                <tr>
                  <td>Handstand &amp; HSPU progressions</td>
                  <td className="text-center compare-no">&#8212;</td>
                  <td className="text-center cst-col">&#10003;</td>
                </tr>
                <tr>
                  <td>Front lever &amp; back lever</td>
                  <td className="text-center compare-no">&#8212;</td>
                  <td className="text-center cst-col">&#10003;</td>
                </tr>
                <tr>
                  <td>Muscle-up technique track</td>
                  <td className="text-center compare-no">&#8212;</td>
                  <td className="text-center cst-col">&#10003;</td>
                </tr>
                <tr>
                  <td>Planche progression system</td>
                  <td className="text-center compare-no">&#8212;</td>
                  <td className="text-center cst-col">&#10003;</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={faqHead.ref} className={`section-head-center ${faqHead.className}`}>
            <span className="eyebrow">Got Questions?</span>
            <h2 className="section-title">Frequently Asked</h2>
          </div>
          <div ref={faqWrap.ref} className={`faq-wrap mt-5 ${faqWrap.className}`}>
            <div className="accordion" id="faqAccordion">
              {FAQ_ITEMS.map((item) => {
                const isOpen = openFaq === item.id;
                return (
                  <div key={item.id} className={`accordion-item faq-item${isOpen ? " open" : ""}`}>
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button faq-btn${isOpen ? "" : " collapsed"}`}
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => toggleFaq(item.id)}
                      >
                        {item.question}
                      </button>
                    </h3>
                    <div className={`accordion-body faq-body${isOpen ? " open" : ""}`}>{item.answer}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={ctaBand.ref} className={`cta-band ${ctaBand.className}`}>
            <span className="eyebrow" style={{ justifyContent: "center" }}>
              Ready to Start?
            </span>
            <h2>Your first class is free.</h2>
            <p>Book a free trial and see what structured calisthenics coaching actually feels like. No pressure, just progress.</p>
            <div className="cta-actions">
              <button
                type="button"
                className="btn btn-success btn-lg"
                data-bs-toggle="modal"
                data-bs-target={`#${TRIAL_MODAL_ID}`}
              >
                Book Free Trial
              </button>
              <TransitionLink to={ROUTES.signUp} className="btn btn-outline-success btn-lg">
                Create Account
              </TransitionLink>
            </div>
          </div>
        </div>
      </section>

      <CoachSelectionModal id={TRIAL_MODAL_ID} buildMessage={(coach) => buildFreeTrialMessage(coach.name)} />
    </>
  );
}

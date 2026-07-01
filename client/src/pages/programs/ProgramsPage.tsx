import { useReveal } from "@shared/hooks/useReveal";
import { useDocumentTitle } from "@shared/hooks/useDocumentTitle";
import { TransitionLink } from "@shared/ui/TransitionLink";
import { ROUTES } from "@shared/constants/routes";

export function ProgramsPage() {
  useDocumentTitle("Programs — ELEV8 Calisthenics & Fitness Studio");

  const heroEyebrow = useReveal<HTMLSpanElement>();
  const heroTitle = useReveal<HTMLHeadingElement>();
  const heroLead = useReveal<HTMLParagraphElement>();

  const scheduleHead = useReveal<HTMLDivElement>();
  const scheduleMorning = useReveal<HTMLDivElement>();
  const scheduleEvening = useReveal<HTMLDivElement>();

  const pricingHead = useReveal<HTMLDivElement>();
  const bftCard = useReveal<HTMLDivElement>();
  const cstCard = useReveal<HTMLDivElement>();

  const ctaBand = useReveal<HTMLDivElement>();

  return (
    <>
      {/* ===================== PAGE HERO ===================== */}
      <section className="section" style={{ paddingTop: 160, paddingBottom: 64 }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <span ref={heroEyebrow.ref} className={`eyebrow ${heroEyebrow.className}`}>
                Train With Intent
              </span>
              <h1 ref={heroTitle.ref} className={`section-title ${heroTitle.className}`} data-delay="1">
                Our Programs
              </h1>
              <p ref={heroLead.ref} className={`section-lead ${heroLead.className}`} data-delay="2">
                Two flagship training tracks. Flexible schedules. Honest pricing.
                All designed around structured progression — from your first session to your peak performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SCHEDULE ===================== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={scheduleHead.ref} className={`section-head-center ${scheduleHead.className}`}>
            <span className="eyebrow">Class Schedule</span>
            <h2 className="section-title">Six Slots. Every Day.</h2>
            <p className="section-lead">Morning and evening sessions designed around your routine — not the other way round.</p>
          </div>

          <div className="row g-4 mt-5">
            <div ref={scheduleMorning.ref} className={`col-md-6 ${scheduleMorning.className}`}>
              <div className="schedule-card">
                <div
                  style={{
                    padding: "1.5rem 1.5rem 0.5rem",
                    color: "var(--orange)",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontSize: "0.85rem",
                  }}
                >
                  Morning Classes
                </div>
                <ul className="list-group list-group-flush schedule-list">
                  <li className="list-group-item">5:30 AM — 6:30 AM</li>
                  <li className="list-group-item">6:30 AM — 7:30 AM</li>
                  <li className="list-group-item">7:30 AM — 8:30 AM</li>
                </ul>
              </div>
            </div>
            <div ref={scheduleEvening.ref} className={`col-md-6 ${scheduleEvening.className}`} data-delay="1">
              <div className="schedule-card">
                <div
                  style={{
                    padding: "1.5rem 1.5rem 0.5rem",
                    color: "var(--orange)",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontSize: "0.85rem",
                  }}
                >
                  Evening Classes
                </div>
                <ul className="list-group list-group-flush schedule-list">
                  <li className="list-group-item">5:00 PM — 6:00 PM</li>
                  <li className="list-group-item">6:00 PM — 7:00 PM</li>
                  <li className="list-group-item">7:00 PM — 8:00 PM</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PRICING ===================== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={pricingHead.ref} className={`section-head-center ${pricingHead.className}`}>
            <span className="eyebrow">Pricing</span>
            <h2 className="section-title">Choose Your Plan</h2>
            <p className="section-lead">All prices in INR. Longer commitments unlock greater savings.</p>
          </div>

          <div className="mt-5">
            {/* Program 1: BFT */}
            <div ref={bftCard.ref} className={`program-card ${bftCard.className}`}>
              <h4 className="program-title">Bodyweight Functional Training</h4>
              <p className="program-desc">
                Build real-world strength and mobility using bodyweight functional movements. The ideal foundation for
                every fitness level — move better, feel stronger.
              </p>

              <table className="table table-dark table-bordered pricing-table mt-4">
                <thead className="table-success">
                  <tr>
                    <th>Duration</th>
                    <th>Original Price</th>
                    <th>Offer Price</th>
                    <th>You Save</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Monthly</td>
                    <td>
                      <s>₹2,300</s>
                    </td>
                    <td>
                      <strong>₹2,100</strong>
                    </td>
                    <td className="text-success">Save ₹200</td>
                  </tr>
                  <tr>
                    <td>3 Months</td>
                    <td>
                      <s>₹6,900</s>
                    </td>
                    <td>
                      <strong>₹5,800</strong>
                    </td>
                    <td className="text-success">Save ₹1,100</td>
                  </tr>
                  <tr>
                    <td>6 Months</td>
                    <td>
                      <s>₹13,000</s>
                    </td>
                    <td>
                      <strong>₹10,800</strong>
                    </td>
                    <td className="text-success">Save ₹3,000</td>
                  </tr>
                  <tr>
                    <td>12 Months</td>
                    <td>
                      <s>₹27,600</s>
                    </td>
                    <td>
                      <strong>₹20,000</strong>
                    </td>
                    <td className="text-success">Save ₹7,600</td>
                  </tr>
                </tbody>
              </table>

              <TransitionLink to={`${ROUTES.signUp}?plan=bft`} className="btn btn-success btn-lg mt-4 w-100">
                Enroll Now — BFT
              </TransitionLink>
              <p className="text-center mt-2" style={{ fontSize: "0.82rem", color: "var(--steel)" }}>
                Questions?{" "}
                <a
                  href="https://wa.me/917066131474"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--steel)" }}
                >
                  Chat on WhatsApp →
                </a>
              </p>
            </div>

            {/* Program 2: CST */}
            <div ref={cstCard.ref} className={`program-card ${cstCard.className}`} data-delay="1">
              <h4 className="program-title">Calisthenics Skill Training</h4>
              <p className="program-desc">
                Master elite bodyweight skills — handstands, muscle-ups, levers, and beyond. A structured progression
                system for those who want to unlock their true potential.
              </p>

              <table className="table table-dark table-bordered pricing-table mt-4">
                <thead className="table-success">
                  <tr>
                    <th>Duration</th>
                    <th>Original Price</th>
                    <th>Offer Price</th>
                    <th>You Save</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Monthly</td>
                    <td>
                      <s>₹2,500</s>
                    </td>
                    <td>
                      <strong>₹2,300</strong>
                    </td>
                    <td className="text-success">Save ₹200</td>
                  </tr>
                  <tr>
                    <td>3 Months</td>
                    <td>
                      <s>₹7,500</s>
                    </td>
                    <td>
                      <strong>₹6,000</strong>
                    </td>
                    <td className="text-success">Save ₹1,500</td>
                  </tr>
                  <tr>
                    <td>
                      6 Months <span className="badge bg-success">Most Popular</span>
                    </td>
                    <td>
                      <s>₹15,000</s>
                    </td>
                    <td>
                      <strong>₹11,500</strong>
                    </td>
                    <td className="text-success">Save ₹3,500</td>
                  </tr>
                  <tr>
                    <td>12 Months</td>
                    <td>
                      <s>₹30,000</s>
                    </td>
                    <td>
                      <strong>₹22,000</strong>
                    </td>
                    <td className="text-success">Save ₹8,000</td>
                  </tr>
                </tbody>
              </table>

              <TransitionLink to={`${ROUTES.signUp}?plan=cst`} className="btn btn-success btn-lg mt-4 w-100">
                Enroll Now — CST
              </TransitionLink>
              <p className="text-center mt-2" style={{ fontSize: "0.82rem", color: "var(--steel)" }}>
                Questions?{" "}
                <a
                  href="https://wa.me/917066131474"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--steel)" }}
                >
                  Chat on WhatsApp →
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={ctaBand.ref} className={`cta-band ${ctaBand.className}`}>
            <span className="eyebrow" style={{ justifyContent: "center" }}>
              The Lifestyle Change Movement
            </span>
            <h2>Not sure where to start?</h2>
            <p>Drop us a message and we'll help you choose the right program for your level and goals.</p>
            <div className="cta-actions">
              <a
                href="https://wa.me/917066131474"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-lg"
              >
                Ask on WhatsApp
              </a>
              <TransitionLink to={ROUTES.signUp} className="btn btn-outline-success btn-lg">
                Create Account
              </TransitionLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

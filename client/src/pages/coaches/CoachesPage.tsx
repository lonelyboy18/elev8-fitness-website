import { useDocumentTitle } from "@shared/hooks/useDocumentTitle";
import { useReveal } from "@shared/hooks/useReveal";
import { TransitionLink } from "@shared/ui/TransitionLink";
import { CoachSelectionModal } from "@shared/ui/CoachSelectionModal";
import { ROUTES } from "@shared/constants/routes";
import { ASSET_PATHS } from "@shared/constants/assetPaths";
import { buildFreeTrialMessage } from "@shared/lib/whatsapp";

const TRIAL_MODAL_ID = "coachesTrialCoachModal";

export function CoachesPage() {
  useDocumentTitle("Our Coaches — ELEV8 Calisthenics & Fitness Studio Goa");

  const heroEyebrow = useReveal<HTMLSpanElement>();
  const heroTitle = useReveal<HTMLHeadingElement>();
  const heroLead = useReveal<HTMLParagraphElement>();

  const headCoachesHead = useReveal<HTMLDivElement>();
  const headCoach1 = useReveal<HTMLDivElement>();
  const headCoach2 = useReveal<HTMLDivElement>();

  const teamHead = useReveal<HTMLDivElement>();
  const teamCoach1 = useReveal<HTMLDivElement>();
  const teamCoach2 = useReveal<HTMLDivElement>();
  const teamCoach3 = useReveal<HTMLDivElement>();
  const teamCoach4 = useReveal<HTMLDivElement>();

  const whyHead = useReveal<HTMLDivElement>();
  const whyCard1 = useReveal<HTMLDivElement>();
  const whyCard2 = useReveal<HTMLDivElement>();
  const whyCard3 = useReveal<HTMLDivElement>();
  const whyCard4 = useReveal<HTMLDivElement>();

  const ctaBand = useReveal<HTMLDivElement>();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 160, paddingBottom: 80 }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-9">
              <span ref={heroEyebrow.ref} className={`eyebrow ${heroEyebrow.className}`}>
                The ELEV8 Coaching Team
              </span>
              <h1
                ref={heroTitle.ref}
                className={`section-title ${heroTitle.className}`}
                data-delay="1"
                style={{ fontSize: "clamp(2.8rem,8vw,5.5rem)" }}
              >
                Coaches who've
                <br />
                <span className="accent">done the work.</span>
              </h1>
              <p ref={heroLead.ref} className={`section-lead ${heroLead.className}`} data-delay="2">
                Every ELEV8 coach has lived the journey — from their first pull-up to advanced calisthenics skills.
                They don't just teach movement. They teach you how to trust your body.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Head Coaches ──────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }} id="head-coaches">
        <div className="container">
          <div ref={headCoachesHead.ref} className={`section-head-center ${headCoachesHead.className}`}>
            <span className="eyebrow">Leadership</span>
            <h2 className="section-title">Head Coaches</h2>
            <p className="section-lead">The founders and principal coaches of ELEV8's training system.</p>
          </div>

          <div className="coaches-grid coaches-grid--head mt-5">
            <div ref={headCoach1.ref} className={`coach-card ${headCoach1.className}`}>
              <img src={ASSET_PATHS.coaches.nimay} alt="Nimay — Head Calisthenics Coach at ELEV8" loading="lazy" />
              <div className="coach-card-body">
                <p className="coach-role-badge">Head Coach · Calisthenics</p>
                <h3 className="coach-card-name">Nimay</h3>
                <p className="coach-handle">@nim_boo_24</p>
                <p className="coach-quote">"Mastery over your own body is the foundation of everything."</p>
                <p className="coach-bio">
                  Cornerstone of ELEV8's calisthenics system. Specialises in advanced skill progressions — front
                  lever, planche, handstand.
                </p>
                <a
                  href="https://www.instagram.com/nim_boo_24/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  Follow on Instagram
                </a>
              </div>
            </div>

            <div ref={headCoach2.ref} className={`coach-card ${headCoach2.className}`} data-delay="1">
              <img src={ASSET_PATHS.coaches.raj} alt="Raj — Head Strength Coach at ELEV8" loading="lazy" />
              <div className="coach-card-body">
                <p className="coach-role-badge">Head Coach · Strength &amp; Conditioning</p>
                <h3 className="coach-card-name">Raj</h3>
                <p className="coach-handle">@_raj_missile_</p>
                <p className="coach-quote">
                  "Strength isn't just physical — it's the discipline to show up every single day."
                </p>
                <p className="coach-bio">
                  Explosive energy and deep technical knowledge. Specialises in strength, body composition, and
                  conditioning.
                </p>
                <a
                  href="https://www.instagram.com/_raj_missile_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  Follow on Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Coaching Team ─────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }} id="coaching-team">
        <div className="container">
          <div ref={teamHead.ref} className={`section-head-center ${teamHead.className}`}>
            <span className="eyebrow">The Full Team</span>
            <h2 className="section-title">Coaching team</h2>
            <p className="section-lead">
              Our dedicated community coaches who show up every day and make ELEV8 what it is.
            </p>
          </div>

          <div className="coaches-grid coaches-grid--team mt-5">
            <div ref={teamCoach1.ref} className={`coach-card ${teamCoach1.className}`}>
              <img src={ASSET_PATHS.coaches.pancy} alt="Pansy — Calisthenics Coach at ELEV8" loading="lazy" />
              <div className="coach-card-body">
                <p className="coach-role-badge">Calisthenics Coach</p>
                <h3 className="coach-card-name">Pansy</h3>
                <p className="coach-handle">@pansypinto</p>
                <p className="coach-quote">"Your first pull-up is just the beginning of what's possible."</p>
                <a
                  href="https://www.instagram.com/pansypinto/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  Follow on Instagram
                </a>
              </div>
            </div>

            <div ref={teamCoach2.ref} className={`coach-card ${teamCoach2.className}`} data-delay="1">
              <img src={ASSET_PATHS.coaches.rupam} alt="Rupam — Strength Coach at ELEV8" loading="lazy" />
              <div className="coach-card-body">
                <p className="coach-role-badge">Strength Coach</p>
                <h3 className="coach-card-name">Rupam</h3>
                <p className="coach-handle">@lotlikar_rupam44</p>
                <p className="coach-quote">
                  "Consistency beats intensity every time — build the habit, and results follow."
                </p>
                <a
                  href="https://www.instagram.com/lotlikar_rupam44/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  Follow on Instagram
                </a>
              </div>
            </div>

            <div ref={teamCoach3.ref} className={`coach-card ${teamCoach3.className}`} data-delay="2">
              <img src={ASSET_PATHS.coaches.mahi} alt="Mahi — Mobility Coach at ELEV8" loading="lazy" />
              <div className="coach-card-body">
                <p className="coach-role-badge">Mobility &amp; Conditioning Coach</p>
                <h3 className="coach-card-name">Mahi</h3>
                <p className="coach-handle">@_mahi0520_</p>
                <p className="coach-quote">
                  "Mobility isn't a warm-up — it's what unlocks every skill you're chasing."
                </p>
                <a
                  href="https://www.instagram.com/_mahi0520_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  Follow on Instagram
                </a>
              </div>
            </div>

            <div ref={teamCoach4.ref} className={`coach-card ${teamCoach4.className}`} data-delay="3">
              <img src={ASSET_PATHS.coaches.samarth} alt="Samarth — Calisthenics Coach at ELEV8" loading="lazy" />
              <div className="coach-card-body">
                <p className="coach-role-badge">Calisthenics Coach</p>
                <h3 className="coach-card-name">Samarth</h3>
                <p className="coach-handle">@disruptor_23</p>
                <p className="coach-quote">"Bring the energy, trust the process, and make every session count."</p>
                <a
                  href="https://www.instagram.com/disruptor_23/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  Follow on Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Train With Us ─────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={whyHead.ref} className={`section-head-center ${whyHead.className}`}>
            <span className="eyebrow">Why It Works</span>
            <h2 className="section-title">Why train with our coaches</h2>
          </div>
          <div className="feature-grid mt-5">
            <div ref={whyCard1.ref} className={`feature-card ${whyCard1.className}`}>
              <div className="feature-icon">🎓</div>
              <h3>They've Done the Work</h3>
              <p>
                Every coach on our team has achieved the skills they teach. No theory without practice — only
                lived experience.
              </p>
            </div>
            <div ref={whyCard2.ref} className={`feature-card ${whyCard2.className}`} data-delay="1">
              <div className="feature-icon">🔄</div>
              <h3>Progressive Coaching</h3>
              <p>
                Sessions are structured so you always know where you are, where you're going, and exactly how to
                get there.
              </p>
            </div>
            <div ref={whyCard3.ref} className={`feature-card ${whyCard3.className}`} data-delay="2">
              <div className="feature-icon">👁️</div>
              <h3>Form Over Everything</h3>
              <p>
                Our coaches watch every rep. Small corrections early prevent injuries later — and build quality
                that lasts.
              </p>
            </div>
            <div ref={whyCard4.ref} className={`feature-card ${whyCard4.className}`} data-delay="3">
              <div className="feature-icon">❤️</div>
              <h3>Community First</h3>
              <p>
                ELEV8 coaches don't just run sessions. They invest in people — celebrating your progress and
                showing up when it counts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={ctaBand.ref} className={`cta-band ${ctaBand.className}`}>
            <span className="eyebrow" style={{ justifyContent: "center" }}>
              Start Today
            </span>
            <h2>Train with the best.</h2>
            <p>
              Book a free trial session and experience ELEV8 coaching first-hand. No experience needed — just
              show up.
            </p>
            <div className="cta-actions">
              <button
                type="button"
                className="btn btn-success btn-lg"
                data-bs-toggle="modal"
                data-bs-target={`#${TRIAL_MODAL_ID}`}
              >
                Book a Free Trial
              </button>
              <TransitionLink to={ROUTES.programs} className="btn btn-outline-success btn-lg">
                View Programs
              </TransitionLink>
            </div>
          </div>
        </div>
      </section>

      <CoachSelectionModal id={TRIAL_MODAL_ID} buildMessage={(coach) => buildFreeTrialMessage(coach.name)} />
    </>
  );
}

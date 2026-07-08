import { useReveal } from "@shared/hooks/useReveal";
import { TransitionLink } from "@shared/ui/TransitionLink";
import { CoachSelectionModal } from "@shared/ui/CoachSelectionModal";
import { useDocumentTitle } from "@shared/hooks/useDocumentTitle";
import { ASSET_PATHS } from "@shared/constants/assetPaths";
import { ROUTES } from "@shared/constants/routes";
import { buildFreeTrialMessage } from "@shared/lib/whatsapp";
import { MembersShowcase } from "./MembersShowcase";

const TRIAL_MODAL_ID = "aboutTrialCoachModal";

export function AboutPage() {
  useDocumentTitle("About — ELEV8 Calisthenics & Fitness Studio Goa");

  const heroBadge = useReveal<HTMLSpanElement>();
  const heroTitle = useReveal<HTMLHeadingElement>();

  const aboutText = useReveal<HTMLDivElement>();
  const aboutVideo = useReveal<HTMLDivElement>();

  const storyHead = useReveal<HTMLDivElement>();
  const storyCard1 = useReveal<HTMLDivElement>();
  const storyCard2 = useReveal<HTMLDivElement>();
  const storyCard3 = useReveal<HTMLDivElement>();

  const whyHead = useReveal<HTMLDivElement>();
  const whyCard1 = useReveal<HTMLDivElement>();
  const whyCard2 = useReveal<HTMLDivElement>();
  const whyCard3 = useReveal<HTMLDivElement>();

  const coachesHead = useReveal<HTMLDivElement>();
  const coachNimay = useReveal<HTMLDivElement>();
  const coachRaj = useReveal<HTMLDivElement>();
  const coachPansy = useReveal<HTMLDivElement>();
  const coachRupam = useReveal<HTMLDivElement>();
  const coachMahi = useReveal<HTMLDivElement>();
  const coachSamarth = useReveal<HTMLDivElement>();

  const missionCard = useReveal<HTMLDivElement>();
  const visionCard = useReveal<HTMLDivElement>();

  const timelineHead = useReveal<HTMLDivElement>();
  const timeline1 = useReveal<HTMLDivElement>();
  const timeline2 = useReveal<HTMLDivElement>();
  const timeline3 = useReveal<HTMLDivElement>();
  const timeline4 = useReveal<HTMLDivElement>();
  const timeline5 = useReveal<HTMLDivElement>();

  const statsStrip = useReveal<HTMLDivElement>();

  const ctaBand = useReveal<HTMLDivElement>();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 160, paddingBottom: 80 }}>
        <div className="container">
          <div className="col-lg-9">
            <span ref={heroBadge.ref} className={`eyebrow ${heroBadge.className}`}>
              Goa's Calisthenics Movement
            </span>
            <h1
              ref={heroTitle.ref}
              className={`section-title ${heroTitle.className}`}
              data-delay="1"
              style={{ fontSize: "clamp(2.8rem,8vw,5.5rem)" }}
            >
              Built on movement.
              <br />
              <span className="accent">Driven by community.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* ── About ELEV8 ───────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div ref={aboutText.ref} className={`col-lg-6 ${aboutText.className}`}>
              <span className="eyebrow">About ELEV8</span>
              <h2 className="section-title">Goa's premier calisthenics studio</h2>
              <p className="section-lead">
                ELEV8 is built on a simple belief: your body is the most powerful tool you'll ever
                use. We train it with discipline, precision, and real community.
              </p>
              <p style={{ color: "var(--steel)", fontSize: "1rem", lineHeight: 1.7, marginTop: "1rem" }}>
                Our coaches guide every level — from your first pull-up to advanced skills like
                front levers and handstands. One deliberate rep at a time.
              </p>
            </div>
            <div ref={aboutVideo.ref} className={`col-lg-6 ${aboutVideo.className}`} data-delay="1">
              <div className="video-wrapper">
                <video controls preload="metadata" playsInline>
                  <source src={ASSET_PATHS.videos.elev8CalisthenicsPromo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p className="video-caption">ELEV8 Calisthenics — the movement in motion.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Story ─────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={storyHead.ref} className={`section-head-center ${storyHead.className}`}>
            <span className="eyebrow">Our Story</span>
            <h2 className="section-title">From park benches to a movement</h2>
          </div>
          <div className="feature-grid mt-5">
            <div ref={storyCard1.ref} className={`feature-card ${storyCard1.className}`}>
              <div className="feature-icon">🌅</div>
              <h3>The Beginning</h3>
              <p>
                A small crew training outdoors in Goa. No equipment, no gym — just discipline and
                belief in what the body could do.
              </p>
            </div>
            <div ref={storyCard2.ref} className={`feature-card ${storyCard2.className}`} data-delay="1">
              <div className="feature-icon">📋</div>
              <h3>The Structure</h3>
              <p>
                Informal sessions evolved into structured programs. ELEV8 launched in 2021 with
                clear progressions for every level.
              </p>
            </div>
            <div ref={storyCard3.ref} className={`feature-card ${storyCard3.className}`} data-delay="2">
              <div className="feature-icon">👥</div>
              <h3>The Community</h3>
              <p>
                Rated 5.0★ on Google. The community is the heart of ELEV8 — every milestone
                celebrated, every challenge shared.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Calisthenics ─────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={whyHead.ref} className={`section-head-center ${whyHead.className}`}>
            <span className="eyebrow">Why Calisthenics</span>
            <h2 className="section-title">Strength that goes everywhere</h2>
          </div>
          <div className="feature-grid mt-5">
            <div ref={whyCard1.ref} className={`feature-card ${whyCard1.className}`}>
              <div className="feature-icon">💪</div>
              <h3>Real Strength</h3>
              <p>
                Full-body movement patterns that build functional strength — the kind that carries
                into every area of life.
              </p>
            </div>
            <div ref={whyCard2.ref} className={`feature-card ${whyCard2.className}`} data-delay="1">
              <div className="feature-icon">🤸</div>
              <h3>Mobility First</h3>
              <p>
                Every skill demands flexibility and joint health. You get stronger and more
                capable — not just bigger.
              </p>
            </div>
            <div ref={whyCard3.ref} className={`feature-card ${whyCard3.className}`} data-delay="2">
              <div className="feature-icon">♾️</div>
              <h3>Train for Life</h3>
              <p>
                Lower impact, better posture, reduced injury risk. Calisthenics is training you
                can do for decades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Meet Our Coaches ─────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }} id="coaches">
        <div className="container">
          <div ref={coachesHead.ref} className={`section-head-center ${coachesHead.className}`}>
            <span className="eyebrow">Meet Our Coaches</span>
            <h2 className="section-title">Coaches who've done the work</h2>
            <p className="section-lead">
              Every coach at ELEV8 has lived the journey. They teach movement — and how to trust
              your body.
            </p>
          </div>

          <div className="coaches-simple-grid mt-5">
            {/* Nimay flip card */}
            <div ref={coachNimay.ref} className={`coach-flip-wrap ${coachNimay.className}`}>
              <div className="coach-card-flip">
                <div className="coach-card-face coach-card-front">
                  <img
                    src={ASSET_PATHS.coaches.nimay}
                    alt="Nimay — Head Calisthenics Coach at ELEV8 Goa"
                    className="coach-photo-simple"
                    loading="lazy"
                  />
                  <div className="coach-front-info">
                    <p className="coach-role-badge">Head Coach · Calisthenics</p>
                    <h3 className="coach-card-name">Nimay</h3>
                    <span className="coach-flip-hint">Hover to learn more</span>
                  </div>
                </div>
                <div className="coach-card-face coach-card-back">
                  <p className="coach-role-badge">Head Coach · Calisthenics</p>
                  <h3 className="coach-card-name">Nimay</h3>
                  <p className="coach-handle">@nim_boo_24</p>
                  <p className="coach-quote">
                    "Mastery over your own body is the foundation of everything."
                  </p>
                  <p className="coach-bio-simple">
                    Cornerstone of ELEV8's calisthenics system. Specialises in advanced skill
                    progressions — front lever, planche, handstand.
                  </p>
                  <a
                    href="https://www.instagram.com/nim_boo_24/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm mt-3"
                  >
                    Follow on Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Raj flip card */}
            <div ref={coachRaj.ref} className={`coach-flip-wrap ${coachRaj.className}`} data-delay="1">
              <div className="coach-card-flip">
                <div className="coach-card-face coach-card-front">
                  <img
                    src={ASSET_PATHS.coaches.raj}
                    alt="Raj — Head Strength Coach at ELEV8 Goa"
                    className="coach-photo-simple"
                    loading="lazy"
                  />
                  <div className="coach-front-info">
                    <p className="coach-role-badge">Head Coach · Strength &amp; Conditioning</p>
                    <h3 className="coach-card-name">Raj</h3>
                    <span className="coach-flip-hint">Hover to learn more</span>
                  </div>
                </div>
                <div className="coach-card-face coach-card-back">
                  <p className="coach-role-badge">Head Coach · Strength &amp; Conditioning</p>
                  <h3 className="coach-card-name">Raj</h3>
                  <p className="coach-handle">@_raj_missile_</p>
                  <p className="coach-quote">
                    "Strength isn't just physical — it's the discipline to show up every single
                    day."
                  </p>
                  <p className="coach-bio-simple">
                    Explosive energy and deep technical knowledge. Specialises in strength, body
                    composition, and conditioning.
                  </p>
                  <a
                    href="https://www.instagram.com/_raj_missile_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm mt-3"
                  >
                    Follow on Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3 mt-3">
            {/* Pansy */}
            <div ref={coachPansy.ref} className={`col-6 col-md-3 ${coachPansy.className}`}>
              <div className="coach-mini-flip-wrap">
                <div className="coach-card-flip">
                  <div className="coach-card-face coach-card-front">
                    <img src={ASSET_PATHS.coaches.pancy} alt="Pansy" className="coach-mini-photo" />
                    <div className="coach-mini-front-overlay">
                      <h4 className="coach-mini-name">Pansy</h4>
                      <p className="coach-mini-role">Calisthenics Coach</p>
                    </div>
                  </div>
                  <div className="coach-card-face coach-card-back coach-mini-back">
                    <h4 className="coach-mini-name">Pansy</h4>
                    <p className="coach-mini-role">Calisthenics Coach</p>
                    <a
                      href="https://www.instagram.com/pansypinto/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="coach-mini-handle"
                    >
                      @pansypinto
                    </a>
                    <p className="coach-mini-intro">
                      Proves calisthenics is for everyone. Leads beginners step by step with sharp
                      technique and contagious energy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rupam */}
            <div ref={coachRupam.ref} className={`col-6 col-md-3 ${coachRupam.className}`} data-delay="1">
              <div className="coach-mini-flip-wrap">
                <div className="coach-card-flip">
                  <div className="coach-card-face coach-card-front">
                    <img src={ASSET_PATHS.coaches.rupam} alt="Rupam" className="coach-mini-photo" />
                    <div className="coach-mini-front-overlay">
                      <h4 className="coach-mini-name">Rupam</h4>
                      <p className="coach-mini-role">Strength Coach</p>
                    </div>
                  </div>
                  <div className="coach-card-face coach-card-back coach-mini-back">
                    <h4 className="coach-mini-name">Rupam</h4>
                    <p className="coach-mini-role">Strength Coach</p>
                    <a
                      href="https://www.instagram.com/lotlikar_rupam44/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="coach-mini-handle"
                    >
                      @lotlikar_rupam44
                    </a>
                    <p className="coach-mini-intro">
                      Builds strength the right way — methodical, consistent, built to last. No
                      shortcuts, just real results.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mahi */}
            <div ref={coachMahi.ref} className={`col-6 col-md-3 ${coachMahi.className}`} data-delay="2">
              <div className="coach-mini-flip-wrap">
                <div className="coach-card-flip">
                  <div className="coach-card-face coach-card-front">
                    <img src={ASSET_PATHS.coaches.mahi} alt="Mahi" className="coach-mini-photo" />
                    <div className="coach-mini-front-overlay">
                      <h4 className="coach-mini-name">Mahi</h4>
                      <p className="coach-mini-role">Mobility &amp; Conditioning Coach</p>
                    </div>
                  </div>
                  <div className="coach-card-face coach-card-back coach-mini-back">
                    <h4 className="coach-mini-name">Mahi</h4>
                    <p className="coach-mini-role">Mobility &amp; Conditioning</p>
                    <a
                      href="https://www.instagram.com/_mahi0520_/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="coach-mini-handle"
                    >
                      @_mahi0520_
                    </a>
                    <p className="coach-mini-intro">
                      Mobility unlocks everything. Makes movement feel natural for every body type,
                      at every level.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Samarth */}
            <div ref={coachSamarth.ref} className={`col-6 col-md-3 ${coachSamarth.className}`} data-delay="3">
              <div className="coach-mini-flip-wrap">
                <div className="coach-card-flip">
                  <div className="coach-card-face coach-card-front">
                    <img src={ASSET_PATHS.coaches.samarth} alt="Samarth" className="coach-mini-photo" />
                    <div className="coach-mini-front-overlay">
                      <h4 className="coach-mini-name">Samarth</h4>
                      <p className="coach-mini-role">Calisthenics Coach</p>
                    </div>
                  </div>
                  <div className="coach-card-face coach-card-back coach-mini-back">
                    <h4 className="coach-mini-name">Samarth</h4>
                    <p className="coach-mini-role">Calisthenics Coach</p>
                    <a
                      href="https://www.instagram.com/disruptor_23/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="coach-mini-handle"
                    >
                      @disruptor_23
                    </a>
                    <p className="coach-mini-intro">
                      Brings relentless energy every session. Keeps the group pushing and the
                      atmosphere alive.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Members ───────────────────────────────────────── */}
      <MembersShowcase />

      {/* ── Mission & Vision ─────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="row g-4">
            <div ref={missionCard.ref} className={`col-md-6 ${missionCard.className}`}>
              <div className="story-mission-card">
                <div className="story-card-icon">🎯</div>
                <h3 className="story-card-label">Our Mission</h3>
                <p className="story-card-text">
                  Make elite calisthenics coaching accessible to every person in Goa — building a
                  community where discipline and progress are the standard.
                </p>
              </div>
            </div>
            <div ref={visionCard.ref} className={`col-md-6 ${visionCard.className}`} data-delay="1">
              <div className="story-mission-card">
                <div className="story-card-icon">🌟</div>
                <h3 className="story-card-label">Our Vision</h3>
                <p className="story-card-text">
                  To be India's leading calisthenics movement — producing athletes that demonstrate
                  the extraordinary potential of the human body.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Journey Timeline ──────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }} id="our-story">
        <div className="container">
          <div ref={timelineHead.ref} className={`section-head-center ${timelineHead.className}`}>
            <span className="eyebrow">The Journey</span>
            <h2 className="section-title">Milestones that shaped us</h2>
          </div>
          <div className="story-timeline mt-5">
            <div ref={timeline1.ref} className={`timeline-item ${timeline1.className}`}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-year">2020</span>
                <h4 className="timeline-event">First Sessions Outdoors</h4>
                <p className="timeline-desc">
                  A small crew begins training together at parks and open grounds across Goa. The
                  seed is planted.
                </p>
              </div>
            </div>
            <div ref={timeline2.ref} className={`timeline-item ${timeline2.className}`} data-delay="1">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-year">2021</span>
                <h4 className="timeline-event">ELEV8 Founded</h4>
                <p className="timeline-desc">
                  The community formalises. ELEV8 is born with a clear purpose: structured
                  calisthenics coaching for all levels.
                </p>
              </div>
            </div>
            <div ref={timeline3.ref} className={`timeline-item ${timeline3.className}`} data-delay="2">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-year">2022</span>
                <h4 className="timeline-event">First Community Workshop</h4>
                <p className="timeline-desc">
                  ELEV8 hosts its first open workshop — 30+ attendees discover calisthenics
                  fundamentals together.
                </p>
              </div>
            </div>
            <div ref={timeline4.ref} className={`timeline-item ${timeline4.className}`} data-delay="3">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-year">2023</span>
                <h4 className="timeline-event">Studio &amp; Programs Launch</h4>
                <p className="timeline-desc">
                  Dedicated training space opens. BFT and CST programs launch. The studio begins
                  serving the community consistently.
                </p>
              </div>
            </div>
            <div ref={timeline5.ref} className={`timeline-item ${timeline5.className}`} data-delay="4">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-year">2024–25</span>
                <h4 className="timeline-event">Community Growth</h4>
                <p className="timeline-desc">
                  Rated 5.0★ on Google. Members progress from beginners to competing athletes. The
                  movement keeps growing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community Impact ─────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={statsStrip.ref} className={`stats-strip ${statsStrip.className}`}>
            <div className="stat-item">
              <div className="stat-num">5.0★</div>
              <div className="stat-lbl">Google Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">25+</div>
              <div className="stat-lbl">5-Star Reviews</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">6</div>
              <div className="stat-lbl">Daily Classes</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">100%</div>
              <div className="stat-lbl">Community Driven</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={ctaBand.ref} className={`cta-band ${ctaBand.className}`}>
            <h2>Ready to start?</h2>
            <p>Book a free trial. No experience needed — just show up.</p>
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

import { useDocumentTitle } from "@shared/hooks/useDocumentTitle";
import { useReveal } from "@shared/hooks/useReveal";
import { AnimatedCounter } from "@shared/ui/AnimatedCounter";
import { TransitionLink } from "@shared/ui/TransitionLink";
import { ASSET_PATHS } from "@shared/constants/assetPaths";
import { ROUTES } from "@shared/constants/routes";
import { TESTIMONIALS } from "./testimonials";

export function HomePage() {
  useDocumentTitle("ELEV8 | Premium Calisthenics & Fitness Studio in Goa");

  const heroBadge = useReveal<HTMLSpanElement>();
  const heroTitle = useReveal<HTMLHeadingElement>();
  const heroLead = useReveal<HTMLParagraphElement>();
  const heroActions = useReveal<HTMLDivElement>();
  const heroTrust = useReveal<HTMLDivElement>();
  const statGrid = useReveal<HTMLDivElement>();
  const whyHead = useReveal<HTMLDivElement>();
  const feature1 = useReveal<HTMLDivElement>();
  const feature2 = useReveal<HTMLDivElement>();
  const feature3 = useReveal<HTMLDivElement>();
  const feature4 = useReveal<HTMLDivElement>();
  const programsHead = useReveal<HTMLDivElement>();
  const program1 = useReveal<HTMLDivElement>();
  const program2 = useReveal<HTMLDivElement>();
  const journeyText = useReveal<HTMLDivElement>();
  const journeyVideo = useReveal<HTMLDivElement>();
  const testimonialsHead = useReveal<HTMLDivElement>();
  const ctaBand = useReveal<HTMLDivElement>();

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="hero">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <span ref={heroBadge.ref} className={`hero-badge ${heroBadge.className}`}>
                <span className="dot"></span> Goa&rsquo;s Premium Calisthenics Studio ·{" "}
                <strong>5.0★ on Google</strong>
              </span>
              <h1 ref={heroTitle.ref} className={heroTitle.className} data-delay="1">
                Your body is the
                <br />
                <span className="accent">only equipment</span> you need.
              </h1>
              <p ref={heroLead.ref} className={`hero-lead ${heroLead.className}`} data-delay="2">
                Build serious strength, mobility and skill through structured calisthenics, functional and weight
                training. Coaching for every level — from your first push-up to your first muscle-up.
              </p>
              <div ref={heroActions.ref} className={`hero-actions ${heroActions.className}`} data-delay="3">
                <TransitionLink to={ROUTES.signUp} className="btn btn-success btn-lg">
                  Book a Free Trial
                </TransitionLink>
                <TransitionLink to={ROUTES.programs} className="btn btn-outline-success btn-lg">
                  Explore Programs
                </TransitionLink>
              </div>

              <div ref={heroTrust.ref} className={`hero-trust ${heroTrust.className}`} data-delay="4">
                <div>
                  <div className="num">
                    <AnimatedCounter target={5} decimals={1} />
                    <span className="star">★</span>
                  </div>
                  <div className="lbl">Google Rating</div>
                </div>
                <div>
                  <div className="num">
                    <AnimatedCounter target={25} />+
                  </div>
                  <div className="lbl">5-Star Reviews</div>
                </div>
                <div>
                  <div className="num">All</div>
                  <div className="lbl">Levels Welcome</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS STRIP ===================== */}
      <section className="section-tight">
        <div className="container">
          <div ref={statGrid.ref} className={`stat-grid ${statGrid.className}`}>
            <div className="stat-cell">
              <div className="stat-num">
                <AnimatedCounter target={5} decimals={1} />★
              </div>
              <div className="stat-lbl">Google Rated</div>
            </div>
            <div className="stat-cell">
              <div className="stat-num">
                <AnimatedCounter target={25} />+
              </div>
              <div className="stat-lbl">Happy Reviews</div>
            </div>
            <div className="stat-cell">
              <div className="stat-num">
                <AnimatedCounter target={6} />
              </div>
              <div className="stat-lbl">Daily Class Slots</div>
            </div>
            <div className="stat-cell">
              <div className="stat-num">∞</div>
              <div className="stat-lbl">Progress Potential</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== WHY ELEV8 ===================== */}
      <section className="section">
        <div className="container">
          <div ref={whyHead.ref} className={`section-head-center ${whyHead.className}`}>
            <span className="eyebrow">The ELEV8 Difference</span>
            <h2 className="section-title">Train with intent. Progress that lasts.</h2>
            <p className="section-lead">
              We focus on movement quality, discipline and sustainable progress — not quick fixes. Here&rsquo;s what
              every session is built on.
            </p>
          </div>

          <div className="feature-grid mt-5">
            <div ref={feature1.ref} className={feature1.className}>
              <div className="feature-icon">🏋️</div>
              <h3>Structured Coaching</h3>
              <p>Clear progressions for strength, mobility and skill — so you always know your next step, never guessing.</p>
            </div>
            <div ref={feature2.ref} className={feature2.className} data-delay="1">
              <div className="feature-icon">🤸</div>
              <h3>Calisthenics First</h3>
              <p>Master your own bodyweight — handstands, levers, muscle-ups — with technique that earns real respect.</p>
            </div>
            <div ref={feature3.ref} className={feature3.className} data-delay="2">
              <div className="feature-icon">👥</div>
              <h3>Group &amp; Personal</h3>
              <p>Train in an energised community or go one-on-one with a coach. Both built around your goals.</p>
            </div>
            <div ref={feature4.ref} className={feature4.className} data-delay="3">
              <div className="feature-icon">🔥</div>
              <h3>All Levels</h3>
              <p>Beginner or advanced athlete — every plan scales to you. Show up; we handle the rest.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PROGRAMS PREVIEW ===================== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={programsHead.ref} className={`section-head-center ${programsHead.className}`}>
            <span className="eyebrow">Our Programs</span>
            <h2 className="section-title">Find the path that fits you</h2>
            <p className="section-lead">
              Two flagship tracks, flexible schedules, honest pricing — all designed to keep you progressing.
            </p>
          </div>

          <div className="feature-grid mt-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
            <div ref={program1.ref} className={program1.className}>
              <h3 className="program-title">Bodyweight Functional Training</h3>
              <p className="program-desc">
                Build real-world strength and mobility through functional bodyweight movement. The perfect
                foundation for every level.
              </p>
              <ul className="program-features">
                <li>Strength &amp; conditioning fundamentals</li>
                <li>Mobility and injury-resilient movement</li>
                <li>From ₹2,100 / month</li>
              </ul>
              <TransitionLink to={ROUTES.programs} className="btn btn-outline-success w-100">
                View Plans
              </TransitionLink>
            </div>
            <div ref={program2.ref} className={program2.className} data-delay="1">
              <h3 className="program-title">Calisthenics Skill Training</h3>
              <p className="program-desc">
                A structured progression system for elite bodyweight skills — handstands, muscle-ups, levers and
                beyond.
              </p>
              <ul className="program-features">
                <li>Skill-specific progressions</li>
                <li>Handstands, levers &amp; muscle-ups</li>
                <li>From ₹2,300 / month</li>
              </ul>
              <TransitionLink to={ROUTES.programs} className="btn btn-success w-100">
                View Plans
              </TransitionLink>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== START YOUR JOURNEY ===================== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div ref={journeyText.ref} className={`col-lg-6 ${journeyText.className}`}>
              <span className="eyebrow">Start Your Journey</span>
              <h2 className="section-title">Ready to transform body and mind?</h2>
              <p className="section-lead">
                Join ELEV8 and become part of a community dedicated to mastering calisthenics. Whether you&rsquo;re a
                beginner, intermediate, or advanced athlete, we have a program tailored for you.
              </p>
              <div className="hero-actions mt-4">
                <TransitionLink to={ROUTES.signUp} className="btn btn-success btn-lg">
                  Join the Community
                </TransitionLink>
                <TransitionLink to={ROUTES.gallery} className="btn btn-outline-success btn-lg">
                  See the Gallery
                </TransitionLink>
              </div>
            </div>
            <div ref={journeyVideo.ref} className={`col-lg-6 ${journeyVideo.className}`} data-delay="1">
              <div className="video-wrapper home-video-wrapper" style={{ margin: 0 }}>
                <video className="about-video-small" controls preload="metadata" playsInline>
                  <source src={ASSET_PATHS.videos.startYourJourneyPromo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p className="video-caption">Start your journey now.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={testimonialsHead.ref} className={`section-head-center ${testimonialsHead.className}`}>
            <span className="eyebrow">5.0★ · 25 Google Reviews</span>
            <h2 className="section-title">Loved by the ELEV8 community</h2>
            <p className="section-lead">Real members. Real progress. Here&rsquo;s what training at ELEV8 feels like.</p>
          </div>
        </div>

        <div className="t-ticker-wrap mt-5" aria-label="Member testimonials">
          <div className="t-ticker">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={`set1-${t.name}`} testimonial={t} />
            ))}
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={`set2-${t.name}`} testimonial={t} hidden />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA BAND ===================== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={ctaBand.ref} className={`cta-band ${ctaBand.className}`}>
            <span className="eyebrow" style={{ justifyContent: "center" }}>
              The Lifestyle Change Movement
            </span>
            <h2>Elevate yourself. Start this week.</h2>
            <p>
              Book a free trial session and feel the difference structured calisthenics coaching makes. Train hard,
              stay strong, elevate yourself.
            </p>
            <div className="cta-actions">
              <TransitionLink to={ROUTES.signUp} className="btn btn-success btn-lg">
                Book a Free Trial
              </TransitionLink>
              <a
                href="https://wa.me/917066131474"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-success btn-lg"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function TestimonialCard({ testimonial, hidden }: { testimonial: (typeof TESTIMONIALS)[number]; hidden?: boolean }) {
  return (
    <figure className="t-ticker-card" aria-hidden={hidden || undefined}>
      <div className="t-stars">★★★★★</div>
      <blockquote className="t-quote">&ldquo;{testimonial.quote}&rdquo;</blockquote>
      <figcaption className="t-author">
        <div className="t-avatar">{testimonial.avatar}</div>
        <div>
          <p className="t-name">{testimonial.name}</p>
          <p className="t-tag">{testimonial.tag}</p>
        </div>
      </figcaption>
    </figure>
  );
}

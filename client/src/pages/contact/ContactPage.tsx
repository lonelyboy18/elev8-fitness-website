import { useDocumentTitle } from "@shared/hooks/useDocumentTitle";
import { useReveal } from "@shared/hooks/useReveal";
import { TransitionLink } from "@shared/ui/TransitionLink";
import { CoachSelectionModal } from "@shared/ui/CoachSelectionModal";
import { ROUTES } from "@shared/constants/routes";
import { buildEnquiryMessage } from "@shared/lib/whatsapp";
import { ContactForm } from "@features/contact/ui/ContactForm";
import { ReviewsSection } from "./ReviewsSection";

const ENQUIRY_MODAL_ID = "contactEnquiryCoachModal";

export function ContactPage() {
  useDocumentTitle("Contact Us — ELEV8 Calisthenics & Fitness Studio Goa");

  const eyebrow = useReveal<HTMLSpanElement>();
  const title = useReveal<HTMLHeadingElement>();
  const lead = useReveal<HTMLParagraphElement>();
  const formWrap = useReveal<HTMLDivElement>();
  const infoCol = useReveal<HTMLDivElement>();
  const channel1 = useReveal<HTMLDivElement>();
  const channel2 = useReveal<HTMLDivElement>();
  const channel3 = useReveal<HTMLDivElement>();
  const channel4 = useReveal<HTMLDivElement>();
  const channel5 = useReveal<HTMLDivElement>();
  const mapHead = useReveal<HTMLDivElement>();
  const mapWrap = useReveal<HTMLDivElement>();
  const ctaBand = useReveal<HTMLDivElement>();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="contact-hero section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <span ref={eyebrow.ref} className={`eyebrow ${eyebrow.className}`}>
                We&rsquo;re Here for You
              </span>
              <h1
                ref={title.ref}
                className={title.className}
                data-delay="1"
                style={{ fontSize: "clamp(2.8rem,8vw,5rem)" }}
              >
                Contact
                <br />
                <span className="accent">ELEV8 Fitness</span>
              </h1>
              <p ref={lead.ref} className={`section-lead ${lead.className}`} data-delay="2">
                Questions about programs? Ready to book a trial? Want to visit us? We&rsquo;re just a WhatsApp away —
                and we always reply.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Info & Form ─────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="contact-grid">
            {/* Left: Contact Form */}
            <div ref={formWrap.ref} className={`contact-form-wrap ${formWrap.className} glass-card`}>
              <span className="eyebrow">Send a Message</span>
              <h2 className="section-title" style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>
                Get in touch
              </h2>
              <ContactForm />
            </div>

            {/* Right: Contact Info */}
            <div ref={infoCol.ref} className={`contact-info-col ${infoCol.className}`} data-delay="1">
              <span className="eyebrow">Reach Us Directly</span>
              <h2 className="section-title" style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>
                Contact information
              </h2>

              <div className="contact-channels">
                <div ref={channel1.ref} className={`contact-channel ${channel1.className}`}>
                  <div className="contact-ch-icon">📞</div>
                  <div>
                    <p className="contact-ch-label">Phone</p>
                    <a href="tel:+917066131474" className="contact-ch-value">
                      +91 70661 31474
                    </a>
                  </div>
                </div>
                <div ref={channel2.ref} className={`contact-channel ${channel2.className}`} data-delay="1">
                  <div className="contact-ch-icon">💬</div>
                  <div>
                    <p className="contact-ch-label">WhatsApp</p>
                    <a
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target={`#${ENQUIRY_MODAL_ID}`}
                      className="contact-ch-value"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
                <div ref={channel3.ref} className={`contact-channel ${channel3.className}`} data-delay="2">
                  <div className="contact-ch-icon">📸</div>
                  <div>
                    <p className="contact-ch-label">Instagram</p>
                    <a
                      href="https://www.instagram.com/elev8.goa/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-ch-value"
                    >
                      @elev8.goa
                    </a>
                  </div>
                </div>
                <div ref={channel4.ref} className={`contact-channel ${channel4.className}`} data-delay="3">
                  <div className="contact-ch-icon">📍</div>
                  <div>
                    <p className="contact-ch-label">Location</p>
                    <span className="contact-ch-value">Goa, India</span>
                  </div>
                </div>
                <div ref={channel5.ref} className={`contact-channel ${channel5.className}`} data-delay="4">
                  <div className="contact-ch-icon">🕐</div>
                  <div>
                    <p className="contact-ch-label">Class Hours</p>
                    <span className="contact-ch-value">5:30 AM · 6:30 AM · 7:30 AM · 9:00 AM</span>
                    <span className="contact-ch-value" style={{ marginTop: "0.2rem", display: "block" }}>
                      5:00 PM · 6:00 PM · 7:00 PM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Google Map ────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={mapHead.ref} className={`section-head-center ${mapHead.className}`}>
            <span className="eyebrow">Find Us</span>
            <h2 className="section-title">We&rsquo;re in Goa</h2>
          </div>
          <div ref={mapWrap.ref} className={`map-wrapper ${mapWrap.className} mt-4`}>
            <iframe
              title="ELEV8 Fitness Studio location in Goa"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243648.84529199487!2d73.67963365!3d15.29940235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbfba106336b741%3A0xeaf43b6712820d5!2sGoa%2C%20India!5e0!3m2!1sen!2sin!4v1700000000000"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* ── Member Reviews ────────────────────────────────────── */}
      <ReviewsSection />

      {/* ── Community CTA ─────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={ctaBand.ref} className={`cta-band ${ctaBand.className}`}>
            <span className="eyebrow" style={{ justifyContent: "center" }}>
              Begin Your Journey
            </span>
            <h2>Ready to start your calisthenics journey?</h2>
            <p>Join Goa&rsquo;s most dedicated fitness community. Book a free trial and see what ELEV8 can do for you.</p>
            <div className="cta-actions">
              <TransitionLink to={ROUTES.signUp} className="btn btn-success btn-lg">
                Join Now
              </TransitionLink>
              <button
                type="button"
                className="btn btn-outline-success btn-lg"
                data-bs-toggle="modal"
                data-bs-target={`#${ENQUIRY_MODAL_ID}`}
              >
                WhatsApp Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <CoachSelectionModal id={ENQUIRY_MODAL_ID} buildMessage={(coach) => buildEnquiryMessage(coach.name)} />
    </>
  );
}

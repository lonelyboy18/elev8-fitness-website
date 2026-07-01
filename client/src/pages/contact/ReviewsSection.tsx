import { useRef, useState } from "react";
import { useReveal } from "@shared/hooks/useReveal";
import { REVIEWS } from "./reviews";

const PAGES = [1, 2] as const;

/** Mirrors js/pages/contact.js reviews pagination — 3 cards/page, click-to-switch + smooth scroll to #reviews. */
export function ReviewsSection() {
  const [page, setPage] = useState<1 | 2>(1);
  const sectionRef = useRef<HTMLDivElement>(null);

  const head = useReveal<HTMLDivElement>();
  const statBar = useReveal<HTMLDivElement>();
  const pagination = useReveal<HTMLDivElement>();

  function goToPage(next: 1 | 2) {
    if (next === page) return;
    setPage(next);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="section" style={{ paddingTop: 0 }} id="reviews" ref={sectionRef}>
      <div className="container">
        <div ref={head.ref} className={`section-head-center ${head.className}`}>
          <span className="eyebrow">Community Voice</span>
          <h2 className="section-title">What members say</h2>
        </div>

        <div
          ref={statBar.ref}
          className={`rating-stats-bar ${statBar.className} mt-4`}
          id="ratingStatBar"
          style={{ justifyContent: "center", marginBottom: "2.5rem" }}
        >
          <span className="rating-avg" id="liveAvg">
            5.0
          </span>
          <span className="rating-stars-display">★★★★★</span>
          <span className="rating-count" id="liveCount">
            25 Google Reviews
          </span>
        </div>

        <div id="reviewsGrid" className="row g-4">
          {REVIEWS.map((review) => (
            <div
              key={review.name}
              className={`col-md-6 col-lg-4 review-card${review.page === page ? "" : " hidden"}`}
              data-page={review.page}
            >
              <div className="testimonial-card">
                <div className="t-stars">★★★★★</div>
                <p className="t-quote">&quot;{review.quote}&quot;</p>
                <div className="t-author">
                  <div className="t-avatar">{review.avatar}</div>
                  <div>
                    <p className="t-name">{review.name}</p>
                    <p className="t-tag">{review.tag}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div ref={pagination.ref} className={`reviews-pagination ${pagination.className}`}>
          {PAGES.map((p) => (
            <button
              key={p}
              type="button"
              className={`reviews-pg-btn${p === page ? " active" : ""}`}
              data-page={p}
              aria-label={`Page ${p}`}
              onClick={() => goToPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

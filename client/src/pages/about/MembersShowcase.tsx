import { useMemo, useState } from "react";
import { useReveal } from "@shared/hooks/useReveal";
import { MEMBERS, MEMBER_TOTAL, type Member } from "./members";

const PAGE_SIZE = 7;
const AVATAR_COLORS = ["var(--teal)", "var(--teal-mid)", "var(--teal-deep)", "var(--orange)"];

function chunk(items: readonly Member[], size: number): Member[][] {
  const pages: Member[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

function MemberCard({ name, quote, colorIndex }: { name: string; quote: string; colorIndex: number }) {
  const [flipped, setFlipped] = useState(false);
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];

  return (
    <button
      type="button"
      className={`member-flip-btn${flipped ? " is-flipped" : ""}`}
      aria-pressed={flipped}
      aria-label={flipped ? `${name} — showing message, tap to show photo` : `${name} — tap to reveal a message`}
      onClick={() => setFlipped((f) => !f)}
    >
      <span className="member-card-flip">
        <span className="member-card-face member-card-front">
          <span className="member-avatar" style={{ background: color }} aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="member-name">{name}</span>
          <span className="member-flip-hint">Tap for a message</span>
        </span>
        <span className="member-card-face member-card-back">
          <span className="member-quote">&ldquo;{quote}&rdquo;</span>
        </span>
      </span>
    </button>
  );
}

/** "Our Members" showcase — a paginated, tap-to-flip preview of the ELEV8 community. No autoplay: advances only on click. */
export function MembersShowcase() {
  const head = useReveal<HTMLDivElement>();
  const showcase = useReveal<HTMLDivElement>();
  const [page, setPage] = useState(0);

  const pages = useMemo(() => chunk(MEMBERS, PAGE_SIZE), []);
  const pageCount = pages.length;

  function goTo(next: number) {
    setPage(((next % pageCount) + pageCount) % pageCount);
  }

  return (
    <section className="section" style={{ paddingTop: 0 }} id="members">
      <div className="container">
        <div ref={head.ref} className={`section-head-center ${head.className}`}>
          <span className="eyebrow">Our Members</span>
          <h2 className="section-title">250+ transformations</h2>
          <p className="section-lead">
            Real people, real consistency. Join <strong>{MEMBER_TOTAL} happy members</strong> already training
            with ELEV8.
          </p>
        </div>

        <div ref={showcase.ref} className={`members-showcase mt-5 ${showcase.className}`}>
          <div className="members-viewport">
            <div className="members-track" style={{ transform: `translateX(-${page * 100}%)` }}>
              {pages.map((membersOnPage, pageIndex) => (
                <div className="members-page" key={pageIndex}>
                  {membersOnPage.map((member, i) => (
                    <MemberCard
                      key={member.name}
                      name={member.name}
                      quote={member.quote}
                      colorIndex={pageIndex * PAGE_SIZE + i}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="members-controls">
            <button type="button" className="members-nav-btn" aria-label="Previous members" onClick={() => goTo(page - 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="members-dots" role="tablist" aria-label="Members page">
              {pages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`members-dot${i === page ? " active" : ""}`}
                  aria-label={`Go to page ${i + 1}`}
                  aria-current={i === page}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>

            <button type="button" className="members-nav-btn" aria-label="Next members" onClick={() => goTo(page + 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { useDocumentTitle } from "@shared/hooks/useDocumentTitle";
import { useReveal } from "@shared/hooks/useReveal";
import { CoachSelectionModal } from "@shared/ui/CoachSelectionModal";
import { ASSET_PATHS } from "@shared/constants/assetPaths";
import { buildGalleryTrialMessage } from "@shared/lib/whatsapp";

const TRIAL_MODAL_ID = "galleryTrialCoachModal";

type Category = "all" | "training" | "community";

interface GalleryVideoItem {
  id: string;
  category: "training";
  src: string;
  caption: string;
  delay?: string;
}

interface GalleryPictureItem {
  id: string;
  category: "community";
  src: string;
  alt: string;
  caption: string;
  delay?: string;
}

const VIDEO_ITEMS: GalleryVideoItem[] = [
  {
    id: "calisthenics-multi-form",
    category: "training",
    src: ASSET_PATHS.videos.calisthenicsMultiFormShowcase,
    caption: "From basics to advanced — every form built with control and consistency.",
  },
  {
    id: "handstand-pushup",
    category: "training",
    src: ASSET_PATHS.videos.handstandPushupProgression,
    caption: "Handstand push-up progression: balance, shoulder power, confidence.",
    delay: "1",
  },
  {
    id: "one-finger-strength",
    category: "training",
    src: ASSET_PATHS.videos.oneFingerStrengthDrill,
    caption: "One-finger strength drill — grip precision and full-body tension.",
    delay: "2",
  },
  {
    id: "mobility-explosive",
    category: "training",
    src: ASSET_PATHS.videos.mobilityExplosiveMovement,
    caption: "Flex On — mobility, explosive movement, and clean technique.",
    delay: "3",
  },
];

const PICTURE_ITEMS: GalleryPictureItem[] = [
  {
    id: "beach-community-workout",
    category: "community",
    src: ASSET_PATHS.gallery.beachCommunityWorkoutGroup,
    alt: "ELEV8 community growth — athletes training together",
    caption: "We grow together: stronger bodies, sharper minds, one team.",
  },
  {
    id: "indoor-group-training",
    category: "community",
    src: ASSET_PATHS.gallery.indoorGroupTrainingSession,
    alt: "ELEV8 training session — discipline and form",
    caption: "High-energy sessions built on discipline, form, and consistency.",
    delay: "1",
  },
  {
    id: "athlete-physique-showcase",
    category: "community",
    src: ASSET_PATHS.gallery.athletePhysiqueShowcase,
    alt: "ELEV8 athlete performance",
    caption: "Achievement unlocked — one focused rep at a time.",
    delay: "2",
  },
  {
    id: "calisthenics-team-beach",
    category: "community",
    src: ASSET_PATHS.gallery.calisthenicsTeamBeachGroup,
    alt: "ELEV8 community event",
    caption: "Cali family spirit: support, sweat, and shared goals.",
    delay: "3",
  },
];

/**
 * Mirrors the legacy `.gallery-item` fade-then-hide behaviour from
 * js/core/core.js `initGalleryFilter()`: on filter change, non-matching
 * items fade opacity to 0, then after 320ms are removed from layout
 * (display: none) unless the filter changed again in the meantime.
 * Matching items are restored to visible/in-flow immediately.
 */
function useGalleryItemStyle(itemCategory: Category, activeCategory: Category): React.CSSProperties {
  const isVisible = activeCategory === "all" || itemCategory === activeCategory;
  const [display, setDisplay] = useState<"" | "none">(isVisible ? "" : "none");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isVisible) {
      setDisplay("");
    } else {
      timeoutRef.current = window.setTimeout(() => {
        setDisplay("none");
      }, 320);
    }

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  return { opacity: isVisible ? 1 : 0, display };
}

function VideoGalleryItem({ item, activeCategory }: { item: GalleryVideoItem; activeCategory: Category }) {
  const reveal = useReveal<HTMLDivElement>();
  const style = useGalleryItemStyle(item.category, activeCategory);

  return (
    <div
      ref={reveal.ref}
      className={`video-wrapper gallery-item ${reveal.className}`}
      data-delay={item.delay}
      data-category={item.category}
      style={style}
    >
      <video controls preload="metadata" playsInline>
        <source src={item.src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p className="video-caption">{item.caption}</p>
    </div>
  );
}

function PictureGalleryItem({ item, activeCategory }: { item: GalleryPictureItem; activeCategory: Category }) {
  const reveal = useReveal<HTMLDivElement>();
  const style = useGalleryItemStyle(item.category, activeCategory);

  return (
    <div
      ref={reveal.ref}
      className={`picture-wrapper gallery-item ${reveal.className}`}
      data-delay={item.delay}
      data-category={item.category}
      style={style}
    >
      <img loading="lazy" src={item.src} alt={item.alt} />
      <p className="picture-caption">{item.caption}</p>
    </div>
  );
}

export function GalleryPage() {
  useDocumentTitle("Gallery — ELEV8 Calisthenics & Fitness Studio");

  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const heroEyebrow = useReveal<HTMLSpanElement>();
  const heroTitle = useReveal<HTMLHeadingElement>();
  const heroLead = useReveal<HTMLParagraphElement>();

  const movementHead = useReveal<HTMLDivElement>();
  const communityHead = useReveal<HTMLDivElement>();
  const ctaBand = useReveal<HTMLDivElement>();

  return (
    <>
      {/* ===================== PAGE HERO ===================== */}
      <section className="section" style={{ paddingTop: 160, paddingBottom: 64 }}>
        <div className="container">
          <span ref={heroEyebrow.ref} className={`eyebrow ${heroEyebrow.className}`}>
            In Motion
          </span>
          <h1 ref={heroTitle.ref} className={`section-title ${heroTitle.className}`} data-delay="1">
            Gallery
          </h1>
          <p ref={heroLead.ref} className={`section-lead ${heroLead.className}`} data-delay="2">
            Skills built with precision. Community forged through effort. This is ELEV8 in action.
          </p>
        </div>
      </section>

      {/* ===================== FILTER BAR ===================== */}
      <section style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="container">
          <div
            className="gallery-filter-bar"
            id="galleryFilterBar"
            role="group"
            aria-label="Filter gallery by category"
          >
            <button
              className={`gallery-filter-btn${activeCategory === "all" ? " active" : ""}`}
              data-cat="all"
              onClick={() => setActiveCategory("all")}
            >
              All
            </button>
            <button
              className={`gallery-filter-btn${activeCategory === "training" ? " active" : ""}`}
              data-cat="training"
              onClick={() => setActiveCategory("training")}
            >
              Training
            </button>
            <button
              className={`gallery-filter-btn${activeCategory === "community" ? " active" : ""}`}
              data-cat="community"
              onClick={() => setActiveCategory("community")}
            >
              Community
            </button>
          </div>
        </div>
      </section>

      {/* ===================== MOVEMENT HIGHLIGHTS ===================== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={movementHead.ref} className={`section-head-center ${movementHead.className}`}>
            <span className="eyebrow">Movement Highlights</span>
            <h2 className="section-title">Watch the Work</h2>
          </div>
          <div className="gallery-grid mt-5">
            {VIDEO_ITEMS.map((item) => (
              <VideoGalleryItem key={item.id} item={item} activeCategory={activeCategory} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== COMMUNITY MOMENTS ===================== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={communityHead.ref} className={`section-head-center ${communityHead.className}`}>
            <span className="eyebrow">Community Moments</span>
            <h2 className="section-title">The Cali Family</h2>
          </div>
          <div className="gallery-grid mt-5">
            {PICTURE_ITEMS.map((item) => (
              <PictureGalleryItem key={item.id} item={item} activeCategory={activeCategory} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== COMING SOON CTA ===================== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div ref={ctaBand.ref} className={`cta-band ${ctaBand.className}`}>
            <span className="eyebrow" style={{ justifyContent: "center" }}>
              Follow for More
            </span>
            <h2>More Content Coming</h2>
            <p>
              Follow us on Instagram for regular training highlights, events and athlete showcases from the ELEV8
              community.
            </p>
            <div className="cta-actions">
              <a
                href="https://www.instagram.com/elev8.goa/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-lg"
              >
                Follow on Instagram
              </a>
              <button
                type="button"
                className="btn btn-outline-success btn-lg"
                data-bs-toggle="modal"
                data-bs-target={`#${TRIAL_MODAL_ID}`}
              >
                Book a Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      <CoachSelectionModal id={TRIAL_MODAL_ID} buildMessage={(coach) => buildGalleryTrialMessage(coach.name)} />
    </>
  );
}

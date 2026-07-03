import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { TransitionLink } from "@shared/ui/TransitionLink";
import { ROUTES } from "@shared/constants/routes";
import { ASSET_PATHS } from "@shared/constants/assetPaths";

interface NavbarProps {
  /** The "Join Now" CTA is only shown on marketing pages, matching the legacy navbar markup. */
  showJoinCta?: boolean;
}

const NAV_LINKS: { to: string; label: string }[] = [
  { to: ROUTES.home, label: "Home" },
  { to: ROUTES.about, label: "About" },
  { to: ROUTES.programs, label: "Programs" },
  { to: ROUTES.membership, label: "Membership" },
  { to: ROUTES.gallery, label: "Gallery" },
  { to: ROUTES.feedback, label: "Feedback" },
  { to: ROUTES.contact, label: "Contact" },
];

/** Mirrors js/core/core.js `initNavbarScroll()` — toggles `.scrolled` past 24px of scroll. */
function useNavbarScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

export function Navbar({ showJoinCta = true }: NavbarProps) {
  const scrolled = useNavbarScrolled();

  function closeMobileMenu() {
    const collapseEl = document.getElementById("menu");
    const bootstrapInstance = (window as unknown as { bootstrap?: { Collapse: { getInstance(el: Element): { hide(): void } | null } } })
      .bootstrap;
    if (collapseEl?.classList.contains("show") && bootstrapInstance) {
      bootstrapInstance.Collapse.getInstance(collapseEl)?.hide();
    }
  }

  return (
    <header>
      <nav className={`navbar navbar-expand-lg navbar-dark fixed-top${scrolled ? " scrolled" : ""}`} aria-label="Main navigation">
        <div className="container">
          <TransitionLink className="navbar-brand" to={ROUTES.home}>
            <span className="logo-crop">
              <img src={ASSET_PATHS.brandLogo} className="logo" alt="ELEV8 Calisthenics &amp; Fitness Studio" />
            </span>
          </TransitionLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#menu"
            aria-controls="menu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="menu">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              {NAV_LINKS.map((link) => (
                <li className="nav-item" key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === ROUTES.home}
                    className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              {showJoinCta && (
                <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                  <TransitionLink className="btn btn-success" to={ROUTES.signUp} onClick={closeMobileMenu}>
                    Join Now
                  </TransitionLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

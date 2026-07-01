import { useEffect, useRef } from "react";
import { useDocumentTitle } from "@shared/hooks/useDocumentTitle";
import { TransitionLink } from "@shared/ui/TransitionLink";
import { ROUTES } from "@shared/constants/routes";
import { use404SceneAnimation } from "./use404SceneAnimation";

const ERROR_CSS_HREF = "/404/error.css";

/** Injects the standalone 404 stylesheet only while this page is mounted, so its global
 *  resets (html/body overflow, background, etc.) never leak onto the rest of the SPA. */
function use404Stylesheet() {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>(`link[data-elev8-404]`);
    const alreadyPresent = Boolean(link);
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = ERROR_CSS_HREF;
      link.setAttribute("data-elev8-404", "true");
      document.head.appendChild(link);
    }
    document.body.classList.add("elev8-404-active");
    return () => {
      document.body.classList.remove("elev8-404-active");
      if (!alreadyPresent) link?.remove();
    };
  }, []);
}

export function NotFoundPage() {
  useDocumentTitle("404 — Page not found · ELEV8");
  use404Stylesheet();

  const containerRef = useRef<HTMLDivElement | null>(null);
  use404SceneAnimation(containerRef);

  return (
    <div ref={containerRef}>
      <main className="screen" id="screen-404" aria-label="Page not found">
        <div className="spotlight layer" data-depth="0.4" aria-hidden="true"></div>
        <div className="particles layer" id="error-particles" data-depth="1.2" aria-hidden="true"></div>

        <div className="scene-404" id="scene404">
          <div className="bg-404 layer" data-depth="0.6" aria-hidden="true">
            404
          </div>

          <div className="ghost-bar layer" data-depth="0.9" aria-hidden="true"></div>
          <div className="glitch" aria-hidden="true"></div>

          <div className="athlete-stage layer" data-depth="1" aria-hidden="true">
            <svg className="athlete-404" viewBox="0 0 200 320">
              <g className="limb-glow" strokeWidth={19}>
                <path d="M119 116 L135 88"></path>
                <path d="M135 88 L129 56"></path>
                <path d="M81 116 L67 88"></path>
                <path d="M67 88 L75 54"></path>
              </g>
              <g className="limb-glow" strokeWidth={22}>
                <path d="M91 170 L82 216"></path>
                <path d="M82 216 L86 260"></path>
                <path d="M109 170 L118 214"></path>
                <path d="M118 214 L112 258"></path>
              </g>
              <g className="limb" strokeWidth={13}>
                <path d="M119 116 L135 88"></path>
                <path d="M135 88 L129 56"></path>
                <path d="M81 116 L67 88"></path>
                <path d="M67 88 L75 54"></path>
              </g>
              <g className="limb" strokeWidth={16}>
                <path d="M91 170 L82 216"></path>
                <path d="M82 216 L86 260"></path>
                <path d="M109 170 L118 214"></path>
                <path d="M118 214 L112 258"></path>
              </g>
              <path className="fig-torso" d="M81 116 C77 132 85 161 90 170 L110 170 C115 161 123 132 119 116 Z"></path>
              <circle className="fig-head" cx="100" cy="80" r="15"></circle>
              <circle className="fig-hand" cx="129" cy="55" r="4.5"></circle>
              <circle className="fig-hand" cx="75" cy="53" r="4.5"></circle>
            </svg>
          </div>

          <div className="confused-mark layer" data-depth="1.4" aria-hidden="true">
            ?
          </div>

          <div className="error-copy">
            <span className="error-eyebrow">Page not found</span>
            <h1 className="error-headline">Looks like this page skipped leg day and disappeared.</h1>
            <TransitionLink className="btn-cta" id="btnReturnHome" to={ROUTES.home}>
              <svg
                className="ti-ico"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 11.5 12 4l9 7.5"></path>
                <path d="M5 10v9h14v-9"></path>
              </svg>
              Return Home
            </TransitionLink>
          </div>
        </div>
      </main>
    </div>
  );
}

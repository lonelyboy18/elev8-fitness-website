import { Outlet } from "react-router-dom";
import { Navbar } from "@widgets/navbar/Navbar";
import { SiteFooter } from "@widgets/footer/SiteFooter";
import { BackgroundVideo } from "@widgets/background-video/BackgroundVideo";

/** Layout for the sign-in / sign-up / delete-account pages — same chrome, no "Join Now" CTA. */
export function AuthLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <BackgroundVideo />
      <Navbar showJoinCta={false} />
      <main id="main" className="auth-container">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}

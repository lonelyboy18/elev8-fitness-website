import { Outlet } from "react-router-dom";
import { Navbar } from "@widgets/navbar/Navbar";
import { SiteFooter } from "@widgets/footer/SiteFooter";
import { BackgroundVideo } from "@widgets/background-video/BackgroundVideo";

/** Layout for marketing pages (home, about, programs, gallery, contact, etc.). */
export function MainLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <BackgroundVideo />
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}

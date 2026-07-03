import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "@app/layouts/MainLayout";
import { AuthLayout } from "@app/layouts/AuthLayout";
import { ROUTES } from "@shared/constants/routes";

const HomePage = lazy(() => import("@pages/home/HomePage").then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import("@pages/about/AboutPage").then((m) => ({ default: m.AboutPage })));
const ProgramsPage = lazy(() => import("@pages/programs/ProgramsPage").then((m) => ({ default: m.ProgramsPage })));
const MembershipPage = lazy(() =>
  import("@pages/membership/MembershipPage").then((m) => ({ default: m.MembershipPage }))
);
const CoachesPage = lazy(() => import("@pages/coaches/CoachesPage").then((m) => ({ default: m.CoachesPage })));
const GalleryPage = lazy(() => import("@pages/gallery/GalleryPage").then((m) => ({ default: m.GalleryPage })));
const ContactPage = lazy(() => import("@pages/contact/ContactPage").then((m) => ({ default: m.ContactPage })));
const FeedbackPage = lazy(() => import("@pages/feedback/FeedbackPage").then((m) => ({ default: m.FeedbackPage })));
const SignInPage = lazy(() => import("@pages/sign-in/SignInPage").then((m) => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import("@pages/sign-up/SignUpPage").then((m) => ({ default: m.SignUpPage })));
const DeleteAccountPage = lazy(() =>
  import("@pages/delete-account/DeleteAccountPage").then((m) => ({ default: m.DeleteAccountPage }))
);
const DashboardPage = lazy(() => import("@pages/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const NotFoundPage = lazy(() => import("@pages/not-found/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

function RouteFallback() {
  return null;
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.about} element={<AboutPage />} />
          {/* our-story.html was a meta-refresh redirect merged into about.html#our-story */}
          <Route path="/our-story" element={<Navigate to={`${ROUTES.about}#our-story`} replace />} />
          <Route path={ROUTES.programs} element={<ProgramsPage />} />
          <Route path={ROUTES.membership} element={<MembershipPage />} />
          <Route path={ROUTES.coaches} element={<CoachesPage />} />
          <Route path={ROUTES.gallery} element={<GalleryPage />} />
          <Route path={ROUTES.contact} element={<ContactPage />} />
          <Route path={ROUTES.feedback} element={<FeedbackPage />} />
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path={ROUTES.signIn} element={<SignInPage />} />
          <Route path={ROUTES.signUp} element={<SignUpPage />} />
          <Route path={ROUTES.deleteAccount} element={<DeleteAccountPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

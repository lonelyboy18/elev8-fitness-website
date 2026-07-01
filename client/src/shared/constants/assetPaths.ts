/**
 * Public asset paths. Images/videos live in client/public/assets (copied verbatim
 * from the legacy Elev8/assets folder) and are served from the web root, so they
 * are referenced as plain absolute paths rather than bundler imports.
 */
export const ASSET_PATHS = {
  brandLogo: "/assets/images/brand/Elev8-brand-logo.png",
  brandIcon: "/assets/images/brand/Elev8-icon-symbol.png",
  coaches: {
    mahi: "/assets/images/coaches/mahi.jpeg",
    nimay: "/assets/images/coaches/nimay.jpeg",
    pancy: "/assets/images/coaches/pancy.jpeg",
    raj: "/assets/images/coaches/raj.jpeg",
    rupam: "/assets/images/coaches/rupam.jpeg",
    samarth: "/assets/images/coaches/samarth.jpeg",
  },
  gallery: {
    athletePhysiqueShowcase: "/assets/images/gallery/athlete-physique-showcase.jpg",
    beachCommunityWorkoutGroup: "/assets/images/gallery/beach-community-workout-group.jpg",
    calisthenicsTeamBeachGroup: "/assets/images/gallery/calisthenics-team-beach-group.jpg",
    indoorGroupTrainingSession: "/assets/images/gallery/indoor-group-training-session.png",
  },
  videos: {
    heroBackgroundLoop: "/assets/videos/hero-background-loop.mp4",
    elev8CalisthenicsPromo: "/assets/videos/elev8-calisthenics-promo.mp4",
    startYourJourneyPromo: "/assets/videos/start-your-journey-promo.mp4",
    mobilityExplosiveMovement: "/assets/videos/mobility-explosive-movement.mp4",
    frontLeverSkillDemo: "/assets/videos/front-lever-skill-demo.mp4",
    handstandPushupProgression: "/assets/videos/handstand-pushup-progression.mp4",
    calisthenicsMultiFormShowcase: "/assets/videos/calisthenics-multi-form-showcase.mp4",
    oneFingerStrengthDrill: "/assets/videos/one-finger-strength-drill.mp4",
  },
} as const;

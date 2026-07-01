import { ASSET_PATHS } from "@shared/constants/assetPaths";

/** The ambient fixed background video present on every page (`.background-video` in main.css). */
export function BackgroundVideo() {
  return (
    <video className="background-video" autoPlay muted loop playsInline preload="none" aria-hidden="true">
      <source src={ASSET_PATHS.videos.heroBackgroundLoop} type="video/mp4" />
    </video>
  );
}

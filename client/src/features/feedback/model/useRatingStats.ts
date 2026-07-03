import { useCallback, useEffect, useState } from "react";
import { feedbackApi } from "@entities/feedback/api/feedbackApi";
import { isApiSuccess } from "@shared/types/api";

interface RatingStatsDisplay {
  avgText: string;
  countText: string;
}

const LOADING: RatingStatsDisplay = { avgText: "—", countText: "loading…" };
const ERROR: RatingStatsDisplay = { avgText: "—", countText: "" };

/** Mirrors js/pages/feedback.js `loadRatingStats()` — fetches rating_stats.php equivalent on mount. */
export function useRatingStats() {
  const [stats, setStats] = useState<RatingStatsDisplay>(LOADING);

  const load = useCallback(async (isCancelled: () => boolean = () => false) => {
    setStats(LOADING);
    try {
      const result = await feedbackApi.stats();
      if (isCancelled()) return;
      if (isApiSuccess(result)) {
        const { average, count } = result.data;
        setStats({
          avgText: count > 0 ? `${average} / 5` : "No ratings yet",
          countText: count > 0 ? `Based on ${count} review${count !== 1 ? "s" : ""}` : "",
        });
      } else {
        setStats(ERROR);
      }
    } catch {
      if (!isCancelled()) setStats(ERROR);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    load(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { ...stats, reload: load };
}

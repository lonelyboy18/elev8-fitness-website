interface LiveRatingStatsProps {
  avgText: string;
  countText: string;
}

/** Presentational — mirrors the #ratingStatBar markup on html/feedback.html, populated via useRatingStats(). */
export function LiveRatingStats({ avgText, countText }: LiveRatingStatsProps) {
  return (
    <div className="rating-stats-bar" id="ratingStatBar">
      <span className="rating-avg" id="liveAvg">
        {avgText}
      </span>
      <span className="rating-stars-display">★★★★★</span>
      <span className="rating-count" id="liveCount">
        {countText}
      </span>
    </div>
  );
}

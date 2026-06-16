export function SkeletonBlock({ className }: { className?: string }) {
  return <span className={`skeleton${className ? ` ${className}` : ""}`} aria-hidden="true" />;
}

export function ListingCardSkeleton() {
  return (
    <article className="listing-card elevated-listing-card" aria-hidden="true">
      <SkeletonBlock className="skeleton-image" />
      <div className="listing-card-body">
        <SkeletonBlock className="skeleton-line short" />
        <SkeletonBlock className="skeleton-line wide" />
        <SkeletonBlock className="skeleton-line" />
        <div className="skeleton-row">
          <SkeletonBlock className="skeleton-pill" />
          <SkeletonBlock className="skeleton-pill" />
          <SkeletonBlock className="skeleton-pill" />
        </div>
      </div>
    </article>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="marketplace-results" role="status" aria-label="Loading listings">
      {Array.from({ length: count }).map((_, index) => (
        <ListingCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PanelListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="table-list" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, index) => (
        <article className="detail-panel" key={index} aria-hidden="true">
          <SkeletonBlock className="skeleton-line short" />
          <SkeletonBlock className="skeleton-line wide" />
          <SkeletonBlock className="skeleton-line" />
        </article>
      ))}
    </div>
  );
}

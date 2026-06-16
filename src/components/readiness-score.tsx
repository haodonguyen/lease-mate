import { Info } from "lucide-react";

const EXPLAINER =
  "Transfer readiness is scored from the lister's consent status, written-consent proof, bond transfer discussion, landlord awareness, and sublet-risk acknowledgement. Higher scores mean fewer outstanding steps before a transfer.";

export function ReadinessScore({ score, variant = "inline" }: { score: number; variant?: "inline" | "meta" }) {
  return (
    <span className={`readiness-score readiness-score-${variant}`} tabIndex={0} role="note">
      {variant === "meta" ? (
        <>
          <strong>{score}%</strong>
          <span className="readiness-score-label">
            readiness score
            <Info size={13} aria-hidden="true" />
          </span>
        </>
      ) : (
        <>
          {score}% ready
          <Info size={12} aria-hidden="true" />
        </>
      )}
      <span className="readiness-tooltip" role="tooltip">
        {EXPLAINER}
      </span>
    </span>
  );
}

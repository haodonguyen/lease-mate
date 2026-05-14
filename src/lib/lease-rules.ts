export type ListingType = "lease_transfer" | "temporary_sublet" | "room_replacement";
export type ConsentStatus = "approved" | "pending" | "not_started";
export type HousingType = "private_rental" | "student_accommodation" | "share_house";
export type VisibilityLabel = "Ready to transfer" | "Consent pending" | "Needs caution";
export type WarningLevel = "info" | "medium" | "high";

export interface TransferChecklist {
  hasWrittenConsent: boolean;
  bondTransferDiscussed: boolean;
  agentOrLandlordAware: boolean;
  newRenterAddedToLease: boolean;
  understandsSubletRisk: boolean;
  housingType: HousingType;
}

export interface ReadinessInput {
  listingType: ListingType;
  consentStatus: ConsentStatus;
  checklist: TransferChecklist;
}

export interface SafetyWarning {
  level: WarningLevel;
  code: string;
  message: string;
}

export interface ListingBasicsInput {
  rentPerWeek: number;
  bondAmount: number;
  availableFrom: string;
  availableUntil?: string;
}

export function assessListingReadiness(input: ReadinessInput) {
  const missingItems: string[] = [];
  const warnings = getSafetyWarnings({
    listingType: input.listingType,
    consentStatus: input.consentStatus,
    housingType: input.checklist.housingType,
  });

  if (!input.checklist.agentOrLandlordAware) {
    missingItems.push("Agent or landlord awareness must be confirmed");
  }

  if (input.listingType !== "temporary_sublet" && !input.checklist.bondTransferDiscussed) {
    missingItems.push("Bond transfer plan must be discussed");
  }

  if (input.listingType === "lease_transfer" && !input.checklist.hasWrittenConsent) {
    missingItems.push("Written consent status must be confirmed");
  }

  if (input.listingType === "room_replacement" && input.consentStatus === "not_started") {
    missingItems.push("Written consent process must be started");
  }

  if (input.listingType === "temporary_sublet" && !input.checklist.understandsSubletRisk) {
    missingItems.push("Sublet risk must be acknowledged");
  }

  const highRisk = warnings.some((warning) => warning.level === "high");
  const canPublish =
    missingItems.length === 0 &&
    !(input.listingType === "temporary_sublet" && highRisk);

  const visibilityLabel = getVisibilityLabel(input, canPublish);
  const score = calculateReadinessScore(input, missingItems.length, warnings);

  return {
    canPublish,
    missingItems,
    visibilityLabel,
    score,
    warnings,
  };
}

export function getSafetyWarnings(input: {
  listingType: ListingType;
  consentStatus: ConsentStatus;
  housingType: HousingType;
}): SafetyWarning[] {
  const warnings: SafetyWarning[] = [];

  if (input.listingType === "temporary_sublet" && input.consentStatus !== "approved") {
    warnings.push({
      level: "high",
      code: "SUBLET_WITHOUT_WRITTEN_CONSENT",
      message: "Temporary sublets can be risky without written rental provider consent.",
    });
  }

  if (input.consentStatus === "not_started") {
    warnings.push({
      level: "medium",
      code: "CONSENT_NOT_STARTED",
      message: "The renter has not started the consent process yet.",
    });
  }

  if (input.housingType === "student_accommodation") {
    warnings.push({
      level: "info",
      code: "STUDENT_ACCOMMODATION_RULES",
      message: "Student accommodation may have extra provider-specific transfer rules.",
    });
  }

  return warnings;
}

export function validateListingBasics(input: ListingBasicsInput): string[] {
  const errors: string[] = [];
  const availableFrom = parseIsoDate(input.availableFrom);
  const availableUntil = input.availableUntil ? parseIsoDate(input.availableUntil) : undefined;

  if (input.rentPerWeek <= 0) {
    errors.push("Weekly rent must be greater than $0");
  }

  if (input.bondAmount < 0) {
    errors.push("Bond cannot be negative");
  }

  if (!availableFrom) {
    errors.push("Available from date must use YYYY-MM-DD format");
  }

  if (input.availableUntil && !availableUntil) {
    errors.push("Available until date must use YYYY-MM-DD format");
  }

  if (availableFrom && availableUntil && availableUntil <= availableFrom) {
    errors.push("Available until date must be after the available from date");
  }

  return errors;
}

function getVisibilityLabel(input: ReadinessInput, canPublish: boolean): VisibilityLabel {
  if (!canPublish) {
    return "Needs caution";
  }

  if (input.consentStatus === "approved" && input.checklist.hasWrittenConsent) {
    return "Ready to transfer";
  }

  return "Consent pending";
}

function calculateReadinessScore(
  input: ReadinessInput,
  missingCount: number,
  warnings: SafetyWarning[],
) {
  const checklistValues = Object.entries(input.checklist).filter(
    ([key]) => key !== "housingType",
  );
  const completed = checklistValues.filter(([, value]) => Boolean(value)).length;
  const baseScore = Math.round((completed / checklistValues.length) * 80);
  const consentBonus = input.consentStatus === "approved" ? 20 : input.consentStatus === "pending" ? 10 : 0;
  const warningPenalty = warnings.reduce((total, warning) => {
    if (warning.level === "high") return total + 30;
    if (warning.level === "medium") return total + 15;
    return total + 5;
  }, 0);

  return Math.max(0, Math.min(100, baseScore + consentBonus - missingCount * 10 - warningPenalty));
}

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return null;
  }

  return date;
}

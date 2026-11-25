export const REPORT_REASONS = ["Explicit or gross", "Hateful or mean", "Spam", "Not a cat", "Something else"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

/**
 * Reported figures: NCRB "Crime in India" Table 9A.1 — Cyber Crimes (State/UT-wise) 2021–2023.
 * Estimated figures are ScamShield projections and are always labelled as such in the UI.
 */
export const NCRB_SOURCE = {
  name: "NCRB — Crime in India 2023, Table 9A.1",
  url: "https://www.ncrb.mha.gov.in/uploads/files/TABLE9A1.pdf",
  lastUpdated: "2025-09-30",
};

export interface StateRow {
  code: string;
  name: string;
  /** Tile-map position (column, row) — approximate geography. */
  col: number;
  row: number;
  y2021: number;
  y2022: number;
  y2023: number;
  /** Crime rate per lakh population (2023). */
  rate2023: number;
}

export const STATES: StateRow[] = [
  { code: "JK", name: "Jammu & Kashmir", col: 2, row: 0, y2021: 154, y2022: 173, y2023: 185, rate2023: 1.4 },
  { code: "LA", name: "Ladakh", col: 3, row: 0, y2021: 5, y2022: 3, y2023: 1, rate2023: 0.3 },
  { code: "PB", name: "Punjab", col: 2, row: 1, y2021: 551, y2022: 697, y2023: 511, rate2023: 1.7 },
  { code: "HP", name: "Himachal Pradesh", col: 3, row: 1, y2021: 70, y2022: 77, y2023: 127, rate2023: 1.7 },
  { code: "RJ", name: "Rajasthan", col: 1, row: 2, y2021: 1504, y2022: 1833, y2023: 2435, rate2023: 3.0 },
  { code: "HR", name: "Haryana", col: 2, row: 2, y2021: 622, y2022: 681, y2023: 751, rate2023: 2.5 },
  { code: "DL", name: "Delhi", col: 3, row: 2, y2021: 356, y2022: 685, y2023: 407, rate2023: 1.9 },
  { code: "UK", name: "Uttarakhand", col: 4, row: 2, y2021: 718, y2022: 559, y2023: 494, rate2023: 4.2 },
  { code: "SK", name: "Sikkim", col: 6, row: 2, y2021: 0, y2022: 26, y2023: 12, rate2023: 1.7 },
  { code: "AR", name: "Arunachal Pradesh", col: 8, row: 2, y2021: 47, y2022: 14, y2023: 24, rate2023: 1.5 },
  { code: "GJ", name: "Gujarat", col: 0, row: 3, y2021: 1536, y2022: 1417, y2023: 1995, rate2023: 2.8 },
  { code: "MP", name: "Madhya Pradesh", col: 2, row: 3, y2021: 589, y2022: 826, y2023: 685, rate2023: 0.8 },
  { code: "UP", name: "Uttar Pradesh", col: 3, row: 3, y2021: 8829, y2022: 10117, y2023: 10794, rate2023: 4.6 },
  { code: "BR", name: "Bihar", col: 4, row: 3, y2021: 1413, y2022: 1621, y2023: 4450, rate2023: 3.5 },
  { code: "AS", name: "Assam", col: 7, row: 3, y2021: 4846, y2022: 1733, y2023: 909, rate2023: 2.5 },
  { code: "NL", name: "Nagaland", col: 8, row: 3, y2021: 8, y2022: 4, y2023: 2, rate2023: 0.1 },
  { code: "MH", name: "Maharashtra", col: 1, row: 4, y2021: 5562, y2022: 8249, y2023: 8103, rate2023: 6.4 },
  { code: "CG", name: "Chhattisgarh", col: 3, row: 4, y2021: 352, y2022: 439, y2023: 473, rate2023: 1.6 },
  { code: "JH", name: "Jharkhand", col: 4, row: 4, y2021: 953, y2022: 967, y2023: 1079, rate2023: 2.7 },
  { code: "WB", name: "West Bengal", col: 5, row: 4, y2021: 513, y2022: 401, y2023: 309, rate2023: 0.3 },
  { code: "ML", name: "Meghalaya", col: 7, row: 4, y2021: 107, y2022: 75, y2023: 64, rate2023: 1.9 },
  { code: "MN", name: "Manipur", col: 8, row: 4, y2021: 67, y2022: 18, y2023: 3, rate2023: 0.1 },
  { code: "GA", name: "Goa", col: 0, row: 5, y2021: 36, y2022: 90, y2023: 86, rate2023: 5.5 },
  { code: "TG", name: "Telangana", col: 2, row: 5, y2021: 10303, y2022: 15297, y2023: 18236, rate2023: 47.8 },
  { code: "OD", name: "Odisha", col: 4, row: 5, y2021: 2037, y2022: 1983, y2023: 2348, rate2023: 5.1 },
  { code: "TR", name: "Tripura", col: 7, row: 5, y2021: 24, y2022: 30, y2023: 36, rate2023: 0.9 },
  { code: "MZ", name: "Mizoram", col: 8, row: 5, y2021: 30, y2022: 1, y2023: 31, rate2023: 2.5 },
  { code: "KA", name: "Karnataka", col: 1, row: 6, y2021: 8136, y2022: 12556, y2023: 21889, rate2023: 32.3 },
  { code: "AP", name: "Andhra Pradesh", col: 2, row: 6, y2021: 1875, y2022: 2341, y2023: 2341, rate2023: 4.4 },
  { code: "KL", name: "Kerala", col: 1, row: 7, y2021: 626, y2022: 773, y2023: 3295, rate2023: 9.2 },
  { code: "TN", name: "Tamil Nadu", col: 2, row: 7, y2021: 1076, y2022: 2082, y2023: 4121, rate2023: 5.4 },
  { code: "PY", name: "Puducherry", col: 3, row: 7, y2021: 0, y2022: 64, y2023: 147, rate2023: 8.9 },
];

/** Year-on-year growth 2022 → 2023, as a fraction. */
export function growth(s: StateRow) {
  if (s.y2022 === 0) return s.y2023 > 0 ? 1 : 0;
  return (s.y2023 - s.y2022) / s.y2022;
}

/** ScamShield projection for 2024: 2023 cases × damped recent growth (clamped −15%…+40%). */
export function estimate2024(s: StateRow) {
  const g = Math.max(-0.15, Math.min(0.4, growth(s) * 0.6));
  return Math.round(s.y2023 * (1 + g));
}

/** National cyber crime cases registered (NCRB) plus labelled estimates. */
export const NATIONAL_TIMELINE: { year: string; reported?: number; estimated?: number }[] = [
  { year: "2018", reported: 27248 },
  { year: "2019", reported: 44735 },
  { year: "2020", reported: 50035 },
  { year: "2021", reported: 52974 },
  { year: "2022", reported: 65893 },
  { year: "2023", reported: 86420, estimated: 86420 },
  { year: "2024", estimated: 108000 },
  { year: "2025", estimated: 133000 },
];

/** NCRB 2023 — cyber crime cases by motive (reported). */
export const MOTIVES_2023 = [
  { name: "Fraud", value: 59526, color: "var(--chart-1)" },
  { name: "Sexual exploitation", value: 4199, color: "var(--chart-5)" },
  { name: "Extortion", value: 3326, color: "var(--chart-3)" },
  { name: "Other motives", value: 19369, color: "var(--chart-2)" },
];

/** Estimated share of scam types in messages people bring to ScamShield (model estimate). */
export const SCAM_TYPE_ESTIMATE = [
  { name: "UPI / payment traps", value: 34, color: "var(--chart-1)" },
  { name: "Fake KYC / bank", value: 22, color: "var(--chart-2)" },
  { name: "Task & job scams", value: 18, color: "var(--chart-4)" },
  { name: "Digital arrest", value: 14, color: "var(--chart-3)" },
  { name: "Other", value: 12, color: "var(--chart-5)" },
];

export const TRENDING_SCAMS = [
  { emoji: "⚡", title: "Electricity Bill Disconnect", desc: "Power cut tonight at 9:30 PM — call the 'officer' and install a remote app.", level: "Very active" },
  { emoji: "💌", title: "APK Wedding Invite", desc: "WhatsApp 'wedding card' .apk silently steals SMS OTPs.", level: "Very active" },
  { emoji: "📵", title: "TRAI SIM Block", desc: "Your SIM will be blocked in 2 hours, then transfers to fake police.", level: "Very active" },
  { emoji: "🚔", title: "Digital Arrest", desc: "Fake CBI officers keep victims on video call demanding money.", level: "Very active" },
  { emoji: "📈", title: "Stock Market Groups", desc: "Fake SEBI advisors push trading apps with guaranteed returns.", level: "Rising" },
  { emoji: "🚦", title: "Fake Traffic Challan", desc: "SMS link to pay an e-challan on a lookalike site.", level: "Rising" },
] as const;

export const NATIONAL_TOTAL_2023 = 86420;
export const NATIONAL_TOTAL_2022 = 65893;

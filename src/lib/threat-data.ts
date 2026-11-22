/**
 * Reported figures: NCRB "Crime in India 2024", Table 9A.1 — Cyber Crimes (State/UT-wise) 2022–2024
 * (2021 from the 2023 edition). Estimated figures (2025, 2026) are ScamShield projections and are
 * always labelled as such in the UI.
 */
export const NCRB_SOURCE = {
  name: "NCRB — Crime in India 2024, Table 9A.1",
  url: "https://www.ncrb.mha.gov.in/uploads/files/2CrimeinIndia2024-VolumeII.pdf",
  lastUpdated: "2026-05-06",
};

/** Latest year with official NCRB data. */
export const LATEST_REPORTED_YEAR = 2024;
export const ESTIMATE_YEARS = [2025, 2026] as const;
export type EstimateYear = (typeof ESTIMATE_YEARS)[number];

export interface StateRow {
  code: string;
  name: string;
  /** Tile-map position (column, row) — approximate geography. */
  col: number;
  row: number;
  y2021: number;
  y2022: number;
  y2023: number;
  y2024: number;
  /** Crime rate per lakh population. */
  rate2023: number;
  rate2024: number;
}

export const STATES: StateRow[] = [
  { code: "JK", name: "Jammu & Kashmir", col: 2, row: 0, y2021: 154, y2022: 173, y2023: 185, y2024: 114, rate2023: 1.4, rate2024: 0.8 },
  { code: "LA", name: "Ladakh", col: 3, row: 0, y2021: 5, y2022: 3, y2023: 1, y2024: 1, rate2023: 0.3, rate2024: 0.3 },
  { code: "PB", name: "Punjab", col: 2, row: 1, y2021: 551, y2022: 697, y2023: 511, y2024: 888, rate2023: 1.7, rate2024: 2.9 },
  { code: "HP", name: "Himachal Pradesh", col: 3, row: 1, y2021: 70, y2022: 77, y2023: 127, y2024: 148, rate2023: 1.7, rate2024: 2.0 },
  { code: "RJ", name: "Rajasthan", col: 1, row: 2, y2021: 1504, y2022: 1833, y2023: 2435, y2024: 1527, rate2023: 3.0, rate2024: 1.9 },
  { code: "HR", name: "Haryana", col: 2, row: 2, y2021: 622, y2022: 681, y2023: 751, y2024: 1815, rate2023: 2.5, rate2024: 5.9 },
  { code: "DL", name: "Delhi", col: 3, row: 2, y2021: 356, y2022: 685, y2023: 407, y2024: 404, rate2023: 1.9, rate2024: 1.8 },
  { code: "UK", name: "Uttarakhand", col: 4, row: 2, y2021: 718, y2022: 559, y2023: 494, y2024: 543, rate2023: 4.2, rate2024: 4.6 },
  { code: "SK", name: "Sikkim", col: 6, row: 2, y2021: 0, y2022: 26, y2023: 12, y2024: 15, rate2023: 1.7, rate2024: 2.2 },
  { code: "AR", name: "Arunachal Pradesh", col: 8, row: 2, y2021: 47, y2022: 14, y2023: 24, y2024: 78, rate2023: 1.5, rate2024: 4.9 },
  { code: "GJ", name: "Gujarat", col: 0, row: 3, y2021: 1536, y2022: 1417, y2023: 1995, y2024: 1592, rate2023: 2.8, rate2024: 2.2 },
  { code: "MP", name: "Madhya Pradesh", col: 2, row: 3, y2021: 589, y2022: 826, y2023: 685, y2024: 1081, rate2023: 0.8, rate2024: 1.2 },
  { code: "UP", name: "Uttar Pradesh", col: 3, row: 3, y2021: 8829, y2022: 10117, y2023: 10794, y2024: 11073, rate2023: 4.6, rate2024: 4.6 },
  { code: "BR", name: "Bihar", col: 4, row: 3, y2021: 1413, y2022: 1621, y2023: 4450, y2024: 6380, rate2023: 3.5, rate2024: 4.9 },
  { code: "AS", name: "Assam", col: 7, row: 3, y2021: 4846, y2022: 1733, y2023: 909, y2024: 408, rate2023: 2.5, rate2024: 1.1 },
  { code: "NL", name: "Nagaland", col: 8, row: 3, y2021: 8, y2022: 4, y2023: 2, y2024: 14, rate2023: 0.1, rate2024: 0.6 },
  { code: "MH", name: "Maharashtra", col: 1, row: 4, y2021: 5562, y2022: 8249, y2023: 8103, y2024: 9922, rate2023: 6.4, rate2024: 7.8 },
  { code: "CG", name: "Chhattisgarh", col: 3, row: 4, y2021: 352, y2022: 439, y2023: 473, y2024: 660, rate2023: 1.6, rate2024: 2.2 },
  { code: "JH", name: "Jharkhand", col: 4, row: 4, y2021: 953, y2022: 967, y2023: 1079, y2024: 1423, rate2023: 2.7, rate2024: 3.5 },
  { code: "WB", name: "West Bengal", col: 5, row: 4, y2021: 513, y2022: 401, y2023: 309, y2024: 282, rate2023: 0.3, rate2024: 0.3 },
  { code: "ML", name: "Meghalaya", col: 7, row: 4, y2021: 107, y2022: 75, y2023: 64, y2024: 97, rate2023: 1.9, rate2024: 2.9 },
  { code: "MN", name: "Manipur", col: 8, row: 4, y2021: 67, y2022: 18, y2023: 3, y2024: 5, rate2023: 0.1, rate2024: 0.2 },
  { code: "GA", name: "Goa", col: 0, row: 5, y2021: 36, y2022: 90, y2023: 86, y2024: 77, rate2023: 5.5, rate2024: 4.9 },
  { code: "TG", name: "Telangana", col: 2, row: 5, y2021: 10303, y2022: 15297, y2023: 18236, y2024: 27230, rate2023: 47.8, rate2024: 71.1 },
  { code: "OD", name: "Odisha", col: 4, row: 5, y2021: 2037, y2022: 1983, y2023: 2348, y2024: 2501, rate2023: 5.1, rate2024: 5.4 },
  { code: "TR", name: "Tripura", col: 7, row: 5, y2021: 24, y2022: 30, y2023: 36, y2024: 33, rate2023: 0.9, rate2024: 0.8 },
  { code: "MZ", name: "Mizoram", col: 8, row: 5, y2021: 30, y2022: 1, y2023: 31, y2024: 50, rate2023: 2.5, rate2024: 4.0 },
  { code: "KA", name: "Karnataka", col: 1, row: 6, y2021: 8136, y2022: 12556, y2023: 21889, y2024: 21993, rate2023: 32.3, rate2024: 32.2 },
  { code: "AP", name: "Andhra Pradesh", col: 2, row: 6, y2021: 1875, y2022: 2341, y2023: 2341, y2024: 2528, rate2023: 4.4, rate2024: 4.7 },
  { code: "KL", name: "Kerala", col: 1, row: 7, y2021: 626, y2022: 773, y2023: 3295, y2024: 2962, rate2023: 9.2, rate2024: 8.2 },
  { code: "TN", name: "Tamil Nadu", col: 2, row: 7, y2021: 1076, y2022: 2082, y2023: 4121, y2024: 5793, rate2023: 5.4, rate2024: 7.5 },
  { code: "PY", name: "Puducherry", col: 3, row: 7, y2021: 0, y2022: 64, y2023: 147, y2024: 142, rate2023: 8.9, rate2024: 8.4 },
];

/** Year-on-year growth 2023 → 2024, as a fraction. */
export function growth(s: StateRow) {
  if (s.y2023 === 0) return s.y2024 > 0 ? 1 : 0;
  return (s.y2024 - s.y2023) / s.y2023;
}

/** Yearly growth the projection uses: 60% of the latest growth, capped between −15% and +40%. */
export function projectedGrowth(s: StateRow) {
  return Math.max(-0.15, Math.min(0.4, growth(s) * 0.6));
}

/** ScamShield projection: 2024 cases compounded by the damped growth rate for each year after 2024. */
export function estimateCases(s: StateRow, year: EstimateYear) {
  return Math.round(s.y2024 * (1 + projectedGrowth(s)) ** (year - LATEST_REPORTED_YEAR));
}

export const NATIONAL_TOTAL_2022 = 65893;
export const NATIONAL_TOTAL_2023 = 86420;
export const NATIONAL_TOTAL_2024 = 101928;

/** Cases from UTs not drawn on the tile map (A&N, Chandigarh, DNH & DD, Lakshadweep), held flat in projections. */
const UNMAPPED_2024 = NATIONAL_TOTAL_2024 - STATES.reduce((sum, s) => sum + s.y2024, 0);

/** National projection = sum of every state's projection, so the map and the chart always agree. */
export function nationalEstimate(year: EstimateYear) {
  const total = STATES.reduce((sum, s) => sum + estimateCases(s, year), 0) + UNMAPPED_2024;
  return Math.round(total / 100) * 100;
}

/** National cyber crime cases registered (NCRB) plus labelled estimates. */
export const NATIONAL_TIMELINE: { year: string; reported?: number; estimated?: number }[] = [
  { year: "2018", reported: 27248 },
  { year: "2019", reported: 44735 },
  { year: "2020", reported: 50035 },
  { year: "2021", reported: 52974 },
  { year: "2022", reported: NATIONAL_TOTAL_2022 },
  { year: "2023", reported: NATIONAL_TOTAL_2023 },
  { year: "2024", reported: NATIONAL_TOTAL_2024, estimated: NATIONAL_TOTAL_2024 },
  { year: "2025", estimated: nationalEstimate(2025) },
  { year: "2026", estimated: nationalEstimate(2026) },
];

/** NCRB 2024 — cyber crime cases by motive (Table 9A.3, reported). */
export const MOTIVES_2024 = [
  { key: "motive.fraud", value: 73987, color: "var(--chart-1)" },
  { key: "motive.sexual", value: 3190, color: "var(--chart-5)" },
  { key: "motive.extortion", value: 2536, color: "var(--chart-3)" },
  { key: "motive.other", value: 22215, color: "var(--chart-2)" },
] as const;

/** Estimated share of scam types in messages people bring to ScamShield (model estimate). */
export const SCAM_TYPE_ESTIMATE = [
  { key: "type.upi", value: 34, color: "var(--chart-1)" },
  { key: "type.kyc", value: 22, color: "var(--chart-2)" },
  { key: "type.task", value: 18, color: "var(--chart-4)" },
  { key: "type.arrest", value: 14, color: "var(--chart-3)" },
  { key: "type.other", value: 12, color: "var(--chart-5)" },
] as const;

export const TRENDING_SCAMS = [
  { key: "trend.1", level: "veryActive" },
  { key: "trend.2", level: "veryActive" },
  { key: "trend.3", level: "veryActive" },
  { key: "trend.4", level: "veryActive" },
  { key: "trend.5", level: "rising" },
  { key: "trend.6", level: "rising" },
] as const;

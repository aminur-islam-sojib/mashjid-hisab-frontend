// ---------------------------------------------------------------------------
// Mashjid Hisab — Financial Math and Currency Utilities
//
// Invariant: Backend stores ALL monetary amounts as integers in minor units
// (poisha: 1 BDT = 100 poisha). BigInt values are serialized as numeric strings.
// Floating-point math is strictly avoided to prevent rounding errors.
// ---------------------------------------------------------------------------

/**
 * Converts integer poisha (string, number, or bigint) into a decimal string "100.50".
 */
export function poishaToMajor(poisha: string | number | bigint): string {
  try {
    const raw = typeof poisha === "bigint" ? poisha : BigInt(String(poisha).trim() || "0");
    const isNegative = raw < BigInt(0);
    const abs = isNegative ? -raw : raw;
    const major = abs / BigInt(100);
    const minor = abs % BigInt(100);
    const minorStr = minor < BigInt(10) ? `0${minor}` : `${minor}`;
    return `${isNegative ? "-" : ""}${major}.${minorStr}`;
  } catch {
    return "0.00";
  }
}

/**
 * Converts a user major unit input string (e.g. "100.50" or "500") into exact
 * integer minor units (poisha) string (e.g. "10050" or "50000").
 * Avoids JavaScript floating-point multiplication (val * 100).
 */
export function majorToPoisha(majorStr: string): string {
  const clean = majorStr.trim().replace(/,/g, "");
  if (!clean || clean === ".") return "0";

  const isNegative = clean.startsWith("-");
  const unsigned = isNegative ? clean.slice(1) : clean;

  const parts = unsigned.split(".");
  const integerPart = parts[0]?.replace(/\D/g, "") || "0";
  let fractionPart = parts[1]?.replace(/\D/g, "") || "";

  if (fractionPart.length > 2) {
    fractionPart = fractionPart.slice(0, 2);
  } else if (fractionPart.length === 1) {
    fractionPart += "0";
  } else if (fractionPart.length === 0) {
    fractionPart = "00";
  }

  const combined = BigInt(integerPart) * BigInt(100) + BigInt(fractionPart);
  return (isNegative ? -combined : combined).toString();
}

/**
 * Formats integer poisha into a localized currency string, defaulting to Bangladeshi Taka (৳).
 */
export function formatCurrency(
  poisha: string | number | bigint | null | undefined,
  options?: {
    symbol?: string;
    showDecimals?: boolean;
  }
): string {
  if (poisha === null || poisha === undefined) return "৳0.00";

  const { symbol = "৳", showDecimals = true } = options ?? {};
  try {
    const raw = typeof poisha === "bigint" ? poisha : BigInt(String(poisha).trim() || "0");
    const isNegative = raw < BigInt(0);
    const abs = isNegative ? -raw : raw;
    const major = abs / BigInt(100);
    const minor = abs % BigInt(100);

    const formattedMajor = major.toLocaleString("en-US");

    if (!showDecimals && minor === BigInt(0)) {
      return `${isNegative ? "-" : ""}${symbol}${formattedMajor}`;
    }

    const minorStr = minor < BigInt(10) ? `0${minor}` : `${minor}`;
    return `${isNegative ? "-" : ""}${symbol}${formattedMajor}.${minorStr}`;
  } catch {
    return `${symbol}0.00`;
  }
}

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

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function convertLessThanThousand(n: bigint): string {
  if (n === BigInt(0)) return "";
  let result = "";
  if (n >= BigInt(100)) {
    result += ONES[Number(n / BigInt(100))] + " Hundred";
    n = n % BigInt(100);
    if (n > BigInt(0)) result += " ";
  }
  if (n >= BigInt(20)) {
    result += TENS[Number(n / BigInt(10))];
    if (n % BigInt(10) > BigInt(0)) {
      result += "-" + ONES[Number(n % BigInt(10))];
    }
  } else if (n > BigInt(0)) {
    result += ONES[Number(n)];
  }
  return result;
}

function numberToWordsSouthAsian(num: bigint): string {
  if (num === BigInt(0)) return "Zero";

  let n = num < BigInt(0) ? -num : num;
  let words = "";

  const crore = n / BigInt(10000000);
  n = n % BigInt(10000000);

  const lakh = n / BigInt(100000);
  n = n % BigInt(100000);

  const thousand = n / BigInt(1000);
  n = n % BigInt(1000);

  const remainder = n;

  if (crore > BigInt(0)) {
    words += (crore >= BigInt(100) ? numberToWordsSouthAsian(crore) : convertLessThanThousand(crore)) + " Crore ";
  }

  if (lakh > BigInt(0)) {
    words += convertLessThanThousand(lakh) + " Lakh ";
  }

  if (thousand > BigInt(0)) {
    words += convertLessThanThousand(thousand) + " Thousand ";
  }

  if (remainder > BigInt(0)) {
    words += convertLessThanThousand(remainder);
  }

  return words.trim();
}

/**
 * Converts integer poisha (string, number, or bigint) into words in Taka & Poisha
 * using standard Bangladeshi / South Asian financial denomination convention.
 * Example: 75050 -> "Seven Hundred Fifty Taka and Fifty Poisha Only"
 */
export function poishaToWords(poisha: string | number | bigint | null | undefined): string {
  if (poisha === null || poisha === undefined) return "Zero Taka Only";
  try {
    const raw = typeof poisha === "bigint" ? poisha : BigInt(String(poisha).trim() || "0");
    const isNegative = raw < BigInt(0);
    const abs = isNegative ? -raw : raw;
    const major = abs / BigInt(100);
    const minor = abs % BigInt(100);

    const majorWords = numberToWordsSouthAsian(major);
    const prefix = isNegative ? "Negative " : "";

    if (major === BigInt(0) && minor === BigInt(0)) {
      return "Zero Taka Only";
    }

    if (minor === BigInt(0)) {
      return `${prefix}${majorWords} Taka Only`;
    }

    const minorWords = convertLessThanThousand(minor);
    if (major === BigInt(0)) {
      return `${prefix}${minorWords} Poisha Only`;
    }

    return `${prefix}${majorWords} Taka and ${minorWords} Poisha Only`;
  } catch {
    return "Zero Taka Only";
  }
}


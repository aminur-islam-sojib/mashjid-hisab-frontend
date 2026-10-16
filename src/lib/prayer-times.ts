import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from "adhan";

export interface ComputedPrayerTime {
  name: string;
  key: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  time: string; // e.g. "4:41 AM"
  date: Date;
  status: "passed" | "now" | "upcoming";
}

export interface PrayerScheduleResult {
  prayers: ComputedPrayerTime[];
  currentPrayer: string;
  nextPrayer: string;
  locationName: string;
}

export const DEFAULT_BANGLADESH_COORDS = {
  latitude: 23.8103,
  longitude: 90.4125,
  name: "Dhaka, Bangladesh",
};

/**
 * Calculates high-precision Islamic prayer times using University of Islamic Sciences,
 * Karachi calculation method and Hanafi juristic method (standard for Bangladesh & South Asia).
 */
export function getDailyPrayerTimes(
  date: Date = new Date(),
  coords: { latitude: number; longitude: number; name?: string } = DEFAULT_BANGLADESH_COORDS
): PrayerScheduleResult {
  const coordinates = new Coordinates(coords.latitude, coords.longitude);
  const params = CalculationMethod.Karachi();
  params.madhab = Madhab.Hanafi;

  const pt = new PrayerTimes(coordinates, date, params);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const schedule: { name: string; key: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"; date: Date }[] = [
    { name: "Fajr", key: "fajr", date: pt.fajr },
    { name: "Dhuhr", key: "dhuhr", date: pt.dhuhr },
    { name: "Asr", key: "asr", date: pt.asr },
    { name: "Maghrib", key: "maghrib", date: pt.maghrib },
    { name: "Isha", key: "isha", date: pt.isha },
  ];

  const nowMs = date.getTime();

  // Find active prayer window:
  // Active window is the most recent prayer whose start time has passed.
  let activeIdx = -1;
  for (let i = schedule.length - 1; i >= 0; i--) {
    if (nowMs >= schedule[i].date.getTime()) {
      activeIdx = i;
      break;
    }
  }

  // If current time is before today's Fajr, the active window is Isha (from previous night)
  if (activeIdx === -1) {
    activeIdx = 4;
  }

  const prayers: ComputedPrayerTime[] = schedule.map((p, idx) => {
    let status: "passed" | "now" | "upcoming" = "upcoming";
    if (idx === activeIdx) {
      status = "now";
    } else if (idx < activeIdx) {
      status = "passed";
    }
    return {
      name: p.name,
      key: p.key,
      time: formatTime(p.date),
      date: p.date,
      status,
    };
  });

  return {
    prayers,
    currentPrayer: schedule[activeIdx].name,
    nextPrayer: activeIdx < 4 ? schedule[activeIdx + 1].name : schedule[0].name,
    locationName: coords.name || "Dhaka, Bangladesh",
  };
}


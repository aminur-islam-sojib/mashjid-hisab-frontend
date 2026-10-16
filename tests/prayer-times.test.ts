import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getDailyPrayerTimes, DEFAULT_BANGLADESH_COORDS } from "../src/lib/prayer-times";

describe("Dynamic Islamic Prayer Times Calculation Suite", () => {
  it("calculates all 5 daily prayers in chronological order for Bangladesh", () => {
    const testDate = new Date("2026-10-16T12:00:00.000Z");
    const result = getDailyPrayerTimes(testDate, DEFAULT_BANGLADESH_COORDS);

    assert.equal(result.prayers.length, 5);
    const names = result.prayers.map((p) => p.name);
    assert.deepEqual(names, ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]);

    // Verify time format (e.g. "4:41 AM", "11:45 AM")
    const timeRegex = /^\d{1,2}:\d{2}\s+(AM|PM)$/;
    for (const p of result.prayers) {
      assert.match(p.time, timeRegex, `Prayer time '${p.time}' must match format h:mm A`);
      assert.ok(p.date instanceof Date, "Date must be an instance of Date");
    }

    // Chronological ordering check
    for (let i = 0; i < result.prayers.length - 1; i++) {
      assert.ok(
        result.prayers[i].date.getTime() < result.prayers[i + 1].date.getTime(),
        `${result.prayers[i].name} must be earlier than ${result.prayers[i + 1].name}`
      );
    }
  });

  it("determines exactly one active prayer window at any given moment", () => {
    // Test midday (Dhuhr active)
    const midday = new Date("2026-10-16T07:00:00.000Z"); // 1:00 PM Dhaka time (+6)
    const resultMidday = getDailyPrayerTimes(midday, DEFAULT_BANGLADESH_COORDS);

    const nowPrayers = resultMidday.prayers.filter((p) => p.status === "now");
    assert.equal(nowPrayers.length, 1, "Exactly one prayer must be 'now'");
    assert.equal(resultMidday.currentPrayer, nowPrayers[0].name);

    // Test early morning before Fajr (Isha active from previous night)
    const midnight = new Date("2026-10-15T19:00:00.000Z"); // 1:00 AM Dhaka time (+6)
    const resultMidnight = getDailyPrayerTimes(midnight, DEFAULT_BANGLADESH_COORDS);
    const activeMidnight = resultMidnight.prayers.filter((p) => p.status === "now");
    assert.equal(activeMidnight.length, 1);
    assert.equal(activeMidnight[0].name, "Isha");
  });
});


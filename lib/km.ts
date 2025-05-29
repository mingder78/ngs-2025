// src/lib/km.ts
interface SurvivalData {
  time: number;
  status: number; // 1 = event, 0 = censored
  group: string; // "Amplified" or "Non-Amplified"
}

interface KMPoint {
  time: number;
  survival: number;
  censored: boolean;
}

export function calculateKM(data: SurvivalData[], groupName: string): KMPoint[] {
  // Filter and sort data by time for the specified group
  const groupData = data
    .filter((d) => d.group === groupName)
    .sort((a, b) => a.time - b.time);

  let survival = 1;
  let atRisk = groupData.length;
  const kmData: KMPoint[] = [{ time: 0, survival: 1, censored: false }];

  // Get unique time points
  const times = [...new Set(groupData.map((d) => d.time))].sort((a, b) => a - b);

  for (const t of times) {
    // Count events (status = 1) and total observations at this time
    const eventsAtT = groupData.filter((d) => d.time === t && d.status === 1).length;
    const totalAtT = groupData.filter((d) => d.time === t).length;

    // Update number at risk (individuals with time >= t)
    atRisk = groupData.filter((d) => d.time >= t).length;

    // Calculate survival probability
    if (eventsAtT > 0) {
      survival *= 1 - eventsAtT / atRisk;
      kmData.push({ time: t, survival, censored: false });
    }

    // Add censoring points
    if (groupData.some((d) => d.time === t && d.status === 0)) {
      kmData.push({ time: t, survival, censored: true });
    }
  }

  return kmData;
}

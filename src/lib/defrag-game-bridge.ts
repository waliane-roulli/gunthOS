"use client";

/** Event-based bridge between the Defrag app and the taskkill game.
 *  When the user clicks "Defragmenter" in My Computer:
 *    1. My Computer opens the taskkill (dragmenteur.exe) window
 *    2. The game fires `taskkill:win` or `taskkill:lose` CustomEvents on `window`
 *    3. The Defrag app listens for these events and updates its state
 *
 *  Constants for event names to avoid typos.
 */

export const TASKKILL_WIN_EVENT = "taskkill:win";
export const TASKKILL_LOSE_EVENT = "taskkill:lose";

export interface TaskkillResult {
  score: number;
  won: boolean;
  timestamp: string;
}

/** Post game result to the API for profile stats tracking */
export async function submitDefragResult(result: TaskkillResult): Promise<void> {
  try {
    await fetch("/api/profile/defrag-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
  } catch {
    // Silently fail — the game result is the priority
  }
}

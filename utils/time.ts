/**
 * Formats duration in seconds to a human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    // Over 1 hour: Xh Ym Zs
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    // Under 1 hour: Ym Zs
    return `${minutes}m ${secs}s`;
  } else {
    // Under 1 minute: Zs
    return `${secs}s`;
  }
}
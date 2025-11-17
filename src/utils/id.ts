/**
 * Generates a unique ID using crypto.randomUUID() if available,
 * otherwise falls back to a timestamp-based ID with random suffix.
 */
export function generateId(): string {
  // Use crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: timestamp + random number to reduce collision risk
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}



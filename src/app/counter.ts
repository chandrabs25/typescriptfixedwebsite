// Path: .\src\app\counter.ts
'use server'

// --- FIX: Import getDatabase ---
import { getDatabase } from '@/lib/database'
// --- End of FIX ---

// --- Removed unused import ---
// import { headers } from 'next/headers';

// Define type for visit count result
interface VisitCount {
    count: number;
}

// Example function assuming you want to increment a counter in D1
// Create a table named 'visits' with columns: path (TEXT PRIMARY KEY), count (INTEGER), last_visited_at (DATETIME)
export async function incrementVisitCount(path: string = '/') {
  try {
    // --- FIX: Get database instance ---
    const db = getDatabase();
    // --- End of FIX ---

    // Increment a counter in a 'visits' table
    const result = await db.prepare(
        `INSERT INTO visits (path, count, last_visited_at) VALUES (?, 1, CURRENT_TIMESTAMP)
         ON CONFLICT(path) DO UPDATE SET count = count + 1, last_visited_at = CURRENT_TIMESTAMP`
      )
      .bind(path) // Use the provided path
      .run();

    // --- FIX: Check D1 result ---
    if (!result.success) {
        console.error('Error updating visit count in D1:', result);
        return { success: false, error: 'Database operation failed' };
    }
    // --- End of FIX ---

    console.log(`Visit count updated for path: ${path}`);

    // Example: Fetch the new count (optional)
    const countResult = await db.prepare(
        `SELECT count FROM visits WHERE path = ?`
      )
      .bind(path)
      .first<VisitCount>(); // Use the defined type

    return { success: true, count: countResult?.count ?? 0 };

  } catch (error) {
    console.error('Error incrementing visit count:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to update visit count: ${errorMessage}` };
  }
}

// Example function to get the count
export async function getVisitCount(path: string = '/') {
    try {
        // --- FIX: Get database instance ---
        const db = getDatabase();
        // --- End of FIX ---

        const countResult = await db.prepare(
            `SELECT count FROM visits WHERE path = ?`
          )
          .bind(path) // Use the provided path
          .first<VisitCount>(); // Use the defined type

        return { success: true, count: countResult?.count ?? 0 };
    } catch (error) {
        console.error('Error getting visit count:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, count: 0, error: `Failed to get visit count: ${errorMessage}` };
    }
}
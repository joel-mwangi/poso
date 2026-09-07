import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || null,
        role: 'owner', // Default initial sign-in to owner
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed in getOrCreateUser:', error);
    // Sanitize error
    throw new Error('Database user sync failed', { cause: error });
  }
}

export async function getUserProfile(uid: string) {
  try {
    const records = await db.select().from(users).where(eq(users.uid, uid));
    return records[0] || null;
  } catch (error) {
    console.error('Failed in getUserProfile:', error);
    throw new Error('Failed to retrieve user profile', { cause: error });
  }
}

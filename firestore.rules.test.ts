/**
 * Security Rules Verification Matrix (Dirty Dozen Attack Scenarios)
 * Documents required ALLOW and DENY test vectors against firestore.rules.
 */
export const FIRESTORE_SECURITY_TEST_CASES = [
  { name: 'Unauthenticated read of /users/{uid}', expected: 'DENY' },
  { name: 'Cross-user read of /users/otherUid', expected: 'DENY' },
  { name: 'Non-admin list of /users collection', expected: 'DENY' },
  { name: 'Self-privilege escalation creating /users/{uid} with role="admin"', expected: 'DENY' },
  { name: 'Role mutation updating /users/{uid} from customer to admin', expected: 'DENY' },
  { name: 'Mass-assignment extra field injection on /users/{uid}', expected: 'DENY' },
  { name: 'Oversized string DoS (>200 chars displayName) on /users/{uid}', expected: 'DENY' },
  { name: 'UID spoofing (uid != userId) on /users/{uid}', expected: 'DENY' },
  { name: 'Immutable createdAt tampering on /users/{uid} update', expected: 'DENY' },
  { name: 'Cross-user write to /users/otherUid/watchlist/{channelId}', expected: 'DENY' },
  { name: 'Write to unmapped collection /arbitrary/doc', expected: 'DENY' },
  { name: 'Authenticated owner create & read of valid /users/{uid} (role="customer")', expected: 'ALLOW' },
  { name: 'Authenticated owner create, list & delete of /users/{uid}/watchlist/{channelId}', expected: 'ALLOW' },
] as const;

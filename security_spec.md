# Playbeat Digital Firestore Security Specification

## Collections & Access Rules
1. `users/{userId}`
   - **PII Protection**: Contains private customer email and phone number. Public reads and listing by non-admins are strictly forbidden.
   - **Read (`get`)**: Allowed ONLY for `isOwner(userId)` or `isAdmin()`.
   - **List**: Allowed ONLY for `isAdmin()`.
   - **Create**: Allowed for `isOwner(userId)` with `role == 'customer'`, OR `isAdmin()`. Strictly validates field allowlist (`hasOnly`), types, string lengths, and immutable `uid == userId`.
   - **Update**: Allowed for `isOwner(userId)` ONLY if `role`, `uid`, and `createdAt` remain unchanged (no self-privilege escalation), OR `isAdmin()`.
   - **Delete**: Allowed ONLY for `isAdmin()`.

2. `users/{userId}/watchlist/{channelId}`
   - **Read / Write (`get`, `list`, `create`, `update`, `delete`)**: Allowed ONLY for `isOwner(userId)` or `isAdmin()`.
   - **Validation**: `channelId == request.resource.data.channelId`, strict field allowlist, bounded string lengths.

3. **Default Admin Bootstrap**
   - `request.auth.token.email == "uzzirulzz@gmail.com" && request.auth.token.email_verified == true`
   - Or existing `users/{request.auth.uid}` document with `data.role == 'admin'`.

4. **Default Deny Catch-All**
   - `match /{document=**} { allow read, write: if false; }`

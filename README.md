# IDEA JAM

Meeting idea board for collecting student activity, growth, and engagement suggestions.

## Current behavior

- Brutalist responsive landing page with the meeting agenda built in.
- Google Identity Services button using the provided OAuth client ID.
- The submit button stays disabled until Google sign-in returns the user's name, email, and photo.
- `/api/submissions` stores shared submissions in the Firebase Realtime Database path `ideaJams` and the admin panel exports them as CSV.
- The admin account is `rutujdhodapkar@gmail.com`.

## Google setup

In Google Cloud Console, add the deployed Vercel origin to the OAuth client's Authorized JavaScript origins. The OAuth client ID is in `app.js`; never put the OAuth client secret in frontend code or Git.

The Vercel project uses `FIREBASE_DATABASE_URL=https://laptop-privacy-default-rtdb.firebaseio.com` for the shared submission store.

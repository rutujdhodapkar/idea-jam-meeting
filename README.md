# IDEA JAM

Meeting idea board for collecting student activity, growth, and engagement suggestions.

## Current behavior

- Brutalist responsive landing page with the meeting agenda built in.
- Google Identity Services sign-in hook using the provided OAuth client ID.
- Submissions show the signed-in user's name, photo/initials, and relative time.
- Admin panel recognizes `rutujdhodapkar@gmail.ccom` and exports submissions as CSV.
- This static build stores new submissions in the browser's local storage. For shared cross-device submissions, connect the same UI to a database/API before using it as a production meeting system.

## Google setup

In Google Cloud Console, add the deployed Vercel origin to the OAuth client's Authorized JavaScript origins. The OAuth client ID is in `app.js`; never put the OAuth client secret in frontend code or Git.

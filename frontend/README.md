# Speech System // Frontend
Vite/React based frontend for the speech system.


To run it just do `npm run dev` in the frontend folder. Might need to install stuff first though.


## Page Reworks (high level, still components missing on some):
```diff
Pages
-  * Analysis
+  * Chat
+  * ChatDetails
+  * Dashboard ("Speech Analysis" Page)
+  * Login
-  * ProgressSummary (robot, prog bar, info, games)
-  * Schedule
-  * Signup

```

<br>


### ToDo:

<details closed> <summary> <b>To Do</b> </summary>

* Remove/disable links to pages that don't work

Differentiation between patient and caregiver profiles
* Add a bootstrap "theme" to switch things from blue or purple
* Header when signed in as a patient
* Modals
    - Goal/UserSettings modal for caregivers
    - Goal modal for patients
* Make it so that if the profile is loaded in already and we have our tokens that we cant be on the signup or login pages
    - This but also for the different page access

Database related stuff
* "sentiment" field of the ChatSession model isn't correct
* Add "auto_renew" to Goal in the database
    - means we have to do this in a few spots: `models.py, serializers.py, models.ts`
* Can I set a value for if the user is a patient inside AuthContext or whatever and then import it...?
* Tokens should go in models.ts maybe? (currently is in auth.ts)

Misc.
* Add a refresh chats utility
    - call it when leaving the Chat page to make sure the new chat is on the Dashboard
    - add a button to the dashboard to also call the refresh thing
* Add more toast stuff ?
    - "Chat saved", "chats refreshed", etc.
* Chat Page
    - Fix the stuff going on top of the buttons
    - Buttons could be a lot cleaner
* Move files
    - functions
    - components

</details>
















## Project Layout
<details closed> <summary> Project Layout </summary>

```
src/
│
├─ api/                      # Only place that ever interacts to the backend
│   ├─ index.ts              # Group imports for this whole folder
│   ├─ client.ts             # API fetch/request wrapper with token auto-refresh
│   ├─ auth.ts               # login(), refreshToken()
│   ├─ models.ts             # TypeScript interfaces mirroring DB models
│   └─ endpoints/
|       ├─ profile.ts        # Helpers for accessing each of the DB models
|       └─ ... 
│
├─ hooks/
│   ├─ useSpeechEngine.js    # Does... speech stuff
│   └─ ...
│
├─ context/
│   └─ AuthProvider.tsx      # Exposes { user, profile, login, logout } via the wrapper
│
├─ components/               # Small UI components
├─ pages/                    # Route-level pages
├─ styles/                   # Misc. styles
└─ utils/                    # Misc. helpers
```

</details>




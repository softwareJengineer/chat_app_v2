# Speech System // Frontend
Vite/React based frontend for the speech system.

To run it just do `npm run dev` in the frontend folder. Might need to install stuff first though.


## Page Reworks (high level, still components missing on some):
```diff
Pages
+  * Chat
+  * ChatDetails
+  * Dashboard ("Speech Analysis" Page)
+  * Login
-  * ProgressSummary (robot, prog bar, info, games)
+  * Schedule
+  * Signup

```

<br>
Do stuff when there are no chats 

ProgressSummary should be a page they both have, and it should be very component based, similar-ish to ChatDetails. 
I think some of the stuff from ChatDetails needs to go

So instead of 
* ProgressSummary
    - prog bar, fluff
* ChatDetails (single chat)
    - Progress bar, Radar chart, misc fluff
* Analysis (child of ChatDetails)
    - shows transcript with highlights for different biomarkers

We just have
* ProgressSummary
    - Progress bar
    - Misc fluff
* ChatDetails
    - Radar Chart
    - Analysis transcripts





### ToDo:

<details closed> <summary> <b>To Do</b> </summary>

* Theme 
    - universal color sources (change depending on patient/caregiver)
    - font size - throughout the project font size should be relative and then there should be like a global font size we can adjust


Differentiation between patient and caregiver profiles
* Add a bootstrap "theme" to switch things from blue or purple
* Header when signed in as a patient


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




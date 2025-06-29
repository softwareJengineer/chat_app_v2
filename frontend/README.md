# Speech System // Frontend
Vite/React based frontend for the speech system.


## Page Reworks (high level, still components missing on some):
```diff
  General
-  * Home
+  * Login
-  * Signup  

  Caregiver
+  * Dashboard ("Speech Analysis" Page)
+      - ChatHistory
+      - PerformanceTrack (mostly to where it was...)
-  * Settings Modal
-      - Patient UserSettings
+      - Goal

  Patient 
-  * Chat Page
+  * Goal Modal (kind of)
-  * Progress
!  * Today

  Shared
!  * Schedule / Calendar
!  * Analysis (single chat analysis, some stuff different between caregiver/patient)
+  * Goal Form
-      - add useImperativeHandle so you can actually submit
-  * CurrentGoalProgressBar component
```

<br>

### ToDo:
* Do all the color stuff/ green or purple
* Need to add role to the user model -> do this when i do the sign in page
* Goal/UserSettings Modal

* Add "auto_renew" to Goal in the database
    - means we have to do this in a few spots: `models.py, serializers.py, models.ts`

* Can I set a value for if the user is a patient inside AuthContext or whatever and then import it...?






<br>

### ToDo:
* Go back through the models.ts file and the serializers/views files to make sure everything is right
    - Add comments about the format of stuff, especially the timestamps.
* Profile model for sure, I need to decide like how goal/settings/reminder are done.
    - Maybe since goal/settings are one-to-one keep them loaded in with the profile?
    - Just not sure if the serializer is actually sending them...
* Tokens should go in models.ts maybe? (currently is in auth.ts)
* AuthProvider.tsx still needs some clearing up for a bunch of things
* Where/when does the refresh behavior from auth.ts happen?
    - Add another profile fetch after refreshes?
* Constants and styles should probably go in utils



Okay when we pass whatever stuff to the api/token
we get token, user stuff back












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




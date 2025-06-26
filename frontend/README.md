# Speech System // Frontend
Vite/React based frontend for the speech system.


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




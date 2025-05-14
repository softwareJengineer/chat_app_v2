This project aims to create a progressive web app to run a speech system oriented for dementia patients. 

Speech Model is not currently being tracked because of its size

--HOW TO RUN--
1. Ensure your machine has the requirements installed
2. Clone the repo using this terminal command: git clone https://github.com/softwareJengineer/chat_app_v2
3. Open Docker Desktop

In the backend directory (if you want to use the speech synthesis and score generation functionality, unnecessary for only viewing the app):

4. Build the docker container using this command: docker-compose up --build
5. To start the docker container simply run: docker-compose up
6. To shut down the container simply run: docker-compose down

In the frontend directory:

7. Run the command: npm run dev

8. The web app can be accessed through localhost:5173 in your browser

REQUIREMENTS
1. Node.js (the requirement for only viewing the frontend, the others are not necessary if you do not need backend functionality)
2. Docker Desktop
3. Python3
4. Java 22
5. new_LSA.csv
6. stanford-parser models file
7. Phi-3_finetuned.gguf

<hr>

To Do:

1. Getting a bunch of warnings about vulnerabilities from react-wordcloud
2. If the first utterance is shorter than our audio buffer chunk size (5 seconds), the audio based scores (prosody, pronunciation) are generated with an error.
    - Should these be done in another separate async task on reception of audio data? If no audio has been recieved between utterances, the scores will be the same anyways, so there is no reason to re-calculate them.
3. Rename deployment branch to just "depoyment"


<hr>


# Docker Containers
Three services are run in docker-compose:
1) Database (postgres)
2) Backend  (websocket server, LLM calls, biomarker logic)
3) Frontend (vite, react) 

Everything is wrapped in docker-compose.yml, and the backend/database are only accessible inside the Docker network.

## To start it up:
1. SSH into the instance

2. Manual directory creations + file uploads
    1. Create a project directory + the deployment-files directory
    2. Deployment files needs manually uploaded model files and a log output folder
    3. Upload deploy.sh

3. Run deploy.sh
    * Installs docker & updates other dependencies
    * Clones the repo
    * Copies the .env file into its proper location 
    * Copies model files from deployment-files/models/ to their respective locations in the project


# File Architecture

SSH:/home/user/project-directory/
├── V2-Benchmarking/
│   ├── backend/
│   │   ├── Dockerfile-backend   # 
│   │   ├── interface_app/       # Django app
│   │   ├── dementia_chat/       # Python backend logic
│   │   │   ├── services/
│   │   │   │   ├── <span style="color: CornflowerBlue;"> Phi-3_finetuned.gguf </span>
│   │   │   │   ├── pronunciation_rf(v4).pkl
│   │   │   │   └── prosody_rf(v1).pkl
│   │   │   │
│   │   │   ├── websocket/biomarkers/biomarker_models/
│   │   │   │   ├── stanford-parser-full-2020-11-17/<span style="color: CornflowerBlue;"> stanford-parser-4.2.0-models.jar </span>
│   │   │   │   ├── <span style="color: CornflowerBlue;"> new_LSA.csv </span>
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── ...
│   │   │
│   │   ├── requirements.txt
│   │   └── ...
│   │
│   ├── frontend/
│   │   ├── Dockerfile-frontend  # Builds and serves Vite app
│   │   ├── src/
│   │   ├── public/
│   │   └── ...
│   │
│   ├── nginx/
│   │   └── default.conf         # Reverse proxy + static serving
│   │
│   ├── <span style="color: CornflowerBlue;"> .env </span>                     # Shared .env (will not be here until moved in deploy.sh)
│   ├── docker-compose.yml
│   └── ...
│
├── deployment-files/            # All non-tracked, manually uploaded files
│   ├── <span style="color: CornflowerBlue;"> .env </span>                     # Environment variables shared throughout the project (for frontend and backend)
│   ├── models/      
│   │   ├── <span style="color: CornflowerBlue;"> new_LSA.csv </span>
│   │   ├── <span style="color: CornflowerBlue;"> stanford-parser-4.2.0-models.jar </span>
│   │   └── <span style="color: CornflowerBlue;"> Phi-3_finetuned.gguf </span>
│   │
│   ├── logs/        # For backend log output
│   └── ...          # Other non-tracked files (.env)
│
└── deploy.sh        # Script to set everything up




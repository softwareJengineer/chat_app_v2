This project aims to create a progressive web app to run a speech system oriented for dementia patients. 

Speech Model is not currently being tracked because of its size

--HOW TO RUN--
1. Ensure your machine has the requirements installed
2. Clone the repo using this terminal command: git clone https://github.com/softwareJengineer/chat_app_v2
3. Open Docker Desktop

In the backend directory:

4. Build the docker container using this command: docker-compose up --build
5. To start the docker container simply run: docker-compose up
6. To shut down the container simply run: docker-compose down

In the frontend directory:

7. Run the command: npm run dev

8. The web app can be accessed through localhost:5173 in your browser

REQUIREMENTS
1. Node.js
3. Python3
4. Java 22
5. new_LSA.csv
6. stanford-parser models file
7. Phi-3_finetuned.gguf

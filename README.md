To run you have two different options

Option 1:
  Start backend and frontend seperately from terminal by navigating to respective folders. For this option you need to have postgresql setup locally.
  Frontend:
    npm run dev
  Backend
    node server.js

Option 2:
  Use docker while being in the root of the project
  docker compose up --build

For both of these you will need .env file for secrets and you can have it by asking the creator.

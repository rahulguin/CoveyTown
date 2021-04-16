# Covey.Town

Covey.Town provides a virtual meeting space where different groups of people can have simultaneous video calls, allowing participants to drift between different conversations, just like in real life. Our application extends the Covey.Town application created by [Jonathan Bell](https://github.com/jon-bell) for Northeastern's [Spring 2021 software engineering course](https://neu-se.github.io/CS4530-CS5500-Spring-2021/). The github repo for the original application can be found [here](https://github.com/neu-se/covey.town).  

This [addition](FEATURES.md) to the Covey.Town Codebase allows users to interact with a two new features "Placeables" and "player Permissions"

## Important Links

[Repository](https://github.com/rahulguin/CoveyTown) <br />
[Front-end deployment on Netlify](https://coveyplace.netlify.app/)<br />
[Back-end deployment on Heroku](https://covey-town-team40.herokuapp.com/)<br />

## Running this app locally

Running the application locally entails running both the backend service and a frontend.

### Setting up the backend

To run the backend, you will need a Twilio account. Twilio provides new accounts with $15 of credit, which is more than enough to get started.
To create an account and configure your local environment:

1. Go to [Twilio](https://www.twilio.com/) and create an account. You do not need to provide a credit card to create a trial account.
2. Create an API key and secret (select "API Keys" on the left under "Settings")
3. Create a `.env` file in the `services/roomService` directory, setting the values as follows:

| Config Value            | Description                               |
| ----------------------- | ----------------------------------------- |
| `TWILIO_ACCOUNT_SID`    | Visible on your twilio account dashboard. |
| `TWILIO_API_KEY_SID`    | The SID of the new API key you created.   |
| `TWILIO_API_KEY_SECRET` | The secret for the API key you created.   |
| `TWILIO_API_AUTH_TOKEN` | Visible on your twilio account dashboard. |

### Starting the backend

Once your backend is configured, you can start it by running `npm start` in the `services/roomService` directory (the first time you run it, you will also need to run `npm install`).
The backend will automatically restart if you change any of the files in the `services/roomService/src` directory.

### Configuring the frontend

Create a `.env` file in the `frontend` directory, with the line: `REACT_APP_TOWNS_SERVICE_URL=http://localhost:8081` (if you deploy the rooms/towns service to another location, put that location here instead)

### Running the frontend

In the `frontend` directory, run `npm start` (again, you'll need to run `npm install` the very first time). After several moments (or minutes, depending on the speed of your machine), a browser will open with the frontend running locally.
The frontend will automatically re-compile and reload in your browser if you change any files in the `frontend/src` directory.

## Deploying new feature

### Installation instructions

This new upgraded version of Covey.Town doesn't have any extra installation features that you need to worry about. Just make sure to do an `npm install` in both the front-end and back-end, follow the above steps for running locally and you should be all set.

You can clone our repository by entering:

`$ git clone https://github.com/rahulguin/CoveyTown.git`


### Syncing with original repo

This version of Covey.Town is built on top of the original repo. Hence, you would simply need to merge this repo with the original repo using the steps provided in [Activity 10.1](https://neu-se.github.io/CS4530-CS5500-Spring-2021/Activities/continuous-development).

# capstone-project-agridevs
## Overview
The Profit Map Web App aims to help farmers visualize profitability using yield data mapped onto satellite imagery.
Users can upload CSV files, which are then processed to generate a map with an overlaid color gradient.

## To-Do List
- [ ] Create a release (Module 3.1 Due Mon Nov 11)
- [ ] Although test-db was created, make sure we can actually connect to our profitmap db
- [ ] Set up spot for credentials like tokens or websites to ensure group has access at all times

## Ideas
- Consider allowing users to upload CSV files to visualize yield data on a satellite image background.
- Possible technologies: Mapbox, D3.js for visualizations, GeoJSON for geospatial data.

## Useful Links
- Frontend - (https://it-sd-capstone.github.io/capstone-project-agridevs/)
- Backend - (https://capstone-project-agridevs.onrender.com/)

## Installation Commands
### Repository
- Clone with HTTPS
- git clone https://github.com/it-sd-capstone/capstone-project-agridevs.git

### Backend
1. Navigate to the backend folder
    - cd capstone-project-agridevs/backend
2. Initialize the backend folder (already done)
    - npm init -y
3. Install dependencies
    - npm install express pg dotenv cors
    - express: A node.js web application framework to manage requests/responses
    - pg: Allows node.js apps to communicate with PostgreSQL databases
    - dotenv: Loads environmental variables that helps manage sensitive values like our database credentials
        - cors: Cross-Origin Resource Sharing, helps with resources on a server to be requested from another domain
          (Render/GH pages)
4. Running the backend
    - If you wanted to run it locally, you could use npm start
    - The backend is also deployed on Render, look at link above

### Frontend
1. Navigate to the frontend folder
    - cd capstone-project-agridevs/frontend
2. Initialize the frontend folder (already done)
    - npx create-react-app .
3. Install dependencies
    - npm install
4. Install GitHub Pages
    - npm install gh-pages --save-dev
5. Configure the frontend/package.json file to accommodate GitHub Pages
    - "homepage": "https://it-sd-capstone.github.io/capstone-project-agridevs",
    - Add the following two lines under the "scripts" block
        - "predeploy": "npm run build",
        - "deploy": "gh-pages -d build",
6. Build and deploy the frontend to GitHub Pages
    - npm run build
    - npm run deploy
    - The frontend is now accessible at the link above

## Validation
The Profit Map Web App has both frontend and backend components deployed publicly at the links noted above (GitHub Pages
for the frontend and Render for the backend). To verify the connection between the backend and the frontend, navigate to
the frontend live web app and click the "Test Backend Connection" button. On our end of things, once the button is
clicked, the fetch command in our TestComponent.js (frontend) to receive the GET request. This then matches the route
defined in our server.js (backend) and begins to connect to the PostgreSQL database and queries for the current
timestamp. The TestComponent.js awaits for the response and if successful the webpage updates and will display after a
few moments "Success: Database is connected. Central Time: YYYY-MM-DD HH:mm:ss" (to your current time and date).

If you wanted to simply view the backend web server you would go to the above backend link. Another way to verify this
connection would be navigating to (https://capstone-project-agridevs.onrender.com/test-db), note the "test-db" addition
to the end of our backend link. Again, if the connection is successful it will display "Database is connected. Central
Time: YYYY-MM-DD HH:mm:ss" and will update as you refresh the page.

## Bug Tracker
| ID  | Description | Status      | Assignee |
| --- |-------------|-------------|----------|
| 1   | Example 1   | Resolved    | Garrett  |
| 2   | Example 2   | In Progress | Garrett  |

## Meeting Notes
### November 4, 2024
- Set up communication portal via Discord
- Took time to get to know one another outside of project
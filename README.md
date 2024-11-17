# Profit Map Web App
## Overview
The Profit Map Web App aims to help farmers visualize profitability using yield data mapped onto satellite imagery.
Users can upload CSV files, which are then processed to generate a map with an overlaid color gradient.

## To-Do List
- [ ] Be sure to denote steps taken in the README file
- [ ] Although test-db was created, make sure we can actually connect to our profitmap db
- [ ] Set up spot for credentials like tokens or websites to ensure group has access at all times

## Ideas
- Consider allowing users to upload CSV files to visualize yield data on a satellite image background.
- Possible technologies: Mapbox, D3.js for visualizations, GeoJSON for geospatial data.

## Useful Links
https://capstone-project-agridevs.onrender.com/

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
    - npm install express pg dotenv cors multer csv-parser
    - express: A node.js web application framework to manage requests/responses
    - pg: Allows node.js apps to communicate with PostgreSQL databases
    - dotenv: Loads environmental variables that helps manage sensitive values like our database credentials
    - cors: Cross-Origin Resource Sharing, helps with resources on a server to be requested from another domain
      (Only Render now but will keep just in case)
    - multer: used to handle incoming file uploads
    - csv-parser: to parse and validate the .csv file that is uploaded
4. Running the web service
    - If you wanted to run it locally, you could use npm start
    - Otherwise, make sure your build is up to date by running npm run build
    

### Frontend
1. Navigate to the frontend folder
    - cd capstone-project-agridevs/frontend
2. Initialize the frontend folder (already done)
    - npx create-react-app .
3. Install dependencies
    - npm install
4. Configure the frontend/package.json file to accommodate Render Web Service
    - "homepage": "https://capstone-project-agridevs.onrender.com",

## Validation
The Profit Map Web App has both frontend and backend components deployed publicly at the link noted above (Render). 
To verify the connection between the backend and the frontend, navigate to the link and click the "Test Backend 
Connection" button. On our end of things, once the button is clicked, the fetch command in our TestComponent.js 
(frontend) to receive the GET request. This then matches the route defined in our server.js (backend) and begins to
connect to the PostgreSQL database and queries for the current timestamp. The TestComponent.js awaits for the response
and if successful the webpage updates and will display after a few moments "Success: Database is connected. Central 
Time: YYYY-MM-DD HH:mm:ss" (to your current time and date).

## Bug Tracker
| ID  | Description | Status      | Assignee |
| --- |-------------|-------------|----------|
| 1   | Example 1   | Resolved    | Garrett  |
| 2   | Example 2   | In Progress | Garrett  |

## Meeting Notes
### November 4, 2024
- Set up communication portal via Discord
- Took time to get to know one another outside of project

### November 14th, 2024
- Hopped on Discord chat to go over our initial plan
- Wanted to focus on the backend
  - Garrett: Fix GitHub Pages/Render frontend, then help with file upload routing / csv validation
  - Tyler: Design and implement the database
  - Marissa: Database connection and enhancing csv validation to ensure it is correctly inserted
  - Tristen: Implement the profit calculation from parsed data and total costs
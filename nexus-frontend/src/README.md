# Source Code Structure

This directory contains the source code for the ProjectNexus frontend. Here's an overview of the structure:

## Main Files

- `App.js`: The main application component that defines routes
- `index.js`: Entry point of the React application
- `store.js`: Redux store configuration
- `index.css`: Global CSS styles

## Directories

### `/components`
Reusable UI components:
- `Navbar.jsx`: Main navigation bar
- `FaceLogin.jsx` & `SaveFace.jsx`: Face recognition components
- `Footer.jsx`: Site footer
- And many more utility components

### `/pages`
Page components:
- `Home.jsx`: Landing page
- `Profile.jsx`: User profile page
- `Projects.jsx`: Projects listing page
- `GitHubProfile.jsx`: GitHub explorer feature
- And other page components

### `/actions`
Redux action creators:
- `User.js`: User-related actions
- `Project.js`: Project-related actions

### `/reducers`
Redux reducers:
- `User.js`: User state management

### `/assets`
Static assets like images and icons

### `/config`
Configuration files:
- `api.js`: API configuration

## Key Features Implementation

- **Face Recognition**: Implemented in `FaceLogin.jsx` and `SaveFace.jsx` using face-api.js
- **GitHub Integration**: Implemented in `GitHubProfile.jsx`
- **Project Management**: Implemented across multiple components including `Project.jsx`, `EditProject.jsx`
- **User Authentication**: Implemented in `auth.jsx` and related components 
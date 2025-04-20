# ProjectNexus Frontend

This is the frontend part of ProjectNexus, a comprehensive project management system designed for developers to create, manage, and share their projects.

## Features

- **User Authentication**: Regular login/signup and Face Recognition authentication
- **Project Management**: Create, edit, and delete projects
- **GitHub Integration**: Analyze GitHub profiles and repositories
- **Collaboration**: Follow users, comment on projects
- **Responsive Design**: Works on both desktop and mobile devices

## Technology Stack

- React.js
- Redux for state management
- Tailwind CSS for styling
- Axios for API requests
- Face-api.js for face recognition

## Setup Instructions

1. Install dependencies: `npm install`
2. Create a `.env` file with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_GITHUB_TOKEN=your_github_token (optional for GitHub API)
   ```
3. Start the development server: `npm start`

## Environment Variables

- `REACT_APP_API_URL`: URL to the backend API (default: http://localhost:5000)
- `REACT_APP_GITHUB_TOKEN`: GitHub Personal Access Token for GitHub API (optional)

## Project Structure

- `/src/components`: Reusable UI components
- `/src/pages`: Main page components
- `/src/actions`: Redux actions
- `/src/reducers`: Redux reducers
- `/src/assets`: Images and static assets

## GitHub Explorer Feature

The GitHub Explorer feature allows users to:
- Search for GitHub profiles
- View detailed user information
- Analyze repositories, contributions, and activity
- Check for potential repository issues (e.g., missing licenses)

Note: For full GitHub API functionality, consider adding a GitHub Personal Access Token in the `.env` file. 
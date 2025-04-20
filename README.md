# ProjectNexus

ProjectNexus is a comprehensive project management system designed for developers to create, manage, and share their projects. It provides a collaborative platform where users can discover, contribute to, and follow projects of interest.

## Features

- **User Authentication**: Regular login/signup and Face Recognition authentication
- **Project Management**: Create, edit, and delete projects with detailed information
- **GitHub Integration**: Analyze GitHub profiles and repositories
- **Collaboration**: Follow users, comment on projects, and more
- **Admin Dashboard**: Manage users and projects effectively
- **Responsive Design**: Works on both desktop and mobile devices

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.io for real-time features
- Face-api.js for face recognition
- JWT for authentication

### Frontend
- React.js
- Redux for state management
- Tailwind CSS for styling
- Axios for API requests

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory: `cd nixxx`
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Start the server: `npm start`

### Frontend Setup
1. Navigate to the frontend directory: `cd nexus-front`
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_GITHUB_TOKEN=your_github_token (optional for GitHub API)
   ```
4. Start the development server: `npm start`

## Contribution

Feel free to contribute to this project by creating issues or submitting pull requests.

## License

This project is licensed under the MIT License. 
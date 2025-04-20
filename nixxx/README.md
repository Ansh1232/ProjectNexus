# Project Nexus Backend

This is the backend server for Project Nexus, a platform for sharing and collaborating on projects.

## Setup Instructions

1. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```
   
   If you encounter any installation issues, you can use the provided helper script:
   ```
   engines-fix.bat
   ```

2. Configure environment variables:
   The `.env` file should already be configured with:
   ```
   CLOUDINARY_CLOUD_NAME=dcozjijgq
   CLOUDINARY_API_KEY=217369258622492
   CLOUDINARY_API_SECRET=WT14gDIKK65lp97s69vgTTHSlNY
   JWT_SECRET=merekokyamaitopapahuisduniyakapapa
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/abc
   ```

3. Make sure MongoDB is running:
   - Start MongoDB Compass
   - Connect to the URI: `mongodb://127.0.0.1:27017/abc`

4. Start the server:
   ```
   npm start
   ```
   For development with auto-restart:
   ```
   npm run dev
   ```
   
   Or simply run the provided start script:
   ```
   start.bat
   ```

## Running the Full Application

To run both frontend and backend together:
```
start_project_nexus.bat
```

This will start:
1. MongoDB Compass
2. Backend server on port 5000
3. Frontend on port 3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/logout` - Logout

### Profile
- `GET /api/profile/me` - Get current user profile
- `PUT /api/profile/update` - Update user profile
- `POST /api/profile/users/details` - Get user details by IDs
- `POST /api/profile/user/search` - Search users by name

### Projects
- `GET /api/project/feed` - Get all projects
- `GET /api/project/:id` - Get project by ID
- `POST /api/project/upload` - Upload a new project
- `PUT /api/project/:id` - Update a project
- `DELETE /api/project/:id` - Delete a project
- `POST /api/project/comment/:id` - Add comment to a project
- `POST /api/project/comment/remove/:id` - Remove comment from a project
- `POST /api/project/comment/like/:id` - Like a comment
- `POST /api/project/comment/reply/:id` - Reply to a comment
- `POST /api/project/comment/reply/remove/:id` - Remove a reply
- `POST /api/project/unlock/:id` - Unlock premium project content

### Documents
- `GET /api/document/all` - Get all documents
- `GET /api/document/:id` - Get document by ID

### Admin
- `GET /api/admin/stats` - Get statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/projects` - Get all projects
- `DELETE /api/admin/project/:id` - Delete a project as admin
- `POST /api/project/makep/:id` - Toggle premium status for a project 
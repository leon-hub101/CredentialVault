---
```markdown
# CredentialVault

CredentialVault is a secure credential management system built for the HyperionDev Capstone Project. It features a React-based frontend and an Express.js/MongoDB backend, providing user authentication, credential management, and admin-level user management.

## Project Structure
- **/backend**: Contains the Node.js/Express server and MongoDB integration.
- **/frontend**: Contains the React application with routing and UI components.

## Features
- **Authentication**: User registration and login with JWT-based authentication, including toast feedback.
- **Credential Management**: View, add, edit, and delete credentials within divisions via a polished UI with modal-based editing.
- **User Management**: Admin interface to assign/unassign users to divisions/Organizational Units (OUs) and change user roles.

## Tech Stack
- **Backend**:
  - Node.js: Runtime environment.
  - Express.js: Web framework for API endpoints.
  - MongoDB: NoSQL database for data storage.
  - Mongoose: ODM for MongoDB schema management.
  - JWT (jsonwebtoken): Authentication tokens.
  - bcryptjs: Password hashing for security.
- **Frontend**:
  - React: JavaScript library for building the UI.
  - React Router: Client-side routing.
  - Axios: HTTP client for API requests.
  - react-toastify: Toast notifications for user feedback.
  - CSS: Custom styling for a responsive, modern design.

## Setup Instructions
1. **Prerequisites**:
   - Node.js (v14 or higher)
   - MongoDB (local instance or cloud, e.g., MongoDB Atlas)
   - Git

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/leon-hub101/CredentialVault.git
   cd CredentialVault
   ```

3. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   - **Configure MongoDB**: Ensure MongoDB is running locally at `mongodb://localhost:27017/credentialvault` (default URI). Update `mongoURI` in `backend/index.js` if using a different connection string.
   - **Seed Initial Data (Optional)**:
     ```bash
     node src/seedData.js
     ```
     - Seeds sample users (e.g., `admin1`/`adminpass`), OUs, divisions, and credentials.
   - **Run the Server**:
     ```bash
     node index.js
     ```
     - Runs on `http://localhost:5000`.

4. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm start
   ```
   - Runs on `http://localhost:3000`.
   - Ensure the backend is running first, as the frontend communicates with `http://localhost:5000`.

## API Endpoints
All endpoints (except `/register` and `/login`) require an `Authorization: Bearer <token>` header.

- **Authentication**:
  - **POST /register**
    - Body: `{ "username": "string", "password": "string", "role": "string" }`
    - Response: `{ "token": "string", "userId": "string", "role": "string" }`
  - **POST /login**
    - Body: `{ "username": "string", "password": "string" }`
    - Response: `{ "token": "string", "userId": "string", "role": "string" }`

- **Credential Management**:
  - **GET /api/divisions/:divisionId/credentials**
    - Response: `[ { "name": "string", "username": "string", ... } ]`
  - **POST /api/divisions/:divisionId/credentials**
    - Body: `{ "name": "string", "username": "string", "password": "string" }`
    - Response: `{ "message": "Credential added successfully", "credential": {...} }`
  - **PUT /api/divisions/:divisionId/credentials/:credentialId**
    - Body: `{ "name": "string", "username": "string", "password": "string" }` (partial updates allowed)
    - Response: `{ "message": "Credential updated successfully", "credential": {...} }`
    - Requires: `admin` or `management` role.
  - **DELETE /api/divisions/:divisionId/credentials/:credentialId**
    - Response: `{ "message": "Credential deleted successfully" }`
    - Requires: `admin` or `management` role.

- **User Management** (Admin-Only):
  - **GET /api/users**
    - Response: `[ { "username": "string", "role": "string", "divisions": [...] } ]`
  - **GET /api/divisions**
    - Response: `[ { "name": "string", "ou": {...}, ... } ]`
  - **GET /api/ous**
    - Response: `[ { "name": "string", "divisions": [...] } ]`
  - **POST /api/admin/assign-user**
    - Body: `{ "userId": "string", "divisionId": "string", "ouId": "string" }` (one of `divisionId` or `ouId` optional)
    - Response: `{ "message": "User assigned successfully", "user": {...} }`
  - **POST /api/admin/unassign-user**
    - Body: `{ "userId": "string", "divisionId": "string", "ouId": "string" }` (one of `divisionId` or `ouId` optional)
    - Response: `{ "message": "User unassigned successfully", "user": {...} }`
  - **PUT /api/admin/change-role/:userId**
    - Body: `{ "newRole": "string" }` (valid: `user`, `management`, `admin`)
    - Response: `{ "message": "User role updated successfully", "user": {...} }`

## Frontend Routes
- `/`: Welcome page.
- `/login`: Login form.
- `/register`: Registration form.
- `/divisions/:divisionId/credentials`: Credential management interface for a division.
- `/admin/user-management`: Admin interface for managing user roles and division/OU assignments.

## Notes
- **Default Credentials**: Use `admin1`/`adminpass` (from seed data) to access admin features.
- **Styling**: Custom CSS in `frontend/App.css` ensures a responsive, modern UI with modal-based credential editing.
- **Dependencies**: Excluded from version control (`node_modules` in `.gitignore`).

## Running the Project
1. Start the backend:
   ```bash
   cd backend
   npm start run dev
   ```
2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm start
   ```
3. Access the app at `http://localhost:3000`.
```
---

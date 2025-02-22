# CredentialVault

CredentialVault is a secure web application for managing credentials across organizational units (OUs) and divisions. It allows users to register, log in, and manage credentials, with admin features for user role management and division/OU assignments.

## Project Structure

This is a monorepo containing:

- **`backend`**: Node.js/Express server with MongoDB for authentication and credential storage.
- **`frontend`**: React application for the user interface.

## Features

- User registration and login with role-based access (user, management, admin).
- Dashboard displaying assigned divisions and OUs.
- Credential management (add, edit, delete) within divisions.
- Admin user management (role changes, division/OU assignments).
- Toast notifications for user feedback.

## Prerequisites

- Node.js (v16 or later)
- MongoDB (local installation or connection string)
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/leon-hub101/CredentialVault.git
cd CredentialVault
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend

- Ensure MongoDB is running locally (`mongodb://localhost:27017`).
- Update `backend/src/index.js` (or `server.js`) with your MongoDB connection if different.

### 4. Seed Initial Data

```bash
node seed.js
```

- Seeds initial users (e.g., `admin1:adminpass`), divisions, and OUs.

### 5. Start Backend

```bash
node server.js
```

### 6. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 7. Start Frontend

```bash
npm start
```

- Opens at `http://localhost:3000`.

## Usage

### Login

- Use `admin1`/`adminpass` (or seeded credentials) at `http://localhost:3000/login`.

### Dashboard

- View assigned divisions/OUs at `/dashboard`.

### Admin Management

- Manage users at `/admin/user-management` (admin only).

### Credentials

- Manage division credentials at `/divisions/:divisionId/credentials`.

## Default Credentials

### Admin

- Username: `admin1`
- Password: `adminpass`

### User

- Username: `user1`
- Password: `password123`

## Contributing

### Steps to Contribute

1. Fork the repository.

2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Commit changes:

   ```bash
   git commit -m "Add your feature"
   ```

4. Push to your fork:

   ```bash
   git push origin feature/your-feature
   ```

5. Open a pull request on GitHub.

## License

This project is unlicensed (public domain). Use it freely!

## Contact

- **GitHub**: [leon-hub101](https://github.com/leon-hub101)
- **Issues**: [Report bugs or suggest features](https://github.com/leon-hub101/CredentialVault/issues)

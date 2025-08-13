# PipzoMarkets Trading Platform

A comprehensive trading platform with authentication, user dashboard, and real-time trading features.

## Features

- User authentication (registration and login)
- Secure JWT-based authentication
- User dashboard with trading overview
- Trading platform integration
- Account management
- Responsive design

## Project Structure

- **Client**: React application with TypeScript
- **Server**: Express.js backend with MongoDB

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Setup Instructions

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/pipzomarkets
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the client directory with the following variables:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the client:
   ```
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account or login with existing credentials
3. Access the dashboard to view your trading information

## Authentication Flow

1. User registers with email, password, and personal information
2. User logs in with email and password
3. Server validates credentials and returns a JWT token
4. Client stores the token in localStorage
5. Protected routes check for valid token before rendering
6. User can request password reset via email if forgotten
7. User receives a reset link with a token and can set a new password

## API Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login a user
- `GET /api/user` - Get user data (protected route)
- `POST /api/forgot-password` - Request password reset email
- `POST /api/reset-password` - Reset password with token

## Technologies Used

### Frontend
- React
- TypeScript
- React Router
- Bootstrap
- Axios

### Backend
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## License

This project is licensed under the MIT License.
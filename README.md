# UniConnect – Student Discussion and Resource Platform

UniConnect is a fully-functional, modern full-stack web application designed for students and faculty to collaborate, discuss topics, and share resources. 

Built with the **React + Node.js + Express + MySQL** stack, it serves as a robust final-year project demonstrating best practices in web development, REST API design, authentication, and responsive UI.

## Features

- **Authentication System**: Secure JWT-based registration and login.
- **Role-Based Access Control**: Different views and capabilities for Students, Faculty, and Admins.
- **Discussion Module**: Create, edit, and delete posts. Engage with peers through comments and likes. Sort posts by latest or popularity.
- **Resource Sharing**: Upload, categorize, and download study materials (PDF, DOCX, images) with file size/type validation.
- **Admin Dashboard**: Manage platform content, monitor statistics, and remove inappropriate users or posts.
- **Modern UI/UX**: Built with Tailwind CSS, featuring loading skeletons, empty states, and toast notifications (react-hot-toast).

## Tech Stack

- **Frontend**: React 19, React Router DOM, Tailwind CSS, Vite.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL.
- **Key Libraries**: Axios, bcryptjs, jsonwebtoken, multer, react-hot-toast.

## Prerequisites

- **Node.js** (v18+ recommended)
- **MySQL** installed and running on default port `3306`

## Setup Instructions

### 1. Database Configuration

1. Log in to your MySQL instance and ensure it's running.
2. In the `server` directory, duplicate the `.env` configuration (if one doesn't exist) with your database credentials:
   ```env
   PORT=5000
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=uniconnect
   JWT_SECRET=your_jwt_secret_key
   ```
3. Initialize the database schema and default data:
   ```bash
   cd server
   npm install
   node init-db.js
   node db/migrations.js
   ```

### 2. Running the Application

**Run Backend (Server):**
```bash
cd server
npm run dev
```
The server will run on `http://localhost:5000`.

**Run Frontend (Client):**
```bash
cd client
npm install
npm run dev
```
The client will run on `http://localhost:5173`.

### 3. Usage & Admin Access
- Navigate to `http://localhost:5173` in your browser.
- Create a new account or log in.
- To test admin privileges, you will need to manually change a user's `role_id` to `3` in the `users` table via your MySQL database client.

## Folder Structure

```text
UniConnect/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth)
│   │   ├── pages/          # Full page views (Dashboard, Resources, etc.)
│   │   └── services/       # API interceptors and configuration
├── server/                 # Node/Express Backend
│   ├── db/                 # Database schema and migrations
│   ├── middleware/         # Auth and upload middleware
│   ├── routes/             # Express API routes
│   └── uploads/            # Local storage for uploaded resources
└── README.md
```
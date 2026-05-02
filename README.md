# Disaster Relief System

Disaster Relief System is a full-stack MERN application for coordinating disaster response between citizens, NGOs, government staff, and admins. Citizens can report incidents, NGOs can manage assigned requests, and government users can monitor, assign, and analyze relief activity from a central dashboard.

## Features

### Citizen
- Register and log in securely
- Report incidents with location and details
- Track submitted reports
- Edit profile information

### NGO
- View assigned reports
- Manage NGO profile details
- Review and update relief work status

### Government
- View all reports with filters and pagination
- Assign reports to NGOs manually or automatically
- Review NGO workload and analytics
- Monitor assignment status and progress

### Admin
- Access the admin dashboard

### UI and App Experience
- Responsive navigation and role-based layouts
- Dark mode support across Citizen, NGO, and Government layouts
- Persistent login state with profile fields retained after re-login

## Tech Stack

- **Frontend:** React, Vite, React Router, Tailwind CSS, Lucide React, Recharts
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs
- **API Client:** Axios

## Project Structure

```text
Disaster-Relief-System/
├── Backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── package.json
│   └── server.js
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── Layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Danish7754/Disaster-Relief-System-.git
cd Disaster-Relief-System-
```

### 2. Configure the backend

Create a `.env` file inside `Backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 3. Install dependencies

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### 4. Run the app

Start the backend:

```bash
cd Backend
npm run dev
```

Start the frontend in a separate terminal:

```bash
cd Frontend
npm run dev
```

## Available Scripts

### Backend
- `npm start` - start the API server
- `npm run dev` - start the API server with nodemon

### Frontend
- `npm run dev` - start Vite development server
- `npm run build` - build the frontend for production
- `npm run lint` - run ESLint

## Main Routes

### Frontend
- `/` - Home
- `/login` - Login
- `/register` - Register
- `/citizen` - Citizen dashboard
- `/ngo` - NGO dashboard
- `/govt` - Government dashboard
- `/admin/dashboard` - Admin dashboard

### Backend API
- `/api/auth`
- `/api/reports`
- `/api/ngos`
- `/api/govt`
- `/api/users`
- `/api/admin`

## Notes

- The backend server runs on `PORT` from the `.env` file, defaulting to `5000`.
- The frontend uses Vite and typically runs on `http://localhost:5173`.
- MongoDB connection is configured in `Backend/server.js`.

## Author

Danish Iqbal
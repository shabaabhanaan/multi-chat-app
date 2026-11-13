# Multi-Chat App

![Release](https://img.shields.io/badge/release-v1.0.0-blue.svg)
![Updated](https://img.shields.io/badge/last%20updated-November%2013%2C%202026-brightgreen.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

A **modern, real-time multi-chat web application** with support for group channels, 1-on-1 direct messaging, media sharing, and more. Built with **React**, **Node.js**, **Socket.IO**, and **MongoDB**, designed for scalability and modern web experiences.  

---

## **Features**

- **Real-Time Messaging:** Instant messages powered by Socket.IO with sub-second delivery.
- **Multi-Chat Support:** Join multiple channels (`#general`, `#technology`, `#random`), create custom rooms, or launch 1-on-1 direct messages.
- **User Authentication:** Secure registration and login using JWT & salted bcrypt password hashing.
- **One-Click Demo Accounts:** Test instant real-time multi-user conversations without filling forms.
- **Profiles & Avatars:** Customize avatars (DiceBear collections & randomizer or custom URLs), display status, and personal bios.
- **Typing Indicators & Online Status:** Real-time pulse indicator showing who is typing, plus online/offline presence indicators.
- **Media & File Sharing:** Drag or upload images (with full-screen lightbox preview) and documents/files with download cards.
- **Search & History:** Live keyword search within conversation message histories, plus sidebar search across channels and users.
- **Responsive Design:** Polished Slack/Discord-inspired dark mode interface with collapsible mobile sidebar.
- **Docker-Ready:** Complete Dockerfiles and `docker-compose.yml` for backend, frontend, and MongoDB services.

---

## **Tech Stack**

- **Frontend:** React 18, Vite, Lucide Icons, Axios, Socket.IO Client
- **Backend:** Node.js, Express.js, Socket.IO, Multer, Mongoose, JSON Web Tokens, bcryptjs
- **Database:** MongoDB / MongoDB Atlas (with automatic DNS resolution fallback for Windows)
- **Containerization:** Docker & Docker Compose

---

## **Folder Structure**

```
multi-chat-app/
├── backend/
│   ├── config/             # DB & environment configuration
│   ├── controllers/        # Auth, Chat, and User route controllers
│   ├── middleware/         # JWT verification & global error handler
│   ├── models/             # Mongoose schemas (User, Room, Message)
│   ├── routes/             # Express API endpoints
│   ├── socket/             # Socket.IO connection & event handlers
│   ├── utils/              # Token generators & validation helpers
│   ├── uploads/            # Media & file attachments directory
│   ├── Dockerfile
│   └── index.js            # Express server entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # ChatBox, Sidebar, Message, Modals
│   │   ├── services/       # Axios API client & Socket.IO instance
│   │   ├── App.jsx         # App orchestration & state
│   │   ├── index.css       # Design system & dark theme styles
│   │   └── index.jsx       # React DOM root entry
│   ├── Dockerfile
│   └── vite.config.js
├── docker-compose.yml      # Orchestrates mongodb, backend, and frontend
└── README.md
```

---

## **Getting Started**

### **1. Install Dependencies**

From the root directory:
```bash
npm run install-all
```

Or individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### **2. Configure Environment Variables**

In `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/multichat?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
```

### **3. Start the Application**

Run both frontend and backend concurrently from root:
```bash
npm start
```

Or run separately:
- **Backend**: `npm run backend` (Runs on `http://localhost:5000`)
- **Frontend**: `npm run frontend` (Runs on `http://localhost:3000`)

---

## **API Endpoints**

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login user & return JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user | Yes |
| `PUT` | `/api/auth/profile` | Update profile (avatar, bio, status) | Yes |
| `GET` | `/api/users` | List all users (with `?search=`) | Yes |
| `GET` | `/api/chat/rooms` | Fetch user channels and active DMs | Yes |
| `POST` | `/api/chat/rooms` | Create new channel | Yes |
| `POST` | `/api/chat/dm` | Get or create 1-on-1 DM room | Yes |
| `GET` | `/api/chat/messages/:roomId` | Retrieve room message history | Yes |
| `POST` | `/api/chat/messages` | Send message via REST | Yes |
| `POST` | `/api/upload` | Upload media / file attachment | Yes |

---

## **Socket.IO Real-Time Events**

- `setup`: Authenticates client socket and broadcasts presence.
- `online_users`: Emits list of online user IDs to all clients.
- `join_room` / `leave_room`: Joins or exits specific chat rooms.
- `send_message`: Persists message in DB and broadcasts `message_received` to room participants.
- `typing` / `stop_typing`: Broadcasts live typing indicators.

---

## **Docker Deployment**

To launch the full stack with MongoDB container:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- MongoDB: `localhost:27017`

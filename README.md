# FlowDesk | Premium Team Task Management

FlowDesk is a high-fidelity, full-stack collaborative task management platform designed for modern teams. Built with a focus on rich aesthetics, real-time analytics, and seamless user experience, it allows teams to manage projects, assign tasks, and track productivity through beautiful data visualizations.

![FlowDesk Preview](https://via.placeholder.com/1200x600/1A1A2E/00FFD1?text=FlowDesk+Premium+Task+Management)

## 🚀 Live Demo
**[Insert Railway Link Here]**

---

## ✨ Key Features

### 📊 Advanced Analytics Dashboard
- **Productivity Heatmap**: Track overdue tasks over time with a visual calendar heatmap.
- **Task Distribution**: Pie charts for status breakdown and Bar charts for team member workload.
- **Completion Trends**: Line charts showing task completion velocity over the last 30 days.

### 🛠 Project & Task Management
- **Kanban Board**: Drag-and-drop style status management (To Do, In Progress, Done).
- **Role-Based Access**: Admins can manage projects and members; Members focus on assigned tasks.
- **Task Intelligence**: pulsing red glows for overdue items, high-priority flame badges, and smooth completion animations.

### 🔐 Security & Auth
- **JWT Authentication**: Secure session management.
- **Google OAuth**: One-tap login with official Google Identity integration.
- **Role Guarding**: Backend-enforced permissions for Admin vs Member roles.

---

## 🛠 Tech Stack

**Frontend:**
- React 19 + Vite
- Recharts (Data Visualization)
- Lucide React (Icons)
- Vanilla CSS3 (Glassmorphism & Micro-animations)

**Backend:**
- Node.js + Express
- Prisma ORM
- PostgreSQL (Production) / SQLite (Development)
- JSON Web Tokens (JWT)

---

## ⚙️ Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/flowdesk.git
cd flowdesk
```

### 2. Install Dependencies
```bash
# Install everything (Root, Frontend, Backend)
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend` folder:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/flowdesk"
JWT_SECRET="your_secret_key"
GOOGLE_CLIENT_ID="your_google_client_id"
```

Create a `.env` file in the `frontend` folder:
```env
VITE_GOOGLE_CLIENT_ID="your_google_client_id"
```

### 4. Database Setup
```bash
cd backend
npx prisma migrate dev
```

### 5. Run the App
```bash
# From the root directory
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 🚢 Deployment (Railway)

FlowDesk is optimized for one-click deployment on Railway.

1. **Connect GitHub**: Connect this repository to your Railway project.
2. **Add PostgreSQL**: Add the PostgreSQL plugin in Railway.
3. **Set Variables**: 
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `NODE_ENV=production`

Railway will automatically detect the monorepo structure and build the project using the root `package.json` scripts.

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

---

*Developed with ❤️ as a high-performance full-stack demonstration.*

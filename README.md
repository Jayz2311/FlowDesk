# Team Task Management Web Application

This is a full-stack collaborative Team Task Management Web Application built with Node.js, Express, React, and PostgreSQL/SQLite (via Prisma).

## Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   The application uses SQLite for local development by default.
   ```bash
   cd backend
   npx prisma db push
   ```

3. **Start the Development Servers**
   From the root directory:
   ```bash
   npm run dev
   ```
   This will start both the Express backend and Vite frontend concurrently.

## Railway Deployment Instructions

1. **Push to GitHub**
   Initialize a git repository, commit all files, and push to your GitHub account.
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Create Railway Project**
   - Go to [Railway](https://railway.app/).
   - Click "New Project" -> "Deploy from GitHub repo".
   - Select your repository.

3. **Add PostgreSQL Database** (Optional but recommended for production)
   - In your Railway project, click "New" -> "Database" -> "Add PostgreSQL".
   - Wait for it to provision.

4. **Environment Variables**
   - Click on your GitHub repository service in Railway.
   - Go to the "Variables" tab.
   - Add `JWT_SECRET` (e.g., set to a secure random string).
   - If using the PostgreSQL plugin, add `DATABASE_URL` and reference the PostgreSQL connection string. (Make sure to update `schema.prisma` provider to `postgresql` and push).
   - If using the default SQLite, it will use a local `dev.db` file (note: Railway's disk is ephemeral unless you attach a volume, so PostgreSQL is highly recommended).

5. **Deployment**
   - Railway will automatically detect the `package.json` and `railway.json` and deploy your application.
   - You can access the live application using the URL provided by Railway.

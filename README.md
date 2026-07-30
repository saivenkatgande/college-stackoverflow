# College StackOverflow 🎓

A modern, full-stack Q&A platform built specifically for college students and faculty. Students can ask questions, post answers, and participate in polls, while Faculty members have special privileges to officially "Verify" correct answers.

## ✨ Features
* **Role-Based Authentication**: Secure JWT login system with `STUDENT` and `FACULTY` roles. (Faculty accounts require admin approval).
* **Ask & Answer**: Students can post questions with tags, and anyone can post answers.
* **Faculty Verification**: Verified faculty members can mark an answer as "✓ Verified by Faculty", pinning it as the authoritative response.
* **Interactive Polls**: Users can attach multiple-choice polls to their questions and vote dynamically.
* **Beautiful UI**: Modern glassmorphism design, dark mode aesthetics, and responsive layouts built without heavy frontend frameworks.
* **Settings**: Users can securely change their passwords.

## 🛠️ Tech Stack
* **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism UI), and JavaScript (SPA Routing via Hash).
* **Backend**: Node.js, Express.js.
* **Database**: PostgreSQL with Prisma ORM.
* **Security**: `bcryptjs` for password hashing, `jsonwebtoken` for secure stateless sessions.

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* [PostgreSQL](https://www.postgresql.org/) installed and running

### 1. Clone the repository
```bash
git clone https://github.com/saivenkatgande/college-stackoverflow.git
cd college-stackoverflow
```

### 2. Setup the Backend
Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and configure your PostgreSQL database connection:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/college_stackoverflow?schema=public"
JWT_SECRET="your_super_secret_jwt_key_here"
```

Run database migrations to generate the schema:
```bash
npx prisma migrate dev --name init
```

Start the backend server:
```bash
node server.js
```
The backend will run on `http://localhost:5000`.

### 3. Setup the Frontend
Since the frontend uses vanilla HTML/JS, you can serve it using any basic static file server. 

If you use VS Code, install the **Live Server** extension, right-click `client/index.html`, and select "Open with Live Server".

Alternatively, use Python or `npx serve`:
```bash
cd client
npx serve .
```

Navigate to `http://localhost:3000` (or whatever port your static server provides) to view the app!

## 🔐 Faculty Approval Note
By default, creating an account with the `FACULTY` role sets `isApproved` to `false` in the database for security reasons. To test Faculty features (like verifying answers), you will need to manually change `isApproved` to `true` in your PostgreSQL database for that specific user.

---
*Developed by Sai Venkat Gande*

# CollabTask MVP - Real-time Collaborative Task & Project Management

A real-time collaborative project and task management MVP built with React 19, TypeScript, Tailwind CSS, and Firebase (Authentication & Cloud Firestore).

---

## 🎯 9 Core MVP Requirements & Verification Status

| Step | Requirement | Implementation & Status | Verified |
|---|---|---|:---:|
| **1** | Register and Log In | Firebase Auth email/password registration & login with Firestore `users/{uid}` profile syncing and auth state listener (`onAuthStateChanged`). | ✅ Verified |
| **2** | Create a Project | Project creation in Firestore (`projects/{projectId}`), automatically assigning the creator as owner and member with server timestamps. | ✅ Verified |
| **3** | Add Project Members | Look up registered users by email and add to project `members` array and `memberDetails` mapping in Firestore; syncs in real time across sessions. | ✅ Verified |
| **4** | Create and Assign a Task | Task creation in Firestore (`projects/{projectId}/tasks/{taskId}`) with title, description, priority, assignee dropdown, and due date. | ✅ Verified |
| **5** | Update Task Status & Progress | Real-time status changes (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`) and interactive progress slider/presets (0%-100%) persisting atomically via `updateDoc`. | ✅ Verified |
| **6** | Verify Task Saved in Firestore | Direct display of Firestore Document ID (`id: ...`), real-time sync indicators, and verified persistence in Cloud Firestore. | ✅ Verified |
| **7** | Multi-Session Real-Time Updates | Verified across 2 concurrent browser sessions (Playwright test): Session 1 creates/updates tasks and members, and Session 2 receives immediate updates via `onSnapshot` without page refresh. | ✅ Verified |
| **8** | Protected Data & Unauthorized Access Prevention | Firestore Security Rules (`firestore.rules`) enforce that non-members cannot read, create, update, or delete projects or tasks. Verified via unit test suite. | ✅ Verified |
| **9** | Real Dashboard Statistics | Dynamically computed reactive metrics derived from real Firestore task data: total tasks, status breakdown, completion rate (%), average progress (%), assigned tasks, and urgent/high priority counts. | ✅ Verified |

---

## 📂 Architecture & Important Files

- [`src/lib/firebase.ts`](file:///d:/New%20folder/task-manager/src/lib/firebase.ts): Initializes Firebase Web SDK. Automatically detects whether live credentials exist or connects to the local Firebase Emulator Suite (Auth: port 9099, Firestore: port 8080).
- [`src/context/AuthContext.tsx`](file:///d:/New%20folder/task-manager/src/context/AuthContext.tsx): Manages authentication lifecycle, user registration, login, logout, and automatic Firestore user profile synchronization.
- [`src/context/ProjectContext.tsx`](file:///d:/New%20folder/task-manager/src/context/ProjectContext.tsx): Core state and real-time data engine. Manages active project selection, real-time listeners (`onSnapshot`) for projects and tasks, project creation, member invitations, and task CRUD operations.
- [`src/lib/stats.ts`](file:///d:/New%20folder/task-manager/src/lib/stats.ts): Pure utility function computing project statistics reactively from real Firestore tasks (total, completion rate, average progress, status counts, urgent tasks).
- [`firestore.rules`](file:///d:/New%20folder/task-manager/firestore.rules): Production-grade Firestore security rules preventing unauthorized users from accessing or modifying private projects and subcollection tasks.
- [`src/components/DashboardStatsView.tsx`](file:///d:/New%20folder/task-manager/src/components/DashboardStatsView.tsx): Renders the 6 reactive stat cards and visual overall project progress bar.
- [`src/components/TaskBoard.tsx`](file:///d:/New%20folder/task-manager/src/components/TaskBoard.tsx) & [`src/components/TaskCard.tsx`](file:///d:/New%20folder/task-manager/src/components/TaskCard.tsx): Displays tasks in list/grid or Kanban view with real-time status selector, progress slider, quick percentage buttons, and Firestore document ID badge.
- [`e2e/multisession.spec.ts`](file:///d:/New%20folder/task-manager/e2e/multisession.spec.ts): Automated Playwright test exercising all 9 steps across 2 independent browser sessions concurrently.
- [`tests/firestore-security-rules.test.ts`](file:///d:/New%20folder/task-manager/tests/firestore-security-rules.test.ts): Unit tests verifying that unauthorized users are rejected (`PERMISSION_DENIED`) when attempting to read or modify protected data.

---

## 🚀 Running & Testing Locally (With Firebase Emulator)

The local emulator allows you to verify and run the entire application with real Firebase services without needing a cloud project or API keys:

1. **Install dependencies:**
   ```bash
   cd task-manager
   npm install
   ```

2. **Start Firebase Emulators (Auth & Firestore):**
   ```bash
   npm run emulator
   ```

3. **Start the Vite Frontend:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173`. Use the "Fill User 1 (Alice)" and "Fill User 2 (Bob)" buttons on the login screen to quickly test in two browser windows!

4. **Run Automated Test Suites:**
   - **Unit Tests (Dashboard Statistics):**
     ```bash
     npm run test:unit
     ```
   - **Security Rules Verification (Firestore Rules):**
     ```bash
     npm run test:rules
     ```
   - **Multi-Session Real-Time Updates E2E (Playwright):**
     ```bash
     npm run test:e2e
     ```

---

## ☁️ Connecting to Live Firebase

To connect this application to your real Firebase project:

### Step 1: Create a Firebase Project
1. Visit the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the prompts.

### Step 2: Enable Firebase Authentication
1. In the left sidebar, navigate to **Build > Authentication**.
2. Click **Get Started**, select **Email/Password** under *Sign-in method*, and click **Enable**.

### Step 3: Create Cloud Firestore Database
1. In the left sidebar, navigate to **Build > Firestore Database**.
2. Click **Create database**, choose a location (e.g. `us-central1`), and start in **Production mode**.
3. Under the **Rules** tab, paste the contents of [`firestore.rules`](file:///d:/New%20folder/task-manager/firestore.rules) and click **Publish**.

### Step 4: Register Web App & Configure Environment Variables
1. Go to **Project Settings** (gear icon) > **General**.
2. Under *Your apps*, click the Web icon (`</>`), name your app, and register it.
3. In your project root, create a file named `.env` based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Fill in the values from your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:...
   VITE_USE_FIREBASE_EMULATOR=false
   ```
5. Run `npm run dev` to launch the app connected to your live Firebase backend.

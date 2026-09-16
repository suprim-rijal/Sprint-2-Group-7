# RootBridge (Sprint 2)

RootBridge helps children learn their heritage language and culture. Sprint 2 covers **Nepali**.

This repository merges two projects:

- **Elearn-WebProject**: the landing page, about, contact, and the visual theme.
- **storyteller-s-library**: the Nepali curriculum and lesson engine. It was converted from TypeScript + Tailwind + TanStack to plain JavaScript + JSX + CSS.

Sprint 2 rule: **frontend and backend run on their own**. The frontend never calls the backend. It uses `src/services/mockApi.js`, which returns the same JSON as the backend.

---

## 1. Run it

You need Node.js 20 or newer. Open **two terminals**.

```bash
# Terminal 1: backend  ->  http://localhost:5000
cd backend
npm install
npm run dev
```

```bash
# Terminal 2: frontend ->  http://localhost:5173  (works without the backend)
cd frontend
npm install
npm run dev
```

### Demo accounts

Pick the matching role in the role menu. Passwords are not checked in Sprint 2.

| Role menu | Email | Lands on |
| --- | --- | --- |
| Child/Parent | `family@demo.com` (child: Aarav) | `/dashboard` (child view) |
| Normal | `learner@demo.com` | `/dashboard` |
| Teacher | `teacher@demo.com` | `/teacher` |
| Admin | `admin@demo.com` | `/admin` |

- **Class codes** (Cultural Passport → "Join a class"): `482913`, `305726`, `771040`
- **Start fresh:** DevTools → Application → Local Storage → delete every key that starts with `rootbridge_`.

---

## 2. Roles and what each one gets

The roles are defined in `frontend/src/config/roles.js` and `backend/config/roles.js`.

| Role (value) | Menu label | Pages |
| --- | --- | --- |
| `CombinedChildParent` | Child/Parent | **Child view:** `/dashboard`, `/learn/language`, `/learn/culture`, `/passport` · **Parent view:** `/parent`, `/parent/profile` |
| `NormalUser` | Normal | `/dashboard`, `/learn/language`, `/learn/culture`, `/profile` |
| `Teacher` | Teacher | `/teacher` (planned tools), `/teacher/profile` |
| `Admin` | Admin | `/admin` (planned tools), `/admin/profile` |

**The role menu at login is checked.** Choosing a role that doesn't match the account gives: *This account is registered as "Child/Parent". Choose that role and try again.* (HTTP 403.)

**Child vs parent (Child/Parent accounts only):**

- **Child view** is gamified: dashboard, learning paths, and the **Cultural Passport** (stamps, photo, name, language, "Join a class").
- **Parent view** is a standard, administrative interface: progress tables, controls, classes, activity, and a plain profile. **No passport.**
- **The toggle** is in the navbar: "Switch to Parent View" / "Switch to Child View".
  - It's instant, unless the parent switches on "Ask for a PIN" in Controls.
  - Pages from the other view redirect. For example, `/passport` in parent view goes to `/parent`.
- **Separate photos.** The child's photo lives in the passport (`details.avatar`); the parent's photo lives in the parent profile (`details.parentAvatar`).

---

## 3. User flow

```text
/signup (role menu) ─► /welcome (≈4.5 s animation, shown once) ─► role home
/login  (role menu) ─► role home        "Forgot password?" ─► /forgot-password
```

- **Welcome animation** (`pages/auth/WelcomePage.jsx`, CSS only): "welcome" appears in Nepali, French, Swahili, Japanese and Twi, then settles on "Welcome, *name*" with a drawn underline. It then moves on automatically, or when the user clicks "Continue".
- **Forgot password** gives the same answer whether or not the email exists, so it can't be used to discover accounts.
- **Logout** goes to the home page.

---

## 4. Routes

| Path | Page | Guards |
| --- | --- | --- |
| `/` `/about` `/contact` | Home, About, Contact | none |
| `/login` `/signup` `/forgot-password` | `AuthPage`, `ForgotPassword` | logged out only |
| `/welcome` | `WelcomePage` | logged in, welcome not seen yet |
| `/dashboard` | `Dashboard` | welcomed · Child/Parent or Normal · child view |
| `/learn` → `/learn/language` | redirect | same |
| `/learn/language` `/learn/culture` | `PathPage` (own layout) | same, and the path is not turned off by a parent |
| `/learn/:trackId/module/:moduleId` | `ModulePage` | same |
| `/learn/:trackId/lesson/:lessonId` | `LessonView` (full screen) | same |
| `/learn/:trackId/module/:moduleId/quest` | `ModuleQuest` (full screen) | same |
| `/passport` | `PassportPage` | Child/Parent · child view |
| `/parent` `/parent/profile` | `ParentOverview`, `AccountProfile` | Child/Parent · parent view |
| `/profile` | `AccountProfile` | Normal |
| `/teacher` `/teacher/profile` | `RoleWorkspace`, `AccountProfile` | Teacher |
| `/admin` `/admin/profile` | `RoleWorkspace`, `AccountProfile` | Admin |
| anything else | `NotFound` | none |

- **Guards** are in `src/routes/guards.jsx`: `RequireAuth`, `WelcomeStep`, `RequireWelcomed`, `RequireRole`, `RequireView` and `PublicOnly`. A blocked user is sent to their own home page.
- **Wrong path in the URL:** if a lesson or module URL uses the wrong path (e.g. `/learn/culture/lesson/l1-1-l1`), it is corrected automatically.

**Layouts:**

- `MainLayout`: site navbar + footer.
- `LearnLayout`: the learning paths' **own** top bar, with "← Dashboard", path tabs and XP. There's no site navbar there.
- `FocusLayout`: logo only (welcome).

---

## 5. The dashboard (hub, not the course)

`/dashboard` has **exactly five widgets** (`pages/dashboard/widgets/`):

| Widget | Shows |
| --- | --- |
| `ContinueLearning` | Resumes the last opened lesson if it isn't finished; otherwise the next lesson on that path. |
| `StreakWidget` | Days in a row with a lesson (still counts until the end of today), the last 7 days, and the best streak. |
| `WordOfTheDay` | One Nepali word per day, with pronunciation and a listen button. |
| `CulturalFact` | One culture fact per day (`data/cultureFacts.js`). |
| `OverallProgress` | A ring with % of all 368 lessons, modules mastered, and a bar per path. |

The calculations live in `lib/learningSummary.js`: `continueLearning`, `currentStreak`, `longestStreak` and `overallProgress`.

---

## 6. Learning paths (separate from the dashboard)

- **`/learn/language`: a trail.** Numbered chapters are followed in order, and each open chapter shows its module tiles.
- **`/learn/culture`: an atlas.** Topic cards show their module tiles.
- **Module page:** goal, words (tap to hear them), 4 lessons, and the module quest.
- **Unlocking:** a module opens when the one before it is finished.
- **Parent control:** a parent can turn a path off. It then disappears from the navbar and the path tabs, and its pages say "turned off".

---

## 7. Folder structure

```text
rootbridge-project/
├── README.md
├── postman/RootBridge.postman_collection.json
├── backend/
│   ├── server.js
│   ├── config/roles.js
│   ├── data/db.json               # tracks, chapters, modules, users, messages
│   ├── utils/db.js
│   ├── middleware/logger.js, errorHandler.js
│   ├── controllers/               # course, auth (login, signup, forgot-password), user, contact
│   └── routes/
└── frontend/src/
    ├── App.jsx                    # all routes
    ├── main.jsx
    ├── index.css                  # Elearn base theme
    ├── App.css                    # lesson player (ln-) + track colours
    ├── styles/flow.css            # auth, welcome, dashboard, learn, profiles, parent
    ├── config/roles.js            # ROLES, ROLE_OPTIONS, LEARNER_ROLES, VIEWS, homeFor()
    ├── context/AuthContext.jsx    # user, view, actions (useAuth)
    ├── routes/guards.jsx
    ├── services/mockApi.js        # fake backend
    ├── lib/                       # progress, learningSummary, exercises, speech, image
    ├── data/                      # curriculum, language, culture, cultureFacts, languages
    ├── components/
    │   ├── Navbar, Footer, Layouts, ScrollToTop
    │   ├── GlobeScene (login art), ViewSwitch, PinDialog, JoinClassCard
    │   └── LessonEngine, PushToTalk, ProgressBar, TrackOff
    └── pages/
        ├── Home, About, Contact, NotFound
        ├── auth/        AuthPage, ForgotPassword, WelcomePage
        ├── dashboard/   Dashboard + widgets/ (5 widgets)
        ├── learn/       LearnLayout, PathPage, ModulePage, LessonView, ModuleQuest
        ├── profile/     PassportPage (child), AccountProfile (standard)
        ├── parent/      ParentOverview
        └── workspace/   RoleWorkspace (Teacher, Admin)
```

---

## 8. State management

There is no Redux. There are three layers:

1. **`services/mockApi.js` pretends to be the server.**
   - It keeps users, classes and messages in `localStorage`.
   - Every function waits 300 ms and returns the same JSON as the API.
2. **`context/AuthContext.jsx` holds the logged-in user.**
   - **Reads:** `user`, `isFamily`, `isLearner`, `activeView`, `isParentView`, `home`, `learnerName`, `learningRules`.
   - **Actions:** `login(email, password, role)`, `signup(form)`, `logout`, `updateName`, `updateDetails`, `completeWelcome`, `setLanguage`, `updateParentSettings`, `setActiveView`, `joinClass`, `leaveClass`.
3. **`lib/progress.js` holds progress for each account** (`useProgress()`):
   - lessons done and modules mastered
   - XP and learning days (in local time)
   - `lastLesson`, used by "Continue learning"

### The user object

```js
{
  id: "usr-201", name: "Sita Sharma", email: "family@demo.com",
  role: "CombinedChildParent",       // | "NormalUser" | "Teacher" | "Admin"
  createdAt: "2026-09-01T10:00:00.000Z",
  details: {
    avatar: null,                    // learner photo (passport / normal profile)
    parentAvatar: null,              // parent photo (parent profile)
    onboarding: { language: "nepali", completed: true },   // completed = welcome seen
    classes: [ { code: "482913", name: "Nepali Starters", teacher: "Ms. Sharma", meets: "Saturdays, 10:00", joinedAt: "…" } ],
    parentSettings: {
      childName: "Aarav", dailyMinutes: 20, weeklyGoalDays: 4,
      allowedTracks: { language: true, culture: true },
      allowSpeaking: true, requirePin: false, pin: ""
    }
  }
}
```

### Where data is saved

| Data | Frontend (Sprint 2) | Backend |
| --- | --- | --- |
| Accounts | `localStorage["rootbridge_mock_users_v4"]` | `db.json → users` |
| Logged-in user | `localStorage["rootbridge_session"]` | Sprint 3: token |
| Child / parent view | `localStorage["rootbridge_active_view"]` | not needed |
| Progress, XP, last lesson | `localStorage["rootbridge_learning_progress:<userId>"]` | Sprint 3 |
| Contact messages | `localStorage["rootbridge_mock_messages"]` | `db.json → messages` |

---

## 9. API contract

Errors always look like `{ "success": false, "error": "message" }`.

| Method | URL | Body | Status |
| --- | --- | --- | --- |
| GET | `/api/health` | | 200 |
| GET | `/api/tracks` · `/api/tracks/:trackId` | | 200 / 404 |
| GET | `/api/modules/:moduleId` | | 200 / 404 |
| GET | `/api/lessons/:lessonId` | | 200 / 404 |
| POST | `/api/auth/login` | `{ email, password, role }` | 200 / 400 (no role) / 401 (no account) / 403 (wrong role) |
| POST | `/api/auth/signup` | `{ name, childName?, email, password, role }` | 201 / 400 |
| POST | `/api/auth/forgot-password` | `{ email }` | 200 (same answer for any valid email) / 400 |
| GET | `/api/users` | | 200 |
| POST | `/api/users/update` | `{ userId, name?, details? }` | 200 / 400 / 404 |
| POST | `/api/contact` · GET `/api/contact/messages` | | 201 / 200 |
| POST | `/api/classes/join` · `/leave` | `{ userId, code }` | **planned; mock only** |

**Rules (same in mock and backend):**

- `role` is required and must be one of the four values.
- `childName` is required only for `CombinedChildParent`.
- The password needs at least 6 characters, and the email must look valid.
- Login doesn't check the password yet.

**About `/api/users/update`:** each key inside `details` replaces the old key, so send whole nested objects.

### Example: POST /api/auth/login

```json
{ "email": "family@demo.com", "password": "demo123", "role": "Teacher" }
```

```json
{ "success": false, "error": "This account is registered as \"Child/Parent\". Choose that role and try again." }
```

**Postman:** import `postman/RootBridge.postman_collection.json`. It has 28 requests with automatic checks, covering every role, the error cases, and forgot password.

---

## 10. Sprint 3: connecting frontend and backend

1. **Swap the mock for real calls.** Replace each function body in `mockApi.js` with a `fetch()` call. The response shapes already match:

   ```js
   const API = "http://localhost:5000";
   export async function login({ email, password, role }) {
     const res = await fetch(`${API}/api/auth/login`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ email, password, role }),
     });
     const data = await res.json();
     if (!res.ok) throw new Error(data.error);
     return data;
   }
   ```

2. **Backend login:** hash passwords (bcrypt), return a JWT, and check the role on protected endpoints.
3. **Password reset:** create a one-time token, email the link, and add a "choose a new password" page.
4. **Classes:** add `POST /api/classes/join` and `/leave`. Teachers create the 6-digit codes in `/teacher`.
5. **Progress:** add `/api/progress`, so progress, streaks and "Continue learning" follow the user to other devices.
6. **Parent PIN:** check it on the server and store it hashed. Upload photos as files.

---

## 11. Known limits in Sprint 2

- **Browser-only data.** Another browser or computer starts empty.
- **Placeholder workspaces.** The Teacher and Admin pages list the planned tools, but the tools themselves come later.
- **The daily time limit** is displayed in parent Controls but not enforced.
- **Sound depends on the computer.** Lesson audio uses the computer's voices: Nepali or Hindi if installed, otherwise the English meaning.
- **Speaking practice** uses browser speech recognition (Chrome/Edge). Other browsers get an "I said it out loud" button.
- **The welcome animation** is plain CSS. Framer Motion was not added, to keep the bundle small.

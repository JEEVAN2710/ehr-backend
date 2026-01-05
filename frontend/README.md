# EHR Frontend (React + Vite)

## Overview
- Simple React UI for logging in and viewing a basic dashboard
- Connects to the EHR backend (`http://localhost:4000` by default)
- Includes a link to the backend signup form

## Setup
1. `cd frontend`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev` (default `http://localhost:5173`)

## Project Structure
- `src/App.jsx` – app shell, toggles login vs dashboard
- `src/pages/Login.jsx` – login form, calls backend `POST /api/auth/login`
- `src/pages/Dashboard.jsx` – basic authenticated UI (example)
- `src/styles` – CSS

## Configure Backend URL
- Current code calls the backend directly at `http://localhost:4000` inside `src/pages/Login.jsx`.
- To point to a different backend, update the fetch URL in `src/pages/Login.jsx`.
- Optional: you can introduce an environment variable (e.g. `VITE_API_BASE_URL`) and use it in code if preferred.

## API Integration Guide (for building a different frontend)
Backend base URL: `http://localhost:4000`

- Register: `POST /api/auth/register`
  - Body: `{ firstName, lastName, email, password, role? }`
  - Response: `{ success, message, data: { user, accessToken, refreshToken } }`
- Login: `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ success, message, data: { user, accessToken, refreshToken } }`
- Refresh: `POST /api/auth/refresh`
  - Body: `{ refreshToken }`
  - Response: `{ success, message, data: { accessToken, refreshToken } }`

Auth header:
- For protected routes, send `Authorization: Bearer <accessToken>`.

Records (protected):
- Create: `POST /api/records/`
- List: `GET /api/records/:patientId`
- View: `GET /api/records/view/:recordId`
- Update: `PUT /api/records/:recordId`
- Delete: `DELETE /api/records/:recordId`

Health & Email (for testing):
- `GET /api/health` – quick server check
- `GET /api/mail/test?to=<email>&name=<name>&email=<email>` – sends a welcome-style email

## Notes
- The backend welcomes new users by email if SMTP is configured; that flow is automatic after registration.
- If you prefer a native frontend signup page, add `Signup.jsx` that posts to `/api/auth/register` and route/toggle it from `App.jsx`.

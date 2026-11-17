# Clarity — AI Email Management Dashboard

A polished prototype for the **AI Full-Stack Engineer Intern** assignment: an AI-powered workspace for personal assistants who manage client email.

## What is implemented

- Onboarding / simulated Gmail + Outlook connection flow
- Assistant dashboard with inbox metrics
- AI reply-responsibility classification:
  - Assistant to Reply
  - Client to Reply
  - No Reply Needed
  - Review
- Search, segment filters and priority filters
- Conversation detail view
- AI summary and "why this needs attention"
- AI reply drafting with review-before-send workflow
- Manual classification correction
- Archive, unread and important controls
- Minimal client-facing dashboard
- Client "I'll handle this" / "Assistant take over" actions
- Connection + synchronization status
- Responsive mobile layout
- Loading, empty and error states
- Optional OpenAI-compatible AI integration with a deterministic demo fallback
- Optional MongoDB integration; demo mode works without MongoDB

The assignment explicitly allows realistic sample data, mock integrations and simulated workflows where live integrations are not feasible. This project uses that approach for email authorization and provides a clean integration boundary for a future Gmail/Outlook OAuth implementation.

## Tech stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB when `MONGODB_URI` is supplied; in-memory demo data otherwise
- AI: OpenAI-compatible API when `OPENAI_API_KEY` is supplied; local deterministic fallback otherwise
- Styling: custom CSS, no component library required

## Run locally

Requirements: Node.js 20+.

```bash
npm install
npm run install:all
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The server runs on `http://localhost:5000`.

### Optional environment variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/clarity_email
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
CLIENT_URL=http://localhost:5173
```

No environment variables are required for demo mode.

## Demo accounts / workflow

The prototype starts with seeded realistic email conversations. Use:

1. **Assistant View** to review the inbox.
2. Click **Client to Reply** in the segment bar.
3. Open an email and inspect the AI summary and responsibility.
4. Click **Draft reply** and review the generated draft.
5. Change the AI classification from the detail panel to demonstrate human override.
6. Switch to **Client View** from the top-right view switcher.
7. Use **I'll handle this** or **Assistant take over** and switch back to see the shared state.
8. Return to Assistant View and use search / filters.

## Deployment

### Backend — Render / Railway / similar Node host

Build command: none.

Start command:

```bash
npm start
```

Root directory should be `server` if your host supports a root directory setting.

Environment variables:

```env
PORT=10000
CLIENT_URL=https://YOUR-FRONTEND-DOMAIN
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
OPENAI_API_KEY=YOUR_KEY
OPENAI_MODEL=gpt-4o-mini
```

### Frontend — Vercel / Netlify

Set the project root to `client`.

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Set:

```env
VITE_API_URL=https://YOUR-BACKEND-DOMAIN
```

For a single-host deployment, the Express server can also serve the built client; see the optional deployment section in `server/index.js`.

## Production integration path

The prototype deliberately keeps external integrations behind small API boundaries:

- `GET /api/emails`
- `PATCH /api/emails/:id`
- `POST /api/ai/classify`
- `POST /api/ai/summarize`
- `POST /api/ai/draft`
- `GET /api/accounts`
- `POST /api/accounts/connect`
- `POST /api/accounts/:id/sync`

For Gmail/Outlook production OAuth, replace the simulated connect endpoint with provider OAuth callbacks and map provider messages into the existing normalized email shape.

## Assignment mapping

| Requirement | Implementation |
|---|---|
| Onboarding + connection | Connect Email modal + simulated Gmail/Outlook |
| Assistant dashboard | Metrics, inbox, segments, search |
| Automatic responsibility | AI classification on seed data and new messages |
| Client-facing view | Dedicated client mode |
| Organization | Responsibility + action + importance filters |
| Conversation details | Detail drawer |
| AI assistance | Summary, insights, draft reply |
| Reply review | Draft editor before send |
| Responsive UX | Desktop/tablet/mobile CSS |
| Error/loading/empty | API state, skeleton, empty state, toasts |

## Demo disclaimer

The assignment permits simulated email data and integrations. The demo uses realistic seeded conversations so the reviewer can evaluate the complete product journey without granting access to a real mailbox.

## Suggested 3–4 minute demo

See `DEMO_SCRIPT.md`.

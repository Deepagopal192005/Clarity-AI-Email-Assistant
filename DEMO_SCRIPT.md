# Demo video script — Clarity

Target length: 3–4 minutes.

## 0:00–0:20 — Product intro

"Hi, I'm Deepa. I built Clarity, an AI-powered email management workspace for personal assistants who manage communication on behalf of clients.

The core problem I focused on is not just reading email — it is deciding who should actually respond."

## 0:20–0:55 — Onboarding and dashboard

"On onboarding, the assistant can connect a Gmail or Outlook account. For this prototype the OAuth connection is simulated, which keeps the demo safe and reproducible.

Once connected, the assistant lands on the dashboard. The top metrics immediately show unread mail, important conversations, action required, and items waiting for a response."

## 0:55–1:40 — AI responsibility classification

"The main AI workflow is responsibility classification.

Every conversation receives a visible classification: Assistant to Reply, Client to Reply, No Reply Needed, or Review when confidence is low.

For example, scheduling is assigned to the assistant, while an approval request is assigned to the client. Informational newsletters do not require a reply.

The important product decision is that AI is not the final authority. The assistant can manually override a classification."

Open an email and show:
- classification
- confidence / reason
- summary
- conversation history

## 1:40–2:20 — AI assistance

"Inside a conversation, the assistant gets an AI-generated summary and key information.

I can also ask the system to draft a professional response. The draft is editable and must be reviewed before it can be sent. This keeps the human in control."

Show draft generation and editing.

## 2:20–2:55 — Client view

"Clients do not need the full assistant dashboard. The client view is intentionally minimal.

It only surfaces conversations that need the client's personal attention, explains why, and lets the client either handle the matter or hand it back to the assistant."

Click "I'll handle this", switch to assistant view and show the updated state.

## 2:55–3:20 — Technical approach

"The frontend is React with Vite, the backend is Node and Express, and the data layer is MongoDB-ready.

For this prototype, realistic seeded email data is used and the Gmail/Outlook connection is simulated, which is explicitly allowed by the assignment. The AI service has an integration boundary for an OpenAI-compatible model and a deterministic fallback so the core experience remains testable without an API key."

## 3:20–3:40 — Close

"The result is a focused assistant-first workflow: understand the inbox quickly, let AI classify responsibility, keep humans in control, and give clients a much simpler experience.

Thanks for reviewing my submission."

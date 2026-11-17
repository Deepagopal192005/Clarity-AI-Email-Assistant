import "dotenv/config";
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
const port = process.env.PORT || 5000;
app.use(cors({ origin: true }));
app.use(express.json());

const seedAccounts = [
  { id: "acc_gmail", provider: "Gmail", email: "deepa@northstar.co", status: "Connected", lastSync: "Just now" },
  { id: "acc_outlook", provider: "Outlook", email: "ops@northstar.co", status: "Connected", lastSync: "8 min ago" }
];

const seedEmails = [
  {
    id:"e1", sender:"Aisha Rahman", email:"aisha@northstar.co", subject:"Approval needed: Q4 campaign budget",
    date:"Today · 9:42 AM", preview:"Could you approve the revised campaign budget by Thursday? I’ve attached the updated breakdown.",
    responsibility:"Client to Reply", confidence:96, important:true, actionRequired:true, waiting:false, category:"General", unread:true, archived:false, clientHandled:false,
    reason:"The sender is explicitly asking for the client's approval on a business decision.",
    summary:"Aisha needs approval for the revised Q4 campaign budget and is waiting for a decision by Thursday.",
    attachments:1,
    messages:[
      {name:"Aisha Rahman",time:"9:42 AM",body:"Hi Deepa,\nCould you approve the revised campaign budget by Thursday? I’ve attached the updated breakdown. The increase is mainly from the new launch assets and paid social allocation.\n\nThanks,\nAisha"},
      {name:"Deepa",time:"10:05 AM",body:"Thanks Aisha — I’ll review this with the client and get back to you.",fromMe:true}
    ]
  },
  {
    id:"e2", sender:"Marcus Lee", email:"marcus@studioarc.com", subject:"Can we move Friday's product review?",
    date:"Today · 8:51 AM", preview:"Our design lead has a conflict at 10:30. Would 2:00 PM work for your team?",
    responsibility:"Assistant to Reply", confidence:94, important:false, actionRequired:true, waiting:false, category:"Meetings", unread:true, archived:false, clientHandled:false,
    reason:"This is a scheduling change that can be handled by the assistant without a client decision.",
    summary:"Marcus wants to move Friday's product review from 10:30 AM to 2:00 PM because his design lead has a conflict.",
    attachments:0,
    messages:[
      {name:"Marcus Lee",time:"8:51 AM",body:"Hi Deepa,\nOur design lead has a conflict at 10:30. Would 2:00 PM work for your team?\nBest,\nMarcus"},
      {name:"Deepa",time:"9:03 AM",body:"I’ll check the calendar and confirm shortly.",fromMe:true}
    ]
  },
  {
    id:"e3", sender:"Stripe", email:"notifications@stripe.com", subject:"Your weekly account summary",
    date:"Yesterday · 6:15 PM", preview:"Your account had 12 successful payments this week. View your dashboard for details.",
    responsibility:"No Reply Needed", confidence:99, important:false, actionRequired:false, waiting:false, category:"General", unread:false, archived:false, clientHandled:false,
    reason:"This is an automated informational notification and does not ask for a response.",
    summary:"Stripe sent a weekly account summary showing 12 successful payments. No action is requested.",
    attachments:0,
    messages:[{name:"Stripe",time:"Yesterday · 6:15 PM",body:"Your account had 12 successful payments this week.\n\nView your dashboard for details."}]
  },
  {
    id:"e4", sender:"Priya Nair", email:"priya@peopleops.io", subject:"Re: Contractor agreement — signature",
    date:"Yesterday · 3:12 PM", preview:"The agreement is ready for signature. Please confirm the final rate and start date.",
    responsibility:"Client to Reply", confidence:91, important:true, actionRequired:true, waiting:true, category:"General", unread:false, archived:false, clientHandled:false,
    reason:"The sender needs the client's confirmation of commercial terms before the agreement can be finalized.",
    summary:"Priya needs confirmation of the final contractor rate and start date before sending the agreement for signature.",
    attachments:2,
    messages:[
      {name:"Priya Nair",time:"Yesterday · 3:12 PM",body:"Hi Deepa,\nThe agreement is ready for signature. Please confirm the final rate and start date so we can finalize it."},
      {name:"Deepa",time:"Yesterday · 4:01 PM",body:"I’ll confirm those details with the client.",fromMe:true}
    ]
  },
  {
    id:"e5", sender:"Rohan Mehta", email:"rohan@northstar.co", subject:"Follow-up: vendor onboarding checklist",
    date:"Yesterday · 11:27 AM", preview:"Just checking whether the remaining two documents are available. Happy to jump on a call.",
    responsibility:"Assistant to Reply", confidence:88, important:false, actionRequired:true, waiting:true, category:"General", unread:false, archived:false, clientHandled:false,
    reason:"This is a routine operational follow-up and the assistant can coordinate the missing documents.",
    summary:"Rohan is following up on two missing vendor onboarding documents and offers a call if needed.",
    attachments:0,
    messages:[
      {name:"Rohan Mehta",time:"Yesterday · 11:27 AM",body:"Hi Deepa,\nJust checking whether the remaining two documents are available. Happy to jump on a call if useful."},
      {name:"Deepa",time:"Yesterday · 12:10 PM",body:"Thanks — I’ll collect the documents and send them over.",fromMe:true}
    ]
  },
  {
    id:"e6", sender:"The Product Brief", email:"hello@productbrief.com", subject:"This week in product",
    date:"Mon · 7:02 AM", preview:"Five product lessons from teams shipping with AI, plus our latest interview.",
    responsibility:"No Reply Needed", confidence:98, important:false, actionRequired:false, waiting:false, category:"General", unread:false, archived:false, clientHandled:false,
    reason:"This is a newsletter with no response request.",
    summary:"A weekly product newsletter with five AI product lessons and an interview.",
    attachments:0,
    messages:[{name:"The Product Brief",time:"Mon · 7:02 AM",body:"Five product lessons from teams shipping with AI, plus our latest interview."}]
  },
  {
    id:"e7", sender:"Daniel Wong", email:"daniel@acmeventures.com", subject:"Quick thought on the partnership",
    date:"Mon · 5:40 PM", preview:"There are a few sensitive commercial points I’d prefer to discuss directly with the founder.",
    responsibility:"Review", confidence:62, important:true, actionRequired:true, waiting:false, category:"General", unread:false, archived:false, clientHandled:false,
    reason:"The message indicates a sensitive commercial discussion but does not clearly assign the response owner.",
    summary:"Daniel wants to discuss sensitive partnership terms directly with the founder; ownership is unclear.",
    attachments:0,
    messages:[{name:"Daniel Wong",time:"Mon · 5:40 PM",body:"Hi Deepa,\nThere are a few sensitive commercial points I’d prefer to discuss directly with the founder. Could you let me know the best way to coordinate?"}]
  },
  {
    id:"e8", sender:"Google Calendar", email:"calendar-notification@google.com", subject:"Event invitation: Product review",
    date:"Mon · 2:20 PM", preview:"You have been invited to Product review on Wednesday at 10:30 AM.",
    responsibility:"No Reply Needed", confidence:97, important:false, actionRequired:false, waiting:false, category:"Meetings", unread:false, archived:false, clientHandled:false,
    reason:"The calendar notification itself does not require an email reply.",
    summary:"Calendar invitation for Product review on Wednesday at 10:30 AM.",
    attachments:0,
    messages:[{name:"Google Calendar",time:"Mon · 2:20 PM",body:"You have been invited to Product review on Wednesday at 10:30 AM."}]
  }
];

let emails = structuredClone(seedEmails);
let accounts = structuredClone(seedAccounts);

let mongo = null;
if (process.env.MONGODB_URI) {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    mongo = client.db("clarity_email");
    console.log("MongoDB connected");
  } catch (err) {
    console.warn("MongoDB unavailable; using in-memory demo data.", err.message);
  }
}

async function getEmails() {
  if (!mongo) return emails.filter(e => !e.archived);
  const docs = await mongo.collection("emails").find({ archived: { $ne: true } }).toArray();
  return docs.length ? docs : emails.filter(e => !e.archived);
}
async function saveEmail(updated) {
  if (mongo) await mongo.collection("emails").replaceOne({ id: updated.id }, updated, { upsert: true });
  emails = emails.map(e => e.id === updated.id ? updated : e);
}

function heuristicClassify(email) {
  const text = `${email.subject} ${email.preview} ${email.messages?.map(m => m.body).join(" ") || ""}`.toLowerCase();
  if (/newsletter|unsubscribe|weekly account summary|notification|receipt|no action/.test(text)) {
    return { responsibility:"No Reply Needed", confidence:98, reason:"The conversation appears informational or automated and does not request a response." };
  }
  if (/approve|approval|signature|sign|decision|confirm the final|founder|personal input|sensitive|rate and start date/.test(text)) {
    return { responsibility:"Client to Reply", confidence:94, reason:"The message requests a personal decision, approval, confirmation or sensitive client input." };
  }
  if (/schedule|reschedule|move .*meeting|calendar|onboarding|documents|follow-up|follow up|checking whether/.test(text)) {
    return { responsibility:"Assistant to Reply", confidence:91, reason:"The request is administrative or operational and can be handled by the assistant." };
  }
  return { responsibility:"Review", confidence:61, reason:"The intent is ambiguous, so the assistant should review the conversation before assigning responsibility." };
}

async function callAI(prompt) {
  if (!process.env.OPENAI_API_KEY) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${process.env.OPENAI_API_KEY}` },
    body:JSON.stringify({
      model,
      temperature:0.2,
      messages:[
        {role:"system",content:"You are an email operations assistant. Be concise, accurate, and never invent facts."},
        {role:"user",content:prompt}
      ]
    })
  });
  if (!res.ok) throw new Error(`AI provider returned ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

app.get("/api/health", (_, res) => res.json({ ok:true, mode:process.env.OPENAI_API_KEY ? "ai" : "demo" }));
app.get("/api/accounts", (_, res) => res.json({ accounts }));
app.post("/api/accounts/connect", async (req,res) => {
  const provider = req.body.provider === "Outlook" ? "Outlook" : "Gmail";
  const account = { id:`acc_${provider.toLowerCase()}`, provider, email:provider === "Gmail" ? "deepa@northstar.co" : "ops@northstar.co", status:"Connected", lastSync:"Just now" };
  accounts = [...accounts.filter(a => a.id !== account.id), account];
  res.json({ accounts, simulated:true });
});
app.post("/api/accounts/:id/sync", (req,res) => {
  accounts = accounts.map(a => a.id === req.params.id ? {...a,lastSync:"Just now",status:"Connected"} : a);
  res.json({ accounts, simulated:true });
});

app.get("/api/emails", async (_,res) => {
  res.json({ emails: await getEmails() });
});

app.patch("/api/emails/:id", async (req,res) => {
  const current = emails.find(e => e.id === req.params.id);
  if (!current) return res.status(404).json({message:"Conversation not found"});
  const allowed = ["responsibility","important","unread","archived","clientHandled","actionRequired"];
  const updated = {...current};
  for (const key of allowed) if (key in req.body) updated[key] = req.body[key];
  await saveEmail(updated);
  res.json({ emails: await getEmails() });
});

app.post("/api/ai/classify", async (req,res) => {
  const email = req.body.email;
  if (!email) return res.status(400).json({message:"Email is required"});
  try {
    const ai = await callAI(`Classify this email as exactly one of: Assistant to Reply, Client to Reply, No Reply Needed, Review. Return JSON with keys responsibility, confidence (0-100), reason. Conversation: ${JSON.stringify(email)}`);
    if (ai) {
      const parsed = JSON.parse(ai.replace(/```json|```/g,"").trim());
      return res.json(parsed);
    }
  } catch {}
  res.json(heuristicClassify(email));
});

app.post("/api/ai/summarize", async (req,res) => {
  const email = req.body.email;
  if (!email) return res.status(400).json({message:"Email is required"});
  try {
    const ai = await callAI(`Summarize this email conversation in 1-2 sentences. Then mention the single most important next step. Keep it factual. Conversation: ${JSON.stringify(email)}`);
    if (ai) return res.json({ summary:ai });
  } catch {}
  const c = heuristicClassify(email);
  res.json({ summary:`${email.subject}. ${c.reason}` });
});

app.post("/api/ai/draft", async (req,res) => {
  const email = req.body.email;
  const instruction = req.body.instruction || "Write a concise professional reply.";
  if (!email) return res.status(400).json({message:"Email is required"});
  try {
    const ai = await callAI(`${instruction}\n\nDraft only the email body, no subject and no signature unless already known. Conversation: ${JSON.stringify(email)}`);
    if (ai) return res.json({ draft:ai });
  } catch {}
  const fallback = email.responsibility === "Client to Reply"
    ? `Hi ${email.sender.split(" ")[0]},\n\nThanks for the note. I’ll review this with the client and get back to you shortly.\n\nBest,\nDeepa`
    : `Hi ${email.sender.split(" ")[0]},\n\nThanks for reaching out. I’m reviewing this now and will follow up with the next steps shortly.\n\nBest,\nDeepa`;
  res.json({ draft:fallback });
});

const clientDist = new URL("../client/dist/", import.meta.url);
if (process.env.SERVE_CLIENT === "true") {
  const { default: path } = await import("node:path");
  app.use(express.static(clientDist));
  app.get("*", (_,res) => res.sendFile(path.resolve(clientDist.pathname, "index.html")));
}

app.listen(port, () => console.log(`Clarity API running on http://localhost:${port}`));

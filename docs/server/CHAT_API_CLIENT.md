# AI Chat API — client integration guide

How a client app talks to the HK server's AI chat endpoints. Everything here lives under
`/api/chat-conversations` plus one polling route under `/api/ai-flow-manager`.

There are **two rails**, and they return the *same message JSON*, so one renderer handles both:

| Rail | Transcript stored in | Use when |
|---|---|---|
| **Conversation** | `Chat_Conversation_Messages` (a conversation row scopes it) | The screen has its own thread — a sidebar of past conversations, a per-page mini chat. |
| **WhatsApp-backed** | `Messages` (the shared WhatsApp thread) | The customer's chat should be *one continuous conversation* with their WhatsApp. No conversation row exists; `conversation_id` is `null` everywhere. |

The second rail matters because a customer who asks something on the screen and something over
WhatsApp is having **one** conversation. Both flows read and write the same rows, so each sees
the other's turns.

---

## Conventions

**Auth.** Every route needs `Authorization: Bearer <JWT>`. All chat routes additionally require
a **User_Accounts** session — a legacy-store token gets `403 { success: false, message: "This
endpoint is available only for User_Accounts sessions" }`.

The token itself must carry a legacy-user bridge. Auth rejects a User_Accounts token whose
account has no `legacy_user_id` with `401 "User account is missing its legacy user bridge"`, so
by the time a request reaches a handler, the caller's bridge is guaranteed present.

**Response envelope.** Every `/api/chat-conversations` route returns:

```jsonc
// success
{ "success": true, "data": { /* ... */ } }
// failure
{ "success": false, "error": { "code": "NO_CHAT_FLOW_ROUTED", "message": "..." } }
```

The session-status route under `/api/ai-flow-manager` is the **one exception** — it returns a
bare object with no envelope. Don't unwrap `.data` there.

**`:companyId`** is in the path on every route and is authorized per-request; a company the
caller can't access fails before the handler runs.

---

## The send loop

Sending is asynchronous on both rails. A send returns `202` immediately — the assistant's reply
is produced by a background flow.

```
POST …/messages  ──▶ 202 { userMessage, assistantMessage, sessionId }
                          │
                          ├─ poll GET /api/ai-flow-manager/sessions/{sessionId}/status
                          │      until  finished === true
                          │
                          └─▶ re-fetch the messages endpoint (the durable source of truth)
```

Poll the session for *completion signalling only*, then re-read the messages endpoint for the
actual content. Never render the reply straight from the session payload.

### Session status

`GET /api/ai-flow-manager/sessions/:sessionId/status` → **bare object, no envelope**:

```jsonc
{
  "sessionId": "0f2c…-…",
  "status": "RUNNING",          // RUNNING | COMPLETED | FAILED | STOPPED
  "currentStep": 2,
  "currentGroupName": "האקי",   // handy for a "thinking about…" indicator
  "output": { },
  "pending_question": null,
  "finished": false             // true once status is COMPLETED | FAILED | STOPPED
}
```

Stop polling on `finished: true` — including `FAILED`/`STOPPED`, which are terminal. A `404
{ "error": "Session not found" }` also means stop; it covers both a missing session and one the
caller isn't allowed to poll.

---

## The message object

Identical on both rails, so a single component renders either:

```jsonc
{
  "id": 8412,
  "conversation_id": 57,        // null on the WhatsApp-backed rail
  "company_id": 7,
  "user_id": 1204,              // sender for user rows; null for assistant rows. NOTE: this is a
                                // User_Accounts id on the conversation rail but a legacy Users id
                                // on the WhatsApp rail — never compare the two across rails.
  "role": "user",               // "user" | "assistant" (a conversation may also hold "system" rows)
  "content": "כמה הוצאתי החודש?",
  "message_type": "text",       // "text" | "file"
  "status": "complete",         // "complete" | "pending" | "error"
  "input_type": "text",         // "text" | "voice" | null
  "session_id": "0f2c…-…",      // the flow run behind this turn
  "run_id": "36",
  "error": null,                // populated when status === "error"
  "metadata": {},
  "created_at": "2026-09-06T09:14:02.113Z",
  "updated_at": "2026-09-06T09:14:02.113Z"
}
```

Messages come back **oldest → newest**.

**`content` never contains markup.** The server strips the internal `<message_id>` /
`<user_incoming_message>` markers that the AI flows use — those are an agent-facing detail. What
you get is the plain message text, ready to render.

### `metadata` on the WhatsApp rail

WhatsApp rows carry facts the conversation shape has no column for:

```jsonc
"metadata": {
  "source": "whatsapp",
  "kind": "ai_to_customer",   // see below
  "quoted_reply": false,
  "file_id": null
}
```

`kind` classifies who produced the turn, which is worth styling differently:

| `kind` | Meaning |
|---|---|
| `user_incoming_message` | The customer wrote it. |
| `user_incoming_file` | The customer sent a file (`file_id` is set). |
| `ai_to_customer` | The AI answered. |
| `operator_to_customer` | **A human HK operator wrote it** — not the AI. |
| `system_event_to_customer` | An automated system/event message. |
| `message` | Uncategorized. |

⚠️ **`id` is not unique on this rail.** A quoted reply isn't stored as its own row — it's
recorded on the message it replied to — so it surfaces as a synthetic turn carrying *that
message's* id with `quoted_reply: true`. Key lists on `` `${id}-${metadata.quoted_reply}` ``, not
on `id` alone.

---

## Rail 1 — Conversations

### List conversations

`GET /api/chat-conversations/:companyId/conversations`

Query: `user_id` (returns that user's conversations **plus** company-level ones with a null
`user_id`), `status`, `type`, `limit` (default 100).

`data` is an array of conversation objects:

```jsonc
{
  "id": 57, "company_id": 7, "user_id": 1204,
  "title": "כמה הוצאתי החודש?",     // auto-derived from the first message, ≤80 chars
  "status": "active",
  "entry_point": "customer_chat_message",
  "type": "cashflow",
  "chat_context": { },
  "last_message_at": "2026-09-06T09:14:02.113Z",
  "message_count": 6,
  "metadata": {},
  "created_at": "…", "updated_at": "…"
}
```

Sorted by `last_message_at` descending (nulls last), then newest-created.

### Create a conversation

`POST /api/chat-conversations/:companyId/conversations` → `201`

```jsonc
{
  "title": null,                              // optional; the first message names it anyway
  "user_id": 1204,                            // defaults to the authenticated account
  "entry_point": "customer_chat_message",     // see below
  "type": "cashflow",                         // optional page/kind label
  "chat_context": { }                         // optional page seed data
}
```

**`entry_point` picks the audience and is fixed for the conversation's whole life:**

- `chat_message` — the HK **consultant** screen (staff discussing a client company). **Default**
  for anything unrecognized.
- `customer_chat_message` — the **customer's own** screen.

The server never infers this from the caller's role, so send it deliberately.

**`type` / `chat_context` are set once.** `type` must be a lowercase slug (`^[a-z0-9][a-z0-9_-]{0,31}$`)
or you get `400 INVALID_CONVERSATION_TYPE`. `chat_context` is page seed data re-injected into
the agent on *every* turn, so it survives the history window. A later send can only *back-fill*
these while still null — it can never overwrite them.

`type: "cashflow"` is validated against a strict schema; a malformed payload returns `400
INVALID_CASHFLOW_CONTEXT` naming the offending field.

### Fetch messages

`GET /api/chat-conversations/:companyId/conversations/:conversationId/messages`

Query: `after` (id cursor — returns only rows with a greater id, for delta polling), `limit`
(default 500).

```jsonc
{ "conversation": { /* conversation object */ }, "messages": [ /* message objects */ ] }
```

`404 NOT_FOUND` if the conversation doesn't exist or isn't in this company.

### Send a message

`POST /api/chat-conversations/:companyId/conversations/:conversationId/messages` → `202`

```jsonc
{ "content": "כמה הוצאתי החודש?", "message_type": "text" }
```

```jsonc
{
  "conversation":     { /* … */ },
  "userMessage":      { /* the persisted user row */ },
  "assistantMessage": { /* placeholder, status "pending", content "" */ },
  "sessionId": "0f2c…-…"
}
```

On this rail you get a **pending assistant placeholder** you can render immediately as a
typing/skeleton bubble. The background flow completes that same row, so after polling, re-fetch
and the row keeps its `id` — it just gains content and flips to `complete` (or `error`).

### Rename / archive / delete

- `PATCH …/conversations/:conversationId` — `{ "title": "…" }` and/or `{ "status": "…" }`.
  Both are free-form (`status` is a 16-char string, `active` by default).
  ⚠️ To clear a title send `title: ""` (an **empty string**), not `null` — the handler only acts
  on `title` when `typeof title === "string"`, so `null` is ignored, and a PATCH carrying nothing
  else actionable returns `404`.
- `DELETE …/conversations/:conversationId` → `{ "deleted": true }`. Soft-deletes the
  conversation and its messages.

Both return `404 NOT_FOUND` for an unknown conversation.

---

## Rail 2 — WhatsApp-backed chat (no conversation)

Use this when the customer's chat should be continuous with their WhatsApp thread. There is no
conversation to create — just read and send.

### Fetch the thread

`GET /api/chat-conversations/whatsapp/:companyId/messages`

Query: `user_account_id` (defaults to the authenticated account), `limit` (default 30).

```jsonc
{ "conversation": null, "messages": [ /* message objects, oldest → newest */ ] }
```

`conversation` is always `null` — a deliberate shape match with the conversation rail so the same
code path handles both.

### Send a message

`POST /api/chat-conversations/whatsapp/:companyId/messages` → `202`

```jsonc
{ "content": "כמה הוצאתי החודש?", "user_account_id": 1204, "message_type": "text" }
```

```jsonc
{
  "conversation": null,
  "userMessage": { /* the persisted user row, conversation_id: null */ },
  "assistantMessage": null,
  "sessionId": "0f2c…-…"
}
```

⚠️ **`assistantMessage` is always `null` here** — unlike the conversation rail, no placeholder
row exists (the `Messages` table has no pending-row concept). The reply row is only created when
the flow finishes. So:

1. Render your own local "thinking" indicator; don't expect a server row to hang it on.
2. Poll the session.
3. Re-fetch `GET …/whatsapp/:companyId/messages` — the assistant turn appears then.

This always routes through the `customer_chat_message` flow.

### What this rail writes

Both turns are written into the shared `Messages` table, marked exactly like ordinary WhatsApp
rows, so every existing back-office screen treats them the same. **Nothing is delivered to
WhatsApp/Meta** — these are database rows only. The customer does *not* receive a WhatsApp
message as a side effect of using the chat screen.

---

## Errors

| Status | `code` | Meaning |
|---|---|---|
| `400` | `INVALID_CHAT_REQUEST` | Missing/blank `content`, invalid `companyId`. |
| `400` | `INVALID_CONVERSATION_TYPE` | `type` isn't a valid lowercase slug. |
| `400` | `INVALID_CASHFLOW_CONTEXT` | `chat_context` failed the cashflow schema; message names the field. |
| `403` | — | Not a User_Accounts session (`{ success, message }`, no `error` object). |
| `404` | `NOT_FOUND` | Unknown conversation, or not in this company. |
| `404` | `NO_WHATSAPP_CHAT_IDENTITY` | The target account has no legacy-user bridge or no phone number, so it has no WhatsApp thread. **Not retryable** — it's a data problem on the account. Fall back to the conversation rail. |
| `409` | `NO_CHAT_FLOW_ROUTED` | No AI flow is configured for this entry point. An operator configuration problem, not a client bug — surface it plainly and don't retry. |
| `5xx` | `CHAT_CONVERSATIONS_FAILED` | Server error; `message` is generic by design. |

A `409` is worth distinguishing in the UI: the send genuinely didn't happen and retrying the same
request will fail identically until someone configures the route.

---

## Worked example

```js
const BASE = '/api/chat-conversations';
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

const unwrap = async (res) => {
  const body = await res.json();
  if (!body.success) throw Object.assign(new Error(body.error.message), { code: body.error.code });
  return body.data;
};

// Poll until the run finishes. Note: NO envelope on this route.
async function waitForRun(sessionId, { signal } = {}) {
  while (true) {
    const res = await fetch(`/api/ai-flow-manager/sessions/${sessionId}/status`, { headers, signal });
    if (res.status === 404) return 'FAILED';        // gone, or not ours to poll
    const s = await res.json();
    if (s.finished) return s.status;                 // COMPLETED | FAILED | STOPPED
    await new Promise(r => setTimeout(r, 800));
  }
}

// ── WhatsApp-backed rail ────────────────────────────────────────────────────
async function sendWhatsappChat(companyId, content) {
  const { sessionId } = await fetch(`${BASE}/whatsapp/${companyId}/messages`, {
    method: 'POST', headers, body: JSON.stringify({ content }),
  }).then(unwrap);

  // assistantMessage is null on this rail — show a local indicator until the run ends.
  const status = await waitForRun(sessionId);

  const { messages } = await fetch(`${BASE}/whatsapp/${companyId}/messages`, { headers })
    .then(unwrap);
  return { messages, status };
}

// ── Conversation rail ───────────────────────────────────────────────────────
async function sendConversationChat(companyId, conversationId, content) {
  // assistantMessage comes back as a pending placeholder you can render right away.
  const { assistantMessage, sessionId } = await fetch(
    `${BASE}/${companyId}/conversations/${conversationId}/messages`,
    { method: 'POST', headers, body: JSON.stringify({ content }) },
  ).then(unwrap);

  await waitForRun(sessionId);

  // The placeholder keeps its id — it just fills in.
  const { messages } = await fetch(
    `${BASE}/${companyId}/conversations/${conversationId}/messages`, { headers },
  ).then(unwrap);
  return { messages, placeholderId: assistantMessage.id };
}
```

---

## Gotchas

- **Don't unwrap `.data` on the session-status route.** It's the only route without the envelope.
- **Poll the session; read the messages endpoint.** The session tells you *when*, the messages
  endpoint tells you *what*. The stored transcript is the source of truth.
- **`FAILED` and `STOPPED` are terminal.** Treat them as "stop polling", not "keep waiting". On
  the conversation rail the placeholder row flips to `status: "error"` with a populated `error`.
- **`entry_point` is chosen once, at creation**, and can't be changed later.
- **`id` can repeat on the WhatsApp rail** (quoted replies). Build list keys accordingly.
- **`assistantMessage` is `null` on the WhatsApp rail** but a pending row on the conversation
  rail — the one place the two rails' *send* responses genuinely differ.
- **A WhatsApp-rail send doesn't message the customer.** It only writes rows.

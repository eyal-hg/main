# AI Chat — conversation `type` & `chat_context`

Two conversation-level fields on `Chat_Conversations` let you run **per-page "mini chats"**: a page
opens its own scoped chat, seeds the agent with page-specific data, and the AI chat screen can list
every conversation labeled by where it came from.

| Field | Column | Type | Purpose |
|---|---|---|---|
| `type` | `Chat_Conversations.type` | `VARCHAR(32)`, nullable | A page/kind label (`'cashflow'`, `'insights'`, …). Filters each page's list and labels the conversation on the AI chat screen. |
| `chat_context` | `Chat_Conversations.chat_context` | `JSONB`, nullable | Page-specific seed data given to the agent. Stored on the conversation and re-injected **every turn**. |

Migration: `migrations/20260903140000-add-type-and-chat-context-to-chat-conversations.js`
(adds both columns + index `chat_conversations_type_idx` on `(company_id, type, last_message_at DESC)`).

---

## Mental model (read this first)

- **Both are conversation-level and set once.** They describe the *whole* mini-chat, not a single
  message. Send them when the conversation begins; you don't resend them on every message.
- **They are "set-if-missing".** Once a conversation has a `type` / `chat_context`, a later request
  **cannot overwrite it** — a new value is only written while the column is still `NULL`.
- **`chat_context` is NOT stored in a message.** Each flow run is *stateless*: the agent starts
  blank every turn and its context is rebuilt from the DB by `load_chat_history`. That history read is
  **windowed to the recent ~30 messages**, so anything baked into the first message is silently
  dropped once the chat grows. Storing it on the conversation row means it is re-read and re-injected
  on **every** turn, forever — and it never appears as a visible chat bubble.

---

## When to send what

### `type` — almost always, when the chat is page-scoped
Send it the moment you create a page's conversation. Use a **stable, lowercase slug per page/feature**
(e.g. `cashflow`, `insights`, `checks`). It drives:
- the per-page list: `GET …/conversations?type=cashflow` → only that page's chats;
- the label shown on the global AI chat screen.

Omit `type` for a general, page-agnostic conversation (it stays `NULL` and simply won't be filtered
into any page list).

### `chat_context` — only when the agent needs page data it can't get otherwise
Send it at creation when the page has data the agent should reason over from turn 1 — the report the
user is looking at, the selected entity, the current filters, etc. Keep it **compact and relevant**;
it is injected into the prompt on every turn, so large blobs cost tokens each time.

Do **not** send `chat_context` for:
- data the agent already fetches through its own skills/tools (don't duplicate it);
- anything user-visible you want rendered as a message (that's a normal message, not context);
- per-turn changes — context is set once. If the page state changes materially mid-chat, start a new
  conversation (recommended) rather than expecting an update to take effect.

---

## API surface

### Create a conversation (preferred place to set both)
`POST /api/chat-conversations/:companyId/conversations`
```json
{
  "title": "optional",
  "user_id": 123,
  "type": "cashflow",
  "chat_context": {
    "report_id": 987,
    "period": "2026-07",
    "focus": "unusual outflows"
  }
}
```

### Send a message
`POST /api/chat-conversations/:companyId/conversations/:conversationId/messages`
```json
{ "content": "מה חריג בתזרים?", "type": "cashflow", "chat_context": { "...": "..." } }
```
`type` / `chat_context` here are **optional back-fills**: they are written onto the conversation only
if it doesn't already have them. Normal sends just pass `content`. Returns `202` with a pending
assistant placeholder + `sessionId` to poll (see `docs/ai-chat.md`).

### List a page's conversations
`GET /api/chat-conversations/:companyId/conversations?type=cashflow&status=active`
Returns conversations of that type, newest first. Each item includes `type` and `chat_context`.

> The entry point `chat_message` also declares `type` and `chat_context` as inputs, so a flow can
> read them from the entry payload — but persistence is handled server-side; you don't wire that up.

---

## How `chat_context` reaches the agent

`load_chat_history` reads `conversation.chat_context` and prepends it to the transcript as a stable
block before the message history:

```
הקשר:
{
  "report_id": 987,
  "period": "2026-07",
  "focus": "unusual outflows"
}

משתמש: מה חריג בתזרים?
עוזר: ...
```

- Objects are pretty-printed JSON; strings pass through as-is; `null`/empty adds nothing.
- The agent's existing `{{history}}`/`transcript` binding already carries it — **no flow change
  needed**. The skill also exposes a separate `chat_context` output field if you want to bind it on
  its own.

---

## Quick recipe for a new page chat

1. On page open, `POST …/conversations` with `type: "<page-slug>"` and a compact `chat_context`.
2. Render that page's chat list via `GET …/conversations?type=<page-slug>`.
3. Send messages with just `{ content }`; poll the session; re-fetch messages.
4. The agent sees your `chat_context` on every turn automatically.

# הוראות לחיבור Meta Lead Ads דרך הכפתור

מסמך זה מתאר כיצד להפוך את כפתור "חבר Meta" ב-`leads.html` (מוקאפ) לזרימה אמיתית של חיבור Meta Lead Ads — מ-OAuth ועד קליטת לידים דרך Webhook.

---

## 1. הכנה ב-Meta for Developers

### צור Meta App
1. היכנס ל-[developers.facebook.com](https://developers.facebook.com) → My Apps → **Create App**
2. Type: **"Business"**
3. הוסף Products: **Facebook Login** + **Webhooks**

### אסוף את המזהים
- `APP_ID` — מתוך App Dashboard
- `APP_SECRET` — מתוך Settings → Basic
- `VERIFY_TOKEN` — מחרוזת אקראית שאתה ממציא (לאימות webhook)

### הרשאות שצריך לבקש
```
pages_show_list
pages_read_engagement
pages_manage_metadata
leads_retrieval
business_management
```

> ⚠️ **App Review** של Meta נדרש לפני שזה רץ בפרודקשן (בקש review בלשונית App Review באפליקציה).

---

## 2. Frontend — מה הכפתור צריך לעשות

החלף את `startMetaOauth()` המדומה ב-`leads.html` בקריאה אמיתית ל-Facebook OAuth:

```js
function startMetaOauth(){
  const APP_ID = 'YOUR_APP_ID';
  const REDIRECT_URI = encodeURIComponent('https://yourdomain.com/api/meta/callback');
  const SCOPES = 'pages_show_list,pages_read_engagement,leads_retrieval,business_management';
  const STATE = generateRandomState(); // שמור ב-sessionStorage למניעת CSRF

  const url = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${APP_ID}` +
    `&redirect_uri=${REDIRECT_URI}` +
    `&scope=${SCOPES}` +
    `&response_type=code` +
    `&state=${STATE}`;

  // חלון popup או redirect
  const popup = window.open(url, 'meta-oauth', 'width=600,height=700');

  // האזן להודעה מ-backend אחרי שה-callback הצליח
  window.addEventListener('message', (e) => {
    if (e.origin !== window.location.origin) return;
    if (e.data.type === 'meta:connected'){
      metaConnected = true;
      metaAccount = e.data.account;
      renderMetaModal();
      updateMetaBtn();
      popup.close();
    }
  });
}
```

בעת טעינת הדף בדוק סטטוס חיבור קיים:

```js
async function loadMetaStatus(){
  const res = await fetch('/api/meta/status');
  const { connected, account } = await res.json();
  metaConnected = connected;
  metaAccount = account || null;
  updateMetaBtn();
}
loadMetaStatus();
```

---

## 3. Backend — Endpoints

### `GET /api/meta/callback`
מקבל את ה-`code` ש-Facebook מחזיר אחרי הרשאה. מחליף ל-access token, מושך עמודים, נרשם ל-webhooks.

```js
app.get('/api/meta/callback', async (req, res) => {
  const { code, state } = req.query;
  // ⚠️ אמת את ה-state מול ה-session

  // 1. Exchange code for short-lived token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `client_id=${APP_ID}&client_secret=${APP_SECRET}&` +
    `redirect_uri=${REDIRECT_URI}&code=${code}`
  );
  const { access_token: userToken } = await tokenRes.json();

  // 2. Long-lived token (60 days)
  const longRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `grant_type=fb_exchange_token&client_id=${APP_ID}&` +
    `client_secret=${APP_SECRET}&fb_exchange_token=${userToken}`
  );
  const { access_token: longUserToken } = await longRes.json();

  // 3. Get user's pages + Page Access Tokens (אלו לא יפוגו)
  const pagesRes = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${longUserToken}`
  );
  const { data: pages } = await pagesRes.json();

  // 4. שמור ב-DB
  for (const page of pages){
    await db.metaConnections.upsert({
      pageId: page.id,
      pageName: page.name,
      pageAccessToken: encrypt(page.access_token), // ⚠️ הצפן!
    });
  }

  // 5. הירשם ל-webhooks של כל עמוד
  for (const page of pages){
    await fetch(
      `https://graph.facebook.com/v18.0/${page.id}/subscribed_apps?` +
      `subscribed_fields=leadgen&access_token=${page.access_token}`,
      { method:'POST' }
    );
  }

  // 6. שלח חזרה לחלון הראשי
  const firstPage = pages[0];
  res.send(`<script>
    window.opener.postMessage({
      type:'meta:connected',
      account:${JSON.stringify({
        pageName: firstPage.name,
        pageId: firstPage.id,
        forms: [],
      })}
    }, '${process.env.FRONTEND_URL}');
  </script>`);
});
```

### `GET /api/meta/webhook` — Verification (חד-פעמי)
Meta שולחת בקשת אימות כשמגדירים את ה-webhook:

```js
app.get('/api/meta/webhook', (req, res) => {
  const mode  = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN){
    res.send(challenge);
  } else {
    res.sendStatus(403);
  }
});
```

### `POST /api/meta/webhook` — קליטת לידים חדשים

```js
app.post('/api/meta/webhook', async (req, res) => {
  res.sendStatus(200); // ⚠️ החזר 200 מיד (Meta דורשת <5s)

  // אמת את החתימה
  const sig = req.headers['x-hub-signature-256'];
  if (!verifySignature(req.rawBody, sig, APP_SECRET)) return;

  for (const entry of req.body.entry){
    for (const change of entry.changes){
      if (change.field !== 'leadgen') continue;
      const { leadgen_id, page_id, form_id } = change.value;

      // הוצא Page Access Token מ-DB
      const conn = await db.metaConnections.findByPageId(page_id);
      const token = decrypt(conn.pageAccessToken);

      // משוך פרטים מלאים של הליד
      const leadRes = await fetch(
        `https://graph.facebook.com/v18.0/${leadgen_id}` +
        `?fields=field_data,created_time,campaign_name,ad_name,form_name` +
        `&access_token=${token}`
      );
      const lead = await leadRes.json();

      // lead.field_data = [{name:'full_name', values:['אבי כהן']}, ...]
      const fields = Object.fromEntries(
        lead.field_data.map(f => [f.name, f.values[0]])
      );

      // INSERT עם UPSERT לפי metaLeadId למניעת כפילויות
      await db.leads.upsert({
        metaLeadId: leadgen_id,
        name:    fields.full_name,
        phone:   fields.phone_number,
        email:   fields.email,
        source:  {
          channel:  'פייסבוק',
          campaign: lead.campaign_name,
          ad:       lead.ad_name,
          form:     lead.form_name,
        },
        stage:   'new',
        notes:   '',
        created: new Date(lead.created_time),
      });

      // התראה ל-frontend (WebSocket/SSE/polling)
      pushNotification({type:'new-lead', leadId: lead.id});
    }
  }
});
```

### `GET /api/meta/forms` — רשימת הטפסים (להצגה במודאל)

```js
app.get('/api/meta/forms', async (req, res) => {
  const conn = await db.metaConnections.findOne();
  const formsRes = await fetch(
    `https://graph.facebook.com/v18.0/${conn.pageId}/leadgen_forms` +
    `?fields=name,status,leads_count` +
    `&access_token=${decrypt(conn.pageAccessToken)}`
  );
  const { data } = await formsRes.json();
  res.json(data);
});
```

### `GET /api/meta/status` — לבדיקה אם מחובר (בטעינת הדף)

```js
app.get('/api/meta/status', async (req, res) => {
  const conn = await db.metaConnections.findOne();
  if (!conn) return res.json({ connected: false });
  res.json({
    connected: true,
    account: {
      pageName: conn.pageName,
      pageId: conn.pageId,
      businessName: conn.businessName,
      forms: await fetchForms(conn),
    },
  });
});
```

### `DELETE /api/meta/connection` — ניתוק (כפתור "נתק")

```js
app.delete('/api/meta/connection', async (req, res) => {
  const conn = await db.metaConnections.findOne();
  if (conn){
    // בטל את ה-webhook subscription
    await fetch(
      `https://graph.facebook.com/v18.0/${conn.pageId}/subscribed_apps?` +
      `access_token=${decrypt(conn.pageAccessToken)}`,
      { method:'DELETE' }
    );
    await db.metaConnections.delete(conn.id);
  }
  res.sendStatus(204);
});
```

---

## 4. הגדרת ה-Webhook ב-Meta

ב-App Dashboard → **Webhooks** → **Page**:

1. **Callback URL**: `https://yourdomain.com/api/meta/webhook`
2. **Verify Token**: אותה מחרוזת שב-`VERIFY_TOKEN`
3. **Subscribe** לשדה: `leadgen`

---

## 5. סדר עבודה מומלץ

| # | שלב | סטטוס |
|---|-----|------|
| 1 | הקם Meta App במצב **Development** | ☐ |
| 2 | הוסף את עצמך כ-**Test User** ב-App Dashboard | ☐ |
| 3 | בנה את `/api/meta/callback` ובדוק שאתה מקבל token | ☐ |
| 4 | הוסף webhook + שלח Test Lead מ-[Lead Ads Testing Tool](https://developers.facebook.com/tools/lead-ads-testing) | ☐ |
| 5 | ודא שהליד נכנס ל-DB ומופיע במסך הלידים | ☐ |
| 6 | חבר את ה-frontend (`startMetaOauth`) ל-backend האמיתי | ☐ |
| 7 | הגש **App Review** ב-Meta (~2 שבועות) | ☐ |
| 8 | עבור ל-Production | ☐ |

---

## 6. נקודות חשובות

- **Page Access Token לא יפוג** (אחרי המרה ל-long-lived). שמור **מוצפן** ב-DB (`AES-256-GCM`).
- **כפילויות**: שמור `metaLeadId` ועשה UPSERT. Meta עלולה לשלוח את אותו webhook פעמיים.
- **חתימת webhook**: אמת תמיד `X-Hub-Signature-256` ב-HMAC SHA-256:
  ```js
  function verifySignature(body, signature, secret){
    const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }
  ```
- **GDPR / מחיקה**: Meta דורשת מחיקת ליד תוך 90 יום אם המשתמש מבקש.
- **Frontend update**: השתמש ב-WebSocket / SSE כדי שהמסך יתרענן בזמן אמת, או polling כל 30 שניות ל-`/api/leads?since=<timestamp>`.
- **Rate limits**: Meta מגבילה ~200 קריאות לשעה לכל user token. הימנע מבזבוז.
- **שדות בטופס משתנים בין קמפיינים**. אל תניח ששדה `phone_number` קיים — בנה מיפוי שמטפל בחסר.

---

## 7. מבנה DB מוצע

### `meta_connections`
```sql
CREATE TABLE meta_connections (
  id              BIGSERIAL PRIMARY KEY,
  page_id         VARCHAR(64) UNIQUE NOT NULL,
  page_name       VARCHAR(255) NOT NULL,
  business_name   VARCHAR(255),
  business_id     VARCHAR(64),
  access_token    TEXT NOT NULL, -- מוצפן
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `leads` (תוספות לסכמה הקיימת)
```sql
ALTER TABLE leads
  ADD COLUMN meta_lead_id   VARCHAR(64) UNIQUE,
  ADD COLUMN source_channel VARCHAR(32),
  ADD COLUMN source_campaign VARCHAR(255),
  ADD COLUMN source_ad      VARCHAR(255),
  ADD COLUMN source_form    VARCHAR(255);

CREATE INDEX idx_leads_meta_lead_id ON leads(meta_lead_id);
```

---

## 8. סיכום בקצרה

| חלק | מה צריך |
|-----|---------|
| **Frontend** | החלפת `startMetaOauth` בקריאת OAuth אמיתית, התחברות ל-`/api/meta/status` בטעינה |
| **Backend** | 5 endpoints: `callback`, `webhook` (GET+POST), `forms`, `status`, `disconnect` |
| **DB** | טבלת `meta_connections` + עמודות `meta_*` ב-`leads` |
| **Meta side** | App ב-Development → App Review → Production |
| **רמת מאמץ** | ~3-5 ימי פיתוח ל-Backend (כולל בדיקות) + ~2 שבועות המתנה ל-App Review |

# משימה: האפליקציה — מיזוג ענף design/app-refresh (סבב עיצוב וזרימות) · הנחיה לעידו

> **איך לקרוא:** כאן כל מה שאייל שינה עם Claude באפליקציה, בענף `design/app-refresh`: שבעה קומיטים מעל `main` (`b08d24c`), וראש הענף הוא `e476f12`. **המשימה שלך: לעבור על השינויים לפי המסמך, להריץ את הבדיקות בסעיף ה, ולמזג את הענף ל-`main` בעצמך** (ד.10, ט). אנחנו לא ממזגים.
> **הענף ב-GitHub** (נדחף 15.09 באישור אייל, ראש `e476f12`). פריט הלוח: #348. `origin/main` עדיין על `b08d24c`, בסיס הענף, ולכן המיזוג יהיה בלי התנגשויות.
> הכל JS/TS תחת `src/`. אין שינוי בנייטיב (`ios/`, `android/`), בחבילות (`package.json`) או בשרת. סעיף ה הוא תנאי למיזוג ולשחרור. לא ברור — Reject בלוח, לא ניחוש.
> שתי שאלות על השרת פתוחות אצל אייל (ח.4). הן לא משימה שלך, והעוזר עובד גם בלעדיהן, במסלול הישן.
> האפיון שממנו זה נבנה: `docs/tasks/2026-09-14-mobile-app/TASK.md` ו-`MOBILE_SPEC.html` בריפו mainScreen. ההכרעות של אייל מהסבב הזה נכנסו שם לסעיף ב.

## א · מה השתנה במבט אחד

| אזור | במשפט אחד |
|---|---|
| ניווט | שני טאבים ("ראשי", "לקוחות"/"מטופלים"). טאב "פגישות" הוסר, ו-`Home` הוא עכשיו מחסנית (`HomeStack`). |
| בית | מסך חדש: פס "היום" עם הפגישה הבאה, הקלטה מהירה, הפגישות הקרובות וסיכומים לאישור. |
| הקלטה | כל כניסה חדשה להקלטה עוברת דרך כרטיס הלקוח ו-`startRecordFlow`: נעילה, בדיקת הקלטה פתוחה, בחירת פגישה, מיקרופון ויצירה בלי כפילות. |
| כרטיס לקוח | כרטיס אחד גלול במקום שלושה טאבים עליונים. פעולות ההחלקה מהרשימה עברו לתפריט "…". |
| העוזר של הלקוח | מסך נפרד מהכרטיס. עם התחברות `User_Accounts` — אותו שירות כמו "עוזר AI" בממשק (צד היועץ): שיחות שמורות ותשובות ב-Markdown. עם התחברות ישנה (מה שהכניסה באפליקציה מחזירה היום) — הצ׳אט הישן, עם הצעות פתיחה ושורת שגיאה במקום חלון שגיאה של המערכת. |
| רשימת לקוחות | נכתבה מחדש: חיפוש, צ׳יפים, התראה אחת בשורה. בלי החלקה ובלי כפתור פעולה מהשרת. |
| כל הפגישות וסיכומים | מסך משנה שנפתח מהבית. פגישה מתוכננת נפתחת דרך הכרטיס, וסיכום נפתח בבית. |
| זירת הפגישה | עיצוב ומבנה הכותרת (JSX), בלי שינוי לוגיקה, חוץ משינוי ניווט אחד במודאל `approveBlocked`. |
| הכנה / בריף | צבעים וגופנים של המותג, בלי סגול קבוע ב-HK (`94a7f80`). עיצוב בלבד. |
| קישורים עמוקים | עוברים דרך `openMeetingAnywhere`. הקלטה מקישור רק לפגישה מתוכננת של היום. |
| שפת עיצוב | `brand.ts` (צבעים, גדלים, פינות) ו-`terms.ts` (מילים) לשני המותגים. |
| תשתית | קבצי עזר לזמן, לחיפוש, להתראות ולמצב ההקלטה. בלי חבילות, בלי נייטיב, בלי שינוי בשרת. |

**הקומיטים** (מהישן לחדש)

| קומיט | מה |
|---|---|
| `4fed9d3` | שפת העיצוב בטאב־בר, ב-`AppHeader`, בבית, בלקוחות ובפגישות. סגנונות בלבד. |
| `884675c` | שני טאבים, הקלטה מהירה, העוזר לכל לקוח, זירת הפגישה בעיצוב החדש. רוב השינוי. |
| `d4564f4` | כרטיס לקוח: קביעת פגישה ושינוי מועד בחלון מעל הכרטיס. הוסרו חיוג ווואטסאפ. |
| `864bf78` | העוזר (הצ׳אט הישן): שדה השאלה מעל המקלדת גם באנדרואיד 15+. |
| `94a7f80` | מסך ההכנה / הבריף בצבעי המותג. עיצוב בלבד, רק `CompanyPreparationScreen.tsx`. |
| `d09930a` | העוזר של הלקוח על השירות של הממשק (`chat-conversations` + `ai-flow-manager`, צד היועץ) ותשובות ב-Markdown. עם טוקן ישן — הצ׳אט הישן. |
| `e476f12` | העוזר: שיחה ריקה נמחקת כשהעוזר לא מחובר בשרת, שבירות שורה נשמרות, טבלה ברוחב מלא, גרף לא גולש, שאלה מוכנה על מגמת ההכנסות. |

## ב · השינויים לפי אזור

### ב.1 ניווט וטאבים
**מה רואים עכשיו**
- שני טאבים: "ראשי" ו"לקוחות" (ב-Jampa "מטופלים", מ-`terms.clients`). טאב "פגישות" הוסר, וגם הבאדג׳ עם מספר הלקוחות.
- טאב־בר: רקע לבן, קו עליון `c.line2`, בלי צל, גובה 58 + השוליים הבטוחים בתחתית. אייקונים 24×24 ב-`tintColor` (פעיל `c.navy`, לא פעיל `c.ink3`), תווית 11.5 במשקל 500.
- לחיצה על הטאב שכבר פתוח חוזרת לראש המחסנית שלו (`HomeMain` / `ClientsList`). מעבר מטאב אחר שומר את המחסנית.
- בזמן הקלטה (`hasAnyRecording && !paused`) טאב "ראשי" חסום, כמו ב-`main`. מעבר לטאב הלקוחות מטאב אחר מותר, כי מסך ההקלטה שם. לחיצה חוזרת על טאב הלקוחות כשהוא פתוח חסומה.
- מסכי משנה (`Frame`): כפתור חזרה עגול וכותרת, ושורת משנה כשיש (הכנה: שם הלקוח, עוזר: "עוזר"). בפגישות הלקוח הכותרת היא שם הלקוח.

**מה השתנה בקוד**
- `AppTabsNavigator`: הטאב `Home` מקבל `HomeStack` במקום `HomeScreen`. `MeetingsStack` נמחק מהטאבים. הוסרו `useNavigationState`, `tabBarBadge` ו-`activeCompanies`.
- `tabPress` של `Home`: `preventDefault`. בזמן הקלטה `return`. בטאב הנוכחי `navigate('Home', {screen: 'HomeMain', pop: true})`, אחרת `TabActions.jumpTo('Home')`.
- `tabPress` של `Clients`: מטאב אחר `jumpTo('Clients')` גם בזמן הקלטה. בטאב הנוכחי: בזמן הקלטה `return`, אחרת `navigate('Clients', {screen: 'ClientsList', pop: true})`.
- `HomeStack.tsx` (חדש): `HomeMain`, `HomeEvents`, `HomeMeetings`, `SummaryDetails` (`getId` לפי `meetingId`), `ClientPrep`.
- `ClientsStack.tsx`: נוספו `ClientPrep`, `ClientChat`, `ClientMeetings`. `getId` ל-`ClientDetails` לפי `client.id` ול-`ClientMeetingDetails` לפי `meetingId`.
- `openClient.ts` (חדש): `clientOfMeeting`, `openClientCard`, `openMeetingAnywhere` והטיפוסים `RecordRequest`, `OpenRequest`, `CardParams` (פירוט בסעיף ג).
- העיקרון: מסך פגישה מתוכננת, שממנו מקליטים, נפתח רק במחסנית הלקוחות כ-`ClientMeetingDetails`. סיכומים נפתחים בבית כ-`SummaryDetails`.
- `MeetingsStack.tsx` נשאר בריפו ואף אחד לא מייבא אותו. `RootNavigator` לא השתנה בענף.

**קבצים:** `src/navigation/AppTabsNavigator.tsx`, `src/navigation/stacks/HomeStack.tsx`, `src/navigation/stacks/ClientsStack.tsx`, `src/navigation/openClient.ts`, `src/navigation/navigationService.ts`, `src/screens/Clients/ClientSubScreens.tsx`, `src/screens/Home/HomeSubScreens.tsx`

### ב.2 מסך הבית
**מה רואים עכשיו**
- הבית הקודם (לוגו, תמונת רקע, ברכה, "לאיזור האישי", רשימת אירועים) הוחלף.
- פס נייבי "היום" עם קו `c.tick` (קורל ב-HK, סגול בהיר ב-Jampa) ותאריך ארוך ("יום שלישי · 15.09.2026"). בפס "לטיפול" (HK) או "חיזוקים" (Jampa), שפותח את רשימת האירועים הישנה במסך נפרד, ואווטאר שפותח את האזור האישי. שורת הסטטוס בבית נייבי.
- הפגישה הבאה של היום: "הפגישה הבאה · בעוד h:mm", או "הפגישה עכשיו · עד HH:MM" (בלי `remind_to_time` רק "הפגישה עכשיו"), שעה ושם. אם לאותו לקוח יש סיכום `processed` קודם: "הסיכום מהפגישה הקודמת מחכה לאישור". ב-HK גם כותרת פגישה לא אוטומטית. כפתורים: "הקלטת הפגישה" (קורל) ו"הכנה לפגישה" / "בריף לפגישה".
- בלי פגישה נוספת היום: "אין פגישות היום" / "אין פגישות נוספות היום", ומתחת "הבאה: {יום} · {שעה} · {שם}".
- "הפגישות לא נטענו" עם "טעינה מחדש" מופיע רק כשאין פגישות בזיכרון ואין פגישה בפס. אחרת נשארים הנתונים הקודמים, בלי הודעה.
- כרטיס "הקלטה מהירה" (עיגול `c.rec`), "בוחרים לקוח ומקליטים — גם בלי פגישה" (ב-Jampa "מטופל").
- "הפגישות הקרובות": רצועה אופקית של עד 20 פגישות מתוכננות מהיום עד היום +6 שלא הסתיימו, בלי זו שבפס. קישור "כל הפגישות", או "קביעת פגישה" כשאין פגישה בפס ואין ברצועה (גם אם יש פגישה בעוד יותר משבוע).
- "סיכומים לאישור": עד 3 פגישות `processed` אחרונות, מונה וקישור "כל הסיכומים". משיכה לרענון.

**מה השתנה בקוד**
- `HomeScreen.tsx` נכתב מחדש. הפגישות בעותק מקומי ולא ב-`store.meetings`, כי מסך לקוח דורס את `store.meetings` (סעיף ז).
- טעינה: `meetingsAPI.getAllMeetings(ids)` → `POST /meetings/company/getAllMeetingsByIds {companyIds}`. `STALE_MS` = 60 שניות, אבל פונקציית הניקוי של `useFocusEffect` מאפס את `loadedAtRef` ביציאה, כך שכל חזרה לבית טוענת מחדש. ברענון: `getActiveCompanies()` ואז `load(true)`.
- מאזין ל-`REC_STATE`: כש-`hasAnyRecording` עובר מ-`true` ל-`false`, טעינה מחדש אחרי 3 שניות.
- פגישות רק של חברות ב-`activeCompanies`. אם יש לי פגישות (`user_id === userId`) מוצגות רק הן, אחרת של כולם. זמנים לפי שעון ישראל (`meetingTime`), ו-`useMinuteClock` מרענן כל דקה.
- `hero` = פגישה `scheduled` ראשונה של היום עם `windowEnd > now` (`windowEnd` = `remind_to_time`, או שעה אחרי ההתחלה). `later` = הראשונה מיום שאחרי.
- פגישה מתוכננת (פס, רצועה, "הבאה") → `openClientCard(client)` בלי `open`. סיכום → `navigate('SummaryDetails', {meetingId, meeting})`. "הקלטת הפגישה" → `openClientCard(client, {record: {meetingId, explicit: true}})`. הכנה → `navigate('ClientPrep', {client})`.
- `guard()` של 800 מ״ש רק על פתיחת פגישה, "הקלטת הפגישה", הכנה ופתיחת הגיליון. בחירת שם בגיליון לא מוגנת: כל לחיצה קוראת ל-`openClientCard` עם `at` חדש, ולכן `handledRef` לא מסנן אותה. ההגנה היחידה היא הנעילה ב-`startRecordFlow` — לחיצה שנייה מקבלת `'busy'` ומציגה "הקלטה אחרת בדיוק נפתחת" ל-4 שניות. אין הגנה על "לטיפול", האווטאר, "כל הפגישות", "קביעת פגישה", "כל הסיכומים" ו"טעינה מחדש".
- "לטיפול" → `HomeEvents`. "כל הפגישות" → `HomeMeetings {filter: 'scheduled'}`. "קביעת פגישה" → `HomeMeetings {createMeeting: true}`. "כל הסיכומים" → `HomeMeetings {filter: 'pending'}`. אווטאר → `navigation.replace('PersonalArea')`, כמו ב-`main`.
- `HomeEventsScreen.tsx` (חדש): `EventsList`, `BudgetModal` ו-`formatCurrency` עברו אליו כמו שהם.
- `App.tsx`: כש-`currentRoute === 'HomeMain'` ה-`StatusBar` ב-`light-content` ו-`c.navy`, ו-`TopInsetTint` צובע את השוליים הבטוחים העליונים. `setCurrentRoute` נקרא גם ב-`onReady`. הרקע הכללי `c.bg` במקום לבן, חוץ ממסך הכניסה.
- `AppHeader` כבר לא בבית. ההתנתקות נשארה ב-`PersonalAreaScreen`, ו"חברה חדשה" עבר לרשימת הלקוחות.

**קבצים:** `src/screens/Home/HomeScreen.tsx`, `src/screens/Home/HomeEventsScreen.tsx`, `src/navigation/stacks/HomeStack.tsx`, `src/App.tsx`, `src/utils/meetingTime.ts`, `src/utils/useMinuteClock.ts`

### ב.3 הקלטה מהירה ומסלול ההקלטה
**מה רואים עכשיו**
- גיליון "הקלטה מהירה — לאיזה לקוח?" (Jampa: "לאיזה מטופל?"). חיפוש זהה בשני המותגים: שם, ואחר כך ח.פ מ-3 ספרות. ב-Jampa רק טקסט הרמז בשדה הוא "חיפוש לפי שם". שלוש קבוצות: "היום" (פגישה מתוכננת היום שלא הסתיימה, עם שעה ו"בעוד h:mm"/"עכשיו"), "לאחרונה" (עד 5 לקוחות עם פגישה ב-14 הימים האחרונים), "לפי שם".
- לחיצה על שם סוגרת את הגיליון ועוברת לכרטיס הלקוח בטאב הלקוחות, ושם מתחיל המסלול. בזמן ההכנה הכפתור מראה "פותח הקלטה…".
- כל כניסה חדשה להקלטה (בית, הקלטה מהירה, כרטיס, "התחל והקלט", קישור) עוברת דרך הכרטיס. הכפתור "הקלטת פגישה" בתוך מסך הפגישה נשאר ישיר, כמו ב-`main`.
- גיליון "על איזו פגישה?": עד 2 פגישות ("הפגישה של HH:MM" עם "מתחילה בעוד…", "הפגישה עכשיו" או "הייתה ב-… · לא הוקלטה", ו"· של `{user_name}`" לפגישה של אחר), ו"פגישה חדשה עכשיו".
- גיליון "צריך הרשאה כדי להקליט": "הגדרות ← HK/Jampa ← מיקרופון", "פתיחת ההגדרות" (`Linking.openSettings`), "לא עכשיו", "לא נוצרה פגישה."
- הודעות בשורה אחת בבלוק הנייבי: "אין חיבור · אפשר לנסות שוב", "הפגישות לא נטענו · אפשר לנסות שוב", "יש הקלטה פתוחה · אפשר להקליט אחרי שהיא נסגרת", "הפגישה לא נמצאה · אפשר להקליט בלי פגישה", "הפגישה לא נוצרה · אפשר לנסות שוב", "הפגישה נוצרה בלי הקלטה · יש הקלטה פתוחה אחרת", ולמשך 4 שניות "הקלטה אחרת בדיוק נפתחת · אפשר לנסות שוב בעוד רגע".
- ב-`CreateMeetingModal` (רשימת פגישות וכרטיס) אין "התחל והקלט". הכפתור המשני "ביטול".

**מה השתנה בקוד**
- `ClientPickerSheet.tsx` (חדש): `{visible, onClose, onPick(client, meetingId?), companies, items, now}`. מסנן ב-`isVisibleClient`, ממיין לפי שם (`'he'`), מדרג חיפוש ב-`normalize`/`matchRank`. רק לשורות "היום" מצורף `meetingId`.
- `HomeScreen.onQuickPick`: סוגר, ואחרי 350 מ״ש (בשתי הפלטפורמות, בגלל iOS) `openClientCard(client, {record: {meetingId, explicit: meetingId != null}})`.
- `recordFlow.ts` → `planRecord(meetings, now, userId, preferredId?, explicit=false)` מחזיר `open` / `record` / `choose` / `create` / `missing`. `todays` = `scheduled` של היום (שעון ישראל). `soon` = `windowEnd > now && start − now ≤ 30 דק׳`. "מוקלטת" = `uploads_started_count > 0`.
- עם `preferredId`: לא נמצאה → `missing`. לא `scheduled`, או שלי ומוקלטת → `open`. שלי, לא מוקלטת, עם `explicit` או `soon` → `record`. אחרת → `choose` עם [המבוקשת, ועוד אחת של היום שלא הוקלטה, הקרובה בזמן].
- בלי `preferredId`: יש לי מוקלטת היום → `open` על האחרונה. שלי לא מוקלטת ו-`soon` → `record`. אחרת עד 2 של היום שלא הוקלטו, של כל יועץ → `choose`. אין → `create`. אחרי בחירה: `'new'` → `create`; שלי ולא מוקלטת → `record`; השאר → `open`.
- `startRecordFlow({navigation, client, userId, preferredId?, explicit?, ui})` → `'busy' | void`. נעילה גלובלית `current`: מסלול רץ שהמסך שלו פעיל → `'busy'`. מסלול שהמסך שלו כבר לא פעיל → מחכים ל-`current.done`, כדי שיצירה שכבר נשלחה לא תיצור כפילות.
- השלבים: (1) `freshMeetings` → `GET /meetings/company/{id}` עם מרוץ של 10 שניות; בכישלון `NetInfo.fetch` בוחר הודעה. (2) `blockedByOpenRecording`: אם `anyRecordingOpen()`, סורקים עד 8 פגישות `scheduled` של הלקוח ב-`meetingRecordingOpen(id)`; נמצאה → חוזרים אליה בלי `startRecord`, אחרת שגיאה. (3) `planRecord` ו-`ui.choose`. (4) `open` → ניווט בלי `startRecord`. (5) `record` על פגישה עם `finalizationPending` → נפתחת בלי הקלטה. (6) `ensureMicrophone`. (7) בדיקה אחרונה של `anyRecordingOpen`, ואז `navigate('ClientMeetingDetails', {meetingId, meeting, client, startRecord: true})`. `ui.isActive()` נבדק בין השלבים.
- `ensureMicrophone`: אנדרואיד `PermissionsAndroid` `RECORD_AUDIO` (`check` ואז `request`). iOS `AudioMeterModule.getMicrophonePermissionStatus`, ו-`requestMicrophonePermission` רק כשהסטטוס לא `granted`/`denied`. בשגיאה מחזיר `true`.
- `create`: `api.post('/meetings/create', payload, {timeout: 20000})` ישירות, בלי `retryRequest`, כי ניסיון חוזר אחרי `Network Error` עלול ליצור כפילות. אם הבקשה נכשלה (שגיאה או חריגה ממגבלת הזמן) או שחזרה בלי `id`, טוענים שוב ומחפשים `scheduled` עם אותה `title` ו-`scheduled_at` בהפרש של פחות מ-60 שניות. אחר כך שוב `anyRecordingOpen()`, ורק אז `startRecord: true`.
- `recordingState.ts` (חדש): מאזין ל-`REC_STATE` ברמת המודול (לא מוסר), `getRecState()`, `useRecState()` (`useSyncExternalStore`). `nativeOpen(meetingId)` קורא לנייטיב לקריאה בלבד, עם מגבלת זמן של 1.5 שניות: `true` אם `activeRecordings > 0 || pausedManagedRecordings > 0 || pausedForCall`, `null` אם לא ענה.
- `anyRecordingOpen()` = `nativeOpen('')` || (`hasAnyRecording && !paused`). `meetingRecordingOpen(id)` = `nativeOpen(String(id))`.
- הקלטה שהמשתמש השהה לא חוסמת הקלטה ללקוח אחר, וזה מכוון (ההערה על `anyRecordingOpen`). `nativeOpen` סופר `pausedManagedRecordings` ו-`pausedForCall`, אבל הם מתמלאים רק בהשהיה בגלל שיחה, ולכן רק הקלטה שהושהתה בגלל שיחה חוסמת.
- `recordGuard.ts` (חדש): `RECORD_WINDOW_MS`, `finalizationPending(meetingId)`, ו-`isMineUnrecorded` שמיוצא ולא בשימוש.
- `TranscriptTab`: אין שינוי בלוגיקת ההקלטה ובפליטת `REC_STATE`. `startRecord` מגיע כמו קודם מ-`route.params.startRecord === true`.
- `MeetingsListScreen`: `onRefresh` בלי `openMeetingAndRecord`, `handleMeetingCreated` בלי `startRecord`, ו-`secondaryButtonMode="cancel"` בשני המופעים של `CreateMeetingModal`.

**קבצים:** `src/components/ClientPickerSheet.tsx`, `src/utils/recordFlow.ts`, `src/utils/recordingState.ts`, `src/utils/recordGuard.ts`, `src/screens/Home/HomeScreen.tsx`, `src/screens/Clients/ClientDetailsScreen.tsx`, `src/screens/Meetings/MeetingsListScreen.tsx`

### ב.4 כרטיס לקוח
**מה רואים עכשיו**
- במקום כותרת ושלושה טאבים עליונים (צ׳אט / הכנה / פגישות) — כרטיס אחד גלול.
- כותרת: חזרה, שם, התראה אחת (אדום / כתום / אפור) ו"…". אין חיוג ווואטסאפ.
- בלוק נייבי, מצב אחד לפי הסדר: "הקלטה פתוחה" + "חזרה להקלטה"; שלד טעינה; "הפגישות לא נטענו" + "הקלטה עכשיו" + "טעינה מחדש"; "הוקלטה · טרם נסגרה" + "המשך או סיום"; "הפגישה הבאה · היום · בעוד h:mm" / "הפגישה עכשיו · עד HH:MM" (בלי `remind_to_time` הטקסט "הפגישה עכשיו · עכשיו" — כפילות בקוד, לרשום) / יום, עם "הקלטה" (שלי, היום, לא הוקלטה, מתחילה בעוד 30 דק׳ לכל היותר) או "הקלטה עכשיו", ולידו הכנה/בריף; "לא נקבעה פגישה · קביעה ›" + "הפגישה האחרונה · {יום}".
- פאנל "פגישות": מונה ועד 4 שורות (העתידית שאחרי הפגישה שבבלוק, ואחריה האחרונות; אם אין אף אחת — הפגישה שבבלוק). מצבים: יום / "הוקלטה · טרם נסגרה" / "לא התקיימה" / "היום" / "מחכה לאישור" / "בעיבוד" / "אושר". "כל הפגישות" פותח את פגישות הלקוח.
- פאנל "פרטים": איש קשר (שם · 05X-XXX-XXXX). ב-HK גם ח.פ ומנהל תזרים, ב-Jampa "כל כמה ימים חיזוק".
- שורה קבועה מעל הטאב־בר: "שאלה על {שם}…" → העוזר.
- תפריט "…": קביעת פגישה; שינוי מועד הפגישה הבאה; עריכת פרטים; הוספת משימה; העברה לארכיון ("אפשר להחזיר", לחיצה שנייה מאשרת); מחיקה (לחיצה שנייה, "אי אפשר לבטל").
- "קביעת פגישה" ו"שינוי מועד" נפתחים בחלון מעל הכרטיס. סגירה חוזרת לכרטיס, ואחרי שמירה הפגישות נטענות מחדש.

**מה השתנה בקוד**
- `ClientDetailsScreen.tsx` נכתב מחדש, בלי `createMaterialTopTabNavigator`. הפרמטרים: `CardParams`, ולתאימות `editMeeting` / `createMeeting` (פותחים את `meetingModal`) ו-`initialTab` (`'ClientPreparationTab'` → `push('ClientPrep')`, `'client'` → `push('ClientChat')`). אף קוד בענף כבר לא שולח אותם.
- `fresh`: `CommonActions.reset` של מחסנית הלקוחות ל-[`routes[0]`, כל ה-`ClientMeetingDetails` שבמחסנית (רק אם `getRecState().hasAnyRecording && !paused`), הכרטיס עם `fresh: undefined`]. בלי הקלטה פעילה יורדים כולם, כולל מסך מושהה. ל-`REC_STATE` אין `meetingId`, אז אי אפשר לדעת איזה מהם מקליט.
- `record` / `open`: `useEffect` עם `handledRef` (`Set` לפי `at`), ואז `setParams({record: undefined})` / `({open: undefined})`. `open` משתמש ב-`meeting` שהועבר או טוען ומחפש, ואז `navigate('ClientMeetingDetails', {meetingId, meeting, client})`. לא נמצאה: "הפגישה לא נפתחה · אפשר לנסות שוב".
- נתונים: `GET /meetings/company/{id}` בכל כניסה. `GET /companies/get-company-details/{id}` בטעינה ובכל שינוי של `editOpen`. מנהל התזרים מ-`store.operatorUsers`. ההתראה מ-`buildClientInfo` / `clientSignal`.
- "הקלטה פתוחה": `meetingRecordingOpen(id)` על עד 4 פגישות `scheduled` של היום, מחדש בשינוי `todays` או `useRecState`.
- הקלטה: `record(preferredId?, explicit?)` → `startRecordFlow`. אובייקט ה-`ui`: `focusEpochRef` (עולה בכל יציאה), `mountedRef`, `chooseRef`, `afterSheets` (סוגר גיליונות ומחכה 350 מ״ש). "הקלטה" → `record(next.id)`, "הקלטה עכשיו" → `record()`, "חזרה להקלטה" / "המשך או סיום" → `navigate('ClientMeetingDetails')` בלי `startRecord`.
- ארכיון: `companiesAPI.updateCompanyStatus` → `POST /companies/update-company-status`, גוף הבקשה בפועל `{id, status: 'NOTACTIVE', status_description: 'לא פעיל'}` (`color` לא נשלח), דרך `retryRequest`. אותה קריאה כמו בהחלקה ב-`main`. מחיקה: `companiesAPI.inactiveCompany(id)` → `DELETE /companies/{id}`. לחיצה שנייה נחשבת אישור רק אחרי 600 מ״ש. הצלחה: `getActiveCompanies()` ו-`goBack()`. שגיאה: "הפעולה לא נשמרה · אפשר לנסות שוב".
- עריכת פרטים: `EditCompany {companyId}`. משימה: `TaskEventDialog {companyId, mode: 'create'}`. `afterMenu` סוגר את התפריט ומחכה 350 מ״ש לפני שהם נפתחים.
- `CreateMeetingModal` בכרטיס: `create` / `edit` (עם `next.m`), `companyId=Number(client.id)`, `secondaryButtonMode="cancel"`, `onMeetingCreated` → סגירה ו-`loadMeetings()`.
- `ClientSubScreens.tsx` (חדש): `Frame` (`paddingBottom` 58 + השוליים הבטוחים), `ClientPrepScreen` (עוטף `CompanyPreparationScreen`, `POST /meetings/preparation` לא השתנה), `ClientMeetingsScreen` (עוטף `MeetingsListScreen`), `ClientChatScreen` (ב.5).

**קבצים:** `src/screens/Clients/ClientDetailsScreen.tsx`, `src/screens/Clients/ClientSubScreens.tsx`, `src/utils/clientSignal.ts`, `src/navigation/openClient.ts`

### ב.5 העוזר של הלקוח (`884675c`, `864bf78`, `d09930a`, `e476f12`)
**מה רואים עכשיו**
- מסך נפרד מהשורה "שאלה על {שם}…" בכרטיס: כותרת שם הלקוח, תת־כותרת "עוזר", והמקלדת נפתחת מיד.
- המסך בוחר מסלול פעם אחת, כשהוא נפתח (`canUseAiChat()`):
  - **טוקן `User_Accounts`** (בטוקן `user_store === 'user_accounts'` ו-`auth_user_id` גדול מ-0) → `ClientAssistant`: אותו שירות כמו "עוזר AI" בממשק, צד היועץ.
  - **כל טוקן אחר** → `ClientChatTab`, הצ׳אט הישן. זה גם מה שמקבל היום מי שנכנס דרך מסך הכניסה של האפליקציה (ח.4).
- בשני המסלולים: שדה "שאלה על {שם}…", כפתור שליחה בקורל, בועת משתמש בצבע `c.tint`, ואותן הצעות (`CHAT_SUGGESTIONS`). HK, ארבע: "מה סוכם בפגישה האחרונה?", "מה להכין לפגישה הבאה?", "איך נראה התזרים בחודש הקרוב?", "מה מגמת ההכנסות ב-3 החודשים האחרונים?" (`e476f12`). Jampa, שלוש: "מה עלה בפגישה האחרונה?", "על מה לעבור בפגישה הבאה?", "אילו דפוסים חוזרים?".

**המסלול החדש (`ClientAssistant`)**
- פתיחה: "מה לבדוק על {שם}?" וההצעות, ומתחתן "שיחות קודמות" — עד 20 שיחות, מהאחרונה, עם תאריך `dd.mm`. שיחות וואטסאפ (`type === 'whatsapp'`) לא מוצגות. שיחה בלי כותרת נקראת "שיחה", ושיחה מסוג `cashflow` "תמונת תזרים". בטעינה ספינר, ובכישלון "השיחות הקודמות לא נטענו · ניסיון נוסף". ההצעות מוצגות גם בזמן הטעינה, אחרי כישלון וכשיש היסטוריה.
- לחיצה על שיחה קודמת פותחת אותה: פס עליון עם כותרת השיחה ו"שיחה חדשה", ומתחתיו ההודעות. "שיחה חדשה" חוזר למסך הפתיחה. השיחה נוצרת בשרת רק בשליחה הראשונה.
- שליחה (מהשדה או מהצעה): הבועה של המשתמש מופיעה רק אחרי שהשרת קיבל, אין בועה מקדימה. בזמן ההמתנה שלוש נקודות מהבהבות והשורה "ממתינים לתשובת העוזר לפני שאלה נוספת.". אפשר להקליד, אבל אי אפשר לשלוח עד שהתשובה מגיעה.
- התשובה מוצגת ב-Markdown (`Markdown.tsx`): כותרות, פסקאות ששומרות שבירות שורה, מודגש, נטוי, קו חוצה, רשימות (כולל מקוננות ומשימות), ציטוט, טבלאות (צרה נמתחת לרוחב המסך, רחבה נגללת הצידה), קוד, קו מפריד, קישורים, ובלוק קוד מסוג `chart` כגרף עמודות אופקי. HTML גולמי נמחק. גרף שלא נקרא: "לא ניתן להציג את הגרף.".
- תשובה שנכשלה: כרטיס "לא הצלחנו להשלים את התשובה", ההסבר, ו"ניסיון נוסף" ששולח שוב את השאלה הקודמת באותה שיחה.
- שליחה שנכשלה: שורה אדומה מעל השדה עם ההודעה (למשל "השאלה לא נשלחה. אפשר לנסות שוב."). טקסט מוקלד נשאר בשדה. אין קישור "לנסות שוב" בשורה — שולחים שוב.
- העוזר לא מחובר בשרת (409 `NO_CHAT_FLOW_ROUTED` — היום בשרת Jampa, ח.4): "העוזר אינו זמין כרגע. אפשר לנסות שוב מאוחר יותר.", ושיחה שנוצרה באותה שליחה נמחקת.
- בעיה זמנית בבדיקת מצב התשובה (3 כישלונות ברצף): שורה כתומה "יש קושי זמני לבדוק את מצב התשובה. ממשיכים לנסות…".

**המסלול הישן (`ClientChatTab`)**
- בשיחה ריקה, רק אחרי טעינה שהצליחה: "מה לבדוק על {שם}?" וההצעות.
- שליחה שנכשלה: אין חלון שגיאה של המערכת. הבועה יורדת ומופיעה שורה אדומה "השאלה לא נשלחה · לנסות שוב". טקסט מוקלד נשאר בשדה. בהצעה השדה לא משתנה, וההצעות חוזרות.
- השדה נשאר מעל המקלדת גם באנדרואיד 15+ (`864bf78`).

**מה השתנה בקוד**
- `ClientSubScreens.tsx` → `ClientChatScreen`: `const [useAiChat] = React.useState(canUseAiChat)` — המסלול נבחר פעם אחת לכל פתיחה של המסך. `keyboardOffset` = `insets.top` + גובה כותרת ה-`Frame` (`onLayout`). `autoFocus` מ-`route.params.autoFocus`, כי הכרטיס עושה `push('ClientChat', {client, autoFocus: true})`. שני הרכיבים עם `key={String(client?.id)}`.
- `aiChatApi.ts` (חדש): הקריאות, `canUseAiChat`, `authUserAccountId`, `chatErrorMessage` ו-`AiChatError`. פירוט בח.2.
- `ClientAssistant.tsx` (חדש):
  - `useFocusEffect` → `listConversations` בכל כניסה למסך.
  - שליחה: בלי שיחה פתוחה — `createConversation`, ואז `sendMessage`. התשובה מחזירה `userMessage`, `assistantMessage` (`pending`, עם `session_id`) ו-`sessionId`, והן מתמזגות לרשימה לפי `id`.
  - מעקב: כשההודעה האחרונה היא של העוזר, ב-`pending` ועם `session_id` — `sessionStatus` כל 700 מ״ש, עד 120 שניות. כש-`finished`, או סטטוס `COMPLETED` / `FAILED` / `STOPPED`: `getMessages` עם `after` = מזהה השאלה, עד 5 ניסיונות בהפרש 250 מ״ש, עד שההודעה כבר לא `pending`. נשארה `pending` → שגיאה לפי הסטטוס ("העוזר לא הצליח להשלים את התשובה." / "יצירת התשובה הופסקה." / "הריצה הסתיימה, אבל התשובה לא נשמרה בשיחה."). אחר כך רשימת השיחות נטענת מחדש.
  - 400/401/403/404 במעקב → שגיאה ועצירה ("אין הרשאה לבדוק את מצב התשובה הזו." ל-403, אחרת "לא ניתן להמשיך לעקוב אחר תשובת העוזר."). כישלון אחר → ממשיכים, ומהשלישי ברצף השורה הכתומה. עברו 120 שניות → "ההמתנה לתשובה ארכה יותר מדי. אפשר לנסות לשלוח שוב.".
  - שיחה שנפתחת עם תשובה שעדיין `pending` ממשיכה במעקב. `pollToken` מבטל מעקב ישן בפתיחת שיחה אחרת, ב"שיחה חדשה" וביציאה מהמסך.
  - שליחה שנכשלה: אם השיחה נוצרה באותה שליחה והקוד `NO_CHAT_FLOW_ROUTED` → `deleteConversation` (בלי לחכות לתשובה) והשיחה מתאפסת. אחרת, אם יש שיחה — קוראים אותה, ואם שאלה עם אותו תוכן כבר נשמרה מציגים את השיחה בלי שגיאה. אחרת `chatErrorMessage`.
  - "ניסיון נוסף" = `send(prevUser.content)` — הודעה חדשה באותה שיחה.
  - אין נעילה ב-`ref` על השליחה: `send` נחסם רק לפי `busy` מהרינדור האחרון (ב-`ClientChatTab` יש `sendingRef`). ראה A2.
  - `KeyboardAvoidingView`: iOS `padding`, אנדרואיד `height`. `keyboardVerticalOffset` = `keyboardOffset` + גובה הפס העליון כשיש שיחה פתוחה. השיחה ב-`FlatList` הפוך.
- `Markdown.tsx` (חדש, בלי חבילות): `parseBlocks` מפרק ל-`Block`, ו-`renderInline` מרנדר טקסט בתוך שורה. קישור נפתח רק ל-`http`/`https`/`mailto`. `textAlign: 'left'` הוא צד ההתחלה (האפליקציה כפויה לימין־לשמאל), ועמודת טבלה ביישור לימין מוצגת בצד ההתחלה. בלוק קוד מסוג `chart`: JSON `{type, title?, unit?, labels, series: [{name, data}]}` עם `type` אחד מ-`line` / `bar` / `area` / `pie`; JSON קטוע מתוקן בסגירת סוגריים; כל הסוגים מוצגים כעמודות אופקיות, ערך שלילי ב-`c.danger`, ומקרא כשיש יותר מסדרה אחת.
- `ClientChatTab.tsx` (המסלול הישן, `884675c` ו-`864bf78`): מאפיינים אופציונליים `keyboardOffset`, `autoFocus`, `clientName`, `suggestions`. `loadState` (`'idle' | 'ok' | 'error'`) לפי `POST /openai/get-messages {id, type}`. `handleRun(text?)`: `sendingRef` חוסם שליחה כפולה. השליחה ללא שינוי: `POST /chat/handle-chat {companyId, userId, userMessageContent, type, entryPoint: 'ai_chat'}`. בכישלון: הסרת הבועה, `setSessionId('')`, `setSendError(content)`. השדה מתנקה רק אם מה שנשלח זהה לתוכן השדה. סוג השיחה (`type`) נשאר `'client'`. `keyboardVerticalOffset = keyboardOffset ?? (iOS ? 64 + insets.bottom + 68 : 0)`; כש-`keyboardOffset` מועבר הוא חל גם באנדרואיד (`behavior 'height'`), ובלי — כמו ב-`main`.

**קבצים:** `src/screens/Clients/ClientSubScreens.tsx`, `src/screens/Clients/ClientAssistant.tsx`, `src/components/Markdown.tsx`, `src/services/aiChatApi.ts`, `src/screens/Clients/tabs/ClientChatTab.tsx`

### ב.6 רשימת לקוחות
**מה רואים עכשיו**
- כותרת גדולה "לקוחות" / "מטופלים" עם "חברה חדשה" / "מטופל חדש". ב-Jampa הכפתור היה "לקוח חדש" (ב-`AppHeader` הישן), ועכשיו "מטופל חדש" (`terms.newClient`). `AppHeader` לא מוצג.
- חיפוש קבוע, לא רגיש לאותיות סופיות ולגרשיים: התחלת שם או מילה, שם שמכיל, ח.פ (3 ספרות+). Enter עם תוצאה אחת פותח אותה.
- צ׳יפי מצב עם מונה, רק מצבים שיש בהם לקוחות. הפעיל נייבי.
- מיון לפי שם (קודם לפי `next_meeting_text`). שורה בגובה 64, הגדלת טקסט עד 1.2: שם, התראה אחת, הפגישה הבאה ("מחר 10:00"), או `next_meeting_text`, או "לא נקבעה" אחרי שהפגישות נטענו. בתחתית "לפי שם · N לקוחות".
- התראה לפי עדיפות: "בעיה תזרימית" (HK, `company_details.is_hariga > 0`), "לא התקיימה dd.mm", "סיכום מחכה לאישור". אחרת `ui_status_name` באפור. התג המעוגל הצבעוני מהשרת הוסר.
- משרד HK (`business === '1'`): בכל שורה סטטוס לחיץ. גיליון "סטטוס · {שם}" מציג את כל הסטטוסים עם ✓ על הנוכחי. לחיצה על הנוכחי לא עושה כלום. סגירה רק ב-X או בחזרה, לא בלחיצה על הרקע. קודם: "סטטוס נוכחי" + "בחרו סטטוס חדש", הנוכחי מוסתר, ולחיצה על הרקע סגרה.
- הוסרו: החלקה (עריכה / ארכיון / מחיקה / משימה), שעברה לתפריט "…" בכרטיס, וכפתור הפעולה מהשרת (`consultant_ui_status.cta`: `EDIT_LAST_MEETING` / `CREATE_MEETING` / `MEETING_PREP`), שלא הוחלף.
- מצבים ריקים: "לא נמצא לקוח בשם "…"" ו"אין תוצאה לסינון" עם "ניקוי", ו"עוד אין לקוחות" בלי כפתור.

**מה השתנה בקוד**
- `ClientsListScreen.tsx` נכתב מחדש: `ClientRow` (`React.memo`) במקום `ClientCard` עם `Swipeable`. `getItemLayout` עם `ROW_H = 64`.
- כניסה: `getActiveCompanies()` + `getCompanyStatuses()` בכל כניסה. פגישות (`getAllMeetingsByIds`) בעותק מקומי, לכל היותר פעם בדקה, `force` ברענון. בכישלון לא נכתב "לא נקבעה".
- `clients = activeCompanies.filter(isVisibleClient)` → `{...company, id, name}`. מיפוי ברירות המחדל הישן (כעשרים שדות) הוסר, כולל `status: company.status || 'active'`. לקוח בלי `status` לא נספר בצ׳יפים של `business '1'`, ו-`getStatusText` מחזיר "—" במקום "פעיל".
- סינון: ב-`business '1'` לפי `status.status`, אחרת `consultant_ui_status.ui_status_key`. חיפוש: `normalize` + `matchRank`.
- שינוי סטטוס (גוף הבקשה לא השתנה): `companiesAPI.updateCompany({id, occupation, billing_amount, operator_user_id, status: newStatus, status_description: ' '})` → `POST /companies/update-company`, ואז `getActiveCompanies()`.
- לקוח חדש: `CreateCompanyWithUserModal` → `POST /companies/create-company-with-user`, ואז `getActiveCompanies()` + `getCompanyStatuses()`. קודם בתוך `AppHeader`.
- פתיחה: `navigate('ClientDetails', {client})` בלי `fresh`.
- הוסר `export sortByNextMeeting` (בלי מייבאים). `isVisibleInClientsList` הוא שם נוסף ל-`isVisibleClient`. אין `useMinuteClock` במסך.

**קבצים:** `src/screens/Clients/ClientsListScreen.tsx`, `src/utils/clientSearch.ts`, `src/utils/clientSignal.ts`, `src/utils/terms.ts`

### ב.7 כל הפגישות וסיכומים
**מה רואים עכשיו**
- "כל הפגישות" נפתח מהבית כמסך משנה, בלי `AppHeader`, עם צ׳יפים (קרובות / ממתינות לאישור / הושלמו / לא התקיימו) ו"קביעת פגישה" בקורל. מהבית נפתח על הצ׳יף הרלוונטי, או ישר חלון קביעה.
- פגישות הלקוח (מהכרטיס): `Frame` עם שם הלקוח, מתחתיו "פגישות" ו"קביעת פגישה".
- פגישה מתוכננת ברשימה הכללית → כרטיס הלקוח → מסך הפגישה. סיכום → בבית. "התחל והקלט" → הקלטה דרך הכרטיס.
- כרטיסי פגישה: פאנל עם גבול, "היום" בתג `infoBg`, כפתור פעולה מתאר נייבי.

**מה השתנה בקוד**
- `HomeSubScreens.tsx` (חדש): `HomeMeetingsScreen` = `Frame` + `MeetingsListScreen`. `SummaryDetailsScreen`: פגישה `scheduled` → `goBack()` + `openMeetingAnywhere(meeting)`. אחרת `MeetingDetailsScreen` עם `startRecord=false`.
- `MeetingsListScreen`: `route.params.filter` חדש (`'scheduled' | 'pending' | 'approved' | 'past'`, ברירת מחדל `'scheduled'`, עם לקוח — `null`). `createMeeting` / `editMeeting` עדיין נקראים מהפרמטרים.
- `onPress` בלי לקוח → `openMeetingAnywhere(meeting)`. עם לקוח → `navigate('ClientMeetingDetails', {meetingId, client, meeting})`, ללא שינוי.
- `onPreparationPress` ("התחל והקלט"): עם לקוח → `navigate('ClientDetails', {client, record: {meetingId, explicit: true, at}}, {pop: true})`. בלי לקוח → `openClientCard(clientOfMeeting(meeting), {record: {meetingId, explicit: true}})`. קודם: ניווט ישיר עם `startRecord: true`.
- הוסרו `AppHeader` ו-`useSafeAreaInsets`. `paddingBottom` 24 בלי לקוח, 0 עם לקוח.
- `MeetingCard.tsx`: סגנונות בלבד. ההחלקה ו-`uiTextByType` לא השתנו. נשאר ייבוא `IS_NLP` לא בשימוש (שגיאת `eslint`, ד.5; עדיין שם ב-`e476f12`).

**קבצים:** `src/screens/Home/HomeSubScreens.tsx`, `src/screens/Meetings/MeetingsListScreen.tsx`, `src/screens/Meetings/components/MeetingCard.tsx`

### ב.8 זירת הפגישה (עיצוב)
**מה רואים עכשיו**
- כותרת: חזרה עגול, "סיכום - {כותרת}" (19, משקל 700), שורת משנה "תאריך · שעה · `{user_name}`" עם סימן כיוון מימין לשמאל. טווח `remind_from–remind_to` רק כש-`remind_client` דלוק. שורת האייקונים הקודמת הוסרה.
- "היום" תג בצבע `c.tint`. "סיימתי": תג מעוגל מתאר בגובה 32 (גבול `c.line2`, טקסט נייבי 12.5) במקום מסגרת נייבי. "ייצוא" עבר לשורת הכותרת, מתאר. תפריט הייצוא 46 מלמעלה + השוליים העליונים.
- טאבים פנימיים: קו סימון נייבי 2.5, תוויות 14/600, רקע `c.bg`.
- חלונות "הייצוא הושלם" ו"לא ניתן לאשר לפני אישור כל המשימות": רקע כהה ממותג, פינות 22, ראשי קורל, משני מתאר.
- תמלול: "הקלטת פגישה" אדום (`c.rec`), השהיה/המשך על צ׳יפ, עצירה אדומה, "מקליט פגישה" באדום, טיימר נייבי בספרות אחידות, באנרים ממותגים.
- סיכום: "אישור ושליחת סיכום" ראשי, "אישור ללא שליחה" משני (קודם שניהם ראשיים). משימות בפאנל, שמירה/ביטול/שחזור בשורת "באחריות:". משוב בפאנל, "נקודת חוזק" `c.ok`, "נקודה לשיפור" `c.warn`.
- חלון סיום הקלטה ובחירת נמענים: X של `Ionicons`, ✓ כאייקון, ספינרים ממותגים.
- העיצוב חל גם על `MeetingDetails` של לקוח קצה (CUSTOMER) מ-`MyProcessScreen`.

**מה השתנה בקוד**
- `MeetingDetailsScreen`: JSX וסגנון, חוץ משינוי אחד: במודאל `approveBlocked`, `navigate({name: route.name, params: {meetingId, meeting, validateTasksBeforeApprove, screen: 'Tasks'}, merge: true})` במקום `name: 'MeetingDetails'`. כך המעבר לטאב המשימות עובד גם ב-`ClientMeetingDetails` וב-`SummaryDetails`.
- `TranscriptTab`: צבעים, המאפיינים `bg`/`fg` ל-`RoundMediaIcon` (קיימים ברכיב), תווית וסגנונות. בלי שינוי לוגיקה, קריאות נייטיב או `REC_STATE`.
- `SummaryTab` / `TasksTab` / `FeedbackTab`: עטיפות `View` (`panel`, `metaRow`, `feedbackPanel`), אייקונים, ספינרים. בלי שינוי בקריאות שרת או במצב. `EndRecordingModal`, `SendSummaryUsersModal`, `AutoGrowTextarea`: סגנונות בלבד.

**קבצים:** `src/screens/Meetings/MeetingDetailsScreen.tsx`, `src/screens/Meetings/tabs/TranscriptTab.tsx`, `SummaryTab.tsx`, `TasksTab.tsx`, `FeedbackTab.tsx`, `src/screens/Meetings/components/EndRecordingModal.tsx`, `SendSummaryUsersModal.tsx`, `AutoGrowTextarea.tsx`

### ב.9 הכנה לפגישה / בריף (`94a7f80`)
**מה רואים עכשיו**
- מסך "הכנה לפגישה" (HK) / "בריף לפגישה" (Jampa) בצבעי המותג. ב-`main` היו גבולות ורקעים סגולים בהירים קבועים (`#E5E7FF`, `#C8CCFF`) גם ב-HK, ורקע `#ffffff` / `#FFFBF3` לפי `IS_NLP`.
- כל הסעיפים (תמונת מצב, משימות מהפגישה האחרונה, יעדים, פתיחות) בתוך פאנל אחד עם פינות `r.panel` וצל.
- `StatusPill` כתג מעוגל: "בוצע" על `okBg` בטקסט `ok`, השאר על `chip`. ספינר ו-`RefreshControl` ב-`c.navy`.

**מה השתנה בקוד**
- `CompanyPreparationScreen.tsx` (+313/−262): צבעים מ-`brand.ts` (`c`, `fs`, `r`, `shadow`), הוסר ייבוא `IS_NLP`. עטיפות `panel` / `panelClip` / `panelInner`, סגנון `pillTextDone`. בלי שינוי בלוגיקה או ב-`meetingsAPI.meetingPreparation`. `eslint` על הקובץ: 0 שגיאות, 2 אזהרות.

**קבצים:** `src/screens/Clients/tabs/CompanyPreparationScreen.tsx`

### ב.10 קישורים עמוקים
**מה רואים עכשיו**
- `?openMeeting={id}` (שם הפרמטר לא רגיש לאותיות גדולות; `admin.hak.co.il`, `admin.jampa.ai`, `stg.hak.co.il`, `stg.jampa.ai`) לפגישה מתוכננת פותח את כרטיס הלקוח בטאב הלקוחות, על מחסנית רשימה ← כרטיס.
- הקלטה מקישור (בלי `startRecord=0`) רק לפגישה של היום בשעון ישראל, ורק דרך `startRecordFlow`. פגישה מתוכננת מיום אחר נפתחת בלי מיקרופון. פגישה לא מתוכננת → מסך הסיכום בטאב הבית.
- פגישה שלא בזיכרון נטענת מהשרת.
- אותה כתובת פתיחה מטופלת פעם אחת לכל תהליך, גם אם מסך הטאבים נטען מחדש. כתובת פתיחה אחרת מטופלת.

**מה השתנה בקוד**
- `deepLinks.ts`: `consumedInitialUrl` ברמת המודול, השוואה לפי ערך הכתובת. המאזין ל-`'url'` לא השתנה.
- `AppTabsNavigator`: `initDeepLinks` ב-`useEffect` עם `[]`, דרך `openMeetingByIdRef` ו-`meetingsLoadedRef`, עם דגל `cancelled`. `source=live_activity`, `startrecord !== '0'`, `handledMeetingIdRef` ו-`pendingMeetingOpenRef` כמו שהיו.
- `openMeetingById` (`async`): `store.meetings`, ואם אין — `GET /meetings/{id}` (`data.id` או `data.meeting`). `mountedRef` מונע ניווט אחרי שהמסך ירד. אחר כך `openMeetingAnywhere(meeting, {record: startRecord})` ב-`try/catch`.
- הוסר הניווט המקונן `Main › Meetings › MeetingDetails` עם `startRecord`.

**קבצים:** `src/utils/deepLinks.ts`, `src/navigation/AppTabsNavigator.tsx`, `src/navigation/openClient.ts`

### ב.11 שפת עיצוב וטוקנים
**מה רואים עכשיו**
- HK: נייבי `#0C4068`, קורל `#E4826E`, רקע `#F6F8FB`. Jampa: `#6F62AC`, `#7557E3`, רקע `#FFFBF3`. כפתור ההקלטה `#E5392B` בשניהם.
- צ׳יפים מעוגלים, פאנלים לבנים עם גבול דק וצל עדין, כפתור ראשי אחד למסך.
- `EventsList` ("לטיפול" / "חיזוקים"): כרטיסים בפינות 14, פס צד 4, כפתורים מתארים, צ׳יפי סינון נפרדים.
- `AppHeader`: רקע לבן עם קו תחתון במקום צל, התנתקות 24 ב-`ink2`. "חברה חדשה" עוצב, אבל מוסתר (`hideAddCompanyButton={true}`) בכל ארבעת המסכים שבהם הרכיב נשאר: `CustomerVoiceHomeScreen`, `CompanyFilesScreen`, `MyProcessScreen`, `TargetsScreen`.

**מה השתנה בקוד**
- `brand.ts` (חדש): `c = IS_NLP ? JAMPA : HK` עם אותם מפתחות (`navy`, `navy2`, `coral`, `danger`, `sky`, `link`, `ok`, `okBg`, `warn`, `warnBg`, `infoBg`, `ink`, `ink2`, `ink3`, `onNavy`, `onNavy2`, `bg`, `panel`, `chip`, `tint`, `line`, `line2`, `tick`, `rec`, `mark`). `fs` (`h1` 28 … `xs` 11.5), `r` (`ctl` 10, `chip` 7, `panel` 14, `pill` 999), `shadow`, `panel`. המקור: `css/tokens.css` בפרוטוטיפ ו-`MOBILE_SPEC.html`.
- `terms.ts` (חדש): `client`, `clients`, `newClient`, `noClients`, `notFound`, `whichClient`, `quickSub`, `prep`, `search` לפי `IS_NLP`.
- `EventsList`: סגנונות, הוסר `Platform`. `CombinedFilterPills`: הוסרו מפרידים ורדיוס/צל לפי אינדקס, בלי שינוי בסינון.
- תמונות שכבר לא מופנות: `meetings.png`, `meetings_active.png`, `meetings_nlp_active.png`, `search.png`.

**קבצים:** `src/utils/brand.ts`, `src/utils/terms.ts`, `src/components/AppHeader.tsx`, `src/screens/Home/components/EventsList.tsx`, `CombinedFilterPills.tsx`, `src/App.tsx`

### ב.12 תשתית וקבצי עזר
- `meetingTime.ts` (חדש): `ymdIL`, `minutesIL`, `hmIL` (`Asia/Jerusalem`), `getEffectiveTs` (לפי `MeetingsListScreen`; שעה לא תקינה ב-`remind_from_time` נופלת כאן ל-`scheduled_at`, ושם ל-00:00), `getEndTs`, `addDaysYmd`, `weekdayOf`, `ddmm`, `dayLabel`, `longDate`, `countdown`, `slashDate`, `ilWallClockIso` (כמו `asScheduledAtIso` ב-`CreateMeetingModal`), `addHourCapped`, ו-`toItems` → `MeetingItem {m, start, end, windowEnd = end ?? start + 60 דק׳, ymd}`, ממוין, בלי פגישות בלי `scheduled_at`.
- `clientSearch.ts` (חדש): `isVisibleClient` (`is_active !== false` וסטטוס שונה מ-`NOTACTIVE`), `normalize`, `matchRank` → 3/2/1/0. אין בדיקת `IS_NLP`.
- `clientSignal.ts` (חדש): `buildClientInfo(meetings, now)` → `Map<company_id, {next, processed, notHeld, lastHeldStart}>`. `notHeld` = `scheduled` מיום שעבר, ב-30 הימים האחרונים, לא הוקלטה, בלי פגישה עתידית ובלי פגישה שהתקיימה אחריה. `clientSignal` → `{kind: 'danger' | 'warn' | 'muted', text} | null`.
- `useMinuteClock.ts` (חדש): מתעדכן בתחילת כל דקה ובחזרה ל-`AppState 'active'`.
- `types/navigation.ts` לא עודכן: `ClientsStackParamList` עדיין עם `ClientMeetingsTab` ו-`initialTab`, בלי `ClientPrep`, `ClientChat`, `ClientMeetings`, `record`, `open`, `fresh`. `TabParamList` עדיין כולל `Meetings`, ו-`Home` מוגדר `undefined`. `MeetingsStackParamList` לא בשימוש, אין טיפוס ל-`HomeStack`. המסכים החדשים מוקלדים `any`.

**קבצים:** `src/utils/meetingTime.ts`, `src/utils/clientSearch.ts`, `src/utils/clientSignal.ts`, `src/utils/useMinuteClock.ts`, `src/types/navigation.ts`

## ג · חוזים שהשתנו

### ג.1 ניווט ונתיבים
- הטאב `Meetings` (`MeetingsStack`: `MeetingsList`, `MeetingDetails`) הוסר מ-`Main`. כל `navigate('Meetings', …)` או `navigate('Main', {screen: 'Meetings', …})` ישבור. בענף לא נשארו כאלה.
- `Home` הוא `HomeStack`: `HomeMain`, `HomeEvents`, `HomeMeetings {filter?: 'scheduled' | 'pending' | 'approved' | 'past', createMeeting?: true}`, `SummaryDetails {meetingId, meeting}` (`getId` לפי `meetingId`; בלי `meeting` המסך לא מזהה פגישה מתוכננת ולא מעביר אותה לכרטיס), `ClientPrep {client}`. `App.tsx` בודק `currentRoute === 'HomeMain'` לצבע שורת הסטטוס. שינוי שם הנתיב ישבור את זה.
- `ClientsStack`: `ClientPrep {client}`, `ClientChat {client, autoFocus?}`, `ClientMeetings {client}`, `ClientMeetingDetails {meetingId, meeting, client, startRecord?}`. `getId`: `ClientDetails` לפי `params.client.id`, `ClientMeetingDetails` לפי `params.meetingId`.
- **סמנטיקה של `getId` ב-React Navigation 7** (`StackRouter`, `NAVIGATE`): `navigate` לנתיב שכבר קיים עם אותו מזהה, בלי `pop`, מעביר אותו לראש המחסנית ומשאיר את המסכים שהיו מעליו. הפרמטרים מוחלפים, לא מתמזגים. לכן:
  - כש-`startRecordFlow` חוזר ל-`ClientMeetingDetails` קיים (`blockedByOpenRecording` / `open`), המסך עובר לראש המחסנית ו-`startRecord` נמחק מהפרמטרים.
  - `openClientCard` לכרטיס קיים מחליף את הפרמטרים שלו ל-`{client, fresh, record|open}`, ורק האיפוס (`CommonActions.reset`) של `fresh` מנקה את המחסנית.
- הפרמטרים של `ClientDetails` = `CardParams {client, record?: {meetingId?, explicit?, at}, open?: {meetingId, meeting?, at}, fresh?: boolean}`. `at` הוא מפתח חד־פעמי (`handledRef`), ו-`record`/`open` מתאפסים ב-`setParams`. `fresh` → איפוס ל-[`routes[0]`, ה-`ClientMeetingDetails` שבמחסנית רק בזמן הקלטה פעילה, הכרטיס]. `editMeeting` / `createMeeting` / `initialTab` עדיין נתמכים ואף אחד לא שולח.
- `openClientCard(client, {record?, open?})` ו-`openMeetingAnywhere(meeting, {record?})` תלויים ב-`getNavigationRef()` (חדש ב-`navigationService`, מחזיר הפניה לניווט רק כש-`isReady()`) ובשורש `Main`. לא עובדים ל-CUSTOMER (השורש `CustomerMain`). `openClientCard` יוצא בשקט בלי הפניה או `client.id`.
- `clientOfMeeting(meeting)`: מחפש ב-`activeCompanies`. לא נמצא → `{id, name: company_name ?? ''}`, ול-`Meeting` אין `company_name`.
- `MeetingDetails`: הוסרו 3 ניווטים מ-`MeetingsListScreen` (`onRefresh`, `onPress`, `onPreparationPress`) והניווט המקונן `Main › Meetings › MeetingDetails` מ-`AppTabsNavigator`. נשאר `MyProcessScreen` → `MeetingDetails` בשורש. במודאל `approveBlocked` הניווט ל-`route.name`.
- `tabPress`: טאב פעיל → `navigate` עם `pop: true` ל-`HomeMain` / `ClientsList`. טאב אחר → `TabActions.jumpTo`. לקוחות מותר בזמן הקלטה. החסימה חלה רק על `tabPress`, לא על ניווט מהקוד.
- `types/navigation.ts` לא עודכן (ב.12).

### ג.2 הקלטה
- `startRecord: true` נשלח רק ל-`ClientMeetingDetails`, רק מ-`startRecordFlow`. `SummaryDetailsScreen` מאלץ `startRecord=false` ומעביר `scheduled` לכרטיס. `MeetingsListScreen` ו-`CreateMeetingModal` כבר לא מקליטים.
- `REC_STATE`: אין שינוי בפולט (`TranscriptTab`) ובמבנה `{hasAnyRecording, paused}`. מאזינים חדשים: `recordingState.ts` (מודול) ו-`HomeScreen` (טעינה אחרי 3 שניות). `AppTabsNavigator` ממשיך לחסום לפי `hasAnyRecording && !paused`. שינוי במבנה האירוע ישבור את כולם.
- קריאות נייטיב חדשות מ-JS, לקריאה בלבד, למתודות קיימות: `AudioMeterModule.getActiveRecordingStatus` (iOS) / `getManagedUploadStatus` (אנדרואיד) עם `{managedRecording: true, meetingId ('' לכולן), apiBaseUrl, authToken, ownerUserId}`, קוראים `activeRecordings`, `pausedManagedRecordings`, `pausedForCall`. וגם `getMeetingFinalizationStatus` (דרך `getNativeMeetingFinalizationStatus`), `getMicrophonePermissionStatus` / `requestMicrophonePermission` (iOS). שינוי שם או שדה בנייטיב ישבור את המסלול בשקט (`null` → נשען על האירוע בלבד). באנדרואיד `getManagedUploadStatus` קורא רק את `meetingId` (שאר השדות לא בשימוש), ומחזיר את התמונה האחרונה ש-`AudioMeterService.publishManagedUploadStatus` פרסם, לא מצב חי. ל-`meetingId` מסוים יש ערך רק לפגישה עם הקלטה פעילה, מושהית או העלאה בתור; אחרת אפסים.
- `RecordFlowUi`: `setBusy(busy)`, `setError(text, action?)` (`action` לא בשימוש), `choose(options)` → `MeetingItem | 'new' | null`, `needPermission()`, `isActive()`. בכרטיס `isActive` = `mountedRef && navigation.isFocused() && focusEpochRef` לא השתנה.

### ג.3 קריאות שרת (השרת לא השתנה, רק איך ומתי קוראים)
- `POST /meetings/create` מ-`startRecordFlow`: `api.post` ישירות, בלי `retryRequest`, מגבלת זמן 20 שניות. גוף הבקשה: `{title: '{שם}, DD/MM/YYYY', scheduled_at: ISO של עכשיו בשעון ישראל, company_id, remind_client: false, remind_from_time: HH:MM, remind_to_time: +שעה עד 23:59, calendarSync: false}`. אם נכשל או חזר בלי `id` — חיפוש כפילות לפי `title` ו-`scheduled_at` (< 60 שניות).
- `GET /meetings/company/{id}` ב-`freshMeetings`: עדיין דרך `meetingsAPI.getCompanyMeetings` → `retryRequest` (עד 3 ניסיונות חוזרים על `Network Error`, 1+2+4 שניות), ומחזיר `[]` על 404. ה-10 שניות הן מרוץ ב-JS, והבקשה ממשיכה ברקע. 404 מחזיר `[]`: בלי פגישה מבוקשת (הקלטה מהירה, "הקלטה עכשיו") זה מוביל ל-`create`, ועם פגישה מבוקשת (בית, קישור, "התחל והקלט") ל"הפגישה לא נמצאה · אפשר להקליט בלי פגישה".
- `GET /meetings/{id}` מקישור, כשהפגישה לא בזיכרון. התשובה `data` או `data.meeting`.
- `POST /meetings/company/getAllMeetingsByIds {companyIds}`: בבית בכל חזרה למסך, ברשימת הלקוחות לכל היותר פעם בדקה, בנוסף לטעינה ב-`AppTabsNavigator`.
- ארכיון `POST /companies/update-company-status {id, status: 'NOTACTIVE', status_description: 'לא פעיל'}`, מחיקה `DELETE /companies/{id}` — אותן קריאות כמו בהחלקה ב-`main`, רק ממקום אחר.
- `GET /meetings/company/{id}` בכרטיס הלקוח: בכל פוקוס על הכרטיס, בנוסף בכל לחיצת הקלטה (`freshMeetings`) ובפתיחת פגישה מקישור בלי `meeting`.
- `GET /companies/get-company-details/{id}` — חדש בכרטיס (ב-`main` רק ב-`EditCompany`): בטעינה, ובכל פתיחה וסגירה של "עריכת פרטים" (`editOpen`).
- העוזר, רק עם טוקן `User_Accounts`: `chat-conversations` ו-`ai-flow-manager` (פירוט בח.2). קריאות שהממשק כבר משתמש בהן, חדשות לאפליקציה. עם טוקן ישן — `POST /chat/handle-chat` ו-`POST /openai/get-messages`, כמו קודם.

### ג.4 רכיבים
- `CreateMeetingModal`: `secondaryButtonMode="cancel"` ב-`MeetingsListScreen` (יצירה ועריכה) וב-`ClientDetailsScreen`. "התחל והקלט" (`handleSubmit(true)`) לא מוצג באף מקום באפליקציית היועץ. ברירת המחדל של הרכיב נשארה `'start_record'`.
- `MeetingsListScreen`: `route.params.filter` חדש. `onRefresh()` ו-`handleMeetingCreated()` לא מקבלים פגישה להקלטה. בלי לקוח מניח שהוא בתוך `Frame` (בלי `AppHeader`, `paddingBottom` 24).
- `ClientChatTab`: מאפיינים `keyboardOffset`, `autoFocus`, `clientName`, `suggestions`; `handleRun(text?)`; סוג השיחה (`type`) `'client'` (`route.name`). `keyboardOffset` חל גם באנדרואיד. מוצג רק כש-`canUseAiChat()` מחזיר `false` (ב.5).
- `ClientAssistant` (חדש): מאפיינים `client`, `suggestions`, `autoFocus`, `keyboardOffset`. `Markdown` (חדש): מאפיין `content`, ומייצא גם `parseBlocks`, `renderInline` והטיפוס `Block`. `aiChatApi.ts` (חדש) מייצא `aiChatApi`, `canUseAiChat`, `authUserAccountId`, `chatErrorMessage`, `AiChatError` והטיפוסים (ח.2).
- קישורים עמוקים (`?openMeeting=`, `&startRecord=0`, `&source=live_activity`): `initDeepLinks` נרשם פעם אחת. אותה כתובת פתיחה מטופלת פעם אחת לכל תהליך, כתובת פתיחה אחרת מטופלת. הפתיחה עוברת דרך `openMeetingAnywhere`, ופורמט הקישור לא השתנה.
- `ClientsListScreen`: הוסר `export sortByNextMeeting`. `consultant_ui_status.cta` לא מוצג. `AppHeader` הוסר מהבית, מהלקוחות ומרשימת הפגישות, והעיצוב החדש שלו חל על מסכי לקוח הקצה.

## ד · איך מקבלים וממזגים

1. **קבלת הענף.** הענף נדחף ל-GitHub ב-15.09 (`git@github-hk-app:h-beehive/HK-APP.git`, ענף `design/app-refresh`, ראש `e476f12`). אצלך: `git fetch origin && git checkout design/app-refresh`.
2. **בסיס.** `git log -1 origin/main` צריך להיות `b08d24c` (`Fixes`, 08.09.2026), אב ישיר של הענף. ב-15.09 הוא עדיין שם. אם `main` זז: `git rebase`, ואז שלבים 3–6 שוב, וסעיף ה מחדש.
3. **היקף.** `git log --oneline origin/main..design/app-refresh` → 7 קומיטים (`4fed9d3`, `884675c`, `d4564f4`, `864bf78`, `94a7f80`, `d09930a`, `e476f12`; פירוט בסוף סעיף א). `git diff --shortstat origin/main...design/app-refresh` → 41 קבצים (18 חדשים, 23 ששונו), 6645+ / 3744−, כולם תחת `src/`. אין שינוי ב-`package.json`, `ios/`, `android/` (`jwt-decode`, שבו משתמש `aiChatApi.ts`, כבר ב-`package.json` של `main`), ולכן אין צורך ב-`npm install` או `pod install` חדשים בגלל הענף.
4. **`npm run tsc`** (`npx tsc --noEmit --skipLibCheck`): 0 שגיאות ב-`e476f12` (נבדק שוב על עותק נקי, בלי הקבצים המקומיים) וב-`b08d24c`.
5. **`npm run lint`:** ב-`e476f12` 17 שגיאות ו-114 אזהרות, כמו ב-`94a7f80`. בארבעת הקבצים של העוזר (`Markdown.tsx`, `ClientAssistant.tsx`, `aiChatApi.ts`, `ClientSubScreens.tsx`) אין שגיאות ואין אזהרות. ב-`b08d24c` 16 שגיאות ו-127 אזהרות.
   - 16 כבר ב-`main` (בענף `FeedbackTab`/`TasksTab` זזו בשורה): `FeedbackTab.tsx:4` (`DeviceEventEmitter`), `FeedbackTab.tsx:121` (`setGenerating`), `FeedbackTab.tsx:293` (`setBarH`), `TasksTab.tsx:56` (`setGenerating`), `CustomerTabsNavigator.tsx:7` (`IS_NLP`), `TaskAssigneePicker.tsx:60` (`handleOpen`), `DynamicGuidelinesModalNative.tsx:36`, `TimePicker.tsx:109` (`exhaustive-deps`), `CompanyFilesScreen.tsx:390`, `meetingPdfExport.ts:9` ו-`:647`, `MyProcessScreen.tsx:653`, `:716`, `:1021`, `:1158`, `types/meetings.ts:13`.
   - אחת חדשה, ועדיין שם ב-`e476f12`: `src/screens/Meetings/components/MeetingCard.tsx:5`, ייבוא `IS_NLP` לא בשימוש (`4fed9d3` הוריד את השימוש). להסיר בקומיט על הענף לפני המיזוג.
6. **`npm test`** נכשל גם ב-`main`: `__tests__/App.test.tsx` → `SyntaxError: Unexpected token 'export'` ב-`@react-navigation/native`, כי ל-`jest.config.js` אין `transformIgnorePatterns`. לא תנאי למיזוג.
7. **קבצים שאסור שייכנסו לקומיט** (מקומיים אצל אייל; שבעת הקומיטים נקיים מהם — אין בהם שינוי ב-`api.ts`, `RootNavigator.tsx`, `project.pbxproj` או `Info.plist`, אין `require` או `import` ל-`demo.local`/`devToken.local`, ו-`isProd = true`):
   - `src/services/api.ts` — מקומית `isProd = false` (סטייג׳) ו-`if (__DEV__) require('../demo.local').installDemo(api)` בסוף. בלי `demo.local.ts` הבנדל נכשל (Metro פותר `require` סטטית).
   - `src/navigation/RootNavigator.tsx` — `import { DEV_TOKEN, DEV_TOKEN_JAMPA, PREFER_DEV_TOKEN } from '../devToken.local'` ונפילה אליהם ב-`__DEV__` (כניסה בגוגל נכשלת בסימולטור). הייבוא סטטי, אז בלי `devToken.local.ts` הבנדל נכשל.
   - `src/devToken.local.ts` — טוקני סטייג׳, סוד. מוחרג רק ב-`.git/info/exclude` של אייל, לא ב-`.gitignore`. לא להעתיק ולא לשתף.
   - `src/demo.local.ts` — נתוני דמו לצילומי שיווק, מוחרג ב-`.git/info/exclude`.
   - `ios/HK.xcodeproj/project.pbxproj` — תוצאת `USE_FRAMEWORKS=static pod install` (`Pods_HK.framework`/`Pods_NLP.framework` במקום `libPods-*.a`, `HEADER_SEARCH_PATHS`, `OTHER_LDFLAGS` כמערך). אין שינוי חתימה.
   - `ios/RecordingStatusWidget/Info.plist` — `RCTNewArchEnabled=true` מ-`pod install`.
   - קבצי העוזר (`ClientAssistant.tsx`, `Markdown.tsx`, `aiChatApi.ts` והשינוי ב-`ClientSubScreens.tsx`) כבר בקומיטים `d09930a` ו-`e476f12`. הם חלק מהענף, לא קבצים מקומיים.
   - לידיעה, ממילא לא בגיט: `android/local.properties`, `ios/.xcode.env.local`, `ios/Podfile.lock`. במחשב של אייל: `git status` לפני כל קומיט, הוספה לפי שם, בלי `git add -A` ובלי `git commit -a`.
8. **בנייה iOS:** `npm run ios:pods`, ואז `npm run ios:hk` / `npm run ios:nlp`. אצל אייל `pod install` נכשל על `AppCheckCore` (`google-signin`) ועבד רק עם `LANG=en_US.UTF-8 USE_FRAMEWORKS=static pod install`. אצלך לבנות כרגיל. אם עברת ל-`USE_FRAMEWORKS=static` — לא להכניס לקומיט את השינויים ב-`project.pbxproj` וב-`Info.plist`.
9. **בנייה אנדרואיד:** JDK 17, `compileSdk`/`targetSdk` 36, `build-tools` 36.0.0, NDK 28.0.12433566, Gradle 9.0.0 (דרך `gradlew`), `android/local.properties` עם `sdk.dir`. `npm run android:hk:debug` / `npm run android:nlp:debug` (`arm64-v8a`).
10. **מיזוג — אתה ממזג.** אחרי סעיף ה והקומיט של ד.5: מיזוג `design/app-refresh` ל-`main`, ב-PR באתר GitHub (ל-`gh` של eyal-hk אין גישה לריפו) או ישירות. כל עוד `origin/main` על `b08d24c` אין התנגשויות, ואפשר `git merge --ff-only`. לפני כל בנייה לשחרור — לוודא `isProd = true` ב-`src/services/api.ts` (וראה ז.2 על `googleDrivePickerBridge.ts`). שחרור לחנויות — לפי ט.

## ה · בדיקות על מכשיר לפני המיזוג

> **כל בדיקה שיוצרת פגישה, מקליטה, שולחת סיכום, יוצרת משימה, שואלת את העוזר, מעבירה לארכיון או מוחקת — רק על חברת בדיקה (HK) או מטופל בדיקה (Jampa) שאנשי הקשר שלהם מהצוות.** הסטייג׳ מחובר ללקוחות אמיתיים. נמענים לסיכום — רק מהצוות. לעוזר — רק שאלות קריאה; לא לבקש ממנו לשלוח הודעה או ליצור משימה.
> מתחילים מ-HK: אייל הריץ אותו רק על נתוני דמו, והקלטה אמיתית לא נבדקה על מכשיר בכלל.

**0 · הכנה** · שניהם
- צעדים:
  1. לבנות את ראש הענף אחרי ד.5 (הקומיט שמסיר את `IS_NLP` מ-`MeetingCard.tsx`, מעל `e476f12`). בקומיט `isProd = true` (פרודקשן) — לבדיקות לשנות מקומית ל-`false` בלי קומיט, ולוודא `true` לפני בניית שחרור.
  2. HK (`com.hak.hk`, גרסת בנייה `hk`) ו-Jampa (`com.hak.nlp`, גרסת בנייה `nlp`). מכשירים: אייפון עם Dynamic Island (iOS 17+), אייפון קטן עם כפתור בית, אנדרואיד 15/16 עם מחוות, אנדרואיד 13/14 עם שלושה כפתורים.
  3. נתונים (לתאם עם אייל): לקוח בלי פגישה היום ועם פגישה מחר; פגישה שלי היום בעוד ~35 דק׳; פגישה שלי היום בעוד ~שעתיים; פגישה של יועץ אחר היום; פגישה שלי מהיום שכבר עברה ולא הוקלטה (R4); פגישה שלי מלפני 2–30 ימים שלא הוקלטה, ללקוח בלי פגישה עתידית ("לא התקיימה", C1/N8); לקוח עם שלוש פגישות היום (R4); לקוח עם סיכום `processed` ועם פגישה מאוחרת יותר היום (N7); פגישה `processed` עם משימות שלא אושרו; פגישה `approve`; פגישה מתוכננת של אתמול (R10); חברה עם `is_hariga > 0` (HK, J1/N8); שתי חברות חד־פעמיות לארכיון ולמחיקה; לקוח בלי היסטוריה בעוזר; לקוח עם שיחות קודמות בעוזר של הממשק, של אותו משתמש (A1); משתמש יועץ שני בלי פגישות משלו (R2.6).
  4. `CreateMeetingModal`: "אזכור ללקוח" דלוק בכל פתיחה של יצירה — לכבות בכל פעם. "לסנכרן ליומן" זוכר את הבחירה האחרונה (Keychain) — לכבות ולוודא.
  5. אדמין הסטייג׳ פתוח, לבדיקת פגישות שנוצרו ולמזהים לקישורים.
  6. העוזר (ב.5): המסלול נקבע לפי הטוקן. בכניסה רגילה באפליקציה הטוקן ישן, ולכן רק הצ׳אט הישן זמין (ח.4). את המסלול החדש אפשר לבדוק רק עם טוקן `User_Accounts` לפיתוח, בלי קומיט — לתאם עם אייל.
- עובר כש: הבנייה פונה ל-`hk-stage-462507` / `hk-jampa-dot-hk-stage-462507`, הנתונים מוכנים, ושום בדיקה לא נוגעת בלקוח אמיתי.

**R1 · הקלטה מהירה ללקוח בלי פגישה** · שניהם
- צעדים: 1) לקוח בלי פגישה היום (עם פגישה מחר). 2) בית ← "הקלטה מהירה". 3) חיפוש, גם באות סופית שגויה ("מ" במקום "ם"), ולחיצה על השם. 4) דקה דיבור, נעילת מסך ל-30 שניות תוך כדי דיבור, פתיחה. 5) השהיה ← "סיימתי" ← "סיום הקלטה", לחכות לסיכום. 6) באדמין לפתוח את הפגישה. 7) חזרה, ועוד חזרה. 8) (אופציונלי) אזור זמן לונדון במכשיר ושלבים 2–5 שוב.
- עובר כש: הגיליון נסגר, נפתח הכרטיס עם "פותח הקלטה…", ואז מסך הפגישה וההקלטה מתחילה לבד. באדמין פגישה אחת: "{שם}, DD/MM/YYYY", שעת הלחיצה בשעון ישראל (גם בלונדון), אזכור כבוי, מ-HH:MM עד שעה אחרי (≤ 23:59), הפגישה של מחר לא השתנתה. אין אירוע ביומן ואין תזכורת לאיש הקשר (לחכות 15 דק׳). חזרה → כרטיס, עוד חזרה → רשימה. התמלול כולל את מה שנאמר כשהמסך היה נעול.
- הסיכון: פגישה כפולה, שעה שגויה מחוץ לישראל, תזכורת או יומן ללקוח, הקלטה שלא מתחילה.

**R2 · "הקלטת הפגישה" מהפס בבית** · שניהם
- צעדים: 1) פגישה שלי היום בעוד ~שעתיים, בלי קרובה יותר. 2) בפס "הפגישה הבאה · בעוד H:MM" ← "הקלטת הפגישה". 3) לוודא בשורת המשנה של מסך הפגישה שזו אותה פגישה. 4) 30 שניות, השהיה, סיום. 5) וריאציה: מקליטים ומשהים, יוצאים לבית, ושוב "הקלטת הפגישה". 6) וריאציה: משתמש בלי פגישות משלו לוחץ על פגישה של יועץ אחר. 7) לחיצה כפולה מהירה.
- עובר כש: מקליט מיד על הפגישה שבפס, בלי "על איזו פגישה?" ובלי פגישה חדשה. 5: נפתחת הפגישה המושהית בלי הקלטה חדשה (תלוי ש-`uploads_started_count` כבר > 0 בשרת; אם לא — לרשום מה קרה). 6: "על איזו פגישה?" עם הפגישה שבפס ראשונה ו"· של {שם}", ובחירה בה פותחת בלי הקלטה. 7: כרטיס אחד ומסך אחד.
- הסיכון: הקלטה על פגישה אחרת, פיצול לשתי פגישות, הקלטה על פגישה של יועץ אחר.

**R3 · הקלטה מהכרטיס, פגישה בעוד פחות מ-30 דק׳** · שניהם
- צעדים: 1) פגישה שלי בעוד 35 דק׳ ← כרטיס: "בעוד 0:35" ו"הקלטה עכשיו". 2) להשאיר פתוח עד 0:30 בלי רענון. 3) "הקלטה", לוודא פגישה, השהיה וסיום. 4) פגישה שהתחילה לפני 10 דק׳ ← "הקלטה". 5) לקוח עם פגישה רק מחר ← "הקלטה עכשיו". 6) רקע 5 דק׳ וחזרה.
- עובר כש: ב-0:30 הכפתור מתחלף ל"הקלטה" בלי רענון ומקליט על הפגישה הקיימת. 5: נוצרת פגישה להיום (כמו R1), מחר לא נגעה. 6: הספירה מעודכנת.
- הסיכון: `nextReady` ו-`useMinuteClock` — כפתור שמקליט על פגישה לא נכונה או לא מתעדכן.

**R4 · "על איזו פגישה?"** · שניהם
- צעדים: שלוש חברות, פגישה אחת היום לכל אחת: (א) שלי בעוד שעתיים, (ב) שלי שכבר עברה היום ולא הוקלטה, (ג) של יועץ אחר; וחברה רביעית עם שלוש פגישות היום שלא הוקלטו. 1) בכל אחת: כרטיס ← "הקלטה עכשיו". 2) סגירה ב-X (ובאנדרואיד בחזרה). 3) פתיחה ובחירה בפגישה. 4) בג׳: "פגישה חדשה עכשיו". 5) מהבית, הקלטה מהירה: ב׳ מתחת ל"לאחרונה", ג׳ מתחת ל"לפי שם", א׳ מתחת ל"היום" (א׳ מופיעה רק שם).
- עובר כש: תתי־כותרות: א "מתחילה בעוד H:MM", ב "הייתה ב-HH:MM · לא הוקלטה", ג "… · של {שם}", חדשה "נפתחת פגישה ב-HH:MM ומתחילה הקלטה". לכל היותר שתי פגישות (בחברה הרביעית — שתי הקרובות בזמן). סגירה: אין ניווט ואין פגישה. בחירה בא׳ או בב׳ מקליטה על הפגישה. בחירה בג׳ פותחת בלי הקלטה. "חדשה" יוצרת ומקליטה. בבית: ב׳ וג׳ פותחות את "על איזו פגישה?", א׳ מקליטה ישר. ב-iOS הגיליון נסגר לפני שהמסך נפתח, בלי מסך לבן או חלון תקוע.
- הסיכון: הקלטה על פגישה של יועץ אחר, חלון תקוע ב-iOS (`closeChooser` מחכה 350 מ״ש).

**R5 · מיקרופון נדחה** · שניהם
- צעדים: iOS: 1) התקנה נקייה ← הקלטה מהירה ללקוח בלי פגישה ← "Don't Allow". 2) לוודא באדמין שאין פגישה. 3) שוב "הקלטה עכשיו". 4) "פתיחת ההגדרות" ← לאשר ← להקליט. אנדרואיד: 1) התקנה נקייה ← "לא לאפשר". 2) שוב, עד שהמערכת מפסיקה לשאול. 3) "פתיחת ההגדרות" ← לאשר. 4) לאשר מיקרופון ולדחות טלפון/התראות כשמסך הפגישה מבקש.
- עובר כש: גיליון "צריך הרשאה כדי להקליט" עם "הגדרות ← HK ← מיקרופון" (Jampa: Jampa), "פתיחת ההגדרות", "לא עכשיו", "לא נוצרה פגישה.", ובאמת אין פגישה. ב-iOS בפעם השנייה הגיליון מופיע מיד, בלי חלון מערכת. באנדרואיד אחרי כל דחייה בחלון המערכת מופיע הגיליון; חלון המערכת חוזר בכל ניסיון עד שהמערכת מפסיקה לשאול, ומאז הגיליון מופיע מיד. אחרי אישור ההקלטה עובדת. אנדרואיד 4: "חסרות הרשאות להקלטה" — כאן פגישה כבר נוצרה (הזרימה בודקת רק מיקרופון); לוודא שהכרטיס מציג אותה, ושהניסיון הבא מקליט עליה ולא יוצר שנייה.
- הסיכון: פגישות ריקות על הלקוח, או תקיעה בלי דרך להגדרות.

**R6 · לחיצה כפולה** · שניהם
- צעדים: 2–3 לחיצות מהירות על: "הקלטה מהירה", שם בגיליון, "הקלטת הפגישה", "הקלטה עכשיו"/"הקלטה", שורה ב"על איזו פגישה?", "פגישה חדשה עכשיו", "חזרה להקלטה"/"המשך או סיום", "סיום הקלטה". אחרי כל אחד: אדמין וחזרה אחורה.
- עובר כש: גיליון אחד, כרטיס אחד, מסך פגישה אחד (חזרה אחת → כרטיס), פגישה אחת, הקלטה אחת, סיום אחד. מותר "הקלטה אחרת בדיוק נפתחת · …" לכ-4 שניות.
- הסיכון: שתי פגישות או שני מסכי הקלטה. בחירת שם בגיליון בלי `guard`, וכל לחיצה עם `at` חדש — מוגנת רק ע״י הנעילה ב-`startRecordFlow`.

**R7 · בלי רשת ורשת איטית** · שניהם
- צעדים: 1) מצב טיסה ← כרטיס ← "הקלטה עכשיו". 2) Wi-Fi בלי אינטרנט ← "הקלטה עכשיו". 3) רשת איטית (iOS: Network Link Conditioner "Very Bad Network"; אנדרואיד: Charles/Proxyman) ← הקלטה מהירה ללקוח בלי פגישה ← עד 30 שניות. אם "הפגישה לא נוצרה" — לבדוק אדמין ושוב "הקלטה עכשיו". 4) רשת איטית ← "הקלטה עכשיו" ומיד חזרה לרשימה ← 30 שניות במסך אחר. 5) (א) סגירה מלאה, מצב טיסה, הפעלה ← בית ← לקוחות. (ב) הפעלה עם רשת, מצב טיסה, ואז כרטיס של לקוח שלא נפתח מאז ההפעלה. 6) באמצע הקלטה מצב טיסה לשתי דקות, חזרה, סיום.
- עובר כש: 1: תוך ~10 שניות "אין חיבור · אפשר לנסות שוב", הכפתור חוזר, אין פגישה. 2: "הפגישות לא נטענו · אפשר לנסות שוב". 3: לכל היותר פגישה אחת, והניסיון החוזר מקליט עליה. 4: שום מסך פגישה לא קופץ; אם נוצרה פגישה, היא בכרטיס כפגישה של היום בלי הקלטה. 5: (א) בבית "הפגישות לא נטענו" ו"טעינה מחדש", ברשימת הלקוחות "עוד אין לקוחות" (החברות לא נשמרות במכשיר). אם האפליקציה כבר נטענה עם רשת, הבית נשאר עם הנתונים הקודמים בלי הודעה — תקין. (ב) בכרטיס, אחרי ~7–10 שניות, "הפגישות לא נטענו" עם "הקלטה עכשיו" ו"טעינה מחדש". 6: באנר הרשת קריא, ההעלאה ממשיכה, הסיכום כולל הכל.
- הסיכון: פגישה כפולה, או מסך הקלטה שנפתח אחרי שהמשתמש עזב.

**R8 · השהיה, יציאה, חזרה, המשך וסיום** · שניהם
- צעדים: 1) הקלטה (כמו R1) והשהיה. 2) חזרה ← בכרטיס "הקלטה פתוחה"/"הוקלטה · טרם נסגרה" ← לחיצה ← נגן ← השהיה. 3) "ראשי" ← "לקוחות" ← נגן ← השהיה. 4) בבית לחיצה על פגישה של אותו לקוח, או הקלטה מהירה לאותו לקוח ← "המשך או סיום" ← נגן. 5) השהיה ← אווטאר ← חזרה (הטאבים נטענים מחדש) ← כרטיס ← "המשך או סיום" ← נגן. 6) השהיה ← רקע 5 דק׳ ← נגן. 7) השהיה ← "סיימתי" ← "סיום הקלטה". 8) אחרי העיבוד: כרטיס ובית.
- עובר כש: בכל חזרה אותה פגישה, וההקלטה ממשיכה ולא מתחילה מאפס. 3: אותו מסך מושהה. 4: הקלטה מהירה לאותו לקוח פותחת את המושהית בלי פגישה חדשה. אין פגישה שנייה. 8: "בעיבוד" ואז "מחכה לאישור" בכרטיס, ובבית ב"סיכומים לאישור". התמלול כולל את כל הקטעים. אם בשלב 2 הכרטיס לא מציג אף אחד מהשניים (ההעלאה עוד לא בשרת) — לרשום; זה פער ידוע (ו.2).
- הסיכון: `fresh` ו-`replace('PersonalArea')` מורידים את המסך המושהה, וההחזרה תלויה ב-`uploads_started_count`. קטע שהולך לאיבוד, או הקלטה חדשה על אותה פגישה.

**R9 · הקלטה שנייה כשיש הקלטה פתוחה** · שניהם
- צעדים: חברות בדיקה A ו-B, ל-B פגישה היום. 1) מקליטים על A בלי השהיה ← "ראשי", "לקוחות", חזרה. 2) קישור לפגישה של B (R10) ← כרטיס B ← "הקלטה עכשיו". 3) חזרה מכרטיס B. 4) קישור לפגישה של A. 5) קישור ל-B ← שורת פגישה של B (נפתח בלי הקלטה) ← חזרה עד A ← חזרה ו"ראשי". 6) השהיה של A ← בית ← הקלטה מהירה ל-B. 7) כש-A מקליטה (לא מושהית): קישור לפגישה אחרת של B (מזהה שונה מהקישור בשלב 5) עם `startrecord=0` ← נפתח מסך הפגישה של B דרך הכרטיס ← "הקלטת פגישה" בתוכו. 8) מסיימים את A, ואחרי שהעיבוד התחיל הקלטה מהירה ל-B.
- עובר כש: 1: שום דבר לא קורה. 2: "יש הקלטה פתוחה · אפשר להקליט אחרי שהיא נסגרת", A ממשיכה (טיימר ב-Live Activity/התראה). 3: חוזרים ל-A שמקליט. 4: חוזרים ל-A בלי מסך שני. 5: A ממשיכה, חזרה ו"ראשי" לא עושים כלום. 6: ההקלטה ל-B מתחילה (מכוון), ומסך A יורד מהמחסנית. לבדוק שבכרטיס A מופיע "הוקלטה · טרם נסגרה" (רק אם השרת כבר מחזיר `uploads_started_count > 0`), ושאפשר להמשיך ולסיים את A בלי לאבד קטעים. חוסם רק אם A עדיין מקליטה בנייטיב. 7: אם מתחילה הקלטה שנייה במקביל — ממצא חוסם לאייל (הכפתור בתוך מסך הפגישה לא עובר ב-`startRecordFlow`, כמו ב-`main`). 8: B מתחילה, בלי חסימה שנשארה.
- הסיכון: שתי הקלטות במקביל, או מסך מקליט שיורד מהמחסנית. `REC_STATE` בלי מזהה, ו-`getId` מזיז מסך קיים לראש.

**R10 · קישור לפגישה** · שניהם
- צעדים: `https://stg.hak.co.il/?openmeeting=ID&startrecord=1` (Jampa: `stg.jampa.ai`). אנדרואיד: `adb shell "am start -W -a android.intent.action.VIEW -d 'https://stg.hak.co.il/?openmeeting=ID&startrecord=1' com.hak.hk"` (Jampa `com.hak.nlp`). iOS: להדביק ב-Notes ← לחיצה ארוכה ← פתיחה באפליקציה. אם נפתח Safari — לבדוק על בנייה חתומה (TestFlight פנימי או Ad Hoc) עם `isProd = false`; בנייה מהקומיט פונה לפרודקשן, והמזהה מ-`stg` לא יימצא שם. 1) פגישה שלי מהיום שעוד לא הוקלטה (גם בעוד 3 שעות), אפליקציה ברקע; לסיים את ההקלטה לפני שלב 2. 2) פגישה אחרת שלי מהיום, שלא הוקלטה, בלי `startrecord`, ועוד אחת עם `startrecord=0`. קישור עם אותו `openMeeting` כמו הקישור האחרון שטופל מתעלם, עד שנפתח קישור למזהה אחר או שמסך הטאבים נטען מחדש — לכן כל פעם מזהה אחר. 3) פגישה של מחר עם `startrecord=1`. 4) מתוכננת של אתמול. 5) `processed` או `approve`. 6) פגישה שנוצרה באדמין אחרי שהאפליקציה נטענה. 7) אפליקציה סגורה לגמרי ← קישור לפגישה שלישית שלי מהיום שלא הוקלטה. 8) אחרי 7: אזור אישי ← חזרה. 9) מזהה שלא קיים.
- עובר כש: 1: טאב לקוחות ← כרטיס ← מסך הפגישה, והקלטה מתחילה. 2: בלי הפרמטר מקליט, עם `0` בלי הקלטה. 3–4: כרטיס ← מסך הפגישה בלי הקלטה. 5: מסך הסיכום בטאב "ראשי". 6: נטענת מהשרת ונפתחת. 7: "טוען נתונים..." ואז כמו 1, פעם אחת. 8: הקישור לא מטופל שוב. 9: לא קורה כלום, אין קריסה.
- הסיכון: קישור ישן שפותח מיקרופון, או קישור שמטופל פעמיים.

**R11 · Live Activity והתראת ההקלטה** · שניהם
- צעדים: iOS: 1) הקלטה ← נעילה ← לחיצה על ה-Live Activity / Dynamic Island. 2) השהיה ← בית ← רקע ← Live Activity. 3) סגירה מלאה בזמן השהיה ← Live Activity או אייקון. אנדרואיד: אותו דבר עם התראת ההקלטה.
- עובר כש: 1: חוזרים בדיוק למסך ההקלטה, בלי ניווט ובלי זרימה חדשה. 2: נפתח במקום שהיה (בית), ומשם כרטיס ← "חזרה להקלטה"/"המשך או סיום" עובד. 3: נפתח בבית, בכרטיס "הקלטה פתוחה"/"הוקלטה · טרם נסגרה", ממשיכים ומסיימים, אין כפילות.
- הסיכון: iOS `com.hak.hk://live-activity/focus?source=live_activity` (ב-Jampa `com.hak.nlp://live-activity/focus?source=live_activity`) — `deepLinks.ts` לא מפענח (לא `https`) ו-`AppTabsNavigator` מתעלם מ-`live_activity`. אנדרואיד `RECORDING_FOCUS` בלי כתובת. פתיחה שמפעילה זרימת קישור או מאבדת את מסך ההקלטה.

**R12 · "סיימתי" (`END_MEETING`)** · שניהם
- צעדים: 1) בזמן הקלטה בטאב "תמלול" אין "סיימתי". 2) השהיה ← "סיימתי" מופיע ← ניסיון לעבור ל"סיכום פגישה", "משימות", "משוב" (לא אמור לעבור). 3) "סיימתי" ← "ביטול" ← נגן ← השהיה. 4) עצירה אדומה ← לחיצה כפולה על "סיום הקלטה". 5) "מסיים..." ← "מכין סיכום פגישה..." ← "סיכום פגישה". 6) וריאציה: מהבית פותחים סיכום של פגישה אחרת, עוברים בו ל"תמלול" ומשאירים ב"ראשי"; בטאב "לקוחות" מקליטים, משהים ו"סיימתי".
- עובר כש: בזמן `scheduled`/`processing` אי אפשר לעבור לטאבים הפנימיים האחרים. "ביטול" משאיר מושהה. לחיצה כפולה מסיימת פעם אחת. 6: חלון סיום אחד, נסגרת רק הפגישה שהוקלטה, והסיכום בבית לא משתנה.
- הסיכון: `END_MEETING` ו-`REC_STATE` גלובליים בלי מזהה, ו-`MeetingDetailsScreen` יכול להיות פתוח גם ב-`SummaryDetails` וגם ב-`ClientMeetingDetails`. חלון סיום כפול או סיום הפגישה הלא נכונה.

**R13 · טאבים בזמן הקלטה ובהשהיה** · שניהם
- צעדים: 1) בזמן הקלטה: "ראשי" ואז "לקוחות". 2) השהיה ← "ראשי". 3) מהבית ← "לקוחות". 4) במסך המושהה שוב "לקוחות". 5) רשימה ← כרטיס ← "המשך או סיום" ← נגן ← השהיה ← סיום. 6) אחרי הסיום "ראשי" ו"לקוחות".
- עובר כש: 1: לא קורה כלום. 2: עוברים לבית. 3: חוזרים לאותו מסך מושהה. 4: חוזרים לרשימה (המסך יורד), ההשהיה נשמרת. 6: הטאבים עובדים. אם בכרטיס אין "המשך או סיום" (השרת עוד לא מחזיר `uploads_started_count > 0`) — לרשום; פער ידוע (ו.2).
- הסיכון: יציאה ממסך מקליט, או השהיה שהולכת לאיבוד.

**R14 · חזרה והחלקה בזמן הקלטה** · שניהם
- צעדים: 1) בזמן הקלטה חץ החזרה בכותרת. 2) אנדרואיד: כפתור חזרה ומחוות חזרה (15/16). 3) iOS: החלקה מהקצה. 4) בהשהיה: 1–3 שוב. 5) בכרטיס עם "פותח הקלטה…" (רשת איטית): חזרה.
- עובר כש: 1–3: המסך לא נסגר וההקלטה ממשיכה. אם ב-iOS ההחלקה סוגרת — ההקלטה חייבת להמשיך, הכרטיס מציג "הקלטה פתוחה" ו"חזרה להקלטה" מחזיר; לדווח לאייל בכל מקרה (אין `gestureEnabled:false`). 4: חוזרים לכרטיס. 5: חוזרים לרשימה ושום מסך הקלטה לא נפתח אחר כך.
- הסיכון: מסך מקליט שנסגר בהחלקה (סעיף ז).

**N1 · שני טאבים, שורת סטטוס, טאב־בר** · שניהם
- צעדים: 1) HK "ראשי · לקוחות", Jampa "ראשי · מטופלים", אין "פגישות". 2) אייקון נבחר נייבי (Jampa סגול), השני אפור. 3) בבית שורת הסטטוס נייבי עם אייקונים בהירים, בשאר המסכים בהירה; משיכה למטה בבית — הנייבי ממשיך. 4) גובה ומרווח תחתון בכל ארבעת המכשירים. 5) בכרטיס, "כל הפגישות", הכנה ועוזר — השורה האחרונה לא מתחת לטאב־בר.
- עובר כש: הכל כמתואר, בלי הבהוב בצבע שורת הסטטוס. באנדרואיד 15+ הנייבי מאחורי שורת הסטטוס.
- הסיכון: `currentRoute === 'HomeMain'` ו-`TopInsetTint`. באנדרואיד 15+ `backgroundColor` של `StatusBar` לא נלקח בחשבון.

**N2 · לחיצה על טאב ושמירת מחסנית** · שניהם
- צעדים: 1) ראשי ← "כל הפגישות" ← "ראשי" (וגם מ"לטיפול", מסיכום ומהכנה). 2) לקוחות ← כרטיס ← "כל הפגישות" ← פגישה ← "לקוחות". 3) לקוחות ← כרטיס ← ראשי ← לקוחות. 4) ראשי ← "כל הפגישות" ← לקוחות ← ראשי.
- עובר כש: 1–2: ראש הטאב. 3–4: כל טאב שומר את המסך שהיה פתוח.

**N3 · מחסנית נקייה בכניסה לכרטיס מבחוץ** · שניהם
- צעדים: 1) לקוחות ← כרטיס X ← "כל הפגישות" ← פגישה. 2) ראשי ← פגישה בפס של לקוח Y. 3) חזרה, ועוד חזרה. 4) כרטיס X ← העוזר; ראשי ← פגישה של X ברצועה ← חזרה. 5) הפעלה מאפס ← הקלטה מהירה (או פגישה) בלי כניסה קודמת ללקוחות ← חזרה מהכרטיס. 6) בית ← "כל הפגישות" ← פגישה מתוכננת.
- עובר כש: 2: כרטיס Y בטאב הלקוחות. 3: חזרה אחת → רשימה. 4: כרטיס X, חזרה → רשימה (העוזר ירד). 5: חזרה → רשימה. 6: כרטיס ← מסך הפגישה בלי הקלטה, חזרה → כרטיס.
- הסיכון: מחסנית עמוקה או כפולה, כרטיס של לקוח אחר מתחת.

**N4 · "כל הפגישות"** · שניהם
- צעדים: 1) בית ← "כל הפגישות": כותרת ו"קרובות" נבחר. 2) פגישה מתוכננת; "התחל והקלט" על מתוכננת; פגישה ממתינה/הושלמה. 3) כשאין פגישות היום ובשבוע: "קביעת פגישה" ← "ביטול". 4) "סיכומים לאישור" ← "כל הסיכומים". 5) כרטיס ← "כל הפגישות": פגישה, "התחל והקלט", "קביעה מחדש" בפגישה שלא התקיימה. 6) החלקה לעריכה ומחיקה — רק בחברת בדיקה.
- עובר כש: 2: מתוכננת → כרטיס → מסך הפגישה; "התחל והקלט" → זרימת הכרטיס (R2–R4); סיכום → "ראשי". 3: חלון מעל "כל הפגישות" עם "ביטול" ובלי "התחל והקלט". 4: "ממתינות לאישור" נבחר. 5: "התחל והקלט" חוזר לכרטיס (המסך יורד) ומקליט; חזרה ממסך הפגישה → כרטיס. 6: הרשימה מתעדכנת.

**N5 · סיכומים מהבית** · שניהם
- צעדים: 1) "סיכומים לאישור" ← שורה. 2) הטאב־בר על "ראשי", "סיכום פגישה" פתוח. 3) אישור בחברת בדיקה (M2). 4) חזרה.
- עובר כש: נפתח בטאב "ראשי" בלי כפתור הקלטה. אחרי אישור וחזרה הפגישה יצאה מהרשימה והמונה ירד.
- הסיכון: מסך הקלטה שנפתח בטאב הבית.

**N6 · שאר הכניסות בבית והתנתקות** · שניהם
- צעדים: 1) "לטיפול"/"חיזוקים" ← חלון תקציב אם יש ← חזרה. 2) "הכנה לפגישה"/"בריף לפגישה" ← חזרה. 3) אווטאר ← אזור אישי ← חזרה; התנתקות מהאזור האישי והתחברות. 4) בלי פגישה נוספת היום: "הבאה: …".
- עובר כש: כל כניסה נפתחת וחוזרת לבית. "הבאה:" פותח את הכרטיס. אצל יועץ ההתנתקות רק מהאזור האישי, והיא עובדת.

**N7 · מצבי הבית** · שניהם
- צעדים: 1) פגישה בעוד שעה: "בעוד 1:00", ואחרי דקה יורד. 2) שהתחילה: "הפגישה עכשיו · עד HH:MM"; פגישה בלי שעת סיום — "הפגישה עכשיו" בבית, ובכרטיס לרשום אם מופיע "הפגישה עכשיו · עכשיו". 3) סיכום קודם ממתין: "הסיכום מהפגישה הקודמת מחכה לאישור". 4) "אין פגישות היום" / "אין פגישות נוספות היום". 5) "שתיים נוספות בשבוע הקרוב" / "אין פגישות בשבוע הקרוב", גלילה אופקית נעצרת על כרטיסייה, לחיצה → כרטיס. 6) "יום {שם} · DD.MM.YYYY". 7) משיכה לרענון; אחרי סיום הקלטה הבית מתעדכן תוך כמה שניות. 8) טקסט מערכת גדול.
- עובר כש: תואם לאדמין בשעון ישראל, והרצועה לא נחתכת בטקסט גדול.

**N8 · רשימת הלקוחות** · שניהם
- צעדים: 1) חיפוש: תחילת מילה קודם, אותיות סופיות, גרשיים, ח.פ מ-3 ספרות (בשני המותגים), Enter עם תוצאה אחת. 2) צ׳יפים עם מונים, צ׳יף ריק לא מוצג. 3) שורה: שם, התראה אחת, פגישה הבאה ("היום HH:MM" / "לא נקבעה"). 4) משתמש משרד HK: שינוי סטטוס בחברת בדיקה — ✓ על הנוכחי, לחיצה עליו לא עושה כלום, רקע לא סוגר, X וחזרה סוגרים. 5) "חברה חדשה"/"מטופל חדש" נפתח ונסגר בלי שמירה. 6) אין החלקה. 7) להשאיר את המסך פתוח דקות ארוכות.
- עובר כש: הכל כמתואר, גלילה לא קופצת בטקסט גדול. לקוח בלי `status` מציג "—" ולא נספר בצ׳יפים — לרשום אם יש כאלה בנתונים. 7: "היום HH:MM" ו"לא התקיימה" לא מתעדכנים עד כניסה או רענון (ידוע, ו.3).

**A1 · העוזר: פתיחה והצעות** · שניהם
- איזה מסלול: לפי הטוקן (ב.5, ה.0.6). בכניסה רגילה באפליקציה — הישן. החדש — עם טוקן `User_Accounts` לפיתוח, בתיאום עם אייל. ב-Jampa המסלול החדש ממתין לצד של Jampa (ח.4); עד אז בודקים שם רק את שלב 9.
- צעדים (שני המסלולים): 1) כרטיס ← גלילה: "שאלה על {שם}…" קבועה. 2) לחיצה: שם הלקוח + "עוזר", מקלדת פתוחה, טקסט הרמז בשדה נכון. 3) לקוח בלי היסטוריה: "מה לבדוק על {שם}?" וההצעות — HK ארבע (כולל "מה מגמת ההכנסות ב-3 החודשים האחרונים?"), Jampa שלוש. 4) טקסט בשדה בלי לשלוח, ולחיצה על הצעה. 5) הקלדה בזמן שהתשובה בדרך. 6) לקוח עם היסטוריה, ופתיחה במצב טיסה.
- צעדים (החדש בלבד): 7) לקוח עם שיחות קודמות (גם כאלה שנפתחו בממשק): "שיחות קודמות" ← שיחה ← "שיחה חדשה". 8) ההצעה על מגמת ההכנסות, או שאלה שהתשובה עליה עם טבלה, רשימה או גרף ← גלילה בטבלה. 9) Jampa, כל עוד השרת מחזיר 409: שאלה בשיחה חדשה ← יציאה וכניסה מחדש למסך. 10) יציאה מהמסך בזמן שהתשובה בדרך ← כניסה ← "שיחות קודמות" ← אותה שיחה.
- עובר כש (הישן): ההצעה נשלחת כבועה, ההצעות נעלמות, תשובה מגיעה. הטקסט המוקלד נשאר. השדה נעול עד סוף התשובה. עם היסטוריה או כשהטעינה נכשלה — אין הצעות.
- עובר כש (החדש): ההצעה נשלחת, מופיעות שלוש נקודות ו"ממתינים לתשובת העוזר לפני שאלה נוספת.", ואז תשובה ב-Markdown בלי סימנים גולמיים (`**`, `|`, `#`). הטקסט המוקלד נשאר; בזמן ההמתנה אפשר להקליד ואי אפשר לשלוח. ההצעות מופיעות גם כשיש היסטוריה, ומתחתן "שיחות קודמות"; 6: "השיחות הקודמות לא נטענו · ניסיון נוסף". 7: השיחה נפתחת עם כל ההודעות, "שיחה חדשה" חוזר למסך הפתיחה, והרשימה זהה לרשימה בממשק לאותו משתמש ולאותה חברה. 8: טבלה צרה ברוחב מלא, רחבה נגללת הצידה, גרף לא יוצא מהמסך, בלי HTML גולמי. 9: "העוזר אינו זמין כרגע. אפשר לנסות שוב מאוחר יותר.", ובכניסה מחדש אין שיחה ריקה חדשה ב"שיחות קודמות". 10: התשובה מופיעה, או שהנקודות ממשיכות עד שהיא מגיעה.

**A2 · שליחה לעוזר נכשלת** · שניהם
- צעדים: 1) עוזר עם רשת. 2) מצב טיסה. 3) "בדיקה" ← שליחה. 4) רשת ← שליחה חוזרת (בישן "לנסות שוב", גם כפול; בחדש שוב כפתור השליחה, גם כפול). 5) אותו דבר עם הצעה. 6) אחרי רענון — השאלה לא נשמרה פעמיים. בחדש בלבד: 7) שאלה עם רשת, ומיד מצב טיסה לחצי דקה, וחזרה. 8) לחיצה כפולה מהירה מאוד על כפתור השליחה עם רשת.
- עובר כש (הישן): אחרי ~7–10 שניות (`retryRequest`) הבועה נעלמת ומופיע "השאלה לא נשלחה · לנסות שוב", בלי חלון שגיאה של המערכת. בטקסט מוקלד הוא נשאר בשדה והשדה פתוח. בהצעה השדה לא משתנה, וההצעות מופיעות שוב יחד עם שורת השגיאה. "לנסות שוב" שולח פעם אחת.
- עובר כש (החדש): אין בועה. מעל השדה שורה אדומה "השאלה לא נשלחה. אפשר לנסות שוב.", בלי חלון שגיאה של המערכת, מיד או לכל היותר אחרי 30 שניות. הטקסט המוקלד נשאר בשדה. 6: בשיחה השאלה מופיעה פעם אחת. 7: מהבדיקה השלישית שנכשלה שורה כתומה "יש קושי זמני לבדוק את מצב התשובה. ממשיכים לנסות…"; כשהרשת חוזרת התשובה מגיעה והשורה נעלמת. 8: שאלה אחת בשיחה — אם נשלחו שתיים, לרשום.
- הסיכון: בישן `handle-chat` עובר ב-`retryRequest`, ותשובה שאבדה אחרי שהשרת קיבל עלולה להישמר פעמיים. בחדש אין `retryRequest`, ואחרי כישלון קוראים את השיחה ומציגים שאלה שכבר נשמרה; אבל אין נעילה ב-`ref` על השליחה (ב.5).

**A3 · מקלדת בעוזר ובגיליון, iOS** · iOS
- צעדים: Face ID וכפתור בית, בכל מסלול שזמין: 1) עוזר מהכרטיס. 2) הרבה שורות. 3) שליחה וגלילה עם מקלדת. 4) סגירת מקלדת. 5) הכתבה. 6) חיפוש בגיליון "הקלטה מהירה". 7) בחדש: שיחה פתוחה (עם הפס "שיחה חדשה") ← הקלדה.
- עובר כש: השדה צמוד מעל המקלדת, ההודעה האחרונה נראית, בסגירה השדה מעל הטאב־בר. 7: השדה לא נכנס מתחת למקלדת. בגיליון שדה החיפוש והתוצאות הראשונות גלויים.
- הסיכון: בחדש ההיסט הוא `keyboardOffset` + גובה הפס העליון כשיש שיחה פתוחה.

**A4 · מקלדת, אנדרואיד** · אנדרואיד
- צעדים: 1) אנדרואיד 15/16 מחוות: עוזר, הקלדה, שליחה, סגירה — בכל מסלול שזמין, ובחדש גם עם שיחה פתוחה. 2) אנדרואיד 13/14 שלושה כפתורים. 3) Gboard ומקלדת סמסונג. 4) חיפוש בגיליון "הקלטה מהירה". 5) "קביעת פגישה" מהכרטיס: שדה הכותרת.
- עובר כש: השדה תמיד מעל המקלדת, בלי רווח כפול (13/14), הטאב־בר לא מכסה. בגיליון שדה החיפוש והתוצאה הראשונה גלויים.
- הסיכון: `keyboardOffset` חל גם באנדרואיד בשני המסלולים (`behavior 'height'`); תצוגה מקצה לקצה כפויה מ-15 עם `targetSdk` 36; ל-`ClientPickerSheet` אין `behavior` באנדרואיד.

**C1 · כרטיס הלקוח: מבנה ומצבים** · שניהם
- צעדים: 1) כותרת: חזרה, שם, התראה, "···", בלי חיוג ווואטסאפ. 2) כל מצבי הבלוק: שלד, "לא נקבעה פגישה", הפגישה הבאה, "הקלטה פתוחה", "הוקלטה · טרם נסגרה", "הפגישות לא נטענו". 3) "פגישות": מונה, עד 4 שורות, "כל הפגישות". 4) "פרטים": טלפון 05X-XXX-XXXX; HK ח.פ ומנהל תזרים; Jampa "כל כמה ימים חיזוק". 5) בזמן "פותח הקלטה…" — "···", שורות הפגישות ושורת העוזר לא מגיבות.
- עובר כש: הכל כמתואר ותואם לאדמין.

**C2 · קביעה ושינוי מועד בחלון מעל הכרטיס** · שניהם
- צעדים: חברת בדיקה, "אזכור ללקוח" כבוי. 1) "קביעה ›" ← החלון עם הלקוח ממולא ← X / "ביטול" / חזרה. 2) מחר 10:00 ← "אישור". 3) "···" ← "קביעת פגישה" ← שעה אחרת. 4) "···" ← "שינוי מועד הפגישה הבאה" ← "שמירה". 5) לחיצה כפולה על "אישור".
- עובר כש: סגירה משאירה את הכרטיס בלי שינוי. בחלון "ביטול" ואין "התחל והקלט". אחרי שמירה נשארים בכרטיס והבלוק מתעדכן. ב-iOS התפריט נסגר לפני שהחלון נפתח. לחיצה כפולה → פגישה אחת.

**C3 · ארכיון ומחיקה** · שניהם
- צעדים: רק החברות החד־פעמיות. 1) "···" ← "העברה לארכיון" ← לחיצה אחת: "לחיצה נוספת מעבירה לארכיון". 2) סגירה ופתיחה של התפריט. 3) לחיצה כפולה מהירה (< 0.6 שניות). 4) לחיצה, שנייה המתנה, לחיצה. 5) חברה שנייה: "מחיקת החברה"/"מחיקת המטופל" ← "לחיצה נוספת מוחקת" ← לחיצה. 6) מצב טיסה: לחיצה ואישור. 7) "העברה לארכיון" ואחריה מחיקה.
- עובר כש: 2: האישור מתאפס. 3: לא עובר לארכיון. 4: חוזרים לרשימה, הלקוח לא ברשימה ולא בגיליון ההקלטה המהירה. 5: נמחק. 6: אחרי ~7–10 שניות "הפעולה לא נשמרה · אפשר לנסות שוב", נשארים בתפריט. האישור נשאר דרוך: לחיצה אחת נוספת מנסה שוב מיד בלי "לחיצה נוספת…" — לרשום. 7: המחיקה רק מבקשת אישור.
- הסיכון: מחיקה בטעות בלחיצה כפולה (`SECOND_TAP_MS=600`).

**C4 · שאר פעולות התפריט** · שניהם
- צעדים: 1) "עריכת פרטים" ← שינוי ושמירה בחברת בדיקה. 2) "הוספת משימה" ← פתיחה וסגירה. 3) מעבר מהיר: תפריט ← פעולה מיד.
- עובר כש: חלון אחד בכל פעם, סגירה חוזרת לכרטיס, הפרטים מתעדכנים אחרי עריכה.
- הסיכון: `afterMenu` סוגר את התפריט ומחכה 350 מ״ש לפני `EditCompany` / `TaskEventDialog`. הבדיקה: שאין חלון תקוע ב-iOS כשהמעבר מהיר.

**M1 · מסך הפגישה בעיצוב החדש** · שניהם
- צעדים: 1) פגישה מתוכננת: "סיכום - {כותרת}", שורת משנה "DD.MM.YYYY · HH:MM · {יועץ}" (טווח HH:MM-HH:MM רק כש"אזכור ללקוח" דלוק), תג "היום", טאבים עם קו נייבי. 2) לקוח עם שם באנגלית — סדר שורת המשנה. 3) "הקלטת פגישה" אדום, "מקליט פגישה" וטיימר, בהשהיה נגן ועצירה. 4) "טוען תמלול…", "ממתין לתמלול מהשרת…", "מכין סיכום פגישה...". 5) באנרי רשת והעלאה. 6) HK ו-Jampa, מסך קטן, טקסט גדול.
- עובר כש: טקסטים לא נחתכים, "סיימתי"/"ייצוא"/"היום" לא דוחפים את הכותרת, שורת המשנה לא מתהפכת.
- הסיכון: מבנה הכותרת ב-`MeetingDetailsScreen` השתנה (לא רק סגנון).

**M2 · אישור ושליחת סיכום** · שניהם
- צעדים: פגישת בדיקה `processed`, נמענים מהצוות בלבד. 1) משימות לא מאושרות ← "אישור ושליחת סיכום" ← "לא ניתן לאשר…" ← "מעבר למשימות" — גם מהכרטיס (`ClientMeetingDetails`) וגם מהבית (`SummaryDetails`). 2) אישור כל המשימות ← "אישור ושליחת סיכום" ← רק איש קשר מהצוות ← שליחה. 3) פגישה אחרת: "אישור ללא שליחה". 4) כרטיס ובית.
- עובר כש: 1: טאב "משימות" באותו מסך, בלי מסך נוסף. 2: ההודעה רק לנמען שנבחר, "אושר", "ייצוא" מופיע. 3: מאושרת בלי שליחה. 4: "אושר" בכרטיס, יצאה מ"סיכומים לאישור".
- הסיכון: `navigate` עם `name: route.name`. API: `GET /meetings/{id}/get-meeting-summary-users?recipient_format=contacts`, `POST /meetings/{id}/send-meeting-summary` עם `{contact_ids}` (או `{users}` כשלנמענים אין `contactId`), בלי ניסיון חוזר, `GET /meetings/{id}/approve`.

**M3 · משימות** · שניהם
- צעדים: "הוסף משימה"; עריכה ← "שמור" / "ביטול"; "מחיקה" ← "שחזור"; "אישור"; טקסט ארוך; מקלדת ב-iOS ובאנדרואיד 15+; כל פעולה במצב טיסה.
- עובר כש: כל פעולה נשמרת ורענון מציג אותו מצב. בכישלון המצב חוזר ומופיעה שגיאה. השדה מעל המקלדת.
- הסיכון: עטיפה חדשה (`panel`, `metaRow`). API: `POST /tasks/{meetingId}/action-items`, `PATCH /tasks/{id}/update-task`, `PATCH /tasks/{id}/approve`.

**M4 · משוב** · שניהם
- צעדים: פתיחה וסגירה של נושאים, נושא בתחתית, פגישה בלי משוב, טעינה.
- עובר כש: האקורדיון עובד, פתיחה גוללת לנושא, שום דבר לא נחתך.

**M5 · ייצוא ושליחה חוזרת** · שניהם
- צעדים: פגישה `approve`: 1) "ייצוא" ← התפריט צמוד מתחת לכפתור (מגרעת, בלי מגרעת, אנדרואיד). 2) "ייצוא ל-PDF" ← "הייצוא הושלם" ← "פתיחה", ופעם שנייה "סגירה". 3) חברת בדיקה: "שליחה חוזרת" ← "בוצע".
- עובר כש: נפתח PDF עם סיכום ומשימות. "שליחה חוזרת" מחזירה ל"אישור ושליחת סיכום" ולא שולחת בעצמה (`PUT /meetings/{id}` עם `status 'processed'`).

**M6 · משתמש CUSTOMER** (אם יש משתמש בדיקה) · שניהם
- צעדים: התחברות; `CustomerVoiceHomeScreen`, `MyProcessScreen`, `TargetsScreen`, `CompanyFilesScreen` — `AppHeader` ורקע; פגישה מ-`MyProcessScreen`.
- עובר כש: שום מסך לא נשבר, "חברה חדשה" לא מוצג. במסך הפגישה רק "סיכום פגישה" ו"משימות".
- הסיכון: `AppHeader`, רקע `c.bg` ו-`MeetingDetailsScreen` משותפים עם אפליקציית הלקוח.

**P1 · הכנה לפגישה / בריף (`94a7f80`)** · שניהם
- צעדים: 1) מהבית ומהכרטיס: "הכנה לפגישה" (HK) / "בריף לפגישה" (Jampa). 2) לקוח עם פגישות קודמות: פתיחה וסגירה של כל הסעיפים, משימות עם "בוצע" ובלי. 3) לקוח בלי פגישות קודמות ("אין פגישות קודמות, לא ניתן לבצע הכנה לפגישה"). 4) משיכה לרענון וטעינה ראשונה ("מכין פגישה..."). 5) מסך קטן וטקסט גדול.
- עובר כש: ב-HK אין סגול בכלל (רק נייבי/קורל/אפורים), ב-Jampa צבעי Jampa. כל הסעיפים בפאנל אחד, הפינות לא חותכות תוכן, והאקורדיון נפתח ונסגר. "בוצע" ירוק, השאר על `c.chip`. ספינר ורענון בצבע המותג. הנתונים זהים ל-`main`.
- הסיכון: עיצוב בלבד (`panel`/`panelClip`/`panelInner`), אבל העטיפה החדשה יכולה לחתוך תוכן או לשבור את האקורדיון.

**J1 · הנוסח ב-HK וב-Jampa** · שניהם
- צעדים (HK / Jampa): טאב־בר "לקוחות"/"מטופלים"; כותרת הרשימה; "חברה חדשה"/"מטופל חדש"; טקסט הרמז בשדה "חיפוש לפי שם או ח.פ"/"חיפוש לפי שם" (החיפוש עצמו זהה); "לטיפול"/"חיזוקים"; "הכנה לפגישה"/"בריף לפגישה"; "בוחרים לקוח/מטופל ומקליטים — גם בלי פגישה"; "לאיזה לקוח?"/"לאיזה מטופל?"; "לא נמצא לקוח/מטופל בשם"; "עוד אין לקוחות/מטופלים"; "מחיקת החברה"/"מחיקת המטופל"; "יועץ אחר"/"מטפל אחר"; "הגדרות ← HK/Jampa ← מיקרופון"; ח.פ, מנהל תזרים ו"בעיה תזרימית" רק ב-HK; "כל כמה ימים חיזוק" רק ב-Jampa; ב-Jampa כותרת פגישה מותאמת לא מוצגת בבית, ברצועה ובכרטיס; הצעות העוזר (HK ארבע כולל מגמת ההכנסות, Jampa שלוש); צבעים (HK נייבי וקורל, Jampa סגול על קרם, הקלטה אדום בשניהם).
- עובר כש: ב-Jampa אין "לקוח", "לקוחות", "חברה" או "יועץ" במסכים שהענף הוסיף, וב-HK אין "מטופל". בחלון קביעת הפגישה יש מילים מלפני הענף ("אזכור ללקוח", "שם לקוח", "בחר לקוח", "יש לבחור לקוח") — לרשום, לא לחסום.

## ו · מה לא נעשה בכוונה / סיכונים שנשארו

### ו.1 הוסר בכוונה
- **"התחל והקלט" בחלון יצירת פגישה** (`MeetingsListScreen.tsx:603`, `ClientDetailsScreen.tsx:842` מעבירים `secondaryButtonMode="cancel"`). כל הקלטה עוברת ב-`startRecordFlow`, כדי שיהיו בדיקת הקלטה פתוחה, מיקרופון ומסך הקלטה אחד.
- **החלקה וכפתור פעולה מהשרת ברשימת הלקוחות.** הפעולות עברו לתפריט "…" בכרטיס. הכפתור (`consultant_ui_status.cta`) לא הוחלף. `editMeeting` / `createMeeting` / `initialTab` נשארו בכרטיס לתאימות בלבד.
- **הקלטה מקישור.** ב-`main` הקישור הקליט על כל פגישה מתוכננת (מכל תאריך, גם של יועץ אחר), כי ההקלטה האוטומטית ב-`TranscriptTab` רצה כש-`statusNow === 'scheduled'`. עכשיו רק פגישה מתוכננת של היום, ורק דרך `planRecord` (של יועץ אחר → "על איזו פגישה?"). הסיבה: קישור ישן לא יפתח מיקרופון.
- **חיוג ווואטסאפ בכרטיס** (`d4564f4`).

### ו.2 פערים בהקלטה (נשארו לשלב 2: הקשחת `TranscriptTab`, שדורשת מכשיר)
- **ל-`REC_STATE` אין `meetingId`.** נשלח מ-`TranscriptTab.tsx` (1273, 2500, 2526, 2756, 2831, 2947, 3024, 3478, 3497, 3540, 3714) עם `{hasAnyRecording, paused}` בלבד. לכן `recordingState.ts` שואל קודם את הנייטיב, ואם הוא לא עונה — נשען על האירוע. הוספת מזהה היא שינוי לוגיקה ב-`TranscriptTab`, ובענף הזה הוא קיבל עיצוב בלבד.
- **מסך פגישה שלא מקליט משדר "לא מקליט" בכל כניסה.** `TranscriptTab.tsx:3711-3716` (`useFocusEffect`) שולח `hasAnyRecording.current` (`false`) ודורס את `AppTabsNavigator.isRecordingRef` (חסימת "ראשי" ו-`beforeRemove`), `MeetingDetailsScreen.recState` ("סיימתי", חסימת חזרה) ו-`getRecState`. האיפוס (`CommonActions.reset`) של `fresh` נשען על `getRecState`. תרחיש: בזמן הקלטה קישור פותח כרטיס של לקוח אחר, ומשם פגישה אחרת — ה-JS חושב שלא מקליטים. `startRecordFlow` מוגן כי שואל את הנייטיב. לא נבדק על מכשיר.
- **`END_MEETING` גלובלי.** `MeetingDetailsScreen.tsx:685` שולח בלי מזהה, ו-`TranscriptTab.tsx:3188` פותח `EndRecordingModal` בכל `TranscriptTab` מורכב. עם שני `ClientMeetingDetails` במחסנית (או `SummaryDetails` בבית) לחיצה אחת עלולה לפתוח שני חלונות. לא טופל ולא נבדק (R12).
- **הנייטיב לא רואה הקלטה שהמשתמש השהה.** השהיה של המשתמש קוראת ל-`stopRecording` → `AudioMeterModule.stopMetering` (`TranscriptTab.tsx:3061`). `pausedManagedRecordings` מתמלא רק בהשהיה בגלל שיחה (iOS `pauseForConnectedCallWithReason`, `AudioMeterModule.m:3737-3772`; אנדרואיד `AudioMeterService.pauseAllForActiveCall`, 1478-1487). התוצאות: (1) אפשר להקליט פגישה אחרת כשאחת מושהית — מכוון. (2) הכרטיס לא מציג "הקלטה פתוחה", ו"הוקלטה · טרם נסגרה" רק אם השרת כבר מחזיר `uploads_started_count > 0`. (3) `fresh` מוריד מסך מושהה מהמחסנית.
- **פגישות יתומות מהקלטה מהירה.** `recordFlow.ts:241-282` יוצר פגישה לפני שההקלטה מתחילה. אם יצאו מהמסך אחרי היצירה, נפתחה בינתיים הקלטה אחרת ("הפגישה נוצרה בלי הקלטה"), ההפעלה האוטומטית (`TranscriptTab.tsx:3725-3733`) לא רצה או נכשלה, או שהאפליקציה נסגרה — הפגישה נשארת `scheduled` ונראית אחר כך "לא התקיימה". אותו דבר ב"פגישה חדשה עכשיו". אין ניקוי.
- **אין פס "מקליט עכשיו" בין המסכים.** מצב ההקלטה רק במסך הפגישה ובכרטיס של הלקוח (`todays.slice(0,4)`). "ראשי" נחסם בלי הסבר (`AppTabsNavigator.tsx:317`, כמו ב-`main`).
- **החסימה של הטאבים רק על `tabPress`.** ניווט מהקוד עוקף אותה: קישור לפגישה לא מתוכננת בזמן הקלטה מעביר ל"ראשי" (`Home › SummaryDetails`), ו-`openClientCard` מעביר לכרטיס. מסך ההקלטה נשאר מורכב במחסנית הלקוחות.
- **הקלטה של פגישה מיום אחר לא מוצגת בכרטיס.** "התחל והקלט" על פגישה עתידית → `record explicit:true` → `planRecord` מקליט על פגישה שלי בכל תאריך. הכרטיס בודק רק פגישות של היום. החסימה של הקלטה שנייה עדיין עובדת (`blockedByOpenRecording` סורק 8).
- **`freshMeetings` עם `retryRequest`.** עד 3 ניסיונות חוזרים (1+2+4 שניות), `[]` על 404, והבקשה ממשיכה ברקע אחרי ה-10 שניות. 404 מחזיר `[]`: בלי פגישה מבוקשת → `create`, עם פגישה מבוקשת → "הפגישה לא נמצאה · אפשר להקליט בלי פגישה".
- **"סיכום -" בזמן הקלטה.** `MeetingDetailsScreen.tsx:655` מציג "סיכום - {כותרת}" גם לפגישה מתוכננת ("סיכום - {שם}, 15/09/2026"). הטקסט לא שונה, כי הזירה קיבלה עיצוב בלבד.
- **`MyProcessScreen` מנווט ל-`MeetingDetails` בשורש** (`MyProcessScreen.tsx:1009`, כולל `startRecord:true`). ל-CUSTOMER אין טאב תמלול, אז לא מתחילה הקלטה. אבל `Stack.Screen "MeetingDetails"` רשום ב-`RootNavigator.tsx:160` גם ליועץ, וכל `navigate('MeetingDetails')` עתידי מתוך `Main` יעקוף את הכלל. `MeetingsStack.tsx` ו-`MeetingsStackParamList` בלי שימוש.

### ו.3 ניווט, נתונים וביצועים
- **`clientOfMeeting` בלי שם.** חברה שלא ב-`activeCompanies` (למשל בארכיון) → `{id, name: company_name ?? ''}`, ול-`Meeting` אין `company_name`. מקישור או מ"כל הפגישות" ייפתח כרטיס בלי שם, ובחירה ב"פגישה חדשה עכשיו" בגיליון "על איזו פגישה?" תיצור כותרת ", DD/MM/YYYY".
- **עומס טעינה.** `HomeScreen`: `getAllMeetingsByIds` בכל חזרה למסך (`STALE_MS` חל רק בלי יציאה). `ClientsListScreen`: פגישות לכל היותר פעם בדקה, אבל `getActiveCompanies` + `getCompanyStatuses` בכל כניסה. בנוסף לטעינה ב-`AppTabsNavigator`. בלי טווח תאריכים. לא נמדד על יועץ עם הרבה חברות.
- **`ClientsListScreen` בלי `useMinuteClock`.** `now` מתעדכן רק ב-`loadData`, אז "היום HH:MM" ו"לא התקיימה dd.mm" מתיישנים כשהמסך פתוח. בבית ובכרטיס השעון מתעדכן כל דקה.
- **ברירת המחדל `status: company.status || 'active'` הוסרה.** לקוח בלי `status` לא נספר בצ׳יפים של `business '1'` ומוצג "—".
- **מקלדת באנדרואיד בגיליון ההקלטה המהירה.** `ClientPickerSheet.tsx:139`: `behavior` הוא `undefined` באנדרואיד, בתוך `Modal` עם `statusBarTranslucent`. באנדרואיד 15+ חלק מהרשימה יכול להיות מוסתר. לא נבדק (A4).
- **`types/navigation.ts` לא עודכן** והמסכים החדשים `any`. `tsc` לא יתפוס טעות בשם נתיב או בפרמטרים.

### ו.4 לא נבדק
- הקלטה אמיתית על מכשיר (המיקרופון בוטל בסימולטור בכוונה, כדי לא ליצור פגישות בסטייג׳).
- HK מול הסטייג׳ (רק נתוני דמו).
- זירת הפגישה על פגישה שבאמת מקליטה ומסתיימת.
- העוזר החדש על מכשיר אמיתי, ומשתמש שנכנס דרך מסך הכניסה של האפליקציה (טוקן ישן — ח.4).
- אימות לפי המחבר: סימולטור iOS — HK בנתוני דמו, Jampa מול סטייג׳. אמולטור אנדרואיד — Jampa מול סטייג׳. הקלטה אמיתית לא נבדקה.

## ז · ממצאים בקוד הקיים (לא מהענף)

1. **סיסמאות מפתח ההעלאה בגיט.** `android/gradle.properties` מכיל `UPLOAD_STORE_PASSWORD` ו-`UPLOAD_KEY_PASSWORD` בטקסט גלוי מאז `0091cb3` (30.09.2025). `android/app/build.gradle` משתמש בהם כש-`UPLOAD_*` לא בסביבה. `upload-keystore.p12` עצמו לא בגיט. להעביר למשתני סביבה או `~/.gradle/gradle.properties`, ולשקול החלפת מפתח ההעלאה ב-Play Console, כי הן כבר בהיסטוריה.
2. **`isProd = false` קבוע ב-`src/utils/googleDrivePickerBridge.ts:5`**, בנפרד מ-`api.ts`. קיים ב-`main`, לא מהענף. בבניית פרודקשן בוחר הקבצים של Google Drive (`buildGoogleDrivePickerLaunchUrl`, מ-`CompanyFilesScreen`) נטען מהסטייג׳, עם כתובת חזרה ב-`stg.hak.co.il` / `stg.jampa.ai`, ושולח לשם `access_token` של Google Drive בכתובת. לקרוא את `isProd` מ-`@services/api`.
3. **מקלדת באנדרואיד 15+ במסכים אחרים.** `targetSdk` 36, `windowSoftInputMode=adjustResize`, בלי `windowOptOutEdgeToEdgeEnforcement` — החלון לא מתכווץ. אותה בעיה שתוקנה לעוזר ב-`864bf78` קיימת ב-`SummaryTab.tsx:331-334`, `TasksTab.tsx:205-208` (`behavior` הוא `undefined`), וב-`CreateMeetingModal.tsx:608-611`, `EditCompany.tsx:608-611`, `TaskEventDialog.tsx:358-361`, `CreateCompanyWithUserModal.tsx:266-269`, `DynamicGuidelinesModalNative.tsx:229-232` (`'height'` עם היסט 0). לא נבדק באמולטור.
4. **`userStore.getCompanyMeetings` דורס את `store.meetings`** (`userStore.tsx:153-156`) בפגישות של חברה אחת. קוראים: `MeetingsListScreen.load` עם לקוח, `MeetingDetailsScreen` (414-417, `refreshMeetingLists` 529-537), `MyProcessScreen.tsx:484`. אחרי פגישות של לקוח אחד, "כל הפגישות" מציג לרגע רק אותו, והחיפוש בקישור לא מוצא. לפעולות ב-`userStore` אין `try/catch`, ו-`MeetingsListScreen.load` עוטף ב-`try/finally` בלבד — דחייה שלא נתפסה כשאין רשת. הענף עוקף עם עותקים מקומיים.
5. **`CreateMeetingModal` נכשל כברירת מחדל בין 23:00 ל-23:59.** `getOneHourLater` (121-126) עובר את חצות, ו-`validate` (427-429) משווה מחרוזות `toTime < fromTime` וחוסם עד שמשנים ידנית. `addOneHourSafe` (בבחירה ידנית) עוצר ב-23:59. בנוסף `getFullDateInHebrew` (128-134) לוקח את התאריך מאזור הזמן של המכשיר.
6. **`meetingsAPI.createMeeting` עם `retryRequest`** (`api.ts:867-874`): עד 3 ניסיונות חוזרים על `POST` ב-`Network Error`. אם הבקשה הגיעה והתשובה אבדה — פגישות כפולות מ-`CreateMeetingModal`.
7. **החלקה מהקצה ב-iOS יוצאת ממסך מקליט.** אין `gestureEnabled:false` ואין `beforeRemove` על `ClientMeetingDetails` או על `MeetingDetails` בשורש. רק `handleBackPress` ו-`hardwareBackPress` (`MeetingDetailsScreen.tsx:632`) בודקים `recState`. כשהמסך יורד, `TranscriptTab` לא עוצר את ההקלטה בנייטיב. לא נבדק (R14).
8. **`ClientChatTab.handleRun` בלי מזהה תהליך** (808-821, המסלול הישן בלבד): כש-`getChatProcessInfo` מחזיר `null` רק `console.error`. `sessionId` נשאר מלא, השדה נעול (`editable={sessionId === ''}`, 958) והבועה נשארת עד טעינה מחדש. הענף תיקן רק חריגה.
9. **`handledMeetingIdRef` שומר רק את המזהה האחרון** (`AppTabsNavigator.tsx:150,157`). קישור עם אותו `openMeeting` כמו הקישור האחרון שטופל מתעלם, עד שנפתח קישור למזהה אחר או שמסך הטאבים נטען מחדש (למשל אחרי `replace` ל-`PersonalArea`). קיים ב-`main`, והענף שמר.
10. **`jest` לא רץ.** `jest.config.js` עם `preset 'react-native'` בלי `transformIgnorePatterns` ל-`@react-navigation`, ו-`__tests__/App.test.tsx` נכשל ב-`main`. אין בפועל בדיקות אוטומטיות.

## ח · העוזר — השירות של הממשק (`d09930a`, `e476f12`)

### ח.1 מה נבנה
- העוזר של הלקוח באפליקציה עבר לשירות שבו משתמש "עוזר AI" בממשק (`WorkspaceAiChat` ב-`hk-client`), בצד היועץ: שיחות שמורות בשרת, תשובה שנבנית ברקע, והטקסט הסופי נקרא מההודעות ומוצג כ-Markdown.
- רשימת השיחות נטענת באותה בקשה כמו בממשק (אותו `user_id` = `auth_user_id`, `status=active`, `limit=100`), ולכן לאותו משתמש ולאותה חברה אמורות להופיע אותן שיחות.
- הצ׳אט הישן (`ClientChatTab`: `POST /chat/handle-chat`, `POST /openai/get-messages`) נשאר בקוד ומוצג כש-`canUseAiChat()` מחזיר `false`. זה שירות אחר, וההיסטוריה שלו לא מופיעה בעוזר החדש.

### ח.2 החוזה (`src/services/aiChatApi.ts`)
כל הקריאות עוברות דרך המופע `api` (הכתובת והטוקן של האפליקציה), בלי `retryRequest` — שליחה חוזרת אחרי `Network Error` הייתה יוצרת הודעה כפולה — ועם מגבלת זמן של 30 שניות. תשובה `{success: true, data}` נפתחת ל-`data`; מסלול הסטטוס חוזר בלי מעטפת. שגיאה → `AiChatError` עם `status` (קוד HTTP) ו-`code` (מ-`error.code` בגוף התשובה).

| פעולה | קריאה |
|---|---|
| רשימת שיחות | `GET /chat-conversations/{companyId}/conversations?user_id={auth_user_id}&status=active&limit=100` |
| שיחה חדשה | `POST /chat-conversations/{companyId}/conversations` עם `{title: null, user_id}` — בלי `entry_point` (השרת בוחר `chat_message`), בלי `type` ובלי `chat_context` |
| הודעות | `GET /chat-conversations/{companyId}/conversations/{conversationId}/messages`, ואחרי תשובה `?after={מזהה השאלה}` |
| שליחה | `POST /chat-conversations/{companyId}/conversations/{conversationId}/messages` עם `{content, message_type: 'text'}` → `{conversation, userMessage, assistantMessage, sessionId}` |
| מצב התשובה | `GET /ai-flow-manager/sessions/{sessionId}/status` — לפי `session_id` של הודעת העוזר ב-`pending` |
| מחיקת שיחה | `DELETE /chat-conversations/{companyId}/conversations/{conversationId}` — רק לשיחה שנוצרה באותה שליחה ונכשלה ב-`NO_CHAT_FLOW_ROUTED` |

- `canUseAiChat()`: מפענח את הטוקן (`jwtDecode`) — `user_store === 'user_accounts'` ו-`auth_user_id` גדול מ-0. `authUserAccountId()` מחזיר את `auth_user_id`, מזהה `User_Accounts` — מה שהממשק שולח כ-`user_id`.
- `chatErrorMessage(error, fallback)`, לפי `getChatErrorMessage` בממשק: `NO_CHAT_FLOW_ROUTED` → "העוזר אינו זמין כרגע. אפשר לנסות שוב מאוחר יותר.", 401 → "החיבור פג. צריך להתחבר מחדש.", 403 → "אין לך הרשאה לצפות בצ׳אט של החברה הזו.", 404 → "השיחה כבר לא קיימת או שאינה זמינה.", 429 → "העוזר מטפל כעת בבקשות רבות. אפשר לנסות שוב בעוד רגע.". הודעה אחרת מוצגת רק אם היא בעברית ובלי אותיות לטיניות; אחרת טקסט ברירת המחדל. (בממשק היועץ מקבל ב-`NO_CHAT_FLOW_ROUTED` הסבר טכני; באפליקציה — ההודעה הכללית.)

### ח.3 מה שונה מהממשק
- מעקב כל 700 מ״ש (בממשק 500). אותה מגבלה של 120 שניות, ואותן 5 קריאות סופיות בהפרש 250 מ״ש.
- אין פתיחה מתוך פגישה (`type: 'meeting'`, `chat_context`) ואין פאנל על דוח תמונת התזרים. שיחה מסוג `cashflow` שנפתחה בממשק מופיעה ברשימה.
- `Markdown.tsx` במקום `react-markdown` + `remark-gfm`, בלי חבילות חדשות, ותת־קבוצה בלבד (ב.5). בבלוק קוד מסוג `chart` כל הסוגים מוצגים כעמודות אופקיות.
- בממשק העוזר חסום ב-Jampa (הנתיב מפנה לדשבורד). באפליקציה אין חסימה לפי מותג, וההתנהגות ב-Jampa תלויה בשרת (ח.4).

### ח.4 שאלות פתוחות לאייל — לא משימה לעידו
> פריט שרת שמגלם החלטת מוצר — קודם שאלה לאייל. אם אייל יחליט, ייפתח פריט נפרד.

1. **הכניסה באפליקציה מחזירה טוקן ישן.** הכניסה ב-`LoginScreen.tsx` (`/auth/google/callback`, `/auth/apple`) מחזירה היום טוקן שאינו `User_Accounts`. עם טוקן כזה השירות החדש מחזיר 403, ולכן `canUseAiChat()` מחזיר `false`, ומשתמשים אמיתיים יראו את הצ׳אט הישן — עד שהכניסה באפליקציה תחזיר טוקן `User_Accounts`, כמו בממשק. **השאלה:** להחליף את הכניסה באפליקציה כך שתחזיר טוקן `User_Accounts`? לא נבדק אם שאר הקריאות של האפליקציה עובדות עם טוקן כזה.
2. **שרת Jampa מחזיר 409 `NO_CHAT_FLOW_ROUTED`** — אין בו זרימה מחוברת לצ׳אט (גם הממשק חוסם צ׳אט ב-Jampa). במסך: "העוזר אינו זמין כרגע. אפשר לנסות שוב מאוחר יותר.", והשיחה הריקה נמחקת. עם טוקן ישן Jampa נשאר על הצ׳אט הישן. אייל מסדר עכשיו את הצד של Jampa, ו**בדיקת העוזר החדש ב-Jampa ממתינה לזה** (A1). **לאשר:** באפליקציית Jampa העוזר נשאר פתוח, בשונה מהממשק (AI-GUIDE §5).

## ט · איך מסיימים

**מה עידו עושה ומסמן בלוח**
1. מקבל את הענף אחרי שאייל דוחף (ד.1), מריץ ד.2–ד.9, ומסיר את `IS_NLP` מ-`MeetingCard.tsx:5` בקומיט על הענף.
2. מריץ את סעיף ה על מכשירים אמיתיים, ב-HK וב-Jampa, על בנייה עם `isProd = false` מקומית (בלי קומיט) מול הסטייג׳, רק על חברת בדיקה. העוזר — בכל מסלול שזמין (A1); המסלול החדש ב-Jampa ממתין (ח.4).
3. ממצא חוסם (הקלטה כפולה, קטע שאבד, פגישה כפולה, מסך מקליט שנסגר, שליחה ללקוח) — לא ממזגים. מתקנים בענף, או Reject בלוח עם הממצא אם התיקון הוא החלטת מוצר.
4. **ממזג בעצמו** את `design/app-refresh` ל-`main` (ד.10), ומוודא `isProd = true` לפני כל בנייה לשחרור.
5. מסמן **"נבנה"** בפריט בלוח, ובהערה: הקומיט שנבדק וקומיט המיזוג, המכשירים וגרסאות מערכת ההפעלה, רשימת הבדיקות בסעיף ה עם עובר/נכשל לכל אחת, באיזה מסלול נבדק העוזר, ומה נרשם כפער ידוע (ו) בלי לחסום. בלי צילומים.
6. לא ברור, או לא מסכים עם משהו בסעיף ו — **Reject** בלוח עם השאלה. לא בוואטסאפ, לא ניחוש.

**מה אייל בודק**
- על בנייה מ-`main` אחרי המיזוג, עם `isProd = false` מקומית (בלי קומיט; בנייה מהקומיט עצמו פונה לפרודקשן), מול הסטייג׳, על חברת בדיקה. לפחות הבדיקות עם הסיכון הגבוה: R1, R2, R8, R9, R10, R12, C2, C3, A2, P1, ו-J1 ו-N1 בשני המותגים.
- עובר → **"נבדק"**, ורק אז שחרור לחנויות. נכשל → **"נכשל"** עם ההערה, והפריט חוזר לעידו.
- כל הכרעה של אייל בסבב הבדיקה נכנסת גם לאפיון (`docs/tasks/2026-09-14-mobile-app/TASK.md`), לא רק ללוח ולקוד.

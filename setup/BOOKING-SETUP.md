# Zoom call booking: setup

The "Book a Call" section on the homepage works straight away: a booking opens
WhatsApp with the details written out. To make taken times show for **everyone**
and get an **automatic WhatsApp alert**, fill in `js/booking.js` → `BOOKING_CONFIG`.

## 1. Shared bookings: Firebase (free)
1. Go to https://console.firebase.google.com → **Add project** → name it `usmedia-booking`
   (use a new project, not the EICT one, so their rules don't clash).
2. **Build → Firestore Database → Create database** → production mode → region close to you.
3. **Rules** tab → paste everything from `setup/firestore.rules` → **Publish**.
4. **Project settings (gear) → Your apps → Web (</>)** → register an app → copy the
   `firebaseConfig` object.
5. In `js/booking.js` set `firebase: { apiKey: "...", authDomain: "...", projectId: "...", appId: "..." }`.

You can see every booking (name, contact, topic, notes) in Firestore → `meetingBookings`.
To free a slot again, delete its document in both `meetingSlots` and `meetingBookings`.

## 2. Automatic WhatsApp alert: CallMeBot (free)
1. Open https://www.callmebot.com/blog/free-api-whatsapp-messages/ and save the WhatsApp
   number shown there in your phone's contacts.
2. From your WhatsApp (+94 71 978 0807), send that number the activation message shown on the page
   (e.g. `I allow callmebot to send me messages`).
3. You'll receive an API key. Put it in `callmebotApiKey: '...'`.

Note: the key is visible in the website's code. Someone could use it to send messages to
**your own** number only, so the risk is spam to yourself. If that ever happens, ask CallMeBot
for a new key.

## 3. Zoom link
Zoom → Profile → **Personal Meeting ID** → copy the invite link → put it in `zoomLink: '...'`.
Clients see an "Open Zoom link" button after booking.

## 4. Your hours
In `BOOKING_CONFIG`: `workDays` (0 = Sun … 6 = Sat), `startHour`, `endHour`,
`slotMinutes`, `daysAhead`, `minNoticeMinutes`. Times are in Sri Lanka time and are shown
to each visitor in their own time zone.

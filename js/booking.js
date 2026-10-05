/* ============================================================
   US MEDIA — "Book a Zoom call" scheduler
   ------------------------------------------------------------
   Fill in BOOKING_CONFIG below (see BOOKING-SETUP.md):
   - firebase:   your Firebase web config → bookings are shared,
                 taken slots show as "Taken" for every visitor
   - callmebotApiKey: free CallMeBot key → you get an automatic
                 WhatsApp message for every booking
   - zoomLink:   your personal Zoom meeting link, shown after booking
   Until firebase is set, the scheduler still works: booking opens
   WhatsApp with the details, and "taken" is only remembered on
   that visitor's own device.
   ============================================================ */
const BOOKING_CONFIG = {
  firebase: {                // usmedia-booking project (these web keys are public by design; Firestore rules protect the data)
    apiKey: 'AIzaSyDzmV3wDuglOOiSG0rPvbgIlEf0SaQXOGY',
    authDomain: 'usmedia-booking.firebaseapp.com',
    projectId: 'usmedia-booking',
    storageBucket: 'usmedia-booking.firebasestorage.app',
    messagingSenderId: '255682885430',
    appId: '1:255682885430:web:a9f5f358b19e0260866597',
  },
  callmebotApiKey: '',       // e.g. '1234567'
  ownerPhone: '94719780807', // your WhatsApp number (international format, no +)
  zoomLink: '',              // e.g. 'https://us05web.zoom.us/j/1234567890?pwd=...'
  timezone: 'Asia/Colombo',  // your time zone; slot times below are in this zone
  utcOffsetMinutes: 330,     // Sri Lanka = UTC+5:30 (no daylight saving)
  workDays: [1, 2, 3, 4, 5, 6], // 0 = Sun … 6 = Sat
  startHour: 10,             // first slot starts 10:00
  endHour: 20,               // last slot ends by 20:00
  slotMinutes: 30,
  daysAhead: 14,
  minNoticeMinutes: 120,     // can't book a slot starting sooner than this
};

const FIREBASE_SDK = 'https://www.gstatic.com/firebasejs/10.12.2';
const root = document.getElementById('booking');
if (root) init();

async function init(){
  const C = BOOKING_CONFIG;
  const $ = s => root.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const localTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const sameZone = new Date().getTimezoneOffset() === -C.utcOffsetMinutes;

  /* ---------- data layer: Firestore if configured, else this device only ---------- */
  let db = null, fs = null;
  const taken = new Set();
  if (C.firebase){
    try {
      const appMod = await import(`${FIREBASE_SDK}/firebase-app.js`);
      fs = await import(`${FIREBASE_SDK}/firebase-firestore.js`);
      db = fs.getFirestore(appMod.initializeApp(C.firebase, 'usmedia-booking'));
      const q = fs.query(fs.collection(db, 'meetingSlots'), fs.where('start', '>=', fs.Timestamp.fromDate(new Date(Date.now() - 864e5))));
      fs.onSnapshot(q, snap => { taken.clear(); snap.forEach(d => taken.add(d.id)); render(); }, err => console.warn('booking: live slots unavailable', err));
    } catch (e){ console.warn('booking: Firebase failed to load, using device-only mode', e); db = null; }
  }
  if (!db){
    try { JSON.parse(localStorage.getItem('usm-booked') || '[]').forEach(id => taken.add(id)); } catch (e) {}
  }

  /* ---------- slot generation (in the owner's time zone) ---------- */
  function days(){
    const out = [];
    const nowOwner = new Date(Date.now() + C.utcOffsetMinutes * 6e4); // wall clock in owner TZ, read via UTC getters
    for (let i = 0; out.length < C.daysAhead && i < C.daysAhead * 2; i++){
      const d = new Date(Date.UTC(nowOwner.getUTCFullYear(), nowOwner.getUTCMonth(), nowOwner.getUTCDate() + i));
      if (!C.workDays.includes(d.getUTCDay())) continue;
      const slots = [];
      for (let m = C.startHour * 60; m + C.slotMinutes <= C.endHour * 60; m += C.slotMinutes){
        const startUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, m) - C.utcOffsetMinutes * 6e4;
        if (startUTC < Date.now() + C.minNoticeMinutes * 6e4) continue;
        slots.push({id: new Date(startUTC).toISOString().slice(0, 16) + 'Z', start: new Date(startUTC), ownerLabel: `${pad(Math.floor(m / 60))}:${pad(m % 60)}`});
      }
      if (slots.length) out.push({date: d, slots});
    }
    return out;
  }
  const fmtDay = d => d.toLocaleDateString(undefined, {weekday:'short', timeZone:'UTC'});
  const fmtDate = d => d.toLocaleDateString(undefined, {day:'numeric', month:'short', timeZone:'UTC'});
  const fmtLocal = d => d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  const fmtLong = d => d.toLocaleString([], {weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit'});

  /* ---------- UI ---------- */
  let DAYS = days(), dayIdx = 0, picked = null;
  $('#bkTz').textContent = sameZone ? `Times shown in Sri Lanka time (${C.timezone})` : `Times shown in your time zone (${localTZ}), with Sri Lanka (SL) time underneath.`;

  function render(){
    if (!DAYS.length){ $('#bkDays').innerHTML = ''; $('#bkSlots').innerHTML = '<p class="bk-empty">No open slots right now. Message us on WhatsApp.</p>'; return; }
    $('#bkDays').innerHTML = DAYS.map((d, i) => {
      const free = d.slots.filter(s => !taken.has(s.id)).length;
      return `<button type="button" class="bk-day${i === dayIdx ? ' on' : ''}${free ? '' : ' full'}" data-i="${i}"><small>${fmtDay(d.date)}</small><b>${fmtDate(d.date)}</b><em>${free ? free + ' free' : 'Full'}</em></button>`;
    }).join('');
    const d = DAYS[dayIdx];
    $('#bkSlots').innerHTML = d.slots.map(s => {
      const isTaken = taken.has(s.id), on = picked && picked.id === s.id;
      return `<button type="button" class="bk-slot${isTaken ? ' taken' : ''}${on ? ' on' : ''}" data-id="${s.id}" ${isTaken ? 'disabled aria-disabled="true"' : ''}>
        <b>${fmtLocal(s.start)}</b>${sameZone ? '' : `<small>${s.ownerLabel} SL</small>`}${isTaken ? '<em>Taken</em>' : ''}</button>`;
    }).join('');
    if (picked && taken.has(picked.id)){ picked = null; showForm(); }
  }
  function showForm(){
    const f = $('#bkForm');
    if (!picked){ f.hidden = true; return; }
    f.hidden = false;
    $('#bkWhen').textContent = `${fmtLong(picked.start)}${sameZone ? '' : ` · ${picked.ownerLabel} Sri Lanka time`}`;
  }
  $('#bkDays').addEventListener('click', e => { const b = e.target.closest('.bk-day'); if (!b) return; dayIdx = +b.dataset.i; picked = null; render(); showForm(); });
  $('#bkSlots').addEventListener('click', e => {
    const b = e.target.closest('.bk-slot'); if (!b || b.disabled) return;
    picked = DAYS[dayIdx].slots.find(s => s.id === b.dataset.id); render(); showForm();
    if (innerWidth < 900) $('#bkForm').scrollIntoView({behavior:'smooth', block:'center'});
  });
  $('#bkChange').addEventListener('click', () => { picked = null; render(); showForm(); });

  /* ---------- booking ---------- */
  $('#bkForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#bkName').value.trim(), contact = $('#bkContact').value.trim(), topic = $('#bkTopic').value, notes = $('#bkNotes').value.trim();
    if (!picked || !name || !contact) return;
    const btn = $('#bkSubmit'); btn.disabled = true; btn.textContent = 'Booking…';
    const slot = picked;
    const msg = `📅 New Zoom call booked\n\nWhen: ${slot.start.toLocaleString('en-GB', {timeZone: C.timezone, weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})} (Sri Lanka)\nName: ${name}\nContact: ${contact}\nTopic: ${topic}${notes ? `\nNotes: ${notes}` : ''}`;
    try {
      if (db){
        const batch = fs.writeBatch(db);
        batch.set(fs.doc(db, 'meetingSlots', slot.id), {start: fs.Timestamp.fromDate(slot.start), createdAt: fs.serverTimestamp()});
        batch.set(fs.doc(db, 'meetingBookings', slot.id), {start: fs.Timestamp.fromDate(slot.start), name, contact, topic, notes, createdAt: fs.serverTimestamp()});
        await batch.commit();
      } else {
        taken.add(slot.id);
        try { localStorage.setItem('usm-booked', JSON.stringify([...taken])); } catch (err) {}
      }
    } catch (err){
      btn.disabled = false; btn.textContent = 'Confirm booking';
      taken.add(slot.id); picked = null; render(); showForm();
      $('#bkError').hidden = false; $('#bkError').textContent = 'Sorry, someone just booked that time. Please pick another slot.';
      return;
    }
    // automatic WhatsApp alert to the owner (CallMeBot), fire-and-forget
    if (C.callmebotApiKey){
      const url = `https://api.callmebot.com/whatsapp.php?phone=${C.ownerPhone}&apikey=${encodeURIComponent(C.callmebotApiKey)}&text=${encodeURIComponent(msg)}`;
      fetch(url, {mode:'no-cors'}).catch(() => {});
    }
    const waLink = `https://wa.me/${C.ownerPhone}?text=${encodeURIComponent(msg.replace('📅 New Zoom call booked', "Hi US Media! I just booked a Zoom call:"))}`;
    $('#bkDone').hidden = false; $('#bkForm').hidden = true; $('#bkPicker').hidden = true;
    $('#bkDoneWhen').textContent = fmtLong(slot.start);
    $('#bkZoom').hidden = !C.zoomLink; if (C.zoomLink) $('#bkZoom').href = C.zoomLink;
    $('#bkWa').href = waLink;
    $('#bkWaNote').textContent = C.callmebotApiKey && db
      ? "We've been notified on WhatsApp. Tap below if you'd like to send us a message too."
      : 'Please tap below to send your booking to us on WhatsApp so we can confirm it.';
    if (!(C.callmebotApiKey && db)) window.open(waLink, '_blank', 'noopener');
    picked = null; render();
  });
  $('#bkAgain').addEventListener('click', () => { $('#bkDone').hidden = true; $('#bkPicker').hidden = false; $('#bkForm').reset(); const b = $('#bkSubmit'); b.disabled = false; b.textContent = 'Confirm booking'; $('#bkError').hidden = true; });

  render(); showForm();
  setInterval(() => { DAYS = days(); if (dayIdx >= DAYS.length) dayIdx = 0; render(); }, 5 * 6e4);
}

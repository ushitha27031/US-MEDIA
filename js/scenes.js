/* ============================================================
   US MEDIA — illustrated sample "footage" scenes (SVG).
   Placeholders until real photos/videos are added: any gallery
   item with an `img` path shows that image instead of a scene.
   ============================================================ */
(function(){
  let uid = 0;
  const W = 1600, H = 900;

  function grad(id, stops, vertical = true){
    return `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  }
  function ridge(y, amp, seed, color, op = 1){
    let d = `M0 ${H} L0 ${y}`;
    for (let x = 0; x <= W; x += 80){
      const k = Math.sin((x + seed * 97) / 210) * amp + Math.sin((x + seed * 41) / 77) * amp * .35;
      d += ` L${x} ${y - k}`;
    }
    return `<path d="${d} L${W} ${H} Z" fill="${color}" opacity="${op}"/>`;
  }
  function palm(x, y, s, c){
    const fronds = [-150, -115, -80, -45, -10].map(a => {
      const r = a * Math.PI / 180, ex = x + Math.cos(r) * 120 * s, ey = y + Math.sin(r) * 60 * s + 40 * s;
      return `<path d="M${x} ${y} Q${(x + ex) / 2} ${y - 50 * s} ${ex} ${ey}" stroke="${c}" stroke-width="${10 * s}" fill="none" stroke-linecap="round"/>`;
    }).join('');
    return `<path d="M${x} ${y} Q${x + 20 * s} ${y + 160 * s} ${x - 10 * s} ${y + 320 * s}" stroke="${c}" stroke-width="${12 * s}" fill="none"/>${fronds}`;
  }
  function birds(x, y){
    return [0, 1, 2].map(i => `<path d="M${x + i * 46} ${y + (i % 2) * 18} q12 -12 24 0 q12 -12 24 0" stroke="#2A1A14" stroke-width="4" fill="none" opacity=".7"/>`).join('');
  }

  const SCENES = {
    /* sunrise over layered hills */
    mountains(id){
      return `<defs>${grad(id + 's', [[0, '#3B1F3F'], [.45, '#E8642A'], [.75, '#FFB25B'], [1, '#FFE2A8']])}</defs>
      <rect width="${W}" height="${H}" fill="url(#${id}s)"/>
      <circle cx="1050" cy="520" r="120" fill="#FFF1C9" opacity=".95"/><circle cx="1050" cy="520" r="210" fill="#FFD27A" opacity=".25"/>
      ${birds(520, 260)}
      ${ridge(560, 70, 1, '#C9573A', .75)}${ridge(640, 60, 3, '#8E3B2C', .85)}
      <rect y="600" width="${W}" height="120" fill="#FFE2C0" opacity=".18"/>
      ${ridge(720, 55, 6, '#5A2620')}${ridge(810, 40, 9, '#2E1410')}`;
    },
    /* drone top-down coastline */
    coast(id){
      const foam = [0, 1, 2, 3].map(i => `<path d="M${-40} ${330 + i * 34} C 300 ${250 + i * 40}, 600 ${470 + i * 30}, 900 ${360 + i * 36} S 1400 ${250 + i * 30}, 1700 ${380 + i * 34}" stroke="#E9FBFF" stroke-width="${6 - i}" fill="none" opacity="${.75 - i * .15}"/>`).join('');
      const tops = Array.from({length: 18}, (_, i) => { const x = 60 + i * 90 + (i % 3) * 14, y = 140 + (i % 4) * 26; return `<g transform="translate(${x} ${y})"><circle r="34" fill="#1F6B3A"/><path d="M-34 0 L34 0 M0 -34 L0 34 M-24 -24 L24 24 M24 -24 L-24 24" stroke="#2E8B4A" stroke-width="7"/></g>`; }).join('');
      return `<defs>${grad(id + 'w', [[0, '#7FE3E0'], [.35, '#25B5C7'], [1, '#0B4F7A']])}${grad(id + 'b', [[0, '#F7E2B5'], [1, '#EAC98A']])}</defs>
      <rect width="${W}" height="${H}" fill="url(#${id}w)"/>
      <path d="M0 0 H${W} V300 C 1300 380, 1000 220, 760 330 S 300 260, 0 330 Z" fill="url(#${id}b)"/>
      <path d="M0 0 H${W} V150 C 1200 200, 900 120, 600 190 S 200 130, 0 180 Z" fill="#2C7A45"/>
      ${tops}${foam}
      <g transform="translate(1080 640) rotate(-18)"><path d="M0 0 L120 0 L140 18 L120 36 L0 36 Z" fill="#FFF7EE"/><rect x="30" y="8" width="44" height="20" rx="4" fill="#E8321E"/></g>
      <path d="M1010 680 l-160 70" stroke="#E9FBFF" stroke-width="5" opacity=".6"/>`;
    },
    /* Nine Arch Bridge style viaduct in misty jungle */
    bridge(id){
      const arches = Array.from({length: 9}, (_, i) => { const x = 260 + i * 120; return `<path d="M${x} 640 L${x} 560 A52 52 0 0 1 ${x + 104} 560 L${x + 104} 640 Z" fill="#2B4A30"/>`; }).join('');
      return `<defs>${grad(id + 's', [[0, '#BFE3D0'], [.6, '#F6E7C5'], [1, '#E9D3A6']])}</defs>
      <rect width="${W}" height="${H}" fill="url(#${id}s)"/>
      ${ridge(380, 60, 2, '#7FB08A', .7)}${ridge(470, 70, 4, '#4E8A5C', .85)}
      <rect x="230" y="470" width="1160" height="200" fill="#B9733F"/>
      <rect x="220" y="455" width="1180" height="22" fill="#9E5E32"/>
      ${arches}
      <g><rect x="560" y="398" width="460" height="58" rx="14" fill="#1E4E8C"/><rect x="560" y="398" width="460" height="16" rx="8" fill="#E8321E"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${590 + i * 70}" y="420" width="44" height="22" rx="4" fill="#CFE6FF"/>`).join('')}</g>
      <path d="M1020 410 q60 -40 140 -30" stroke="#FFFFFF" stroke-width="22" opacity=".35" fill="none" stroke-linecap="round"/>
      ${ridge(760, 60, 7, '#2F6B3E')}${ridge(860, 50, 11, '#1B3F25')}
      <rect width="${W}" height="${H}" fill="#FFFFFF" opacity=".08"/>`;
    },
    /* studio interview: two chairs, key light, bokeh */
    interview(id){
      const bokeh = Array.from({length: 14}, (_, i) => `<circle cx="${80 + i * 115}" cy="${150 + (i * 53) % 260}" r="${18 + (i * 7) % 30}" fill="${i % 2 ? '#FFC23D' : '#FF7A1A'}" opacity=".18"/>`).join('');
      const person = (x, flip) => `<g transform="translate(${x} 0) scale(${flip ? -1 : 1} 1)"><circle cx="0" cy="390" r="62" fill="#0F0A08"/><path d="M-110 720 Q-110 480 0 470 Q110 480 110 720 Z" fill="#0F0A08"/><rect x="-120" y="640" width="240" height="40" rx="10" fill="#3A2A20"/><rect x="-100" y="680" width="20" height="140" fill="#3A2A20"/><rect x="80" y="680" width="20" height="140" fill="#3A2A20"/></g>`;
      return `<defs><radialGradient id="${id}k" cx=".3" cy=".35" r=".7"><stop offset="0" stop-color="#7A4A2A"/><stop offset=".55" stop-color="#2A1A12"/><stop offset="1" stop-color="#120D0A"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}k)"/>${bokeh}
      <rect x="120" y="120" width="180" height="230" rx="12" fill="#FFE9C7" opacity=".85"/><rect x="200" y="350" width="20" height="450" fill="#3A2A20"/>
      <circle cx="210" cy="235" r="260" fill="#FFD9A0" opacity=".12"/>
      ${person(560, false)}${person(1060, true)}
      <path d="M810 120 L810 300 L760 330" stroke="#3A2A20" stroke-width="10" fill="none"/><rect x="730" y="320" width="60" height="24" rx="10" fill="#1A1310"/>
      <rect y="820" width="${W}" height="80" fill="#0B0807"/>`;
    },
    /* vlogger on beach at sunset with selfie stick */
    vlog(id){
      return `<defs>${grad(id + 's', [[0, '#FF9A5A'], [.5, '#FFC876'], [.62, '#FFE3B0'], [.63, '#3E8FB0'], [1, '#1C4F6E']])}</defs>
      <rect width="${W}" height="${H}" fill="url(#${id}s)"/>
      <circle cx="1150" cy="520" r="90" fill="#FFF3D6" opacity=".9"/>
      <rect x="980" y="566" width="340" height="8" fill="#FFF3D6" opacity=".6"/><rect x="1040" y="590" width="220" height="6" fill="#FFF3D6" opacity=".45"/>
      <path d="M0 760 Q800 690 1600 760 V900 H0 Z" fill="#E9C48A"/>
      ${palm(180, 230, 1.15, '#2A1A14')}
      <g fill="#1A0F0B"><circle cx="760" cy="430" r="52"/><path d="M670 790 Q660 520 760 500 Q860 520 850 790 Z"/><path d="M840 560 L1000 380" stroke="#1A0F0B" stroke-width="22" stroke-linecap="round"/><path d="M1000 380 L1060 300" stroke="#1A0F0B" stroke-width="8"/><rect x="1040" y="270" width="50" height="36" rx="6"/></g>`;
    },
    /* couple photo session on rocks at golden hour */
    portrait(id){
      return `<defs>${grad(id + 's', [[0, '#5B2C4E'], [.4, '#E8643A'], [.6, '#FFC36B'], [.61, '#2C6E8A'], [1, '#123A52']])}</defs>
      <rect width="${W}" height="${H}" fill="url(#${id}s)"/>
      <circle cx="500" cy="530" r="110" fill="#FFF0C9"/>
      <path d="M0 610 h1600" stroke="#FFE2A8" stroke-width="6" opacity=".5"/>
      <path d="M700 900 L760 690 L900 640 L1080 660 L1220 720 L1300 900 Z" fill="#1A0F0B"/>
      <g fill="#1A0F0B"><circle cx="930" cy="470" r="34"/><path d="M890 650 Q885 520 930 510 Q975 520 970 650 Z"/><circle cx="1010" cy="455" r="36"/><path d="M965 650 Q960 505 1010 495 Q1060 505 1055 650 Z"/></g>
      ${palm(1420, 180, 1, '#1A0F0B')}${birds(250, 220)}`;
    },
    /* tea plantation rows with mist */
    tea(id){
      const rows = Array.from({length: 11}, (_, i) => `<path d="M-50 ${430 + i * 48} C 400 ${380 + i * 52}, 1100 ${470 + i * 44}, 1650 ${400 + i * 50}" stroke="${i % 2 ? '#2F7A3C' : '#3E9A4B'}" stroke-width="40" fill="none" stroke-linecap="round"/>`).join('');
      return `<defs>${grad(id + 's', [[0, '#D8EEF2'], [1, '#F3F0D9']])}</defs>
      <rect width="${W}" height="${H}" fill="url(#${id}s)"/>
      ${ridge(330, 70, 5, '#9DC3A8', .8)}${ridge(400, 50, 8, '#6FA47C', .9)}
      ${rows}
      <rect y="300" width="${W}" height="140" fill="#FFFFFF" opacity=".35"/>
      <g fill="#E8321E"><circle cx="560" cy="560" r="14"/><circle cx="980" cy="640" r="14"/></g>
      <g fill="#1A1310"><rect x="550" y="572" width="20" height="40" rx="8"/><rect x="970" y="652" width="20" height="40" rx="8"/></g>`;
    },
    /* white stupa at dusk */
    stupa(id){
      return `<defs>${grad(id + 's', [[0, '#1E2A5A'], [.55, '#8A4C7A'], [.85, '#F08A5D'], [1, '#FFC876']])}</defs>
      <rect width="${W}" height="${H}" fill="url(#${id}s)"/>
      ${Array.from({length: 40}, (_, i) => `<circle cx="${(i * 137) % W}" cy="${(i * 71) % 300}" r="${1.5 + (i % 3)}" fill="#FFF" opacity=".7"/>`).join('')}
      <circle cx="1250" cy="170" r="46" fill="#FFF3D6"/>
      <g fill="#F7F0E6"><rect x="560" y="700" width="480" height="40" rx="6"/><rect x="600" y="660" width="400" height="44" rx="6"/><path d="M620 662 Q620 420 800 400 Q980 420 980 662 Z"/><rect x="760" y="350" width="80" height="54"/><path d="M775 352 L800 180 L825 352 Z"/></g>
      <rect x="560" y="700" width="480" height="40" fill="#E0D2C0" opacity=".5"/>
      ${ridge(800, 30, 4, '#1A0F14')}${palm(220, 470, .9, '#1A0F14')}${palm(1420, 500, .8, '#1A0F14')}`;
    },
  };

  /* viewfinder overlay drawn on top of every scene */
  function viewfinder(label){
    return `<g fill="none" stroke="#FFF7EE" stroke-width="5" opacity=".9">
      <path d="M60 140 V60 H140"/><path d="M1460 60 H1540 V140"/><path d="M60 760 V840 H140"/><path d="M1460 840 H1540 V760"/></g>
      <g font-family="DM Sans, sans-serif" font-weight="700" fill="#FFF7EE">
      <circle cx="104" cy="104" r="12" fill="#E8321E" class="rec-dot"/><text x="128" y="114" font-size="30">REC</text>
      <text x="1300" y="114" font-size="28" opacity=".9">4K · 24FPS</text>
      ${label ? `<text x="100" y="812" font-size="30" opacity=".9">${label}</text>` : ''}</g>`;
  }

  window.USM_SCENE = function(name, label, withFinder = true){
    const id = 'sc' + (++uid);
    const body = (SCENES[name] || SCENES.mountains)(id);
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label || name} sample scene">${body}${withFinder ? viewfinder(label) : ''}</svg>`;
  };
})();

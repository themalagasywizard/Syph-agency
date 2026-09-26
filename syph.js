/* Syph landing — interactions. Vanilla, no dependencies. */
(() => {
  "use strict";

  // ------------------------------------------------------------------ config
  // Stripe Payment Links. Replace with the real links when Stripe is connected.
  // While a link still contains "REPLACE", buttons open a "reserve your spot" form instead
  // of sending visitors to a dead page.
  const CHECKOUT = {
    solo: "https://buy.stripe.com/REPLACE_WITH_SOLO_LINK",
    team: "https://buy.stripe.com/REPLACE_WITH_TEAM_LINK",
  };

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => matchMedia("(max-width: 860px)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const G = {
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.2"/>',
    drive: '<path d="M9 3.5h6l6.5 11-3 5.5h-13l-3-5.5z"/><path d="M9 3.5l6.5 11M15 3.5L8.5 14.5M2.5 14.5h19"/>',
    sheet: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M4 9h16M4 15h16M10 9v12"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 11h6M9 15h6M9 18h4"/>',
    crm: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    wa: '<path d="M4 20.5l1.4-4.2A8.5 8.5 0 1 1 8.3 19z"/><path d="M9 9.5c.3 2.3 2.2 4.4 4.8 5"/>',
    tg: '<path d="M21 4L3 11.2l6.2 2.1L11.4 20l3.2-4.3 5 3.8z"/><path d="M9.2 13.3L21 4"/>',
    slides: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8M8 12l3-3 2 2 3-3"/>',
    web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.2 3.2 3.2 14.8 0 18M12 3c-3.2 3.2-3.2 14.8 0 18"/>',
  };
  const TOOLS = [
    ["mail", "Gmail", "#FF8A80"], ["cal", "Calendar", "#9DB8FF"], ["drive", "Drive", "#E3A55F"],
    ["sheet", "Sheets", "#7FDCB8"], ["doc", "Docs", "#9DB8FF"], ["crm", "Odoo CRM", "#C6A8FF"],
    ["wa", "WhatsApp", "#7FDCB8"], ["tg", "Telegram", "#8FD0FF"], ["slides", "Decks", "#E3A55F"], ["web", "Web", "#F4F5F7"],
  ];
  const frameHooks = [];
  const svg = (k, c) => `<svg viewBox="0 0 24 24" stroke="${c}">${G[k]}</svg>`;
  const toolBy = k => TOOLS.find(t => t[0] === k);

  // ------------------------------------------------------------------ intro + nav
  requestAnimationFrame(() => document.body.classList.add("is-ready"));
  const nav = $("#nav");
  const onNav = () => nav.classList.toggle("is-scrolled", scrollY > 30);
  addEventListener("scroll", onNav, { passive: true }); onNav();
  const burger = $("#burger"), mm = $("#mmenu");
  const setMenu = open => { burger.setAttribute("aria-expanded", open); mm.classList.toggle("is-open", open); mm.setAttribute("aria-hidden", !open); document.body.style.overflow = open ? "hidden" : ""; };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("#mmenu a, #mmenu button").forEach(a => a.addEventListener("click", () => setMenu(false)));

  // ------------------------------------------------------------------ split headings + reveals
  $$(".split").forEach(el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span"); w.className = "w";
            const s = document.createElement("span"); s.textContent = part; s.style.setProperty("--i", i++);
            w.appendChild(s); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });
  $$(".plans .rv, .roles__grid .rv").forEach((el, i) => el.style.setProperty("--i", i % 3));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px" });
  $$(".split, .rv").forEach(el => io.observe(el));

  // ------------------------------------------------------------------ magnetic + spotlight
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    $$("[data-magnetic]").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
    $$(".spot").forEach(el => el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px"); el.style.setProperty("--my", e.clientY - r.top + "px");
    }));
  }

  // ------------------------------------------------------------------ marquee
  const chip = ([k, n, c]) => `<span class="chipx">${svg(k, c)}${n}</span>`;
  const row1 = TOOLS.map(chip).join(""), row2 = [...TOOLS].reverse().map(chip).join("") + ["Google Workspace", "Web research", "Slide decks", "Knowledge graph"].map(n => `<span class="chipx">${n}</span>`).join("");
  $("#marquee1").innerHTML = row1 + row1; $("#marquee2").innerHTML = row2 + row2;

  // ------------------------------------------------------------------ hero sky (canvas)
  const sky = $("#sky"), sx = sky.getContext("2d");
  let skyW = 0, skyH = 0, dpr = 1, stars = [], mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const sizeSky = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    skyW = sky.clientWidth; skyH = sky.clientHeight;
    sky.width = skyW * dpr; sky.height = skyH * dpr; sx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(skyW * skyH / 5200);
    stars = Array.from({ length: n }, () => ({ x: Math.random() * skyW, y: Math.random() * skyH, z: Math.random(), p: Math.random() * 6.28 }));
  };
  addEventListener("resize", sizeSky); sizeSky();
  addEventListener("pointermove", e => { mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5; }, { passive: true });
  const drawSky = t => {
    sx.clearRect(0, 0, skyW, skyH);
    // hairline orbits
    sx.save(); sx.translate(skyW / 2 + mouse.x * 30, -skyH * .45 + mouse.y * 20);
    for (let i = 0; i < 3; i++) {
      sx.strokeStyle = `rgba(255,255,255,${.07 - i * .018})`; sx.lineWidth = 1;
      sx.beginPath(); sx.ellipse(0, 0, skyW * (.62 + i * .14), skyH * (.95 + i * .2), Math.sin(t * .0001 + i) * .12, 0, Math.PI * 2); sx.stroke();
    }
    sx.restore();
    for (const s of stars) {
      const y = (s.y - t * .006 * s.z + skyH * 10) % skyH;
      const a = (.1 + .55 * s.z) * (.55 + .45 * Math.sin(t * .002 + s.p));
      sx.fillStyle = `rgba(220,228,255,${a})`;
      const sz = .6 + s.z * 1.4;
      sx.fillRect(s.x + mouse.x * 26 * s.z, y + mouse.y * 18 * s.z, sz, sz);
    }
  };

  // ------------------------------------------------------------------ hero orbit
  const orbit = $("#orbit"), tilesEl = $("#orbitTiles"), osvg = $("#orbitSvg");
  const NS = "http://www.w3.org/2000/svg";
  const tiles = TOOLS.map(([k, n, c]) => {
    const el = document.createElement("div"); el.className = "tile";
    el.innerHTML = `${svg(k, c)}<span>${n}</span><i></i>`; tilesEl.appendChild(el);
    const ln = document.createElementNS(NS, "line"); ln.setAttribute("stroke", "rgba(157,184,255,.35)"); ln.setAttribute("stroke-width", "1"); osvg.appendChild(ln);
    const pu = document.createElementNS(NS, "g"); pu.innerHTML = `<circle r="9" fill="${c}" opacity=".16"/><circle r="2.8" fill="#fff"/>`; osvg.appendChild(pu);
    return { el, ln, pu };
  });
  let orbitOn = true;
  new IntersectionObserver(([e]) => { orbitOn = e.isIntersecting; }).observe(orbit);
  const drawOrbit = t => {
    const w = orbit.clientWidth, h = orbit.clientHeight, cx = w / 2, cy = h / 2;
    const rx = Math.min(w * .44, 620), ry = rx * .34;
    const tilt = mouse.y * .08;
    tiles.forEach((o, i) => {
      const a = i / tiles.length * Math.PI * 2 + t * .00012 + mouse.x * .6;
      const d = (Math.sin(a) + 1) / 2;
      const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry * (1 + tilt) ;
      const s = .62 + .38 * d;
      o.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${s.toFixed(3)})`;
      o.el.style.opacity = (.4 + .6 * d).toFixed(2);
      o.el.style.filter = d < .35 ? `blur(${((.35 - d) * 5).toFixed(1)}px)` : "none";
      o.el.style.zIndex = d > .5 ? 60 + Math.round(d * 10) : Math.round(d * 40);
      o.ln.setAttribute("x1", cx); o.ln.setAttribute("y1", cy); o.ln.setAttribute("x2", x); o.ln.setAttribute("y2", y);
      o.ln.setAttribute("stroke-opacity", (.25 + .75 * d).toFixed(2));
      const f = ((t * .00045 + i * .137) % 1);
      o.pu.setAttribute("transform", `translate(${lerp(cx, x, f).toFixed(1)} ${lerp(cy, y, f).toFixed(1)})`);
      o.pu.setAttribute("opacity", (Math.sin(Math.PI * f) * (.3 + .7 * d)).toFixed(2));
    });
  };
  // live event chips
  const EVENTS = [
    ["Atlas", "Triaged 38 new emails"], ["Nova", "Summarised 14 competitor sites"], ["Atlas", "Qualified 6 leads in Odoo", 0],
    ["Needs you", "Proposal for Tomasz · €94k", 1], ["Iris", "Moved Thursday's call · no conflicts"], ["Vale", "Built the Q4 pitch deck"],
    ["Atlas", "Answered 3 customers on WhatsApp"], ["Iris", "Morning brief sent · 3 decisions"],
  ];
  const evs = $$(".ev"); let evi = 0;
  const cycleEv = async () => {
    for (;;) {
      for (const el of evs) {
        if (getComputedStyle(el).display === "none") continue;
        el.classList.add("is-out"); await wait(600);
        const [who, what, warm] = EVENTS[evi++ % EVENTS.length];
        el.classList.toggle("warm", !!warm);
        $(".ev__txt", el).innerHTML = `<b>${who}</b>${what}`;
        el.classList.remove("is-out"); await wait(1500);
      }
    }
  };
  evs.forEach((el, i) => { const [who, what] = EVENTS[i]; $(".ev__txt", el).innerHTML = `<b>${who}</b>${what}`; }); evi = 3;
  if (!reduce) setTimeout(cycleEv, 2500);

  // ------------------------------------------------------------------ film
  const frame = $("#filmFrame"), fvid = $("#filmVideo"), lb = $("#lightbox"), lbv = $("#lbVideo");
  new IntersectionObserver(([e]) => {
    if (reduce) return;
    if (e.isIntersecting) { if (fvid.preload === "none") { fvid.preload = "auto"; fvid.load(); } fvid.play().catch(() => {}); }
    else fvid.pause();
  }, { threshold: .25 }).observe(frame);
  const openFilm = (at = 0) => {
    fvid.pause(); lb.hidden = false; document.body.style.overflow = "hidden";
    const go = () => { try { lbv.currentTime = at; } catch (_) {} lbv.muted = false; lbv.play().catch(() => {}); };
    if (lbv.readyState >= 1) go(); else { lbv.preload = "auto"; lbv.load(); lbv.addEventListener("loadedmetadata", go, { once: true }); }
  };
  const closeFilm = () => { lbv.pause(); lb.hidden = true; document.body.style.overflow = ""; };
  $$("[data-play]").forEach(b => b.addEventListener("click", () => openFilm(0)));
  const chapters = $$("#chapters button");
  chapters.forEach(b => b.addEventListener("click", () => openFilm(+b.dataset.t)));
  $$("[data-lclose]").forEach(b => b.addEventListener("click", closeFilm));

  // ------------------------------------------------------------------ kinetic words
  const kw = $$("#kwords span");

  // ------------------------------------------------------------------ day timeline
  const TASKS = [
    [8.0, "mail", "#FF8A80", "Sent your morning brief", "3 decisions · 2 meetings · 1 risk"],
    [8.4, "mail", "#FF8A80", "Triaged 38 new emails", "6 need a reply — drafts ready"],
    [9.1, "crm", "#C6A8FF", "Qualified 6 new leads", "Scored & logged in Odoo CRM"],
    [10.5, "doc", "#9DB8FF", "Wrote 4 follow-ups", "In your voice, from your context"],
    [12.2, "cal", "#9DB8FF", "Moved Thursday's call", "No conflicts · invites updated"],
    [13.7, "wa", "#7FDCB8", "Answered 3 customers", "Stock & delivery dates, on WhatsApp"],
    [15.0, "slides", "#E3A55F", "Built the Q4 pitch deck", "12 slides · on brand"],
    [16.3, "sheet", "#7FDCB8", "Updated the pipeline sheet", "€412k open · 3 deals heating up"],
    [17.5, "mail", "#E3A55F", "Proposal ready for Tomasz", "ABC Stone · waiting for your OK", 1],
  ];
  const track = $("#dayTrack"), fill = $("#dayFill"), clock = $("#clock");
  const PX = 380, X0 = 120, XH = h => X0 + (h - 8) * PX;
  const trackW = XH(18.6);
  track.style.width = trackW + "px";
  for (let h = 8; h <= 18; h += .5) {
    const t = document.createElement("i"); t.className = "dtick"; t.style.left = XH(h) + "px"; if (h % 1) t.style.height = "8px", t.style.top = "calc(50% - 4px)"; track.appendChild(t);
    if (h % 1 === 0) { const l = document.createElement("span"); l.className = "dlab"; l.textContent = String(h).padStart(2, "0") + ":00"; l.style.left = XH(h) + "px"; track.appendChild(l); }
  }
  const dItems = TASKS.map(([h, k, c, tt, td, need], i) => {
    const up = i % 2 === 0, x = XH(h);
    const hh = String(Math.floor(h)).padStart(2, "0"), mm = String(Math.round(h % 1 * 60)).padStart(2, "0");
    const card = document.createElement("div");
    card.className = `dcard ${up ? "up" : "down"}${need ? " need" : ""}`;
    card.style.left = (x - 24) + "px";
    card.innerHTML = `<span class="ic">${svg(k, c)}</span><div><p class="tm">${hh}:${mm}</p><p class="tt">${tt}</p><p class="td">${td}</p></div><span class="st">${need ? "NEEDS YOU" : "DONE"}</span>`;
    const stem = document.createElement("i"); stem.className = "dstem" + (up ? "" : " dn");
    stem.style.cssText = `left:${x}px;${up ? "bottom:50%;height:34px" : "top:calc(50% + 2px);height:48px"}`;
    const dot = document.createElement("i"); dot.className = "ddot" + (need ? " need" : ""); dot.style.left = x + "px";
    track.append(stem, dot, card);
    return { h, card, stem, dot };
  });
  const setHour = hr => {
    const hh = Math.floor(hr), mm = Math.floor((hr - hh) * 60);
    clock.textContent = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    let doneN = 0, needN = 0;
    dItems.forEach((o, i) => {
      const on = hr >= o.h;
      o.card.classList.toggle("on", on); o.stem.classList.toggle("on", on); o.dot.classList.toggle("on", on);
      if (on) TASKS[i][5] ? needN++ : doneN++;
    });
    $("#dDone").textContent = doneN; $("#dNeed").textContent = needN;
  };
  // mobile: reveal cards as they scroll in
  const dayIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && mobile()) e.target.classList.add("on"); }), { rootMargin: "0px 0px -10% 0px" });
  dItems.forEach(o => dayIO.observe(o.card));

  // ------------------------------------------------------------------ scroll choreography
  const progress = el => { const r = el.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight)); };
  const onScroll = () => {
    const m = mobile();
    // film grows to full size
    if (!m) {
      // grow while the section scrolls in, then step through the chapters while pinned
      const r = $("#film").getBoundingClientRect();
      const k = clamp((innerHeight - r.top) / innerHeight);
      const ease = 1 - (1 - k) ** 3;
      frame.style.transform = `scale(${lerp(.78, 1, ease).toFixed(4)}) translateY(${lerp(50, 0, ease).toFixed(1)}px)`;
      frame.style.borderRadius = lerp(36, 22, ease).toFixed(1) + "px";
      const cp = progress($("#film")) * chapters.length;
      chapters.forEach((c, i) => { const f = clamp(cp - i); c.style.setProperty("--f", f.toFixed(3)); c.classList.toggle("on", f > 0 && f < 1 || (i === chapters.length - 1 && f >= 1)); });
      // how it works: the step nearest the viewport centre is active
      const steps = $$(".step");
      let best = 0, bestD = Infinity;
      steps.forEach((s, i) => { const sr = s.getBoundingClientRect(); const d = Math.abs(sr.top + sr.height / 2 - innerHeight / 2); if (d < bestD) { bestD = d; best = i; } });
      const hr0 = $(".how__steps").getBoundingClientRect();
      const hp = clamp((innerHeight / 2 - hr0.top) / hr0.height) * steps.length;
      bars.forEach((b, i) => b.style.setProperty("--f", clamp(hp - i).toFixed(3)));
      if (hr0.top < innerHeight && hr0.bottom > 0) setStep(best);
    }
    // kinetic words light up
    const kr = $("#kwords").getBoundingClientRect();
    const kk = clamp((innerHeight * .85 - kr.top) / (kr.height + innerHeight * .35));
    kw.forEach((w, i) => w.classList.toggle("on", kk * kw.length > i + .2));
    // day: horizontal scroll
    if (!m) {
      const p = progress($("#day"));
      const hr = 8 + 10 * clamp((p - .04) / .9);
      const px = XH(hr);
      const maxShift = Math.max(0, trackW - innerWidth + 80);
      const shift = clamp(px - innerWidth * .45, 0, maxShift);
      track.style.transform = `translateX(${-shift}px)`;
      fill.style.width = px + "px";
      setHour(hr);
      $("#dayProg").style.transform = `scaleX(${clamp((p - .04) / .9).toFixed(4)})`;
      $("#dayHint").style.opacity = p > .08 ? 0 : 1;
    } else {
      track.style.transform = ""; fill.style.width = "";
    }
  };

  // ------------------------------------------------------------------ how-it-works demos
  // ids inside the stage become data-id so the demos can be cloned for mobile.
  $$("#howStage [id]").forEach(el => { el.dataset.id = el.id; el.removeAttribute("id"); });
  const q = (root, id) => root.querySelector(`[data-id="${id}"]`);
  const demos = $$("#howStage .demo");
  $$(".step").forEach((st, i) => { const c = demos[i].cloneNode(true); c.classList.add("is-on"); $(".step__demo-m", st).appendChild(c); });

  function connectDemo(root) {
    const grid = q(root, "connGrid"), count = q(root, "connCount");
    const list = TOOLS.slice(0, 8);
    grid.innerHTML = list.map(([k, n, c]) => `<div class="conn">${svg(k, c)}<div><b>${n}</b><small>NOT CONNECTED</small></div></div>`).join("");
    const cells = $$(".conn", grid);
    return async alive => {
      cells.forEach(c => { c.classList.remove("on"); $("small", c).textContent = "NOT CONNECTED"; }); count.textContent = "0 / 8 CONNECTED";
      await wait(500);
      for (let i = 0; i < cells.length && alive(); i++) {
        $("small", cells[i]).textContent = "CONNECTING…"; await wait(280);
        cells[i].classList.add("on"); $("small", cells[i]).textContent = i % 3 === 2 ? "READ ONLY" : "READ + WRITE";
        count.textContent = `${i + 1} / 8 CONNECTED`; await wait(180);
      }
      await wait(2200);
    };
  }
  function hireDemo(root) {
    const name = q(root, "hName"), av = q(root, "hAv"), mis = q(root, "hMission"), tools = q(root, "hTools"), wake = q(root, "hWake"), btn = q(root, "hBtn"), stat = q(root, "hStatus"), tpl = q(root, "hTpl");
    const hl = $(".seg__hl", tpl), opts = $$("span:not(.seg__hl)", tpl);
    tools.innerHTML = ["mail", "cal", "crm", "web", "wa"].map(k => { const t = toolBy(k); return `<span>${svg(k, t[2])}${t[1]}</span>`; }).join("");
    const chips = $$("span", tools);
    const M = "Find qualified buyers, keep the pipeline honest, follow up — and only interrupt me for decisions.";
    const type = async (el, text, cps, alive) => { el.classList.add("focus"); for (let i = 1; i <= text.length && alive(); i++) { el.innerHTML = text.slice(0, i) + '<span class="caret"></span>'; await wait(1000 / cps); } el.innerHTML = text; el.classList.remove("focus"); };
    return async alive => {
      name.textContent = "Untitled"; av.textContent = "?"; mis.innerHTML = ""; wake.textContent = "Only when asked"; btn.classList.remove("done"); btn.firstElementChild.textContent = "Hire Atlas";
      stat.classList.remove("on"); stat.lastChild.textContent = "DRAFT"; hl.style.opacity = 0; opts.forEach(o => o.classList.remove("sel")); chips.forEach(c => c.classList.remove("on"));
      await wait(500); hl.style.opacity = 1; opts[0].classList.add("sel");
      await wait(400); for (const ch of "Atlas") { if (!alive()) return; name.textContent = name.textContent === "Untitled" ? ch : name.textContent + ch; av.textContent = "A"; await wait(90); }
      await wait(250); await type(mis, M, 70, alive);
      for (const c of chips) { if (!alive()) return; c.classList.add("on"); await wait(160); }
      await wait(250); wake.textContent = "Daily at 08:00"; await wait(500);
      btn.classList.add("press"); await wait(160); btn.classList.remove("press"); btn.classList.add("done");
      btn.firstElementChild.textContent = "✓ Atlas is on your team"; stat.classList.add("on"); stat.lastChild.textContent = "ACTIVE";
      await wait(2600);
    };
  }
  function approveDemo(root) {
    const sheet = q(root, "aSheet"), st = q(root, "aState"), btn = q(root, "aBtn"), sent = q(root, "aSent"), tap = q(root, "aTap");
    return async alive => {
      sheet.classList.add("away"); sent.classList.remove("on"); btn.classList.remove("done"); btn.firstElementChild.textContent = "✓ Approve action";
      st.textContent = "Waiting for your approval"; st.className = "warmtxt"; tap.classList.remove("on");
      await wait(400); sheet.classList.remove("away"); await wait(1500); if (!alive()) return;
      const sr = sheet.parentElement.getBoundingClientRect(), br = btn.getBoundingClientRect();
      tap.style.top = (br.top - sr.top + br.height / 2) + "px";
      tap.classList.add("on"); await wait(350); btn.classList.add("press"); await wait(150); btn.classList.remove("press"); tap.classList.remove("on");
      btn.classList.add("done"); btn.firstElementChild.textContent = "✓ Approved"; st.textContent = "Approved · sending now"; st.className = ""; st.style.color = "var(--mint)";
      await wait(800); sheet.classList.add("away"); await wait(300); sent.classList.add("on");
      await wait(2400); st.style.color = "";
    };
  }
  const makers = [connectDemo, hireDemo, approveDemo];
  // a runner loops one demo while it's visible/active
  const runner = (fn) => {
    let token = 0;
    return {
      start() { const my = ++token; const alive = () => my === token; (async () => { while (alive()) { await fn(alive); if (reduce) break; } })(); },
      stop() { token++; },
    };
  };
  const deskRunners = demos.map((d, i) => runner(makers[i](d)));
  const mobRunners = $$(".step__demo-m .demo").map((d, i) => runner(makers[i](d)));
  let active = -1;
  const setStep = i => {
    if (i === active) return; active = i;
    $$(".step").forEach((s, j) => s.classList.toggle("is-active", j === i));
    $(".how__prog span").textContent = `0${i + 1} / 03 · ${["CONNECT", "HIRE", "APPROVE"][i]}`;
    demos.forEach((d, j) => d.classList.toggle("is-on", j === i));
    deskRunners.forEach((r, j) => (j === i ? r.start() : r.stop()));
  };
  const stepIO = new IntersectionObserver(es => es.forEach(e => {
    const i = +e.target.dataset.step;
    if (mobile()) { e.isIntersecting ? mobRunners[i].start() : mobRunners[i].stop(); return; }
  }), { rootMargin: "-20% 0px -20% 0px" });
  $$(".step").forEach(s => stepIO.observe(s));
  const bars = $$(".how__bars i");
  if (!mobile()) setStep(0);
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  // ------------------------------------------------------------------ bento: knowledge graph
  (() => {
    const g = $("#graph"); if (!g) return;
    const nodes = [[260, 150, "IDENTITY", 1], [110, 70, "PRICING.PDF"], [400, 60, "CALL.M4A"], [90, 210, "CATALOGUE"], [420, 220, "CRM NOTES"], [250, 40, "BRAND"], [230, 260, "€90K FLOOR"], [340, 140, ""], [170, 140, ""]];
    const edges = [[0, 7], [0, 8], [7, 2], [7, 4], [8, 1], [8, 3], [0, 5], [0, 6], [1, 5], [4, 6], [2, 5], [3, 6]];
    g.innerHTML = edges.map(([a, b]) => `<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}"/>`).join("") +
      nodes.map(([x, y, l, h]) => `<circle class="${h ? "h" : "n"}" cx="${x}" cy="${y}" r="${h ? 9 : l ? 6 : 4}"/>${l ? `<text x="${x}" y="${y + (h ? 26 : 20)}" text-anchor="middle">${l}</text>` : ""}`).join("") +
      edges.map((_, i) => `<circle class="pulse" r="2.2" data-e="${i}"/>`).join("");
    const pulses = $$(".pulse", g);
    const tick = t => { pulses.forEach((p, i) => { const [a, b] = edges[i]; const f = (t * .0004 + i * .21) % 1; p.setAttribute("cx", lerp(nodes[a][0], nodes[b][0], f)); p.setAttribute("cy", lerp(nodes[a][1], nodes[b][1], f)); p.setAttribute("opacity", Math.sin(Math.PI * f)); }); };
    frameHooks.push(tick);
  })();
  // bento: chat sequence
  const chat = $("#chat");
  const chatLoop = async () => {
    const [me, ai, typing] = $$("p", chat);
    for (;;) {
      [me, ai, typing].forEach(p => p.classList.remove("on")); await wait(700);
      me.classList.add("on"); await wait(900); typing.classList.add("on"); await wait(1400);
      typing.classList.remove("on"); ai.classList.add("on"); await wait(4200);
    }
  };
  // bento: activity log
  const LOG = [
    ["08:00", "atlas", "wake · schedule daily_8"], ["08:01", "atlas", "gmail.read · 38 new"], ["08:03", "atlas", "memory.recall · “never below €90k”"],
    ["08:05", "atlas", "odoo.lead.update · ABC Stone → qualified"], ["08:06", "atlas", "gmail.draft · follow-up ×4"], ["08:07", "atlas", "<em>approval.request · send proposal</em>"],
    ["08:10", "iris", "calendar.move · Thu 14:00"], ["08:12", "nova", "web.research · 14 pages"], ["08:14", "vale", "deck.render · Q4 pitch"],
  ];
  const logEl = $("#log"); let li = 0;
  const logLoop = async () => {
    for (;;) {
      const [t, who, what] = LOG[li++ % LOG.length];
      const d = document.createElement("div"); d.innerHTML = `${t} <b>${who}</b> ${what}`; logEl.appendChild(d);
      if (logEl.children.length > 8) logEl.firstElementChild.remove();
      await wait(1100);
    }
  };
  if (reduce) { $$("p", chat).forEach(p => p.classList.add("on")); $$("p", chat)[2].classList.remove("on"); LOG.slice(0, 6).forEach(([t, w, x]) => { const d = document.createElement("div"); d.innerHTML = `${t} <b>${w}</b> ${x}`; logEl.appendChild(d); }); }
  else {
    const once = (el, fn) => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { fn(); o.disconnect(); } }); o.observe(el); };
    once(chat, chatLoop); once(logEl, logLoop);
  }
  // roles: tool icons
  $$(".role__tools").forEach(el => { el.innerHTML = el.dataset.tools.split(",").map(k => `<span title="${toolBy(k)[1]}">${svg(k, toolBy(k)[2])}</span>`).join(""); });

  // ------------------------------------------------------------------ main loop
  const loop = t => {
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    if (orbitOn) { drawSky(t); drawOrbit(t); }
    frameHooks.forEach(f => f(t));
    if (!reduce) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // ------------------------------------------------------------------ modal, checkout, forms
  const modal = $("#modal"), sales = $("#salesForm"), waitF = $("#waitForm"), done = $("#mdone");
  let lastFocus = null;
  const openModal = (form, plan) => {
    lastFocus = document.activeElement;
    [sales, waitF, done].forEach(f => (f.hidden = f !== form));
    form.reset(); $(".mform__err", form).hidden = true; form.plan.value = plan || "";
    if (form === waitF) $("#waitPlan").textContent = `${plan} plan`;
    modal.hidden = false; document.body.style.overflow = "hidden";
    setTimeout(() => $("input:not([type=hidden])", form)?.focus(), 50);
  };
  const closeModal = () => { modal.hidden = true; document.body.style.overflow = ""; lastFocus?.focus?.(); };
  $$("[data-sales]").forEach(b => b.addEventListener("click", () => openModal(sales, b.dataset.sales || "")));
  $$("[data-close]").forEach(b => b.addEventListener("click", closeModal));
  addEventListener("keydown", e => { if (e.key === "Escape") { if (!modal.hidden) closeModal(); if (!lb.hidden) closeFilm(); } });

  $$("[data-checkout]").forEach(a => {
    const plan = a.dataset.checkout, url = CHECKOUT[plan];
    const live = url && !url.includes("REPLACE");
    if (live) { a.href = url; a.rel = "noopener"; }
    else a.addEventListener("click", e => { e.preventDefault(); openModal(waitF, plan[0].toUpperCase() + plan.slice(1)); });
  });

  const submit = form => form.addEventListener("submit", async e => {
    e.preventDefault();
    form.classList.add("is-sending"); $(".mform__err", form).hidden = true;
    try {
      const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(form)).toString() });
      if (!res.ok) throw new Error(res.status);
      form.hidden = true; done.hidden = false;
    } catch (_) { $(".mform__err", form).hidden = false; }
    finally { form.classList.remove("is-sending"); }
  });
  submit(sales); submit(waitF);
})();

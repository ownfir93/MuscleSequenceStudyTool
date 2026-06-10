/* ===========================================================
 *  BI231 Study Aid — main engine
 *  Section nav, study modes, persistence.
 *  3D viewer + 2D map + interactive AP/reflex live in viz.js.
 * =========================================================== */

const D = window.DATA;
const SAVE_KEY = 'bi231_v3';
const STORE = (function(){
  let s = {};
  try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); } catch(e) {}
  if (!s.known) s.known = {};
  if (!s.bestStreak) s.bestStreak = {};
  if (!s.section) s.section = 'overview';
  return s;
})();
function save(){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(STORE)); } catch(e){} }
window.__STORE = STORE;
window.__SAVE = save;

/* ====== term-highlight engine (reused from original) ====== */
function termClass(t){
  const s = t.toLowerCase();
  if (/calcium|ca²⁺|^ca\b|^\(ca/.test(s)) return 'ca';
  if (/\batp\b/.test(s)) return 'atp';
  if (/\bactin\b/.test(s)) return 'atp';
  if (/\badp\b|phosphate|inorganic/.test(s)) return 'adp';
  if (/acetylcholin|\bach\b|\bachE\b|nicotinic/.test(s)) return 'ach';
  if (/tropon|tropomyo/.test(s)) return 'trop';
  if (/na\+|sodium/.test(s)) return 'na';
  if (/k\+|potassium/.test(s)) return 'k';
  if (/ganglion|nucleus|tract|plexus|cns|pns|cord|brain|nerve|axon|soma|dendrite|hillock|sheath|node|sarcolemma|t-tubule|reticulum|m-line|\bsr\b|myosin|active site|motor neuron|action potential|junction|cleft|sarcomere|fiber|fascicle|epimysium|perimysium|endomysium|disc|z-disc|band|zone|horn|root|ramus|funiculi|column|plexus|enlargement|filum|cone|cauda equina|meninges|dura|arachnoid|pia|ligament|aponeurosis|tendon|spindle|golgi|receptor|effector|cortex|thalamus|spindle|trochanter|epicondyle|fossa|tubercle|crest|tuberosity|condyle|process|ramus|symphysis|aspera|interosseous|membrane/i.test(s)) return 'struct';
  return 'plain';
}
function parse(str){
  const out=[]; const re=/\[\[(.+?)\]\]/g; let last=0,m;
  while((m=re.exec(str))){
    if(m.index>last) out.push({t:str.slice(last,m.index),k:false});
    out.push({t:m[1],k:true});
    last = re.lastIndex;
  }
  if(last<str.length) out.push({t:str.slice(last),k:false});
  return out;
}
function renderText(parsed, el, hi=true){
  el.innerHTML='';
  parsed.forEach(seg => {
    if (seg.k && hi){
      const s = document.createElement('span');
      s.className = 'k '+termClass(seg.t);
      s.textContent = seg.t;
      el.appendChild(s);
    } else {
      el.appendChild(document.createTextNode(seg.t));
    }
  });
}

/* ====== util ====== */
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function el(tag, cls, html){ const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }

/* ============================================================
 *  SECTION REGISTRY — defines tab order
 * ============================================================ */
const SECTIONS = [
  { id:'overview', title:'Overview', emoji:'🏠', kind:'overview' },
  { id:'nervous',  title:'Nervous',  emoji:'🧠', kind:'topic', data:D.nervous },
  { id:'muscle',   title:'Muscle',   emoji:'💪', kind:'topic', data:D.muscle },
  { id:'spinal',   title:'Spinal & Reflexes', emoji:'🔗', kind:'topic', data:D.spinal },
  { id:'axial',    title:'Axial Muscles',  emoji:'🗿', kind:'muscle-topic', data:D.axial },
  { id:'limb',     title:'Limb Muscles',   emoji:'🦵', kind:'muscle-topic', data:D.limb },
  { id:'viz',      title:'Visualizer',     emoji:'🎯', kind:'viz' },
  { id:'quiz',     title:'Quiz Hub',       emoji:'🎮', kind:'quiz-hub' },
];

/* render top-level section tabs */
function buildSectionTabs(){
  const nav = document.getElementById('sectabs');
  nav.innerHTML = '';
  SECTIONS.forEach(s => {
    const b = el('button', 'sectab' + (STORE.section===s.id?' active':''), s.emoji + ' ' + s.title);
    b.dataset.sec = s.id;
    b.onclick = () => activateSection(s.id);
    nav.appendChild(b);
  });
}

function activateSection(id){
  STORE.section = id; save();
  document.querySelectorAll('.sectab').forEach(t => t.classList.toggle('active', t.dataset.sec===id));
  document.querySelectorAll('.secpanel').forEach(p => p.classList.toggle('active', p.id==='sec-'+id));
  window.scrollTo({top:0, behavior:'smooth'});
  // lazy-load viz panel content
  if (id==='viz') ensureVizLoaded();
}

function buildAllPanels(){
  const main = document.getElementById('main');
  main.innerHTML = '';
  SECTIONS.forEach(s => {
    const panel = el('section', 'secpanel' + (STORE.section===s.id?' active':''));
    panel.id = 'sec-' + s.id;
    if (s.kind==='overview') renderOverview(panel);
    else if (s.kind==='topic') renderTopicSection(panel, s);
    else if (s.kind==='muscle-topic') renderMuscleSection(panel, s);
    else if (s.kind==='viz') renderVizSection(panel);
    else if (s.kind==='quiz-hub') renderQuizHub(panel);
    main.appendChild(panel);
  });
}

/* ============================================================
 *  OVERVIEW
 * ============================================================ */
function renderOverview(panel){
  panel.appendChild(el('p','hint','Tap a section to start. Progress (known cards, best streaks) saves on this device.'));
  const grid = el('div','overview-grid');
  SECTIONS.filter(s => s.kind !== 'overview').forEach(s => {
    const c = el('div','overview-card');
    c.onclick = () => activateSection(s.id);
    c.appendChild(el('h3', null, s.emoji+' '+s.title));
    let desc = '';
    if (s.data && s.data.blurb) desc = s.data.blurb;
    else if (s.id==='viz') desc = '3D muscle viewer (BodyParts3D), 2D body map, AP graph, reflex arc animation.';
    else if (s.id==='quiz') desc = 'Random mixed quiz across every section. Streak-based scoring.';
    c.appendChild(el('p','desc', desc));
    const meta = [];
    if (s.data){
      if (s.data.cards && s.data.cards.length) meta.push(s.data.cards.length+' flashcards');
      if (s.data.learn && s.data.learn.length) meta.push(s.data.learn.length+' lessons');
      if (s.data.muscles && s.data.muscles.length) meta.push(s.data.muscles.length+' muscles');
      if (s.data.sequences && s.data.sequences.length) meta.push(s.data.sequences.length+' sequence'+(s.data.sequences.length>1?'s':''));
    }
    c.appendChild(el('div','meta', meta.join(' · ')));
    grid.appendChild(c);
  });
  panel.appendChild(grid);

  // What's covered card
  const cov = el('div','card');
  cov.innerHTML = '<h3 class="subtitle">What\'s here</h3>'+
    '<p class="cardsub">All content traced to your BI231 sources:</p>'+
    '<ul style="font-size:14px;line-height:1.55;color:#cfd5ff;margin:0;padding-left:20px;">'+
    '<li><b>Final exam study guide</b> — every numbered item used as a topic</li>'+
    '<li><b>Lab 6: Axial Muscles</b> — head, neck, back, anterior torso (~22 muscles)</li>'+
    '<li><b>Lab 7: Muscles of the Limbs</b> — shoulder, arm, forearm, hip, thigh, leg (~50 muscles)</li>'+
    '<li><b>Lab 8: Nervous Tissue &amp; Spinal Cord</b> — neuron anatomy, plexuses, reflexes</li>'+
    '</ul>';
  panel.appendChild(cov);
}

/* ============================================================
 *  TOPIC SECTION (Nervous, Muscle, Spinal)
 * ============================================================ */
function renderTopicSection(panel, sec){
  const data = sec.data;
  const modes = [];
  if (data.learn && data.learn.length) modes.push({id:'learn', label:'📖 Learn'});
  if (data.cards && data.cards.length) modes.push({id:'cards', label:'🃏 Flashcards'});
  if ((data.cards && data.cards.length) || (data.quizzes && data.quizzes.length)) modes.push({id:'quiz', label:'🎯 Quiz'});
  if (data.learn && data.learn.length) modes.push({id:'fill', label:'✍️ Fill Blanks'});
  if (data.sequences && data.sequences.length){
    data.sequences.forEach(s => {
      modes.push({id:'seq:'+s.id+':learn', label:'📜 '+s.title+' — Learn'});
      modes.push({id:'seq:'+s.id+':order', label:'🔢 '+s.title+' — Order It'});
      if (s.id==='contraction') modes.push({id:'seq:'+s.id+':viz', label:'🎮 Visualize Contraction'});
    });
  }
  buildModeTabs(panel, sec.id, modes);
  modes.forEach(m => {
    const mp = el('div','modepanel');
    mp.dataset.mode = m.id;
    if (m.id==='learn') renderLearnMode(mp, data.learn, sec.id);
    else if (m.id==='cards') renderFlashMode(mp, data.cards, sec.id);
    else if (m.id==='quiz') renderQuizMode(mp, data, sec.id);
    else if (m.id==='fill') renderFillMode(mp, data.learn, sec.id);
    else if (m.id.startsWith('seq:')){
      const [, sid, sub] = m.id.split(':');
      const seq = data.sequences.find(x => x.id===sid);
      if (sub==='learn') renderSequenceLearn(mp, seq, sec.id);
      else if (sub==='order') renderSequenceOrder(mp, seq, sec.id);
      else if (sub==='viz') renderContractionViz(mp, seq, sec.id);
    }
    panel.appendChild(mp);
  });
  // activate the first mode by default
  const first = panel.querySelector('.modepanel');
  if (first) first.classList.add('active');
  const tab = panel.querySelector('.modetab');
  if (tab) tab.classList.add('active');
}

function buildModeTabs(panel, secId, modes){
  const nav = el('nav','modetabs');
  modes.forEach((m,i) => {
    const b = el('button', 'modetab', m.label);
    b.dataset.mode = m.id;
    b.onclick = () => {
      panel.querySelectorAll('.modetab').forEach(t => t.classList.remove('active'));
      b.classList.add('active');
      panel.querySelectorAll('.modepanel').forEach(p => p.classList.toggle('active', p.dataset.mode===m.id));
    };
    nav.appendChild(b);
  });
  panel.appendChild(nav);
}

/* ====== LEARN MODE — long-form cards ====== */
function renderLearnMode(mp, learn, secId){
  const legend = el('div','legend',
    '<span style="background:var(--t-ca)">Ca / ions</span>'+
    '<span style="background:var(--t-atp)">ATP / actin</span>'+
    '<span style="background:var(--t-adp)">ADP / Pi</span>'+
    '<span style="background:var(--t-ach)">ACh</span>'+
    '<span style="background:var(--t-trop)">troponin/tropomyosin</span>'+
    '<span style="background:var(--t-struct)">structures</span>');
  mp.appendChild(legend);
  learn.forEach((entry, i) => {
    const card = el('div','card');
    const row = el('div','row');
    const num = el('span','num', i+1);
    const txt = el('div','txt');
    if (entry.lead){
      const lead = el('div','subtitle', entry.lead);
      txt.appendChild(lead);
    }
    const body = el('div');
    renderText(parse(entry.text), body, true);
    txt.appendChild(body);
    row.appendChild(num); row.appendChild(txt); card.appendChild(row);
    mp.appendChild(card);
  });
}

/* ====== FLASHCARDS ====== */
function renderFlashMode(mp, cards, secId){
  const state = { idx:0, flipped:false, order: shuffle([...Array(cards.length).keys()]) };
  const key = (i) => secId+':card:'+i;
  const hud = el('div','progress',
    '<span class="pill" id="fc_count">1 / '+cards.length+'</span>'+
    '<div class="bar"><i id="fc_bar"></i></div>'+
    '<span class="pill" id="fc_known">Known: 0</span>');
  mp.appendChild(hud);
  const flash = el('div','flash');
  flash.innerHTML = '<span class="face-label" id="fc_face">Question</span><div id="fc_body"></div><span class="tap">tap card to flip</span>';
  mp.appendChild(flash);
  const ctl = el('div','controls');
  ctl.style.marginTop='14px'; ctl.style.justifyContent='space-between';
  ctl.innerHTML = '<button class="btn" id="fc_prev">‹ Prev</button>'+
                  '<button class="btn primary" id="fc_known_btn">✓ Got it</button>'+
                  '<button class="btn" id="fc_next">Next ›</button>';
  mp.appendChild(ctl);
  const ctl2 = el('div','controls');
  ctl2.style.justifyContent='center';
  ctl2.innerHTML = '<button class="btn ghost" id="fc_shuffle">🔀 Shuffle</button>';
  mp.appendChild(ctl2);

  function update(){
    const i = state.order[state.idx];
    const c = cards[i];
    const face = mp.querySelector('#fc_face');
    const body = mp.querySelector('#fc_body');
    if (!state.flipped){
      face.textContent = 'Question';
      body.innerHTML = '<div class="hinttext">'+c.front+'</div><div class="cue" style="margin-top:10px">Recall it, then flip →</div>';
    } else {
      face.textContent = 'Answer';
      body.innerHTML = '<div class="ans">'+c.back+'</div>';
    }
    mp.querySelector('#fc_count').textContent = (state.idx+1)+' / '+cards.length;
    mp.querySelector('#fc_bar').style.width = ((state.idx+1)/cards.length*100)+'%';
    const known = cards.reduce((n,_,j) => n + (STORE.known[key(j)]?1:0), 0);
    mp.querySelector('#fc_known').textContent = 'Known: '+known;
    mp.querySelector('#fc_known_btn').textContent = STORE.known[key(i)]?'✓ Known':'✓ Got it';
  }
  flash.onclick = () => { state.flipped=!state.flipped; update(); };
  mp.querySelector('#fc_next').onclick = () => { state.flipped=false; state.idx=(state.idx+1)%cards.length; update(); };
  mp.querySelector('#fc_prev').onclick = () => { state.flipped=false; state.idx=(state.idx-1+cards.length)%cards.length; update(); };
  mp.querySelector('#fc_known_btn').onclick = (e) => { e.stopPropagation(); const i=state.order[state.idx]; STORE.known[key(i)] = !STORE.known[key(i)]; save(); update(); };
  mp.querySelector('#fc_shuffle').onclick = () => { state.order=shuffle(state.order); state.idx=0; state.flipped=false; update(); };
  update();
}

/* ====== QUIZ MODE — multi-choice from cards+quizzes ====== */
function buildQuestionPool(data){
  const pool = [];
  // from cards: card front is Q, card back is A; distractors = other backs
  (data.cards||[]).forEach((c,i) => {
    pool.push({ q: c.front, a: c.back, _idx: 'card'+i });
  });
  (data.quizzes||[]).forEach((q,i) => {
    pool.push({ q: q.q, a: q.a, options: q.options, _idx:'qz'+i });
  });
  return pool;
}
function renderQuizMode(mp, data, secId){
  const pool = buildQuestionPool(data);
  if (!pool.length){ mp.appendChild(el('p','hint','No quiz yet for this section.')); return; }
  const state = { i:0, order: shuffle([...Array(pool.length).keys()]), streak:0, locked:false };
  const hud = el('div','progress',
    '<span class="pill" id="qz_n">1 / '+pool.length+'</span>'+
    '<div class="bar"><i id="qz_bar"></i></div>'+
    '<span class="pill" id="qz_streak">Streak: 0</span>');
  mp.appendChild(hud);
  const card = el('div','card');
  card.innerHTML = '<div class="txt" id="qz_q"></div><div id="qz_opts" style="margin-top:14px"></div>';
  mp.appendChild(card);
  const ctl = el('div','controls'); ctl.style.justifyContent='center';
  ctl.innerHTML = '<button class="btn" id="qz_skip">Skip ›</button><button class="btn ghost" id="qz_reset">↺ Restart</button>';
  mp.appendChild(ctl);

  function distractorsFor(q){
    if (q.options) return shuffle(q.options.slice());
    const ans = q.a;
    const pool2 = pool.filter(x => x.a !== ans).map(x => x.a);
    shuffle(pool2);
    return shuffle([ans, ...pool2.slice(0,3)]);
  }
  function update(){
    const q = pool[state.order[state.i]];
    mp.querySelector('#qz_n').textContent = (state.i+1)+' / '+pool.length;
    mp.querySelector('#qz_bar').style.width = ((state.i+1)/pool.length*100)+'%';
    mp.querySelector('#qz_streak').textContent = 'Streak: '+state.streak;
    mp.querySelector('#qz_q').innerHTML = '<b>'+q.q+'</b>';
    const opts = distractorsFor(q);
    const oc = mp.querySelector('#qz_opts'); oc.innerHTML=''; state.locked=false;
    opts.forEach(o => {
      const b = el('button','vchoice', o);
      b.onclick = () => {
        if (state.locked) return;
        if (o===q.a){
          state.locked = true; b.classList.add('correct'); state.streak++;
          if (state.streak > (STORE.bestStreak[secId]||0)){ STORE.bestStreak[secId]=state.streak; save(); }
          mp.querySelector('#qz_streak').textContent = 'Streak: '+state.streak+' (best '+(STORE.bestStreak[secId]||0)+')';
          setTimeout(() => { state.i = (state.i+1) % pool.length; if (state.i===0) state.order=shuffle(state.order); update(); }, 700);
        } else {
          b.classList.add('wrong'); state.streak=0;
          mp.querySelector('#qz_streak').textContent = 'Streak: 0';
          setTimeout(() => b.classList.remove('wrong'), 600);
        }
      };
      oc.appendChild(b);
    });
  }
  mp.querySelector('#qz_skip').onclick = () => { state.i = (state.i+1) % pool.length; if (state.i===0) state.order=shuffle(state.order); state.streak=0; update(); };
  mp.querySelector('#qz_reset').onclick = () => { state.i=0; state.streak=0; state.order=shuffle(state.order); update(); };
  update();
}

/* ====== FILL BLANKS — same as original but multi-card ====== */
function renderFillMode(mp, learn, secId){
  const all = learn.map(e => ({lead: e.lead, parsed: parse(e.text)}));
  const totalBlanks = all.reduce((n,e) => n + e.parsed.filter(s=>s.k).length, 0);
  const hud = el('div','progress',
    '<span class="pill" id="fl_score">Correct: 0</span>'+
    '<div class="bar"><i id="fl_bar"></i></div>'+
    '<span class="pill" id="fl_total">of '+totalBlanks+'</span>');
  mp.appendChild(hud);
  const ctl = el('div','controls');
  ctl.innerHTML = '<button class="btn ghost" id="fl_reveal">👁 Reveal all</button><button class="btn primary" id="fl_reset">↺ Reset</button>';
  mp.appendChild(ctl);
  const list = el('div'); mp.appendChild(list);

  // collect all terms for distractors
  const ALLTERMS = [...new Set(all.flatMap(e => e.parsed.filter(s=>s.k).map(s=>s.t)))];

  let active = null;
  let correct = 0;
  function updateHUD(){
    mp.querySelector('#fl_score').textContent = 'Correct: '+correct;
    mp.querySelector('#fl_bar').style.width = (totalBlanks?correct/totalBlanks*100:0)+'%';
  }
  function build(){
    list.innerHTML = ''; correct=0; active=null;
    all.forEach((e,i) => {
      const card = el('div','card');
      const row = el('div','row');
      const num = el('span','num', i+1);
      const txt = el('div','txt');
      if (e.lead){ const lead = el('div','subtitle', e.lead); txt.appendChild(lead); }
      const body = el('div');
      e.parsed.forEach(seg => {
        if (seg.k){
          const b = el('span','blank', seg.t);
          b.dataset.answer = seg.t;
          b.onclick = () => selectBlank(b);
          body.appendChild(b);
        } else body.appendChild(document.createTextNode(seg.t));
      });
      txt.appendChild(body);
      row.appendChild(num); row.appendChild(txt); card.appendChild(row);
      list.appendChild(card);
    });
    updateHUD();
  }
  function selectBlank(b){
    if (b.classList.contains('correct')) return;
    if (active) active.classList.remove('activeblank');
    const old = mp.querySelector('#opt_panel'); if (old) old.remove();
    active = b; b.classList.add('activeblank');
    const ans = b.dataset.answer;
    const pool2 = ALLTERMS.filter(t => t!==ans);
    shuffle(pool2);
    const opts = shuffle([ans, ...pool2.slice(0,3)]);
    const panel = el('div','opts'); panel.id='opt_panel';
    opts.forEach(o => {
      const btn = el('button','opt', o);
      btn.onclick = (ev) => { ev.stopPropagation(); answer(b, o); };
      panel.appendChild(btn);
    });
    b.parentElement.parentElement.parentElement.appendChild(panel);
  }
  function answer(b, choice){
    const panel = mp.querySelector('#opt_panel'); if (panel) panel.remove();
    b.classList.remove('activeblank','wrong');
    if (choice === b.dataset.answer){
      b.classList.add('correct'); b.textContent = b.dataset.answer; b.classList.remove('revealed');
      correct++; updateHUD();
    } else {
      b.classList.add('wrong'); b.textContent = choice;
      setTimeout(() => { b.classList.remove('wrong'); b.textContent = b.dataset.answer; }, 700);
    }
  }
  mp.querySelector('#fl_reveal').onclick = () => {
    list.querySelectorAll('.blank').forEach(b => { if (!b.classList.contains('correct')){ b.classList.add('revealed'); b.textContent = b.dataset.answer; }});
    const old = mp.querySelector('#opt_panel'); if (old) old.remove();
  };
  mp.querySelector('#fl_reset').onclick = build;
  build();
}

/* ====== SEQUENCE LEARN (numbered steps) ====== */
function renderSequenceLearn(mp, seq, secId){
  if (seq.desc) mp.appendChild(el('p','hint', seq.desc));
  seq.steps.forEach((step, i) => {
    const card = el('div','card');
    const row = el('div','row');
    const num = el('span','num', i+1);
    const txt = el('div','txt');
    renderText(parse(step), txt, true);
    if (seq.cbcRange && i+1>=seq.cbcRange[0] && i+1<=seq.cbcRange[1]){
      const tag = el('span','cbc','Cross-bridge'); txt.appendChild(tag);
    }
    row.appendChild(num); row.appendChild(txt); card.appendChild(row);
    mp.appendChild(card);
  });
}

/* ====== SEQUENCE — ORDER IT ====== */
function renderSequenceOrder(mp, seq, secId){
  const N = seq.steps.length;
  const key = secId+':'+seq.id+':bestStreak';
  let nextSlot=0, streak=0;
  const hud = el('div','progress',
    '<span class="pill" id="or_s">Placed: 0 / '+N+'</span>'+
    '<div class="bar"><i id="or_bar"></i></div>'+
    '<span class="pill" id="or_best">Best streak: '+(STORE.bestStreak[key]||0)+'</span>');
  mp.appendChild(hud);
  mp.appendChild(el('p','hint','Tap the steps in the correct order, 1 → '+N+'. Green = right, red = wrong (it bounces back).'));
  const slots = el('div'); mp.appendChild(slots);
  mp.appendChild(el('h3', null, 'Tap to place next:'));
  const choices = el('div'); mp.appendChild(choices);
  const reset = el('div','controls'); reset.style.justifyContent='center'; reset.style.marginTop='10px';
  reset.innerHTML = '<button class="btn primary" id="or_reset">↺ New Round</button>';
  mp.appendChild(reset);

  function build(){
    nextSlot=0; streak=0;
    slots.innerHTML=''; choices.innerHTML='';
    for (let i=0;i<N;i++){
      const sl = el('div','slot');
      sl.id = 'or_slot_'+i;
      sl.innerHTML = '<span class="sn">'+(i+1)+'</span><span class="stext" style="color:var(--muted);font-size:14px">—</span>';
      slots.appendChild(sl);
    }
    const order = shuffle([...Array(N).keys()]);
    order.forEach(i => {
      const b = el('button','choice'); b.dataset.i=i;
      renderText(parse(seq.steps[i]), b, true);
      b.onclick = () => place(i, b);
      choices.appendChild(b);
    });
    updateHUD();
  }
  function place(i, btn){
    const sl = document.getElementById('or_slot_'+nextSlot);
    const txt = sl.querySelector('.stext');
    if (i===nextSlot){
      sl.classList.add('filled','correct');
      txt.innerHTML=''; renderText(parse(seq.steps[i]), txt, true);
      btn.classList.add('used');
      nextSlot++; streak++;
      if (streak > (STORE.bestStreak[key]||0)){ STORE.bestStreak[key]=streak; save(); }
      updateHUD();
      if (nextSlot===N){
        setTimeout(() => { mp.querySelector('#or_s').textContent='🎉 Perfect! '+N+' / '+N; }, 120);
      }
    } else {
      sl.classList.add('wrong'); setTimeout(() => sl.classList.remove('wrong'), 400);
      streak=0; updateHUD();
    }
  }
  function updateHUD(){
    mp.querySelector('#or_s').textContent = 'Placed: '+nextSlot+' / '+N;
    mp.querySelector('#or_bar').style.width = (nextSlot/N*100)+'%';
    mp.querySelector('#or_best').textContent = 'Best streak: '+(STORE.bestStreak[key]||0);
  }
  mp.querySelector('#or_reset').onclick = build;
  build();
}

/* ====== CONTRACTION VISUALIZE (kept from original) ====== */
function renderContractionViz(mp, seq, secId){
  // Build ring + scene + caption + quiz (same as original)
  mp.appendChild(el('div','vizhead', '<span class="pill" id="vz_status">Step 1 of '+seq.steps.length+'</span><span class="pill" id="vz_score">Streak: 0</span>'));
  mp.appendChild(el('div','ring-wrap', '<svg id="vz_ring" viewBox="0 0 260 260" aria-hidden="true"></svg>'));
  mp.appendChild(el('div','scene-wrap', '<svg id="vz_scene" viewBox="0 0 320 170"></svg>'));
  mp.appendChild(el('div','caption', '<span id="vz_cap"></span>'));
  mp.appendChild(el('div','qbox', '<div class="qlabel" id="vz_ql">Which step comes next?</div><div id="vz_choices"></div>'));
  const ctl = el('div','controls'); ctl.style.justifyContent='center'; ctl.style.marginTop='6px';
  ctl.innerHTML = '<button class="btn ghost" id="vz_replay">↻ Replay step</button><button class="btn primary" id="vz_restart">⟲ Restart</button>';
  mp.appendChild(ctl);

  const N = seq.steps.length;
  // Ring
  const ring = mp.querySelector('#vz_ring');
  const cx=130, cy=130, r=96;
  let html = '<circle cx="130" cy="130" r="96" fill="none" stroke="#2c3568" stroke-width="2"/>';
  for (let i=0;i<N;i++){
    const ang = (-90 + i*(360/N)) * Math.PI/180;
    const x = (cx + r*Math.cos(ang)).toFixed(1);
    const y = (cy + r*Math.sin(ang)).toFixed(1);
    html += '<g class="ringnode" data-i="'+i+'">'+
      '<circle cx="'+x+'" cy="'+y+'" r="17" fill="#232a55" stroke="#33407a" stroke-width="2"/>'+
      '<text x="'+x+'" y="'+(+y+5).toFixed(1)+'" text-anchor="middle" font-size="15" font-weight="800" fill="#9aa3cf">'+(i+1)+'</text></g>';
  }
  if (seq.cbcRange){
    html += '<text x="130" y="123" text-anchor="middle" fill="#ffd166" font-size="10" font-weight="700">CROSS-BRIDGE</text>'+
            '<text x="130" y="138" text-anchor="middle" fill="#ffd166" font-size="10" font-weight="700">CYCLE ('+seq.cbcRange[0]+'-'+seq.cbcRange[1]+')</text>';
  }
  ring.innerHTML = html;

  let idx=0, streak=0, lock=false;
  function updateRing(cur){
    ring.querySelectorAll('.ringnode').forEach(g => {
      const i = +g.dataset.i, c = g.querySelector('circle'), t = g.querySelector('text');
      let f='#232a55', s='#33407a', tc='#9aa3cf';
      if (i<cur){ f='#1f6f47'; s='#33d17a'; tc='#eaffef'; }
      if (i===cur){ f='#6ea8fe'; s='#dbe8ff'; tc='#08122e'; }
      c.setAttribute('fill',f); c.setAttribute('stroke',s); t.setAttribute('fill',tc);
      g.classList.toggle('cur', i===cur);
    });
  }
  function setCaption(i){
    const el2 = mp.querySelector('#vz_cap');
    el2.innerHTML = '';
    const n = el('span','num', i+1); el2.appendChild(n);
    const d = el('span'); renderText(parse(seq.steps[i]), d, true); el2.appendChild(d);
  }
  function setScene(i){ mp.querySelector('#vz_scene').innerHTML = contractionScene(i); }
  function go(){
    updateRing(idx); setScene(idx); setCaption(idx);
    mp.querySelector('#vz_status').textContent = 'Step '+(idx+1)+' of '+N;
    mp.querySelector('#vz_score').textContent = 'Streak: '+streak;
    const ql = mp.querySelector('#vz_ql'); const ch = mp.querySelector('#vz_choices');
    if (idx >= N-1){
      ql.textContent = '🎉 Sequence complete!';
      ch.innerHTML = '<div class="done-msg">You walked the whole sequence. Steps '+ (seq.cbcRange?seq.cbcRange[0]+'–'+seq.cbcRange[1]+' (the cross-bridge cycle)':'4–8') + ' keep repeating as long as Ca²⁺ and ATP are available.</div>';
      return;
    }
    ql.textContent = 'What happens next? Tap the correct step to advance.';
    const correct = idx+1;
    const pool = [];
    for (let k=0;k<N;k++) if (k!==correct) pool.push(k);
    shuffle(pool);
    const opts = shuffle([correct, ...pool.slice(0,3)]);
    ch.innerHTML=''; lock=false;
    opts.forEach(k => {
      const b = el('button','vchoice'); renderText(parse(seq.steps[k]), b, true);
      b.onclick = () => {
        if (lock) return;
        if (k===correct){
          lock=true; b.classList.add('correct'); streak++;
          mp.querySelector('#vz_score').textContent='Streak: '+streak;
          setTimeout(() => { idx++; go(); }, 650);
        } else {
          b.classList.add('wrong'); streak=0;
          mp.querySelector('#vz_score').textContent='Streak: 0';
          setTimeout(() => b.classList.remove('wrong'), 500);
        }
      };
      ch.appendChild(b);
    });
  }
  mp.querySelector('#vz_replay').onclick = () => setScene(idx);
  mp.querySelector('#vz_restart').onclick = () => { idx=0; streak=0; go(); };
  go();
}

/* contractionScene — SVG from original */
function contractionScene(i){
  function caDot(x,y,dx,dy,delay,fill){
    return '<circle class="caDot" cx="'+x+'" cy="'+y+'" r="4" fill="'+(fill||'#ffd166')+'" style="--dx:'+dx+'px;--dy:'+dy+'px;animation-delay:'+delay+'s"/>';
  }
  function token(x,y,label,fill,cls,delay){
    return '<g class="'+(cls||'')+'" style="animation-delay:'+(delay||0)+'s"><rect x="'+x+'" y="'+y+'" width="30" height="16" rx="5" fill="'+fill+'"/>'+
      '<text x="'+(x+15)+'" y="'+(y+12)+'" text-anchor="middle" font-size="9" font-weight="800" fill="#0c1024">'+label+'</text></g>';
  }
  function sarc(o){
    o=o||{};
    const a=o.actin||'', t=o.tropo||'', hd=o.head||'';
    let beads=''; for (let k=0;k<12;k++) beads+='<circle cx="'+(42+k*19)+'" cy="40" r="6.5" fill="#3ddc84"/>';
    const trop=o.troponin?'<circle cx="100" cy="49" r="5" fill="#ff7eb6"/><circle cx="195" cy="49" r="5" fill="#ff7eb6"/>':'';
    return '<line x1="160" y1="8" x2="160" y2="150" stroke="#445091" stroke-dasharray="3 4"/>'+
      '<text x="160" y="161" fill="#9aa3cf" font-size="8" text-anchor="middle">M-line</text>'+
      '<g class="'+a+'">'+beads+'<rect class="tropo '+t+'" x="36" y="46" width="210" height="6" rx="3" fill="#5aa9ff"/>'+trop+'</g>'+
      '<text x="18" y="34" fill="#9aa3cf" font-size="8">actin</text>'+
      '<rect x="36" y="118" width="248" height="12" rx="6" fill="#c98bdb"/>'+
      '<text x="18" y="116" fill="#9aa3cf" font-size="8">myosin</text>'+
      '<g class="head '+hd+'"><rect x="151" y="92" width="7" height="28" fill="#c98bdb"/>'+
      '<circle cx="154" cy="86" r="12" fill="#f0b266" stroke="#0c1024" stroke-width="1"/></g>'+
      (o.extra||'');
  }
  switch(i){
    case 0: return '<text x="14" y="50" fill="#9aa3cf" font-size="9">motor neuron</text>'+
      '<line x1="16" y1="66" x2="214" y2="66" stroke="#8fa0d6" stroke-width="7" stroke-linecap="round"/>'+
      '<circle cx="236" cy="66" r="22" fill="#6e7bbf"/>'+
      '<text x="236" y="104" fill="#9aa3cf" font-size="8" text-anchor="middle">neuromuscular junction</text>'+
      '<circle class="travelAxon" cx="22" cy="66" r="7" fill="#6ea8fe"/>';
    case 1: return '<circle cx="46" cy="52" r="26" fill="#6e7bbf"/>'+
      '<text x="46" y="18" fill="#9aa3cf" font-size="8" text-anchor="middle">axon terminal</text>'+
      '<rect x="250" y="10" width="14" height="148" rx="6" fill="#8fa0d6"/>'+
      '<text x="248" y="170" fill="#9aa3cf" font-size="8" text-anchor="middle">sarcolemma</text>'+
      '<text x="150" y="150" fill="#9aa3cf" font-size="8" text-anchor="middle">synaptic cleft</text>'+
      caDot(74,46,172,4,0,'#f0b266')+caDot(74,54,170,-6,.35,'#f0b266')+caDot(74,60,174,12,.7,'#f0b266')+
      caDot(74,48,172,0,1.05,'#f0b266')+caDot(74,58,170,-2,1.4,'#f0b266');
    case 2: return '<rect x="14" y="8" width="292" height="16" rx="6" fill="#8fa0d6"/>'+
      '<text x="20" y="20" fill="#0c1024" font-size="8" font-weight="700">sarcolemma</text>'+
      '<rect x="150" y="20" width="16" height="78" rx="6" fill="#8fa0d6"/>'+
      '<text x="172" y="62" fill="#9aa3cf" font-size="8">T-tubule</text>'+
      '<rect x="58" y="104" width="74" height="46" rx="9" fill="#9b8cff" opacity=".5"/>'+
      '<rect x="184" y="104" width="74" height="46" rx="9" fill="#9b8cff" opacity=".5"/>'+
      '<text x="95" y="132" fill="#e7e0ff" font-size="9" font-weight="700" text-anchor="middle">SR</text>'+
      '<text x="221" y="132" fill="#e7e0ff" font-size="9" font-weight="700" text-anchor="middle">SR</text>'+
      '<circle class="travelDown" cx="158" cy="26" r="6" fill="#6ea8fe"/>'+
      caDot(95,104,-6,-42,0)+caDot(110,104,12,-48,.4)+caDot(85,104,-20,-38,.8)+
      caDot(221,104,6,-46,.2)+caDot(206,104,-12,-40,.6)+caDot(236,104,18,-38,1);
    case 3: return sarc({tropo:'tropoShift',troponin:true,extra:
      caDot(92,92,6,-38,0)+caDot(70,96,28,-44,.4)+caDot(120,92,-14,-40,.8)+
      caDot(185,92,8,-38,.3)+caDot(205,96,-12,-42,.7)});
    case 4: return sarc({tropo:'tropoUp',troponin:true,head:'headAttach'});
    case 5: return sarc({tropo:'tropoUp',actin:'powerStroke',head:'headPivot',extra:
      token(118,60,'ADP','#b794f6','tokenUp',0)+token(168,62,'Pi','#b794f6','tokenUp',.4)});
    case 6: return sarc({tropo:'tropoUp',head:'headDetach',extra:
      token(139,148,'ATP','#3ddc84','tokenIn',0)});
    case 7: return sarc({tropo:'tropoUp',head:'headCock',extra:
      token(116,148,'ADP','#b794f6','tokenUp',0)+token(170,148,'Pi','#b794f6','tokenUp',.3)});
    case 8: return sarc({tropo:'tropoCover',actin:'slideBack',troponin:true,extra:
      caDot(92,58,4,42,0)+caDot(120,54,-8,46,.4)+caDot(185,58,6,44,.25)+caDot(205,54,-10,42,.7)});
  }
  return '';
}

/* ============================================================
 *  MUSCLE SECTION (Axial / Limb)
 * ============================================================ */
function renderMuscleSection(panel, sec){
  const data = sec.data;
  const modes = [];
  if (data.learn && data.learn.length) modes.push({id:'learn', label:'📖 Notes'});
  modes.push({id:'list', label:'📋 List'});
  modes.push({id:'flash', label:'🃏 Flashcards'});
  modes.push({id:'oia', label:'🎯 O / I / A Match'});
  buildModeTabs(panel, sec.id, modes);
  modes.forEach((m,i) => {
    const mp = el('div','modepanel');
    mp.dataset.mode = m.id;
    if (m.id==='learn') renderLearnMode(mp, data.learn, sec.id);
    else if (m.id==='list') renderMuscleList(mp, data.muscles, sec.id);
    else if (m.id==='flash') renderMuscleFlash(mp, data.muscles, sec.id);
    else if (m.id==='oia') renderMuscleOIA(mp, data.muscles, sec.id);
    panel.appendChild(mp);
  });
  const first = panel.querySelector('.modepanel'); if (first) first.classList.add('active');
  const tab = panel.querySelector('.modetab'); if (tab) tab.classList.add('active');
}

function renderMuscleList(mp, muscles, secId){
  const groups = [...new Set(muscles.map(m => m.group))];
  const filter = { group:'All', tag:'All' };
  const fbar = el('div','filterbar');
  function chip(label, isActive, onClick){
    const b = el('button','fchip'+(isActive?' on':''), label); b.onclick=onClick; return b;
  }
  function buildFilter(){
    fbar.innerHTML='';
    fbar.appendChild(chip('All groups', filter.group==='All', ()=>{ filter.group='All'; build(); }));
    groups.forEach(g => fbar.appendChild(chip(g, filter.group===g, ()=>{ filter.group=g; build(); })));
    if (muscles.some(m => m.tag==='sits')) fbar.appendChild(chip('SITS only', filter.tag==='sits', ()=>{ filter.tag = filter.tag==='sits'?'All':'sits'; build(); }));
    if (muscles.some(m => m.tag==='ham')) fbar.appendChild(chip('Hamstrings', filter.tag==='ham', ()=>{ filter.tag = filter.tag==='ham'?'All':'ham'; build(); }));
    if (muscles.some(m => m.tag==='quad')) fbar.appendChild(chip('Quads', filter.tag==='quad', ()=>{ filter.tag = filter.tag==='quad'?'All':'quad'; build(); }));
  }
  mp.appendChild(fbar);
  const list = el('div'); mp.appendChild(list);
  function build(){
    buildFilter();
    list.innerHTML = '';
    const filtered = muscles.filter(m => (filter.group==='All' || m.group===filter.group) && (filter.tag==='All' || m.tag===filter.tag));
    filtered.forEach(m => {
      const c = el('div','muscle');
      const tagSpan = m.tag ? '<span class="tag '+m.tag+'">'+(m.tag==='sits'?'SITS':m.tag==='ham'?'Hamstring':m.tag==='quad'?'Quad':m.tag)+'</span>' : '';
      const depthSpan = '<span class="tag '+(m.deep?'dp':'sup')+'">'+(m.deep?'Deep':'Superficial')+'</span>';
      c.innerHTML = '<h3>'+m.name+' '+tagSpan+depthSpan+'</h3>'+
        '<div class="grp">'+m.group+'</div>'+
        '<div class="oia">'+
          '<span class="lbl">O</span><span>'+m.origin+'</span>'+
          '<span class="lbl">I</span><span>'+m.insertion+'</span>'+
          '<span class="lbl">A</span><span>'+m.action+'</span>'+
        '</div>';
      list.appendChild(c);
    });
    if (!filtered.length) list.innerHTML = '<p class="hint">No muscles match this filter.</p>';
  }
  build();
}

function renderMuscleFlash(mp, muscles, secId){
  const modeChoice = { side:'name' };  // 'name' -> ask O/I/A,  'oia' -> ask name from action
  const sel = el('div','controls');
  sel.innerHTML = '<button class="btn small" id="mf_n">Card: name → O/I/A</button><button class="btn small ghost" id="mf_o">Card: O/I/A → name</button>';
  mp.appendChild(sel);

  const state = { idx:0, flipped:false, order: shuffle([...Array(muscles.length).keys()]) };
  const key = (i) => secId+':musc:'+i;
  const hud = el('div','progress',
    '<span class="pill" id="mf_count">1 / '+muscles.length+'</span>'+
    '<div class="bar"><i id="mf_bar"></i></div>'+
    '<span class="pill" id="mf_known">Known: 0</span>');
  mp.appendChild(hud);
  const flash = el('div','flash');
  flash.innerHTML = '<span class="face-label" id="mf_face">Question</span><div id="mf_body"></div><span class="tap">tap card to flip</span>';
  mp.appendChild(flash);
  const ctl = el('div','controls'); ctl.style.marginTop='14px'; ctl.style.justifyContent='space-between';
  ctl.innerHTML = '<button class="btn" id="mf_prev">‹ Prev</button>'+
                  '<button class="btn primary" id="mf_known_btn">✓ Got it</button>'+
                  '<button class="btn" id="mf_next">Next ›</button>';
  mp.appendChild(ctl);
  const ctl2 = el('div','controls'); ctl2.style.justifyContent='center';
  ctl2.innerHTML = '<button class="btn ghost" id="mf_shuffle">🔀 Shuffle</button>';
  mp.appendChild(ctl2);

  function update(){
    const i = state.order[state.idx];
    const m = muscles[i];
    const face = mp.querySelector('#mf_face');
    const body = mp.querySelector('#mf_body');
    if (modeChoice.side==='name'){
      if (!state.flipped){
        face.textContent = 'Name';
        body.innerHTML = '<div class="hinttext">'+m.name+'</div><div class="cue">'+m.group+'</div><div class="cue" style="margin-top:10px">Recall O / I / A, then flip →</div>';
      } else {
        face.textContent = 'O / I / A';
        body.innerHTML = '<div class="oia" style="font-size:15px;text-align:left;">'+
          '<span class="lbl">O</span><span>'+m.origin+'</span>'+
          '<span class="lbl">I</span><span>'+m.insertion+'</span>'+
          '<span class="lbl">A</span><span>'+m.action+'</span></div>';
      }
    } else {
      if (!state.flipped){
        face.textContent = 'Find the muscle';
        body.innerHTML = '<div class="cue">Action:</div><div class="hinttext">'+m.action+'</div><div class="cue" style="margin-top:8px">Hint: '+m.group+'</div>';
      } else {
        face.textContent = 'Name';
        body.innerHTML = '<div class="hinttext">'+m.name+'</div><div class="ans">O: '+m.origin+'<br>I: '+m.insertion+'</div>';
      }
    }
    mp.querySelector('#mf_count').textContent = (state.idx+1)+' / '+muscles.length;
    mp.querySelector('#mf_bar').style.width = ((state.idx+1)/muscles.length*100)+'%';
    const known = muscles.reduce((n,_,j) => n + (STORE.known[key(j)]?1:0), 0);
    mp.querySelector('#mf_known').textContent = 'Known: '+known;
    mp.querySelector('#mf_known_btn').textContent = STORE.known[key(i)]?'✓ Known':'✓ Got it';
  }
  flash.onclick = () => { state.flipped=!state.flipped; update(); };
  mp.querySelector('#mf_next').onclick = () => { state.flipped=false; state.idx=(state.idx+1)%muscles.length; update(); };
  mp.querySelector('#mf_prev').onclick = () => { state.flipped=false; state.idx=(state.idx-1+muscles.length)%muscles.length; update(); };
  mp.querySelector('#mf_known_btn').onclick = (e) => { e.stopPropagation(); STORE.known[key(state.order[state.idx])] = !STORE.known[key(state.order[state.idx])]; save(); update(); };
  mp.querySelector('#mf_shuffle').onclick = () => { state.order=shuffle(state.order); state.idx=0; state.flipped=false; update(); };
  mp.querySelector('#mf_n').onclick = () => { modeChoice.side='name'; mp.querySelector('#mf_n').classList.remove('ghost'); mp.querySelector('#mf_o').classList.add('ghost'); state.flipped=false; update(); };
  mp.querySelector('#mf_o').onclick = () => { modeChoice.side='oia'; mp.querySelector('#mf_o').classList.remove('ghost'); mp.querySelector('#mf_n').classList.add('ghost'); state.flipped=false; update(); };
  update();
}

function renderMuscleOIA(mp, muscles, secId){
  mp.appendChild(el('p','hint','Match each muscle to its action. 4 choices per round; +1 streak for correct, reset on miss.'));
  const state = { i:0, order: shuffle([...Array(muscles.length).keys()]), streak:0, lock:false };
  const key = secId+':oia:bestStreak';
  const hud = el('div','progress',
    '<span class="pill" id="oa_n">1 / '+muscles.length+'</span>'+
    '<div class="bar"><i id="oa_bar"></i></div>'+
    '<span class="pill" id="oa_streak">Streak: 0 (best '+(STORE.bestStreak[key]||0)+')</span>');
  mp.appendChild(hud);
  const card = el('div','card');
  card.innerHTML = '<div class="cardsub" id="oa_grp">Group</div><h3 class="subtitle" id="oa_name"></h3><div class="oia"><span class="lbl">O</span><span id="oa_o"></span><span class="lbl">I</span><span id="oa_i"></span></div><div class="qlabel" style="margin:14px 0 8px">Action?</div><div id="oa_opts"></div>';
  mp.appendChild(card);
  const ctl = el('div','controls'); ctl.style.justifyContent='center';
  ctl.innerHTML = '<button class="btn" id="oa_skip">Skip ›</button><button class="btn ghost" id="oa_reset">↺ Restart</button>';
  mp.appendChild(ctl);
  function update(){
    const i = state.order[state.i];
    const m = muscles[i];
    mp.querySelector('#oa_n').textContent = (state.i+1)+' / '+muscles.length;
    mp.querySelector('#oa_bar').style.width = ((state.i+1)/muscles.length*100)+'%';
    mp.querySelector('#oa_streak').textContent = 'Streak: '+state.streak+' (best '+(STORE.bestStreak[key]||0)+')';
    mp.querySelector('#oa_grp').textContent = m.group;
    mp.querySelector('#oa_name').textContent = m.name;
    mp.querySelector('#oa_o').textContent = m.origin;
    mp.querySelector('#oa_i').textContent = m.insertion;
    const others = muscles.filter(x => x.action !== m.action);
    shuffle(others);
    const opts = shuffle([m.action, ...others.slice(0,3).map(x => x.action)]);
    const oc = mp.querySelector('#oa_opts'); oc.innerHTML=''; state.lock=false;
    opts.forEach(o => {
      const b = el('button','vchoice', o);
      b.onclick = () => {
        if (state.lock) return;
        if (o===m.action){
          state.lock=true; b.classList.add('correct'); state.streak++;
          if (state.streak > (STORE.bestStreak[key]||0)){ STORE.bestStreak[key]=state.streak; save(); }
          mp.querySelector('#oa_streak').textContent='Streak: '+state.streak+' (best '+(STORE.bestStreak[key]||0)+')';
          setTimeout(() => { state.i = (state.i+1) % muscles.length; if (state.i===0) state.order=shuffle(state.order); update(); }, 700);
        } else {
          b.classList.add('wrong'); state.streak=0;
          mp.querySelector('#oa_streak').textContent='Streak: 0';
          setTimeout(() => b.classList.remove('wrong'), 600);
        }
      };
      oc.appendChild(b);
    });
  }
  mp.querySelector('#oa_skip').onclick = () => { state.i=(state.i+1)%muscles.length; if (state.i===0) state.order=shuffle(state.order); state.streak=0; update(); };
  mp.querySelector('#oa_reset').onclick = () => { state.i=0; state.streak=0; state.order=shuffle(state.order); update(); };
  update();
}

/* ============================================================
 *  VISUALIZER SECTION  (3D viewer + 2D map + AP + reflex arc)
 * ============================================================ */
function renderVizSection(panel){
  const modes = [
    {id:'body3d', label:'🧍 3D Muscle Viewer'},
    {id:'bodymap', label:'🗺️ 2D Body Map'},
    {id:'ap', label:'⚡ Action Potential'},
    {id:'reflex', label:'🔄 Reflex Arc'},
  ];
  buildModeTabs(panel, 'viz', modes);
  modes.forEach(m => {
    const mp = el('div','modepanel');
    mp.dataset.mode = m.id;
    if (m.id==='body3d') mp.innerHTML = '<p class="hint">Loading 3D viewer…</p><div id="viz_body3d_host"></div>';
    else if (m.id==='bodymap') mp.innerHTML = '<div id="viz_bodymap_host"></div>';
    else if (m.id==='ap') mp.innerHTML = '<div id="viz_ap_host"></div>';
    else if (m.id==='reflex') mp.innerHTML = '<div id="viz_reflex_host"></div>';
    panel.appendChild(mp);
  });
  const first = panel.querySelector('.modepanel'); if (first) first.classList.add('active');
  const tab = panel.querySelector('.modetab'); if (tab) tab.classList.add('active');
}

let __viz_loaded = false;
async function ensureVizLoaded(){
  if (__viz_loaded) return;
  __viz_loaded = true;
  try {
    const viz = await import('./viz.js');
    viz.mountBody3D(document.getElementById('viz_body3d_host'));
    viz.mountBodyMap(document.getElementById('viz_bodymap_host'));
    viz.mountAP(document.getElementById('viz_ap_host'));
    viz.mountReflex(document.getElementById('viz_reflex_host'));
  } catch(e){
    console.error('viz load failed:', e);
    document.getElementById('viz_body3d_host').innerHTML = '<p class="hint">Couldn\'t load 3D viewer: '+e.message+'</p>';
  }
}

/* ============================================================
 *  QUIZ HUB — random mixed quiz across all sections
 * ============================================================ */
function renderQuizHub(panel){
  const allQ = [];
  ['nervous','muscle','spinal'].forEach(sid => {
    const d = D[sid];
    (d.cards||[]).forEach(c => allQ.push({q:c.front, a:c.back, src:sid, _key:'card'}));
    (d.quizzes||[]).forEach(q => allQ.push({q:q.q, a:q.a, options:q.options, src:sid, _key:'qz'}));
  });
  // muscle O/I/A questions: action -> name
  ['axial','limb'].forEach(sid => {
    const d = D[sid];
    (d.muscles||[]).forEach(m => {
      allQ.push({q: 'Which muscle has this action: "'+m.action+'"?', a:m.name, src:sid, _key:'musc-action'});
      allQ.push({q: 'Origin of '+m.name+'?', a:m.origin, src:sid, _key:'musc-O'});
      allQ.push({q: 'Insertion of '+m.name+'?', a:m.insertion, src:sid, _key:'musc-I'});
    });
    (d.cards||[]).forEach(c => allQ.push({q:c.front, a:c.back, src:sid, _key:'card'}));
  });

  const state = { i:0, order: shuffle([...Array(allQ.length).keys()]), streak:0, lock:false, n:0 };
  const head = el('div','progress',
    '<span class="pill" id="qh_n">Question 1</span>'+
    '<div class="bar"><i id="qh_bar"></i></div>'+
    '<span class="pill warn" id="qh_streak">Streak: 0</span>');
  panel.appendChild(head);
  const card = el('div','qmix');
  card.innerHTML = '<div class="cardsub" id="qh_src"></div><div class="qprompt" id="qh_q"></div><div id="qh_opts"></div>';
  panel.appendChild(card);
  const ctl = el('div','controls'); ctl.style.justifyContent='center';
  ctl.innerHTML = '<button class="btn" id="qh_skip">Skip ›</button><button class="btn ghost" id="qh_reset">↺ Restart</button>';
  panel.appendChild(ctl);

  function answersPool(q){
    if (q.options) return shuffle(q.options.slice());
    const same = allQ.filter(x => x._key===q._key && x.a !== q.a).map(x => x.a);
    shuffle(same);
    return shuffle([q.a, ...same.slice(0,3)]);
  }
  function update(){
    state.n++;
    const q = allQ[state.order[state.i]];
    panel.querySelector('#qh_n').textContent = 'Question '+state.n;
    panel.querySelector('#qh_bar').style.width = ((state.i+1)/allQ.length*100)+'%';
    panel.querySelector('#qh_streak').textContent = 'Streak: '+state.streak+' (best '+(STORE.bestStreak['hub']||0)+')';
    const srcName = SECTIONS.find(s => s.id===q.src);
    panel.querySelector('#qh_src').textContent = srcName ? srcName.emoji+' '+srcName.title : q.src;
    panel.querySelector('#qh_q').textContent = q.q;
    const oc = panel.querySelector('#qh_opts'); oc.innerHTML=''; state.lock=false;
    answersPool(q).forEach(o => {
      const b = el('button','vchoice', o);
      b.onclick = () => {
        if (state.lock) return;
        if (o===q.a){
          state.lock=true; b.classList.add('correct'); state.streak++;
          if (state.streak > (STORE.bestStreak['hub']||0)){ STORE.bestStreak['hub']=state.streak; save(); }
          panel.querySelector('#qh_streak').textContent='Streak: '+state.streak+' (best '+(STORE.bestStreak['hub']||0)+')';
          setTimeout(() => { state.i=(state.i+1)%allQ.length; if (state.i===0) state.order=shuffle(state.order); update(); }, 650);
        } else {
          b.classList.add('wrong'); state.streak=0;
          panel.querySelector('#qh_streak').textContent='Streak: 0';
          setTimeout(() => b.classList.remove('wrong'), 600);
        }
      };
      oc.appendChild(b);
    });
  }
  panel.querySelector('#qh_skip').onclick = () => { state.i=(state.i+1)%allQ.length; if (state.i===0) state.order=shuffle(state.order); state.streak=0; update(); };
  panel.querySelector('#qh_reset').onclick = () => { state.i=0; state.streak=0; state.n=0; state.order=shuffle(state.order); update(); };
  update();
}

/* ============================================================
 *  BOOT
 * ============================================================ */
buildSectionTabs();
buildAllPanels();
if (STORE.section==='viz') ensureVizLoaded();

document.getElementById('resetAll').onclick = (e) => {
  e.preventDefault();
  if (!confirm('Wipe all saved progress?')) return;
  localStorage.removeItem(SAVE_KEY);
  location.reload();
};

export {};

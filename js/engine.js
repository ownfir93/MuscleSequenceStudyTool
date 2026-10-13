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
  if (!s || typeof s !== 'object' || Array.isArray(s)) s = {};
  if (!s.known || typeof s.known !== 'object' || Array.isArray(s.known)) s.known = {};
  if (!s.bestStreak || typeof s.bestStreak !== 'object' || Array.isArray(s.bestStreak)) s.bestStreak = {};
  if (!s.answers || typeof s.answers !== 'object' || Array.isArray(s.answers)) s.answers = {};
  if (!s.modes || typeof s.modes !== 'object' || Array.isArray(s.modes)) s.modes = {};
  if (!s.section) s.section = 'overview';
  return s;
})();
function save(){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(STORE)); } catch(e){ const status=document.getElementById('saveStatus');if(status)status.textContent='Progress is temporary: this browser is blocking storage. '; } }
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
function el(tag, cls, html){ const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=String(html); return e; }

/* ============================================================
 *  SECTION REGISTRY — defines tab order
 * ============================================================ */
const SECTIONS = [
  { id:'overview', title:'Overview', emoji:'🏠', kind:'overview' },
  { id:'general', title:'General Senses', emoji:'🖐️', kind:'topic', data:D.general },
  { id:'vision', title:'Vision', emoji:'👁️', kind:'topic', data:D.vision },
  { id:'chemical', title:'Taste & Smell', emoji:'🍋', kind:'topic', data:D.chemical },
  { id:'hearing', title:'Hearing & Balance', emoji:'👂', kind:'topic', data:D.hearing },
  { id:'nervous',  title:'Nervous',  emoji:'🧠', kind:'topic', data:D.nervous },
  { id:'muscle',   title:'Muscle',   emoji:'💪', kind:'topic', data:D.muscle },
  { id:'spinal',   title:'Spinal & Reflexes', emoji:'🔗', kind:'topic', data:D.spinal },
  { id:'axial',    title:'Axial Muscles',  emoji:'🗿', kind:'muscle-topic', data:D.axial },
  { id:'limb',     title:'Limb Muscles',   emoji:'🦵', kind:'muscle-topic', data:D.limb },
  { id:'viz',      title:'Visualizer',     emoji:'🎯', kind:'viz' },
  { id:'quiz',     title:'Quiz Hub',       emoji:'🎮', kind:'quiz-hub' },
];
if (!SECTIONS.some(s => s.id === STORE.section)) STORE.section = 'overview';

/* render top-level section tabs */
function buildSectionTabs(){
  const nav = document.getElementById('sectabs');
  nav.innerHTML = '';
  SECTIONS.forEach(s => {
    const b = el('button', 'sectab' + (STORE.section===s.id?' active':''), s.emoji + ' ' + s.title);
    b.dataset.sec = s.id;
    b.setAttribute('aria-pressed', STORE.section===s.id);
    b.setAttribute('aria-controls', 'sec-'+s.id);
    b.onclick = () => activateSection(s.id);
    nav.appendChild(b);
  });
}

function activateSection(id){
  if (!SECTIONS.some(s => s.id===id)) return;
  STORE.section = id; save();
  document.querySelectorAll('.sectab').forEach(t => { t.classList.toggle('active', t.dataset.sec===id); t.setAttribute('aria-pressed', t.dataset.sec===id); });
  document.querySelectorAll('.secpanel').forEach(p => p.classList.toggle('active', p.id==='sec-'+id));
  window.scrollTo({top:0, behavior:'smooth'});
  if (typeof updateStickyOffsets === 'function') updateStickyOffsets();
  if (id==='viz') ensureVizLoaded();
}

function buildAllPanels(){
  const main = document.getElementById('main');
  main.innerHTML = '';
  SECTIONS.forEach(s => {
    const panel = el('section', 'secpanel' + (STORE.section===s.id?' active':''));
    panel.id = 'sec-' + s.id;
    panel.setAttribute('aria-label', s.title);
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
function appendSource(host, source){
  if (!source) return;
  const p = el('p','source-note'); p.textContent = 'Source: '+source; host.appendChild(p);
}

function renderOverview(panel){
  const hero = el('div','study-hero');
  hero.innerHTML = '<span class="eyebrow">BIOL232 · THE SENSES</span><h2>Turn the material into memory.</h2><p>Understand the idea, recall it without looking, then test how it works. Start with general senses or jump into a topic.</p>';
  const start = el('button','btn primary','Start with general senses →');
  start.onclick = () => activateSection('general'); hero.appendChild(start); panel.appendChild(hero);
  function group(title, sections){
    panel.appendChild(el('h2','overview-heading',title));
    const grid = el('div','overview-grid');
    sections.forEach(s => {
      const c = el('button','overview-card'); c.type='button';
      c.onclick = () => activateSection(s.id);
      c.appendChild(el('span','overview-title',s.emoji+' '+s.title));
      const desc = s.data?.blurb || (s.id==='viz' ? 'Your 3D muscle viewer, action-potential graph and reflex arc.' : 'Choose BIOL232, BI231, or both. Review explanations and retry missed questions.');
      c.appendChild(el('span','desc',desc));
      const meta=[];
      if(s.data?.learn) meta.push(s.data.learn.length+' lessons');
      if(s.data?.cards) meta.push(s.data.cards.length+' cards');
      if(s.data?.quizzes) meta.push(s.data.quizzes.length+' quiz questions');
      if(s.data?.muscles) meta.push(s.data.muscles.length+' muscles');
      c.appendChild(el('span','meta',meta.join(' · '))); grid.appendChild(c);
    }); panel.appendChild(grid);
  }
  group('Explore the senses',SECTIONS.filter(s => s.data?.course==='BIOL232'));
  group('Your BI231 study tools',SECTIONS.filter(s => s.data && s.data.course!=='BIOL232'));
  group('Practice across topics',SECTIONS.filter(s => ['viz','quiz'].includes(s.id)));
  const sources = el('details','card source-details');
  sources.appendChild(el('summary',null,'About these study materials'));
  sources.appendChild(el('p','hint','The BIOL232 activities are original study summaries and diagrams grounded in the four supplied lecture PDFs. Page references use PDF page numbers. They supplement your course materials; the original slides are not republished here.'));
  const list=el('ul','source-list');
  ['BIOL232: General Senses','BIOL232: Vision','BIOL232: Gustation and Olfaction','BIOL232: Hearing and Equilibrium','BI231: Final exam study guide; Lab 6 Axial Muscles; Lab 7 Limb Muscles; Lab 8 Nervous Tissue & Spinal Cord'].forEach(t => {const item=el('li');item.textContent=t;list.appendChild(item);});
  sources.appendChild(list); panel.appendChild(sources);
}

/* ============================================================
 *  TOPIC SECTION (Nervous, Muscle, Spinal)
 * ============================================================ */
function renderTopicSection(panel, sec){
  const data = sec.data;
  const modes = [];
  if (data.course) { const title=el('div','section-intro');title.innerHTML='<span class="eyebrow">'+data.course+'</span><h2>'+data.title+'</h2><p>'+data.blurb+'</p>';panel.appendChild(title); }
  if (data.learn && data.learn.length) modes.push({id:'learn', label:'📖 Learn'});
  if (data.cards && data.cards.length) modes.push({id:'cards', label:'🃏 Flashcards'});
  if ((data.cards && data.cards.length) || (data.quizzes && data.quizzes.length)) modes.push({id:'quiz', label:'🎯 Quiz'});
  if (data.learn && data.learn.length) modes.push({id:'fill', label:'✍️ Fill Blanks'});
  if (data.course==='BIOL232') modes.push({id:'lab',label:'🔬 Practice lab'});
  if (data.sequences && data.sequences.length && data.course==='BIOL232') modes.push({id:'pathways',label:'🔢 Pathways'});
  if (data.sequences && data.sequences.length && data.course!=='BIOL232'){
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
    else if (m.id==='pathways') renderPathways(mp, data.sequences, sec.id);
    else if (m.id==='lab') prepareSensesLab(mp, sec.id);
    else if (m.id.startsWith('seq:')){
      const [, sid, sub] = m.id.split(':');
      const seq = data.sequences.find(x => x.id===sid);
      if (sub==='learn') renderSequenceLearn(mp, seq, sec.id);
      else if (sub==='order') renderSequenceOrder(mp, seq, sec.id);
      else if (sub==='viz') renderContractionViz(mp, seq, sec.id);
    }
    panel.appendChild(mp);
  });
  activateSavedMode(panel, sec.id);
}

function activateSavedMode(panel, secId){
  const wanted = STORE.modes[secId];
  const tabs = [...panel.querySelectorAll(':scope > .modetabs .modetab')];
  (tabs.find(t => t.dataset.mode===wanted) || tabs[0])?.click();
}
function buildModeTabs(panel, secId, modes){
  const nav = el('nav','modetabs'); nav.setAttribute('aria-label','Study modes');
  modes.forEach(m => {
    const b = el('button', 'modetab', m.label); b.dataset.mode = m.id;
    b.setAttribute('aria-pressed','false');
    b.onclick = () => {
      panel.querySelectorAll(':scope > .modetabs .modetab').forEach(t => {t.classList.remove('active');t.setAttribute('aria-pressed','false');});
      b.classList.add('active');b.setAttribute('aria-pressed','true');
      panel.querySelectorAll(':scope > .modepanel').forEach(p => { const active=p.dataset.mode===m.id;p.classList.toggle('active',active);if(active)p._activate?.(); });
      STORE.modes[secId]=m.id;save();
    };
    nav.appendChild(b);
  });
  panel.appendChild(nav);
}
function prepareSensesLab(mp, secId){
  let loading=false,loaded=false;
  async function load(){
    if(loading||loaded)return;loading=true;mp.replaceChildren(el('p','hint','Loading practice lab…'));
    try{
      const {renderSensesLab}=await import('./senses-lab.js?v=8');
      mp.replaceChildren();renderSensesLab(mp,secId,(host,questions,key,onChange)=>renderQuestionSession(host,questions,key,onChange));loaded=true;
    }catch(error){
      mp.replaceChildren(el('p','hint','The practice lab could not load. Check your connection and try again.'));
      const retry=el('button','btn','Try again');retry.onclick=load;mp.appendChild(retry);
    }finally{loading=false;}
  }
  mp._activate=load;
}
function renderPathways(mp, sequences, secId){
  const label=el('label','select-label','Choose a pathway');
  const select=el('select','study-select');label.appendChild(select);mp.appendChild(label);
  sequences.forEach((seq,index) => {const opt=el('option');opt.selected=index===0;opt.value=seq.id;opt.textContent=seq.title;select.appendChild(opt);});
  const host=el('div');mp.appendChild(host);
  function render(){
    const seq=sequences.find(s=>s.id===select.value);host.innerHTML='';
    const explain=el('details','card');explain.appendChild(el('summary',null,'Learn this pathway'));
    const steps=el('div','pathway-explainer');renderSequenceLearn(steps,seq,secId);explain.appendChild(steps);host.appendChild(explain);
    if(seq.desc)host.appendChild(el('p','hint',seq.desc));
    appendSource(host,seq.source);renderSequenceOrder(host,seq,secId);
  }
  select.onchange=render;render();
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
  if(D[secId]?.course==='BIOL232') mp.appendChild(el('p','hint','Highlighted terms become retrieval prompts in Fill Blanks. Each lesson points back to the supplied PDF.'));
  else mp.appendChild(legend);
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
    appendSource(card,entry.source);
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
  const flash = el('button','flash');
  flash.type='button'; flash.title='Flip flashcard (Enter or Space)';
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
      appendSource(body,c.source);
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
  // Senses quizzes use deliberately authored distractors rather than unrelated card backs.
  if (!data.quizOnly) (data.cards||[]).forEach((c,i) => {
    pool.push({ q:c.front, a:c.back, explanation:c.explanation, source:c.source, _idx:'card'+i });
  });
  (data.quizzes||[]).forEach((q,i) => pool.push({...q, _idx:'qz'+i}));
  return pool;
}
function renderQuizMode(mp, data, secId){
  renderQuestionSession(mp, buildQuestionPool(data), secId);
}

/* One deliberate answer, an explanation, then Next. No delayed auto-advance. */
function renderQuestionSession(mp, pool, scope, onChange){
  if (!pool.length){mp.appendChild(el('p','hint','No questions in this set.'));return;}
  const state={order:[],i:0,streak:0,answered:0,correct:0,locked:false,review:false};
  const key=q=>scope+':'+(q.id||q._idx||pool.indexOf(q));
  const toolbar=el('div','controls quiz-tools');
  const review=el('button','btn small ghost','Review missed');
  const restart=el('button','btn small ghost','↺ Restart');
  toolbar.append(review,restart);mp.appendChild(toolbar);
  const hud=el('div','progress quiz-progress');hud.setAttribute('aria-live','polite');
  const count=el('span','pill quiz-count'),score=el('span','pill quiz-score');hud.append(count,score);mp.appendChild(hud);
  const card=el('div','card quiz-card');
  const src=el('p','cardsub quiz-topic'),prompt=el('h3','quiz-prompt'),choices=el('div','quiz-choices');
  prompt.tabIndex=-1;
  const feedback=el('div','quiz-feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  card.append(src,prompt,choices,feedback);mp.appendChild(card);
  const controls=el('div','controls');
  const next=el('button','btn primary quiz-next','Skip question →');controls.appendChild(next);mp.appendChild(controls);
  function refreshReview(){const n=pool.filter(q=>STORE.answers[key(q)]===false).length;review.textContent=(state.review?'All questions':'Review missed')+(state.review?'':' ('+n+')');}
  function begin(reviewOnly=false){
    state.review=reviewOnly;state.i=0;state.streak=0;state.answered=0;state.correct=0;
    state.order=shuffle(pool.filter(q=>!reviewOnly || STORE.answers[key(q)]===false).slice());update();
  }
  function update(){
    state.locked=false;choices.innerHTML='';feedback.replaceChildren();feedback.className='quiz-feedback';refreshReview();
    count.textContent=state.order.length ? Math.min(state.i+1,state.order.length)+' / '+state.order.length : 'Review';
    score.textContent=state.correct+' / '+state.answered+' correct';
    if(state.i>=state.order.length){
      src.textContent='';prompt.textContent=state.order.length?'Round complete':'No missed questions to review';
      feedback.textContent=state.order.length ? 'You answered '+state.correct+' of '+state.answered+' correctly, with '+(state.order.length-state.answered)+' skipped. Restart for a fresh order or review your missed questions.' : 'Answer a few questions first. Any missed answers will be saved here on this browser.';
      next.hidden=true;onChange?.(null);return;
    }
    const q=state.order[state.i];card.dataset.questionKey=key(q);src.textContent=q.topic||'';prompt.textContent=q.q;next.hidden=false;next.textContent='Skip question →';
    const alternatives=q.options || [q.a,...shuffle([...new Set(pool.filter(p=>p.a!==q.a).map(p=>p.a))]).slice(0,3)];
    shuffle([...new Set(alternatives)]).forEach(o=>{
      const b=el('button','vchoice');b.textContent=o;
      b.onclick=()=>{
        if(state.locked)return;state.locked=true;state.answered++;
        const correct=o===q.a;STORE.answers[key(q)]=correct;
        if(correct){state.correct++;state.streak++;}else{state.streak=0;}
        STORE.bestStreak[scope]=Math.max(STORE.bestStreak[scope]||0,state.streak);save();
        [...choices.children].forEach(choice=>{choice.disabled=true;if(choice.textContent===q.a)choice.classList.add('correct');});
        if(!correct)b.classList.add('wrong');
        feedback.classList.add(correct?'is-correct':'is-wrong');
        const result=el('strong');result.textContent=correct?'✓ Correct':'Review this: '+q.a;feedback.appendChild(result);
        const explanation=el('p');explanation.textContent=q.explanation||q.a;feedback.appendChild(explanation);appendSource(feedback,q.source);
        score.textContent=state.correct+' / '+state.answered+' correct · best streak '+STORE.bestStreak[scope];
        next.textContent=state.i===state.order.length-1?'Finish round →':'Next question →';refreshReview();
      };choices.appendChild(b);
    });onChange?.(q);
  }
  next.onclick=(event)=>{if(event.detail>1)return;state.i++;update();prompt.focus({preventScroll:true});};
  restart.onclick=(event)=>{if(event.detail>1)return;begin(state.review);prompt.focus({preventScroll:true});};review.onclick=(event)=>{if(event.detail>1)return;begin(!state.review);prompt.focus({preventScroll:true});};begin();
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
          const b = el('button','blank', seg.t);
          b.type='button'; b.setAttribute('aria-label','Choose the missing term');
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
      b.classList.add('correct'); b.textContent = b.dataset.answer; b.classList.remove('revealed'); b.setAttribute('aria-label', b.dataset.answer+' — correct');
      correct++; updateHUD();
    } else {
      b.classList.add('wrong'); b.textContent = choice;
      setTimeout(() => { b.classList.remove('wrong'); b.textContent = b.dataset.answer; }, 700);
    }
  }
  mp.querySelector('#fl_reveal').onclick = () => {
    list.querySelectorAll('.blank').forEach(b => { if (!b.classList.contains('correct')){ b.classList.add('revealed'); b.textContent = b.dataset.answer; b.setAttribute('aria-label',b.dataset.answer+' — revealed'); }});
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
  const feedback=el('p','hint order-feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');mp.appendChild(feedback);
  const slots = el('div'); mp.appendChild(slots);
  mp.appendChild(el('h3', null, 'Tap to place next:'));
  const choices = el('div'); mp.appendChild(choices);
  const reset = el('div','controls'); reset.style.justifyContent='center'; reset.style.marginTop='10px';
  reset.innerHTML = '<button class="btn primary" id="or_reset">↺ New Round</button>';
  mp.appendChild(reset);

  function build(){
    nextSlot=0; streak=0;feedback.textContent='Choose the first step.';
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
    if (nextSlot>=N || btn.disabled) return;
    const sl = slots.children[nextSlot];
    const txt = sl.querySelector('.stext');
    if (i===nextSlot){
      sl.classList.add('filled','correct');
      txt.innerHTML=''; renderText(parse(seq.steps[i]), txt, true);
      btn.classList.add('used'); btn.disabled=true;
      nextSlot++; streak++;feedback.textContent='✓ Correct. '+(nextSlot===N?'Pathway complete.':'Choose step '+(nextSlot+1)+'.');
      if (streak > (STORE.bestStreak[key]||0)){ STORE.bestStreak[key]=streak; save(); }
      updateHUD();
      if (nextSlot===N){
        mp.querySelector('#or_s').textContent='✓ Complete! '+N+' / '+N;
      }
    } else {
      feedback.textContent='That is not the next step. Try again for position '+(nextSlot+1)+'.';
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
  mp.appendChild(el('div','vizhead', '<span class="pill" id="vz_status">Step 1 of '+seq.steps.length+'</span><span class="pill" id="vz_score">Streak: 0</span>'));
  // Two-column layout: ring on the left, scene on the right (stacks on mobile)
  const dual = el('div','contraction-viz');
  dual.innerHTML =
    '<div class="ring-wrap"><svg id="vz_ring" viewBox="0 0 260 260" aria-hidden="true"></svg></div>'+
    '<div class="scene-wrap"><svg id="vz_scene" viewBox="0 0 320 170"></svg></div>';
  mp.appendChild(dual);
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

  let idx=0, streak=0, lock=false, advanceTimer=null;
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
          advanceTimer=setTimeout(() => { idx++; go(); }, 650);
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
  mp.querySelector('#vz_restart').onclick = () => { clearTimeout(advanceTimer); idx=0; streak=0; lock=false; go(); };
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
  if (data.course) { const title=el('div','section-intro');title.innerHTML='<span class="eyebrow">'+data.course+'</span><h2>'+data.title+'</h2><p>'+data.blurb+'</p>';panel.appendChild(title); }
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
  activateSavedMode(panel, sec.id);
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
  const flash = el('button','flash');
  flash.type='button'; flash.title='Flip flashcard (Enter or Space)';
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
  const state = { i:0, order: shuffle([...Array(muscles.length).keys()]), streak:0, lock:false, timer:null };
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
          state.timer=setTimeout(() => { state.i = (state.i+1) % muscles.length; if (state.i===0) state.order=shuffle(state.order); update(); }, 700);
        } else {
          b.classList.add('wrong'); state.streak=0;
          mp.querySelector('#oa_streak').textContent='Streak: 0';
          setTimeout(() => b.classList.remove('wrong'), 600);
        }
      };
      oc.appendChild(b);
    });
  }
  mp.querySelector('#oa_skip').onclick = () => { clearTimeout(state.timer); state.i=(state.i+1)%muscles.length; if (state.i===0) state.order=shuffle(state.order); state.streak=0; update(); };
  mp.querySelector('#oa_reset').onclick = () => { clearTimeout(state.timer); state.i=0; state.streak=0; state.order=shuffle(state.order); update(); };
  update();
}

/* ============================================================
 *  VISUALIZER SECTION  (3D viewer + 2D map + AP + reflex arc)
 * ============================================================ */
function renderVizSection(panel){
  const modes = [
    {id:'body3d', label:'🧍 3D Muscle Viewer'},
    {id:'ap', label:'⚡ Action Potential'},
    {id:'reflex', label:'🔄 Reflex Arc'},
  ];
  buildModeTabs(panel, 'viz', modes);
  modes.forEach(m => {
    const mp = el('div','modepanel');
    mp.dataset.mode = m.id;
    if (m.id==='body3d') mp.innerHTML = '<div id="viz_body3d_host"></div>';
    else if (m.id==='ap') mp.innerHTML = '<div id="viz_ap_host"></div>';
    else if (m.id==='reflex') mp.innerHTML = '<div id="viz_reflex_host"></div>';
    panel.appendChild(mp);
  });
  activateSavedMode(panel, 'viz');
}

let __viz_loaded = false;
async function ensureVizLoaded(){
  if (__viz_loaded) return;
  __viz_loaded = true;
  try {
    const viz = await import('./viz.js?v=7');
    const bodyHost=document.getElementById('viz_body3d_host');
    viz.mountBody3D(bodyHost).catch(error=>{
      const reason=/webgl/i.test(error.message)?'This browser could not create a WebGL graphics context. ':'The 3D viewer could not start. ';
      bodyHost.replaceChildren(el('p','note',reason+'The muscle cards, action-potential graph, and reflex arc are still available.'));
    });
    viz.mountAP(document.getElementById('viz_ap_host'));
    viz.mountReflex(document.getElementById('viz_reflex_host'));
  } catch(e){
    console.error('viz load failed:', e);
    const host = document.getElementById('viz_body3d_host');
    if (host) host.innerHTML = '<p class="hint">Couldn\'t load 3D viewer: '+e.message+'</p>';
  }
}

/* ============================================================
 *  QUIZ HUB — random mixed quiz across all sections
 * ============================================================ */
function renderQuizHub(panel){
  panel.appendChild(el('h2',null,'Quiz Hub'));
  panel.appendChild(el('p','hint','Choose your course, answer without looking, and read the explanation before moving on. Missed answers are saved for another round.'));
  const label=el('label','select-label','Question set');
  const select=el('select','study-select');
  [['senses','BIOL232 · Senses'],['legacy','BI231 · Original topics'],['all','Both courses']].forEach(([value,text])=>{const option=el('option');option.value=value;option.selected=value==='senses';option.textContent=text;select.appendChild(option);});
  label.appendChild(select);panel.appendChild(label);
  const host=el('div');panel.appendChild(host);
  function update(){
    const questions=[];
    SECTIONS.filter(s=>s.data && (select.value==='all' || (select.value==='senses')===(s.data.course==='BIOL232'))).forEach(s=>{
      buildQuestionPool(s.data).forEach(q=>questions.push({...q,id:s.id+':'+q._idx,topic:s.title}));
      (s.data.muscles||[]).forEach((m,i)=>{
        questions.push({id:s.id+':action'+i,q:'Which muscle has this action: '+m.action+'?',a:m.name,topic:s.title,options:[m.name,...shuffle(s.data.muscles.filter(x=>x.action!==m.action).map(x=>x.name)).slice(0,3)]});
        questions.push({id:s.id+':origin'+i,q:'Origin of '+m.name+'?',a:m.origin,topic:s.title,options:[m.origin,...shuffle([...new Set(s.data.muscles.filter(x=>x.origin!==m.origin).map(x=>x.origin))]).slice(0,3)]});
        questions.push({id:s.id+':insertion'+i,q:'Insertion of '+m.name+'?',a:m.insertion,topic:s.title,options:[m.insertion,...shuffle([...new Set(s.data.muscles.filter(x=>x.insertion!==m.insertion).map(x=>x.insertion))]).slice(0,3)]});
      });
    });host.replaceChildren();renderQuestionSession(host,questions,'hub');
  }
  select.onchange=update;update();
}

/* ============================================================
 *  STICKY OFFSETS — keep modetabs flush below sectabs
 * ============================================================ */
function updateStickyOffsets(){
  const st = document.getElementById('sectabs');
  if (!st) return;
  document.documentElement.style.setProperty('--sectabs-h', st.offsetHeight + 'px');
}
window.addEventListener('resize', updateStickyOffsets);

/* ============================================================
 *  BOOT
 * ============================================================ */
buildSectionTabs();
buildAllPanels();
updateStickyOffsets();
if (STORE.section==='viz') ensureVizLoaded();

document.getElementById('resetAll').onclick = (e) => {
  e.preventDefault();
  if (!confirm('Wipe all saved progress?')) return;
  try { localStorage.removeItem(SAVE_KEY); } catch(e) { /* Browser may block storage. */ }
  location.reload();
};

export {};

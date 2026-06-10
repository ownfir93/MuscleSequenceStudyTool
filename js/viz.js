/* ===========================================================
 *  Visualizers
 *    - 3D muscle viewer (Three.js + BodyParts3D OBJ)
 *    - 2D body map (clickable anterior/posterior SVG)
 *    - Action Potential interactive graph
 *    - Reflex arc animation
 * =========================================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

/* ====== shared helpers ====== */
function el(tag, cls, html){ const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

/* ============================================================
 *  3D MUSCLE VIEWER
 * ============================================================ */
export async function mountBody3D(host){
  host.innerHTML = '';
  // Load manifest
  let manifest;
  try {
    const resp = await fetch('./models/manifest.json');
    manifest = await resp.json();
  } catch(e){
    host.innerHTML = '<p class="hint">Couldn\'t load model manifest: '+e.message+'</p>';
    return;
  }

  // Build name -> file lookup; also a per-muscle category for color
  const ALL_MUSCLES = Object.keys(manifest);
  // Tag bones to fade out
  const BONES = new Set(['humerus','scapula','clavicle','radius','ulna','rib','hip bone','sacrum','femur','tibia','fibula','patella']);

  // Wrap UI
  const wrap = el('div','viewer3d-wrap');
  const canvas = el('canvas'); canvas.id = 'viewer3d';
  wrap.appendChild(canvas);
  const overlay = el('div','viewer-overlay');
  overlay.innerHTML =
    '<div class="sel-label" id="v3d_label"><div><b>Click a muscle to label it</b></div><div class="meta" id="v3d_meta">'+ALL_MUSCLES.length+' parts loaded · drag to rotate · scroll to zoom · right-click drag to pan</div></div>'+
    '<div class="ctrls">'+
      '<button id="v3d_skel">Skeleton: ON</button>'+
      '<button id="v3d_mirror">Mirror: ON</button>'+
      '<button id="v3d_labels">Auto-labels: OFF</button>'+
      '<button id="v3d_isolate">Isolate: OFF</button>'+
    '</div>';
  wrap.appendChild(overlay);

  // bottom-left pan + reset cluster (always discoverable)
  const panctl = el('div','viewer-panctl');
  panctl.innerHTML =
    '<div class="panrow"><button id="v3d_panup" title="Pan up">▲</button></div>'+
    '<div class="panrow">'+
      '<button id="v3d_panleft" title="Pan left">◄</button>'+
      '<button id="v3d_reset" title="Reset view">⟲</button>'+
      '<button id="v3d_panright" title="Pan right">►</button>'+
    '</div>'+
    '<div class="panrow"><button id="v3d_pandown" title="Pan down">▼</button></div>';
  wrap.appendChild(panctl);
  const loading = el('div','viewer-loading');
  loading.innerHTML = '<div class="spinner"></div><div id="v3d_progress">Loading 0 / '+ALL_MUSCLES.length+'</div>';
  wrap.appendChild(loading);
  host.appendChild(wrap);

  // Quiz bar
  const qbar = el('div','viewer-quiz-bar');
  qbar.innerHTML = '<div class="qprompt" id="v3d_qprompt">Quiz: pick a mode →</div>'+
    '<div class="qctl"><button class="btn small" id="v3d_qfind">🎯 Find the muscle</button><button class="btn small" id="v3d_qid">🔍 ID this muscle</button><button class="btn small ghost" id="v3d_qoff">Off</button></div>';
  host.appendChild(qbar);

  // --- Three.js setup ---
  const W = canvas.clientWidth || 800, H = 540;
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W, H, false);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e22);

  const camera = new THREE.PerspectiveCamera(45, W/H, 1, 8000);
  camera.position.set(0, 0, 2000);

  // Root container: rotate body so BodyParts3D's +Z (head) becomes Three.js +Y (up).
  // Lets us keep camera.up = (0,1,0) so OrbitControls behaves naturally.
  const root = new THREE.Group();
  root.rotation.x = -Math.PI / 2;
  scene.add(root);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir1 = new THREE.DirectionalLight(0xffffff, 0.85); dir1.position.set(500, 800, 800); scene.add(dir1);
  const dir2 = new THREE.DirectionalLight(0x88aaff, 0.35); dir2.position.set(-500, 300, -400); scene.add(dir2);

  // OrbitControls — quicker zoom, looser damping
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.rotateSpeed = 1.0; controls.panSpeed = 0.9; controls.zoomSpeed = 1.6;
  controls.minDistance = 80;
  controls.maxDistance = 6000;

  // Color palette per muscle group (data.js groups via DATA.limb / DATA.axial)
  const D = window.DATA || {};
  function groupOf(name){
    // search axial+limb muscle data, fall back to "Other"
    const m = (D.axial?.muscles||[]).concat(D.limb?.muscles||[]).find(x => x.name.toLowerCase().includes(name) || name.includes(x.name.toLowerCase().split(' ')[0]));
    return m ? m.group : 'Other';
  }
  const groupColor = {
    'Head':0xff8a8a, 'Neck/Back':0xffc566, 'Anterior Torso':0xf9806e,
    'Shoulder/Arm':0xffcd6e, 'Forearm':0xffdb91, 'Hip/Glute':0xb990ff,
    'Hamstrings':0xb47cff, 'Anterior Thigh':0xffa6a6, 'Medial Thigh':0xffb7d7,
    'Lateral Thigh':0xffd391, 'Posterior Leg':0xffc275, 'Anterior Leg':0xffe19e,
    'Lateral Leg':0xffba70, 'Other':0xb4c5ff,
  };
  const boneColor = 0xefe6d4;

  // muscle map: name -> Group of meshes
  const parts = new Map();   // name -> {group:THREE.Group, isBone:bool, group:string}
  const loader = new OBJLoader();

  let loaded = 0;
  let boundsBox = new THREE.Box3();

  function colorFor(name, isBone){
    if (isBone) return boneColor;
    const g = groupOf(name);
    return groupColor[g] || groupColor.Other;
  }

  function makeMaterial(color){
    return new THREE.MeshPhongMaterial({
      color: color,
      specular: 0x222244,
      shininess: 16,
      flatShading: false,
      transparent: true,
      opacity: 1.0,
    });
  }

  function fitCameraToBox(box){
    // box is in world space (after the root rotation), so Y is up here.
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fitDist = maxDim / (2 * Math.tan(Math.PI * camera.fov / 360)) * 1.25;
    camera.position.set(center.x, center.y, center.z + fitDist);
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();
  }

  // Load all parts in parallel (browser auto-throttles to ~6 connections)
  const names = ALL_MUSCLES.slice();
  const prog = document.getElementById('v3d_progress');
  const results = await Promise.all(names.map(async (name) => {
    const entry = manifest[name];
    try {
      const obj = await loadOBJ('./models/'+entry.file);
      loaded++;
      if (prog) prog.textContent = 'Loading '+loaded+' / '+names.length+' parts';
      return { name, obj };
    } catch(e){
      console.warn('Failed to load', name, e);
      loaded++;
      if (prog) prog.textContent = 'Loading '+loaded+' / '+names.length+' parts';
      return null;
    }
  }));

  for (const r of results){
    if (!r) continue;
    const { name, obj } = r;
    const isBone = BONES.has(name);
    const color = colorFor(name, isBone);
    const mat = makeMaterial(color);
    const grp = new THREE.Group();
    grp.name = name;
    obj.traverse(o => {
      if (o.isMesh){
        o.material = mat;
        o.userData = { partName: name, isBone };
        grp.add(o);
      }
    });
    root.add(grp);
    const mirrorGrp = grp.clone(true);
    mirrorGrp.scale.x = -1;
    mirrorGrp.name = name+'__mirror';
    mirrorGrp.userData.isMirror = true;
    root.add(mirrorGrp);
    parts.set(name, { group: grp, mirror: mirrorGrp, isBone, displayGroup: groupOf(name), color });
  }
  loading.classList.add('hidden');
  // compute bounds in world space (after root rotation), then frame
  const worldBox = new THREE.Box3().setFromObject(root);
  if (!worldBox.isEmpty()) fitCameraToBox(worldBox);

  // ---- selection ----
  let selected = null;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function setSelected(name, fromQuiz){
    // reset previous
    if (selected){
      const p = parts.get(selected);
      if (p){
        p.group.children.forEach(m => { m.material.emissive = new THREE.Color(0); m.material.opacity = 1; });
        p.mirror.children.forEach(m => { m.material.emissive = new THREE.Color(0); m.material.opacity = 1; });
      }
    }
    selected = name;
    const lbl = document.getElementById('v3d_label');
    if (!name){ lbl.innerHTML = '<div><b>Click a muscle to label it</b></div><div class="meta">'+ALL_MUSCLES.length+' parts loaded</div>'; return; }
    const p = parts.get(name);
    if (!p) return;
    // highlight
    p.group.children.forEach(m => { m.material.emissive = new THREE.Color(0x3a78ff); m.material.emissiveIntensity = 0.45; });
    p.mirror.children.forEach(m => { m.material.emissive = new THREE.Color(0x3a78ff); m.material.emissiveIntensity = 0.45; });
    // isolate?
    if (isolateOn){
      parts.forEach((q, qn) => {
        const visible = qn===name || (q.isBone && skelOn);
        q.group.children.forEach(m => m.material.opacity = visible ? 1 : 0.06);
        q.mirror.children.forEach(m => m.material.opacity = visible ? 1 : 0.06);
      });
    }
    // label
    const m = (D.axial?.muscles||[]).concat(D.limb?.muscles||[]).find(x => x.name.toLowerCase().split(' ')[0] === name.split(' ')[0]) || null;
    let infoHtml = '<div><b>'+capitalize(name)+'</b></div><div class="meta">'+(p.displayGroup||'')+(p.isBone?' (bone)':'')+'</div>';
    if (m){
      infoHtml = '<div><b>'+m.name+'</b></div>'+
        '<div class="meta">'+m.group+' · '+(m.deep?'Deep':'Superficial')+'</div>'+
        '<div class="meta" style="margin-top:4px"><b>O:</b> '+m.origin+'</div>'+
        '<div class="meta"><b>I:</b> '+m.insertion+'</div>'+
        '<div class="meta"><b>A:</b> '+m.action+'</div>';
    }
    lbl.innerHTML = infoHtml;
    // quiz check
    if (quizMode==='find' && quizTarget){
      if (matchesQuiz(name)){
        showQuizFeedback(true);
        nextQuizQuestion();
      } else if (!fromQuiz){
        showQuizFeedback(false, name);
      }
    } else if (quizMode==='id' && quizTarget){
      // user just clicked to "see"; now they confirm name via dialog buttons
      // We render answer options under the quiz bar
      buildIDChoices(name);
    }
  }
  function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

  function matchesQuiz(name){
    return name.toLowerCase() === quizTarget.toLowerCase();
  }

  canvas.addEventListener('pointerdown', () => canvas.classList.add('dragging'));
  canvas.addEventListener('pointerup', () => canvas.classList.remove('dragging'));
  canvas.addEventListener('click', (ev) => {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const meshes = [];
    parts.forEach(p => {
      p.group.children.forEach(m => meshes.push(m));
      p.mirror.children.forEach(m => meshes.push(m));
    });
    const hit = raycaster.intersectObjects(meshes, false);
    if (hit.length){
      const part = hit[0].object.userData.partName;
      setSelected(part);
    } else {
      setSelected(null);
    }
  });

  // ---- skeleton/mirror/labels/isolate toggles ----
  let skelOn = true, mirrorOn = true, labelsOn = false, isolateOn = false;
  function applySkeleton(){
    parts.forEach(p => {
      if (p.isBone){
        p.group.visible = skelOn;
        p.mirror.visible = skelOn && mirrorOn;
        p.group.children.forEach(m => { m.material.opacity = skelOn ? 0.55 : 0; });
      }
    });
    const b = document.getElementById('v3d_skel'); b.textContent = 'Skeleton: '+(skelOn?'ON':'OFF'); b.classList.toggle('active', skelOn);
  }
  function applyMirror(){
    parts.forEach(p => { p.mirror.visible = mirrorOn && (!p.isBone || skelOn); });
    const b = document.getElementById('v3d_mirror'); b.textContent = 'Mirror: '+(mirrorOn?'ON':'OFF'); b.classList.toggle('active', mirrorOn);
  }
  function applyLabels(){
    const b = document.getElementById('v3d_labels'); b.textContent = 'Auto-labels: '+(labelsOn?'ON':'OFF'); b.classList.toggle('active', labelsOn);
    redrawHTMLLabels();
  }
  function applyIsolate(){
    const b = document.getElementById('v3d_isolate'); b.textContent = 'Isolate: '+(isolateOn?'ON':'OFF'); b.classList.toggle('active', isolateOn);
    if (selected) setSelected(selected, true);  // re-apply highlight + opacities
    else {
      parts.forEach(p => {
        p.group.children.forEach(m => m.material.opacity = p.isBone ? (skelOn?0.55:0) : 1);
        p.mirror.children.forEach(m => m.material.opacity = p.isBone ? (skelOn?0.55:0) : 1);
      });
    }
  }
  // ---- HTML labels layer (must exist before applyLabels) ----
  const labelLayer = el('div'); labelLayer.style.position='absolute'; labelLayer.style.inset='0'; labelLayer.style.pointerEvents='none'; wrap.appendChild(labelLayer);

  document.getElementById('v3d_skel').onclick = () => { skelOn = !skelOn; applySkeleton(); };
  document.getElementById('v3d_mirror').onclick = () => { mirrorOn = !mirrorOn; applyMirror(); };
  document.getElementById('v3d_labels').onclick = () => { labelsOn = !labelsOn; applyLabels(); };
  document.getElementById('v3d_isolate').onclick = () => { isolateOn = !isolateOn; applyIsolate(); };
  applySkeleton(); applyMirror(); applyLabels();
  function redrawHTMLLabels(){
    labelLayer.innerHTML = '';
    if (!labelsOn) return;
    const v = new THREE.Vector3();
    // pick a handful of muscles to label (don't clutter)
    const showSet = new Set([
      'deltoid','biceps brachii','triceps brachii','brachioradialis','pectoralis major','trapezius',
      'latissimus dorsi','rectus femoris','vastus lateralis','vastus medialis','biceps femoris',
      'gastrocnemius','tibialis anterior','sartorius','gluteus maximus','gluteus medius',
      'sternocleidomastoid','rectus abdominis','external oblique','serratus anterior'
    ]);
    parts.forEach((p, name) => {
      if (!showSet.has(name)) return;
      if (p.isBone) return;
      const b = new THREE.Box3().setFromObject(p.group);
      b.getCenter(v);
      v.project(camera);
      if (v.z >= 1) return;
      const x = (v.x*0.5+0.5) * canvas.clientWidth;
      const y = (-v.y*0.5+0.5) * canvas.clientHeight;
      const lab = el('div', null, name);
      Object.assign(lab.style, { position:'absolute', left:x+'px', top:y+'px', transform:'translate(-50%,-50%)', background:'rgba(15,18,38,.8)', border:'1px solid #33407a', color:'#eef1ff', padding:'2px 7px', fontSize:'10.5px', fontWeight:'700', borderRadius:'5px', pointerEvents:'none', whiteSpace:'nowrap' });
      labelLayer.appendChild(lab);
    });
  }

  // ---- quiz ----
  let quizMode = null, quizTarget = null, quizScore = 0, quizQNo = 0;
  function pickQuizTarget(){
    const muscleOnly = [...parts.keys()].filter(n => !parts.get(n).isBone);
    return muscleOnly[Math.floor(Math.random()*muscleOnly.length)];
  }
  function setQuizMode(mode){
    quizMode = mode;
    if (!mode){
      document.getElementById('v3d_qprompt').textContent = 'Quiz off — explore freely.';
      quizTarget = null; quizScore=0; quizQNo=0;
      document.getElementById('v3d_qfind').classList.add('ghost');
      document.getElementById('v3d_qid').classList.add('ghost');
      return;
    }
    document.getElementById('v3d_qfind').classList.toggle('ghost', mode!=='find');
    document.getElementById('v3d_qid').classList.toggle('ghost', mode!=='id');
    nextQuizQuestion();
  }
  function nextQuizQuestion(){
    quizQNo++;
    quizTarget = pickQuizTarget();
    if (quizMode==='find'){
      document.getElementById('v3d_qprompt').innerHTML = 'Q'+quizQNo+' · Score '+quizScore+' — Find: <b>'+capitalize(quizTarget)+'</b>';
    } else if (quizMode==='id'){
      // For ID quiz: highlight a random muscle, ask user to pick the name from options
      setSelected(quizTarget, true);
      buildIDChoices(null);
    }
  }
  function showQuizFeedback(correct, wrongName){
    if (correct){ quizScore++; document.getElementById('v3d_qprompt').innerHTML = '✅ <b>'+capitalize(quizTarget)+'</b> — score '+quizScore+'. Next…'; }
    else { document.getElementById('v3d_qprompt').innerHTML = '❌ that was <b>'+capitalize(wrongName||'?')+'</b>. Target was <b>'+capitalize(quizTarget)+'</b>.'; quizScore=0; setTimeout(nextQuizQuestion, 1400); }
  }
  function buildIDChoices(_unused){
    // Remove old buttons
    const oldChoices = document.getElementById('v3d_idchoices'); if (oldChoices) oldChoices.remove();
    const muscleOnly = [...parts.keys()].filter(n => !parts.get(n).isBone && n !== quizTarget);
    shuffle(muscleOnly);
    const opts = shuffle([quizTarget, ...muscleOnly.slice(0,3)]);
    const row = el('div','controls'); row.id='v3d_idchoices'; row.style.padding='0 11px 11px';
    opts.forEach(o => {
      const b = el('button','btn small', capitalize(o));
      b.onclick = () => {
        if (o===quizTarget){ b.classList.add('correct'); quizScore++; document.getElementById('v3d_qprompt').textContent='✅ correct! score '+quizScore; setTimeout(nextQuizQuestion, 700); }
        else { b.style.borderColor='var(--bad)'; quizScore=0; setTimeout(() => b.style.borderColor='', 600); }
      };
      row.appendChild(b);
    });
    host.appendChild(row);
  }
  document.getElementById('v3d_qfind').onclick = () => setQuizMode('find');
  document.getElementById('v3d_qid').onclick = () => setQuizMode('id');
  document.getElementById('v3d_qoff').onclick = () => setQuizMode(null);
  document.getElementById('v3d_qfind').classList.add('ghost');
  document.getElementById('v3d_qid').classList.add('ghost');

  // ---- pan + reset buttons ----
  function panBy(screenDX, screenDY){
    // Pan amount scales with distance from target so it stays feeling consistent at any zoom.
    const dist = camera.position.distanceTo(controls.target);
    const amount = dist * 0.18; // ~18% of view distance per click
    const right = new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
    const up    = new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
    const delta = right.multiplyScalar(screenDX * amount).add(up.multiplyScalar(screenDY * amount));
    camera.position.add(delta);
    controls.target.add(delta);
    controls.update();
  }
  document.getElementById('v3d_panup').onclick    = () => panBy(0, +1);
  document.getElementById('v3d_pandown').onclick  = () => panBy(0, -1);
  document.getElementById('v3d_panleft').onclick  = () => panBy(-1, 0);
  document.getElementById('v3d_panright').onclick = () => panBy(+1, 0);
  document.getElementById('v3d_reset').onclick    = () => {
    const wb = new THREE.Box3().setFromObject(root);
    if (!wb.isEmpty()) fitCameraToBox(wb);
  };

  // arrow-key panning while focused
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => {
    if (e.key==='ArrowUp')    { panBy(0, +1); e.preventDefault(); }
    else if (e.key==='ArrowDown')  { panBy(0, -1); e.preventDefault(); }
    else if (e.key==='ArrowLeft')  { panBy(-1, 0); e.preventDefault(); }
    else if (e.key==='ArrowRight') { panBy(+1, 0); e.preventDefault(); }
  });

  // ---- animation loop ----
  function loop(){
    requestAnimationFrame(loop);
    controls.update();
    renderer.render(scene, camera);
    if (labelsOn) redrawHTMLLabels();
  }
  loop();

  // ---- resize ----
  function resize(){
    const w = canvas.clientWidth || 800;
    const h = 540;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();
}

function loadOBJ(url){
  return new Promise((res, rej) => {
    new OBJLoader().load(url, res, undefined, rej);
  });
}

/* ============================================================
 *  2D BODY MAP (anterior + posterior)
 * ============================================================ */
export function mountBodyMap(host){
  host.innerHTML = '';
  // Toggle anterior/posterior
  const head = el('div','vizhead');
  head.innerHTML = '<span class="pill" id="bm_status">Click a muscle to identify it</span>'+
    '<div class="viewtoggle"><button class="active" data-v="ant">Anterior</button><button data-v="post">Posterior</button></div>';
  host.appendChild(head);
  const wrap = el('div','bodymap-wrap');
  wrap.innerHTML = '<svg id="bm_svg" viewBox="0 0 220 480" class="bodymap"></svg>';
  host.appendChild(wrap);
  // Quiz controls
  const qbar = el('div','controls');
  qbar.innerHTML = '<button class="btn small" id="bm_qfind">🎯 Find the muscle</button>'+
    '<button class="btn small" id="bm_qid">🔍 ID this muscle</button>'+
    '<span class="pill" id="bm_score" style="margin-left:auto">Score: 0</span>';
  host.appendChild(qbar);
  const choiceRow = el('div','controls'); choiceRow.id='bm_choices'; host.appendChild(choiceRow);

  let view = 'ant';
  let quizMode = null, quizTarget = null, score = 0;

  // Regions (rough approximate polygons; not anatomically perfect — enough for memorization)
  const REGIONS = {
    ant: [
      {name:'frontalis', pts:'105,40 95,55 115,55', cx:105, cy:48},
      {name:'orbicularis oculi', pts:'95,57 88,62 95,68 102,62', cx:95, cy:62},
      {name:'masseter', pts:'85,68 80,80 92,82 92,72', cx:86, cy:75},
      {name:'orbicularis oris', pts:'100,75 110,75 110,82 100,82', cx:105, cy:78},
      {name:'sternocleidomastoid', pts:'90,90 100,90 105,108 95,108', cx:97, cy:99},
      {name:'trapezius', pts:'112,90 130,92 132,108 115,105', cx:122, cy:98},
      {name:'deltoid', pts:'75,108 90,108 92,140 70,140', cx:81, cy:124},
      {name:'pectoralis major', pts:'92,108 110,108 110,140 92,140', cx:101, cy:124},
      {name:'biceps brachii', pts:'72,142 88,142 88,175 72,175', cx:80, cy:158},
      {name:'brachialis', pts:'74,176 86,176 86,190 74,190', cx:80, cy:183},
      {name:'brachioradialis', pts:'72,195 86,195 86,220 72,220', cx:79, cy:208},
      {name:'flexor carpi radialis', pts:'74,222 86,222 86,240 74,240', cx:80, cy:231},
      {name:'rectus abdominis', pts:'94,150 108,150 108,205 94,205', cx:101, cy:178},
      {name:'external abdominal oblique', pts:'82,160 92,160 92,205 80,205', cx:86, cy:182},
      {name:'serratus anterior', pts:'82,138 92,138 92,158 80,158', cx:86, cy:148},
      {name:'sartorius', pts:'92,232 108,232 108,290 92,290', cx:100, cy:260},
      {name:'rectus femoris', pts:'90,240 105,240 105,295 90,295', cx:97, cy:267},
      {name:'vastus lateralis', pts:'74,240 90,240 90,295 74,295', cx:82, cy:267},
      {name:'vastus medialis', pts:'105,250 120,250 120,295 105,295', cx:112, cy:272},
      {name:'tibialis anterior', pts:'88,310 102,310 102,360 88,360', cx:95, cy:335},
      {name:'fibularis longus', pts:'74,310 88,310 88,355 74,355', cx:81, cy:333},
      {name:'extensor digitorum longus', pts:'102,310 116,310 116,355 102,355', cx:109, cy:333},
      {name:'gastrocnemius', pts:'70,322 76,322 76,360 70,360', cx:73, cy:341},
    ],
    post: [
      {name:'occipitalis', pts:'105,48 95,58 115,58', cx:105, cy:53},
      {name:'trapezius', pts:'88,90 132,90 138,150 82,150', cx:110, cy:118},
      {name:'deltoid', pts:'73,108 90,108 92,140 70,140', cx:81, cy:124},
      {name:'infraspinatus', pts:'92,110 110,110 110,135 92,135', cx:101, cy:122},
      {name:'teres major', pts:'94,135 110,135 110,148 94,148', cx:102, cy:141},
      {name:'latissimus dorsi', pts:'82,148 138,148 138,200 82,200', cx:110, cy:174},
      {name:'rhomboid major', pts:'108,110 130,110 130,140 108,140', cx:118, cy:124},
      {name:'erector spinae', pts:'102,150 118,150 118,210 102,210', cx:110, cy:180},
      {name:'triceps brachii', pts:'72,140 88,140 88,178 72,178', cx:80, cy:159},
      {name:'extensor carpi radialis longus', pts:'72,195 86,195 86,222 72,222', cx:79, cy:208},
      {name:'extensor digitorum', pts:'74,225 86,225 86,242 74,242', cx:80, cy:233},
      {name:'gluteus maximus', pts:'82,210 138,210 138,250 82,250', cx:110, cy:230},
      {name:'gluteus medius', pts:'78,205 92,205 92,224 78,224', cx:85, cy:215},
      {name:'biceps femoris', pts:'82,255 100,255 100,310 82,310', cx:91, cy:282},
      {name:'semitendinosus', pts:'100,255 118,255 118,310 100,310', cx:109, cy:282},
      {name:'semimembranosus', pts:'118,255 138,255 138,310 118,310', cx:128, cy:282},
      {name:'gastrocnemius', pts:'82,320 138,320 138,365 82,365', cx:110, cy:343},
      {name:'soleus', pts:'88,365 132,365 132,390 88,390', cx:110, cy:378},
    ],
  };

  function silhouette(view){
    // Common body silhouette path
    return '<path class="body-silhouette" d="M100,18 C112,18 118,28 118,42 C118,52 114,60 110,66 L114,74 L130,80 L138,90 L138,110 L132,160 L132,210 L138,220 L138,260 L130,310 L130,360 L128,400 L126,440 L122,460 L114,464 L108,440 L104,400 L102,360 L100,320 L98,320 L96,360 L94,400 L92,440 L86,464 L78,460 L74,440 L72,400 L70,360 L70,310 L62,260 L62,220 L68,210 L68,160 L62,110 L62,90 L70,80 L86,74 L90,66 C86,60 82,52 82,42 C82,28 88,18 100,18 Z"/>';
  }

  function build(){
    const svg = host.querySelector('#bm_svg');
    svg.innerHTML = silhouette(view);
    const regions = REGIONS[view];
    regions.forEach(r => {
      const p = document.createElementNS('http://www.w3.org/2000/svg','polygon');
      p.setAttribute('points', r.pts);
      p.setAttribute('class','mregion');
      p.dataset.name = r.name;
      p.onclick = () => clickRegion(r.name, p);
      svg.appendChild(p);
      // also mirror left/right by reflecting around x=110
      const mPts = r.pts.split(' ').map(pt => {
        const [x,y] = pt.split(','); return (220 - parseFloat(x))+','+y;
      }).join(' ');
      const p2 = document.createElementNS('http://www.w3.org/2000/svg','polygon');
      p2.setAttribute('points', mPts);
      p2.setAttribute('class','mregion');
      p2.dataset.name = r.name;
      p2.onclick = () => clickRegion(r.name, p2);
      svg.appendChild(p2);
    });
  }
  function clickRegion(name, polygon){
    document.querySelectorAll('#bm_svg .mregion').forEach(p => p.classList.remove('selected'));
    document.querySelectorAll('#bm_svg .mregion[data-name="'+name+'"]').forEach(p => p.classList.add('selected'));
    document.getElementById('bm_status').textContent = name;
    if (quizMode==='find'){
      if (name===quizTarget){
        polygon.classList.add('correct'); score++;
        document.getElementById('bm_score').textContent='Score: '+score;
        setTimeout(() => { polygon.classList.remove('correct'); nextQuiz(); }, 700);
      } else {
        polygon.classList.add('wrong'); score=0;
        document.getElementById('bm_score').textContent='Score: 0';
        setTimeout(() => polygon.classList.remove('wrong'), 600);
      }
    } else if (quizMode==='id'){
      buildIDChoices(name);
    }
  }
  function nextQuiz(){
    const regions = REGIONS[view];
    quizTarget = regions[Math.floor(Math.random()*regions.length)].name;
    if (quizMode==='find') document.getElementById('bm_status').innerHTML = 'Find: <b>'+quizTarget+'</b>';
    else if (quizMode==='id'){
      document.getElementById('bm_status').innerHTML = 'Click any muscle to ID it.';
    }
    choiceRow.innerHTML = '';
  }
  function buildIDChoices(clickedName){
    const regions = REGIONS[view].map(r => r.name);
    const others = regions.filter(n => n !== clickedName);
    shuffle(others);
    const opts = shuffle([clickedName, ...others.slice(0,3)]);
    choiceRow.innerHTML = '<div class="qlabel" style="width:100%">What muscle did you click?</div>';
    opts.forEach(o => {
      const b = el('button','btn small', o);
      b.onclick = () => {
        if (o===clickedName){ b.classList.add('correct'); score++; document.getElementById('bm_score').textContent='Score: '+score; setTimeout(() => choiceRow.innerHTML='', 600); }
        else { b.style.borderColor='var(--bad)'; score=0; document.getElementById('bm_score').textContent='Score: 0'; setTimeout(() => b.style.borderColor='', 500); }
      };
      choiceRow.appendChild(b);
    });
  }

  head.querySelectorAll('.viewtoggle button').forEach(b => b.onclick = () => {
    head.querySelectorAll('.viewtoggle button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    view = b.dataset.v;
    quizMode = null; choiceRow.innerHTML=''; document.getElementById('bm_status').textContent='Click a muscle to identify it';
    build();
  });
  document.getElementById('bm_qfind').onclick = () => { quizMode='find'; nextQuiz(); };
  document.getElementById('bm_qid').onclick = () => { quizMode='id'; nextQuiz(); };
  build();
}

/* ============================================================
 *  ACTION POTENTIAL INTERACTIVE GRAPH
 * ============================================================ */
export function mountAP(host){
  host.innerHTML = '';
  const intro = el('div','reflex-caption', '<b>Action potential.</b> Hit <b>⚡ Fire AP</b> to watch the membrane potential go through its 4 phases. Tap a phase tag to read about it.');
  host.appendChild(intro);
  const wrap = el('div','apgraph-wrap');
  // viewBox stays the same, but labels live well inside the box so they don't clip
  wrap.innerHTML = '<svg id="apg" viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block"></svg>';
  host.appendChild(wrap);
  const tags = el('div');
  tags.innerHTML = '<span class="apphase-tag rest">Rest</span><span class="apphase-tag depol">Depolarization</span>'+
    '<span class="apphase-tag repol">Repolarization</span><span class="apphase-tag hyper">Hyperpolarization</span>';
  host.appendChild(tags);
  const info = el('div','apphase-info');
  info.id = 'ap_info';
  info.innerHTML = 'Click <b>Fire AP</b> to watch the membrane potential go through its 4 phases. Tap a phase tag to learn what happens.';
  host.appendChild(info);
  const ctl = el('div','controls'); ctl.style.justifyContent='center';
  ctl.innerHTML = '<button class="btn primary" id="ap_fire">⚡ Fire AP</button><button class="btn ghost" id="ap_reset">↺ Reset</button>';
  host.appendChild(ctl);

  const svg = wrap.querySelector('#apg');
  const W=600, H=280;
  function setBg(){
    let g = '';
    // axes (shifted right so labels have room)
    g += '<line x1="90" y1="20" x2="90" y2="260" stroke="#33407a" stroke-width="1"/>';
    g += '<line x1="90" y1="190" x2="580" y2="190" stroke="#33407a" stroke-width="1"/>';
    // y-axis labels (inside the svg, right-aligned to axis)
    g += '<text x="80" y="64" fill="#9aa3cf" font-size="13" text-anchor="end">+30 mV</text>';
    g += '<text x="80" y="194" fill="#9aa3cf" font-size="13" text-anchor="end">-70 mV (rest)</text>';
    g += '<text x="80" y="232" fill="#9aa3cf" font-size="13" text-anchor="end">-90 mV</text>';
    // threshold line
    g += '<line x1="90" y1="135" x2="580" y2="135" stroke="#33407a" stroke-dasharray="3 4" stroke-width="0.6"/>';
    g += '<text x="98" y="131" fill="#ffd166" font-size="11" font-weight="700">threshold -55 mV</text>';
    g += '<text x="335" y="275" fill="#9aa3cf" font-size="12" text-anchor="middle">time →</text>';
    g += '<polyline id="ap_curve" fill="none" stroke="#6ea8fe" stroke-width="2.5"/>';
    g += '<circle id="ap_dot" r="6" fill="#ffd166" stroke="#0c1024"/>';
    svg.innerHTML = g;
  }
  setBg();
  const curve = () => svg.querySelector('#ap_curve');
  const dot = () => svg.querySelector('#ap_dot');

  function vToY(v){
    // map -90..+30 mV -> 230..60 px
    return 60 + (30 - v) / 120 * 170;
  }
  function tToX(t){
    return 90 + t * 490 / 100;
  }

  let firing = false;
  function fire(){
    if (firing) return;
    firing = true;
    setBg();
    let t = 0;
    let pts = [];
    let phase = 'rest';
    function step(){
      // model AP profile by piecewise time
      let v;
      if (t < 12){ v = -70; phase='rest'; }
      else if (t < 22){ // depolarization
        v = -70 + (t-12)/10 * 100; // -70 → +30
        phase='depol';
      } else if (t < 40){ // repolarization
        v = 30 - (t-22)/18 * 110; // +30 → -80
        phase='repol';
      } else if (t < 65){ // hyperpolarization
        v = -80 + (t-40)/25 * 10;  // -80 → -70
        phase='hyper';
      } else { v=-70; phase='rest'; }
      pts.push(tToX(t)+','+vToY(v));
      curve().setAttribute('points', pts.join(' '));
      dot().setAttribute('cx', tToX(t)); dot().setAttribute('cy', vToY(v));
      updatePhaseTags(phase);
      updateInfo(phase, v);
      t += 0.8;
      if (t < 100) requestAnimationFrame(step);
      else { firing = false; }
    }
    step();
  }
  function updatePhaseTags(phase){
    document.querySelectorAll('.apphase-tag').forEach(t => t.style.opacity = '0.45');
    if (phase==='rest') document.querySelector('.apphase-tag.rest').style.opacity = '1';
    else if (phase==='depol') document.querySelector('.apphase-tag.depol').style.opacity = '1';
    else if (phase==='repol') document.querySelector('.apphase-tag.repol').style.opacity = '1';
    else if (phase==='hyper') document.querySelector('.apphase-tag.hyper').style.opacity = '1';
  }
  function updateInfo(phase, v){
    const PHASE_INFO = {
      rest:    '<b>Resting</b> (~-70 mV) — K+ leak channels open. Voltage-gated Na+/K+ closed. Na+/K+ pump maintains gradient.',
      depol:   '<b>Depolarization</b> — stimulus reached threshold (-55 mV) → voltage-gated Na+ channels open → Na+ rushes IN → voltage shoots up toward +30 mV.',
      repol:   '<b>Repolarization</b> — Na+ channels inactivate. Voltage-gated K+ channels open → K+ flows OUT → voltage falls back toward -70 mV.',
      hyper:   '<b>Hyperpolarization</b> — K+ channels close slowly; voltage briefly dips below rest (-80 mV). <b>Relative refractory period</b> — needs a stronger stimulus to fire.',
    };
    document.getElementById('ap_info').innerHTML = PHASE_INFO[phase] + ' &nbsp; <span class="pill">Vm = '+v.toFixed(1)+' mV</span>';
  }
  document.getElementById('ap_fire').onclick = fire;
  document.getElementById('ap_reset').onclick = () => { setBg(); document.querySelectorAll('.apphase-tag').forEach(t => t.style.opacity='1'); document.getElementById('ap_info').innerHTML = 'Reset. Click <b>Fire AP</b> to start.'; };
  // phase tag click info
  document.querySelectorAll('.apphase-tag').forEach(t => {
    t.style.cursor='pointer';
    t.onclick = () => updateInfo(t.classList.contains('rest')?'rest':t.classList.contains('depol')?'depol':t.classList.contains('repol')?'repol':'hyper', t.classList.contains('rest')?-70:t.classList.contains('depol')?20:t.classList.contains('repol')?-20:-80);
  });
}

/* ============================================================
 *  REFLEX ARC ANIMATION (rebuilt for clarity + responsive SVG)
 * ============================================================ */
export function mountReflex(host){
  host.innerHTML = '';

  // intro banner + caption (top)
  const intro = el('div','reflex-intro');
  intro.innerHTML = '<div class="reflex-caption" id="rfx_cap"><b>Patellar (knee-jerk) reflex.</b> Click <b>▶ Play full arc</b> below, or tap a step to see just that phase.</div>';
  host.appendChild(intro);

  // SVG container — responsive via viewBox + preserveAspectRatio
  const wrap = el('div','reflex-wrap');
  // Big viewBox so labels never clip
  wrap.innerHTML = `
    <svg id="reflexsvg" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block">
      <!-- ===== layer 1: bodies (drawn first, behind everything) ===== -->
      <!-- thigh -->
      <g id="rfx_leg">
        <rect x="40" y="180" width="380" height="56" fill="#4a4f7a" rx="14" stroke="#33407a"/>
        <!-- patellar tendon -->
        <rect x="200" y="238" width="28" height="22" fill="#c98bdb" rx="3"/>
        <!-- leg (moved down so motor label has clear space above) -->
        <g id="rfx_leg_lower">
          <rect x="40" y="370" width="380" height="42" fill="#4a4f7a" rx="14" stroke="#33407a"/>
        </g>
      </g>
      <!-- cord (right) -->
      <g id="rfx_cord" transform="translate(540 160)">
        <ellipse cx="80" cy="80" rx="78" ry="78" fill="#252b58" stroke="#33407a" stroke-width="2"/>
        <!-- butterfly gray matter -->
        <path d="M 28 80 Q 44 50 70 50 Q 80 50 80 64 Q 80 50 90 50 Q 116 50 132 80 Q 116 110 90 110 Q 80 110 80 96 Q 80 110 70 110 Q 44 110 28 80 Z" fill="#3e477c"/>
        <!-- internal horn labels INSIDE the gray matter -->
        <text x="48" y="64" font-size="9" fill="#ffd166" font-weight="700">dorsal</text>
        <text x="112" y="100" font-size="9" fill="#ff7eb6" font-weight="700" text-anchor="end">ventral</text>
        <!-- dorsal root ganglion -->
        <circle id="rfx_drg" cx="-20" cy="50" r="13" fill="#5aa9ff" stroke="#0a0e22" stroke-width="1.5"/>
      </g>

      <!-- ===== layer 2: pathways ===== -->
      <path id="rfx_aff" d="M 230 200 C 340 130, 470 130, 530 195" fill="none" stroke="#5aa9ff" stroke-width="3" stroke-dasharray="6 5"/>
      <path id="rfx_eff" d="M 540 280 C 470 320, 360 290, 230 225" fill="none" stroke="#ff7eb6" stroke-width="3" stroke-dasharray="6 5"/>

      <!-- ===== layer 3: pulse circle (animated) ===== -->
      <circle id="rfx_pulse" r="7" fill="#ffd166" opacity="0"/>

      <!-- ===== layer 4: hammer (drawn after muscle so it overlaps nicely) ===== -->
      <g id="rfx_hammer" transform="translate(214 230)">
        <rect x="-4" y="-32" width="8" height="22" fill="#ffd166"/>
        <circle cx="0" cy="-36" r="10" fill="#ffd166" stroke="#0a0e22"/>
      </g>

      <!-- ===== layer 5: ALL text labels last so nothing overlaps them ===== -->
      <!-- muscle/leg labels -->
      <text x="120" y="214" text-anchor="middle" font-size="14" fill="#eef1ff" font-weight="700">Quadriceps</text>
      <text x="120" y="230" text-anchor="middle" font-size="10" fill="#bdc3ee">(effector + spindle)</text>
      <text x="214" y="282" text-anchor="middle" font-size="11" fill="#cfd5ff" font-weight="700">patellar tendon</text>
      <text x="214" y="296" text-anchor="middle" font-size="9" fill="#9aa3cf">(tap here)</text>
      <text x="230" y="396" text-anchor="middle" font-size="14" fill="#eef1ff" font-weight="700">Leg (extends → knee jerk)</text>
      <!-- pathway labels (with subtle background rect) -->
      <g>
        <rect x="320" y="124" width="170" height="34" fill="#0a0e22" opacity="0.7" rx="4"/>
        <text x="405" y="142" text-anchor="middle" font-size="13" fill="#5aa9ff" font-weight="700">①②③ sensory in</text>
        <text x="405" y="155" text-anchor="middle" font-size="10" fill="#9aa3cf">(via dorsal root)</text>
      </g>
      <g>
        <rect x="290" y="316" width="150" height="34" fill="#0a0e22" opacity="0.7" rx="4"/>
        <text x="365" y="334" text-anchor="middle" font-size="13" fill="#ff7eb6" font-weight="700">④⑤ motor out</text>
        <text x="365" y="347" text-anchor="middle" font-size="10" fill="#9aa3cf">(via ventral root)</text>
      </g>
      <!-- cord/DRG labels -->
      <text x="620" y="124" text-anchor="middle" font-size="13" fill="#cfd5ff" font-weight="700">Spinal cord</text>
      <text x="510" y="195" text-anchor="middle" font-size="10" fill="#cfd5ff" font-weight="700">DRG</text>
    </svg>
  `;
  host.appendChild(wrap);

  // Step list (numbered, clickable)
  const stepsTitle = el('p','hint','Tap a step to play it, or use <b>Play full arc</b> below.');
  host.appendChild(stepsTitle);
  const STEPS = (window.DATA.spinal.sequences || []).find(s => s.id==='reflex-arc')?.steps || [];
  const stepList = el('div','reflex-steplist');
  STEPS.forEach((s, i) => {
    const r = el('div','reflex-step');
    r.dataset.i = i;
    r.innerHTML = '<span class="stepnum">'+(i+1)+'</span><span class="steptext">'+(s.replace(/\[\[(.+?)\]\]/g,'<b>$1</b>'))+'</span>';
    r.onclick = () => playStep(i);
    stepList.appendChild(r);
  });
  host.appendChild(stepList);

  const ctl = el('div','controls'); ctl.style.justifyContent='center';
  ctl.innerHTML = '<button class="btn primary" id="rfx_play">▶ Play full arc</button><button class="btn ghost" id="rfx_reset">↺ Reset</button>';
  host.appendChild(ctl);

  const PHASE_LABELS = [
    '① Hammer taps the patellar tendon — quadriceps spindle stretches.',
    '② Sensory neuron fires AP toward the spinal cord via the dorsal root.',
    '③ Sensory axon synapses directly on a motor neuron in the ventral horn (monosynaptic).',
    '④ Motor neuron fires AP back to the quadriceps via the ventral root.',
    '⑤ Quadriceps contracts — the leg extends (knee jerk, ipsilateral).'
  ];
  const cap = host.querySelector('#rfx_cap');
  function clearActive(){ stepList.querySelectorAll('.reflex-step').forEach(r => r.classList.remove('active')); }
  function setActive(i){ clearActive(); const r = stepList.querySelector('[data-i="'+i+'"]'); if (r) r.classList.add('active'); cap.innerHTML = '<b>Step '+(i+1)+' of 5.</b> ' + PHASE_LABELS[i]; }

  function playStep(i){
    setActive(i);
    const pulse = host.querySelector('#rfx_pulse');
    const aff = host.querySelector('#rfx_aff');
    const eff = host.querySelector('#rfx_eff');
    const hammer = host.querySelector('#rfx_hammer');
    pulse.setAttribute('opacity', '0');
    if (i===0){
      hammer.style.transition = 'transform .25s cubic-bezier(.3,.6,.2,1)';
      hammer.style.transform = 'translate(214px, 230px) rotate(-32deg)';
      setTimeout(() => { hammer.style.transform = 'translate(214px, 230px) rotate(0deg)'; }, 280);
    } else if (i===1){
      animatePath(pulse, aff, '#5aa9ff');
    } else if (i===2){
      const cord = host.querySelector('#rfx_cord');
      cord.style.transition = 'filter .25s';
      cord.style.filter = 'drop-shadow(0 0 10px #6ea8fe)';
      setTimeout(() => cord.style.filter = '', 800);
    } else if (i===3){
      animatePath(pulse, eff, '#ff7eb6');
    } else if (i===4){
      const lower = host.querySelector('#rfx_leg_lower');
      lower.style.transformOrigin = '40px 391px';
      lower.style.transition = 'transform .35s cubic-bezier(.3,.6,.2,1)';
      lower.style.transform = 'rotate(-22deg)';
      setTimeout(() => { lower.style.transform = 'rotate(0)'; }, 600);
    }
  }
  function animatePath(circle, path, color){
    const len = path.getTotalLength();
    circle.setAttribute('fill', color || '#ffd166');
    circle.setAttribute('opacity','1');
    const start = performance.now();
    function step(now){
      const t = Math.min(1, (now - start) / 900);
      const p = path.getPointAtLength(len * t);
      circle.setAttribute('cx', p.x); circle.setAttribute('cy', p.y);
      if (t < 1) requestAnimationFrame(step);
      else circle.setAttribute('opacity','0');
    }
    requestAnimationFrame(step);
  }

  let playing=false;
  host.querySelector('#rfx_play').onclick = async () => {
    if (playing) return; playing = true;
    for (let i=0;i<STEPS.length;i++){
      playStep(i);
      await new Promise(r => setTimeout(r, 1100));
    }
    playing=false;
  };
  host.querySelector('#rfx_reset').onclick = () => {
    clearActive();
    host.querySelector('#rfx_pulse').setAttribute('opacity','0');
    cap.innerHTML = '<b>Patellar (knee-jerk) reflex.</b> Click <b>▶ Play full arc</b> below, or tap a step to see just that phase.';
  };
}

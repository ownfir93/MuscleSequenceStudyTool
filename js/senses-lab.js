/* Original teaching schematics and retrieval practice for BIOL232.
 * Based on the user's four course slide decks; no source art is reproduced.
 * Source page numbers refer to PDF pages (including figure-only slides).
 * Diagram geometry is intentionally simplified and not to scale.
 */
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const line = (x1,y1,x2,y2,color='#63758a',width=3) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
const label = (x,y,text,size=16) => `<text x="${x}" y="${y}" fill="#293c51" font-size="${size}" text-anchor="middle">${esc(text)}</text>`;
function mark(letter,x,y,tx,ty){
  return `<g data-marker="${letter}" class="lab-marker"><path d="M${x} ${y} L${tx} ${ty}" fill="none" stroke="#304965" stroke-width="2" marker-end="url(#lab-pointer)"/><circle cx="${x}" cy="${y}" r="17" fill="#fff" stroke="#304965" stroke-width="2"/><text x="${x}" y="${y+6}" text-anchor="middle" fill="#183550" font-size="17" font-weight="700">${letter}</text></g>`;
}
function svg(id,title,desc,body,height=370){
  return `<svg viewBox="0 0 720 ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;max-height:none;background:#f5f8fc;border-radius:14px;font-family:system-ui,sans-serif"><title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">${esc(desc)}</desc><defs><marker id="lab-pointer" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#304965"/></marker><marker id="lab-light" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#bc8000"/></marker></defs>${body}</svg>`;
}
const q = (id,prompt,answer,distractors,explanation,source,marker) => ({id,q:prompt,a:answer,options:[answer,...distractors],explanation,source,...(marker ? {marker} : {})});
const V = pages => `BIOL232 Vision PDF, ${pages}`;
const C = pages => `BIOL232 Taste & Smell PDF, ${pages}`;
const H = pages => `BIOL232 Hearing & Equilibrium PDF, ${pages}`;
const G = pages => `BIOL232 General Senses PDF, ${pages}`;

const eyeAlt = 'Side section of an eye, front at left. A points to the curved clear outer front surface. B points to the narrow fluid space behind A and in front of the oval C. C is a transparent, biconvex body. D points inside the large chamber behind C. E points to the thin inner lining at the back wall. F points to a thickened ring at the upper edge near C. G points to the fine fibers linking that ring to C. Gold lines show incoming light reaching the back wall.';
const eyeDiagram = svg('eye','Eye anatomy and focusing',eyeAlt,`
  <ellipse cx="407" cy="189" rx="219" ry="151" fill="#f5dfda" stroke="#71525a" stroke-width="5"/>
  <ellipse cx="407" cy="189" rx="207" ry="139" fill="#d2e7ef" stroke="#b56b76" stroke-width="5"/>
  <path d="M231 79 Q114 190 231 299 Q193 191 231 79" fill="#b8dff3" stroke="#4d8bae" stroke-width="4"/>
  <path d="M241 91 L241 159 M241 219 L241 287" stroke="#797157" stroke-width="11"/>
  <ellipse cx="274" cy="189" rx="30" ry="88" fill="#e8f7fc" stroke="#4383a8" stroke-width="4"/>
  <path d="M250 69 L265 97 L281 85 L265 64 M250 308 L265 281 L281 294 L265 315" fill="#b36a8b" stroke="#815271" stroke-width="3"/>
  ${line(261,92,268,105,'#7b6c98',2)}${line(279,92,284,107,'#7b6c98',2)}${line(260,290,268,272,'#7b6c98',2)}
  <path d="M54 147 L170 147 L274 164 L608 189 M54 189 L608 189 M54 231 L170 231 L274 214 L608 189" fill="none" stroke="#bc8000" stroke-width="2.5" marker-end="url(#lab-light)"/>
  <path d="M615 222 L678 246" stroke="#d9aa67" stroke-width="22"/>
  ${label(79,121,'Light',15)}${label(398,350,'Front → back of eye',15)}
  ${mark('A',104,285,182,235)}${mark('B',193,331,229,233)}${mark('C',330,291,290,244)}${mark('D',426,88,426,149)}${mark('E',667,126,599,137)}${mark('F',207,36,256,78)}${mark('G',342,44,280,96)}
`);

const retinaAlt = 'Retinal layers are arranged from the eye interior on the left to the pigmented back wall on the right. A is a long, cylindrical outer segment; B is a tapered outer segment. C is a connecting cell between these receptors and D. D has an axon joining fibers that exit toward the optic nerve. Gold arrows run left to right for light; blue arrows run right to left for the main neural signal. The lower insets compare several receptors converging onto one output with separate, lower-convergence channels.';
const retinaDiagram = svg('retina','Retinal layers and convergence',retinaAlt,`
  <rect x="92" y="64" width="496" height="179" rx="16" fill="#e0edf4"/>
  <rect x="557" y="64" width="30" height="179" rx="7" fill="#866558"/>
  ${label(114,29,'Eye interior',15)}${label(563,29,'Back wall',15)}
  <path d="M88 47 L556 47" stroke="#bc8000" stroke-width="3" marker-end="url(#lab-light)"/>
  ${label(339,37,'Light',14)}
  <path d="M539 263 L137 263" stroke="#304965" stroke-width="3" marker-end="url(#lab-pointer)"/>
  ${label(344,285,'Main neural signal',14)}
  <rect x="472" y="97" width="80" height="23" rx="9" fill="#7e8bc7" stroke="#4e5c9e" stroke-width="2"/>
  <path d="M551 196 L471 175 L471 217 Z" fill="#d88b8e" stroke="#ab5967" stroke-width="2"/>
  ${line(472,108,416,108,'#6474ad',4)}${line(472,196,416,196,'#bc7381',4)}
  <ellipse cx="407" cy="108" rx="18" ry="15" fill="#8794cf"/><ellipse cx="407" cy="196" rx="18" ry="15" fill="#d595a3"/>
  <path d="M389 108 L350 108 L327 151 L350 196 L389 196" fill="none" stroke="#7186a1" stroke-width="3"/>
  ${line(309,151,258,151,'#6c8e8a',4)}<ellipse cx="299" cy="151" rx="24" ry="14" fill="#81b4a4" stroke="#447e73" stroke-width="2"/>
  ${line(258,151,203,151,'#6c8e8a',3)}<circle cx="186" cy="151" r="23" fill="#b791c3" stroke="#775787" stroke-width="2"/>
  <path d="M163 151 L127 151 L127 222 L72 222" fill="none" stroke="#775787" stroke-width="4"/>
  ${label(64,246,'To optic nerve',12)}
  ${mark('A',636,88,522,108)}${mark('B',636,211,522,196)}${mark('C',305,91,299,136)}${mark('D',169,91,181,128)}
  <rect x="91" y="305" width="235" height="125" rx="12" fill="#e8eaf6"/>
  <rect x="389" y="305" width="235" height="125" rx="12" fill="#f7e9e8"/>
  ${[130,165,200,235,270].map(x=>`<rect x="${x}" y="320" width="12" height="28" rx="5" fill="#7e8bc7"/><path d="M${x+6} 350 L207 384" stroke="#6c7dad" fill="none" stroke-width="2"/>`).join('')}
  <ellipse cx="207" cy="377" rx="10" ry="6" fill="#a288ad"/>${line(207,383,207,388,'#775787',2)}<circle cx="207" cy="399" r="11" fill="#775787"/>
  ${[435,500,565].map(x=>`<path d="M${x} 319 L${x-9} 344 L${x+9} 344 Z" fill="#c57989"/>${line(x,345,x,383,'#9d6a93',2)}<ellipse cx="${x}" cy="366" rx="10" ry="6" fill="#a288ad"/><circle cx="${x}" cy="395" r="10" fill="#775787"/>`).join('')}
  ${label(207,452,'Greater convergence',14)}${label(506,452,'Lower convergence',14)}
`,475);

const tasteAlt = 'A taste bud is drawn as an oval cluster beneath an epithelial surface. A points to the small opening at the surface. B points to fine projections extending from the cells into that opening. C points to one long receptor cell inside the cluster. D points to branching sensory nerve endings contacting the bases of these cells. Tastant molecules are above the opening; the cell cluster is below the surface.';
const tasteDiagram = svg('taste','Taste-bud structure',tasteAlt,`
  <rect x="104" y="111" width="512" height="180" rx="15" fill="#efdedf"/>
  <path d="M104 111 H333 M381 111 H616" stroke="#ba8998" stroke-width="5"/>
  ${label(171,94,'Surface',15)}${label(529,306,'Epithelium',15)}
  <path d="M333 111 C218 125 218 302 357 312 C496 302 496 125 381 111" fill="#d5e9eb" stroke="#628c95" stroke-width="3"/>
  ${[294,337,380,423].map((x,i)=>`<path d="M${x} 287 Q${x-45} 200 351 126 Q${x+44} 204 ${x} 287" fill="${i%2?'#bfacd2':'#dcadba'}" stroke="#896b9c" stroke-width="2"/><ellipse cx="${x}" cy="223" rx="9" ry="15" fill="#8c719e"/>`).join('')}
  ${[339,347,355,363,371].map(x=>`<path d="M${x} 137 Q${x+4} 111 ${x} 88" stroke="#665c87" fill="none" stroke-width="2"/>`).join('')}
  <path d="M203 337 L261 306 L293 286 M261 306 L336 286 M261 306 L380 286 M261 306 L423 286" fill="none" stroke="#b27b2a" stroke-width="4"/>
  ${[[321,54],[362,45],[393,62]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="#789c53"/>`).join('')}
  ${label(501,54,'Dissolved molecules',14)}
  ${mark('A',239,61,333,110)}${mark('B',432,79,366,103)}${mark('C',552,199,387,198)}${mark('D',511,340,390,288)}
`);

const smellAlt = 'Section through the roof of the nasal cavity. Mucus and odorant molecules lie at the bottom. A points to branching immobile hairs within the mucus. B points to an elongated cell body that connects downward to A and upward to a slender axon. Axons pass through holes in a bony band, marked C. Above it, D points to a round cluster where those axons meet branching cells in the olfactory bulb.';
const smellDiagram = svg('smell','Olfactory epithelium to bulb',smellAlt,`
  <rect x="103" y="38" width="512" height="92" rx="23" fill="#f2e1bd" stroke="#b69a60" stroke-width="2"/>
  <rect x="103" y="141" width="512" height="41" fill="#d5cec2" stroke="#9c9489" stroke-width="2"/>
  ${[229,348,466].map(x=>`<rect x="${x-12}" y="138" width="24" height="47" rx="6" fill="#f5f8fc"/>`).join('')}
  <rect x="103" y="190" width="512" height="107" fill="#e8d9e8"/>
  <rect x="103" y="298" width="512" height="33" rx="4" fill="#bbdfe2"/>
  ${[229,348,466].map(x=>`<path d="M${x} 302 L${x} 250 Q${x-22} 229 ${x} 210 Q${x+22} 229 ${x} 250 M${x} 210 L${x} 113" stroke="#9c7541" stroke-width="4" fill="#e7ca8e"/><circle cx="${x}" cy="230" r="6" fill="#7b5f59"/><circle cx="${x}" cy="99" r="22" fill="#e6c477" stroke="#a38337" stroke-width="2"/><path d="M${x} 100 L${x-10} 84 M${x} 100 L${x+12} 83 M${x} 100 L${x} 75 M${x} 77 L${x} 56 L${x+26} 56" stroke="#89714a" fill="none" stroke-width="2"/><path d="M${x} 300 Q${x-12} 312 ${x-33} 310 M${x} 300 Q${x+14} 316 ${x+33} 311 M${x} 300 L${x} 320" stroke="#7b6640" fill="none" stroke-width="2"/>`).join('')}
  ${[[167,318],[288,315],[409,322],[566,315]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="#548e7c"/>`).join('')}
  ${label(558,75,'Bulb',14)}${label(562,285,'Epithelium',14)}${label(566,350,'Mucus',14)}
  ${mark('A',190,354,221,311)}${mark('B',305,231,337,231)}${mark('C',668,159,572,159)}${mark('D',167,60,218,91)}
`,385);

const cochleaAlt = 'Simplified cross-section through one turn of the cochlea. A is the large upper fluid chamber. B is the triangular middle chamber. C is the lower fluid chamber. D points to the flexible floor of B. E points to a curved sheet over a cluster of hair cells. F points to one hair cell beneath that sheet. A separate bottom strip shows an uncoiled basilar membrane widening from its base at left toward its apex at right.';
const cochleaDiagram = svg('cochlea','Cochlear chambers and hair cells',cochleaAlt,`
  <path d="M141 150 Q139 40 345 43 Q562 45 561 164 L561 263 Q560 328 346 328 Q140 328 141 254 Z" fill="#d2e8ee" stroke="#62858e" stroke-width="5"/>
  <path d="M142 163 L387 99 L560 238 L143 238 Z" fill="#f4e4b9" stroke="#7b94a5" stroke-width="3"/>
  <path d="M144 238 L558 238" stroke="#b56683" stroke-width="6"/>
  <path d="M268 163 Q335 147 410 180 L399 192 Q334 175 275 181 Z" fill="#8ebdc1" stroke="#4e8f98" stroke-width="2"/>
  ${[312,341,370].map(x=>`<rect x="${x-9}" y="205" width="18" height="29" rx="7" fill="#d3a0b5" stroke="#945e7c" stroke-width="2"/>${[x-5,x,x+5].map((xx,i)=>line(xx,204,xx,187-i*3,'#785e90',2)).join('')}<path d="M${x} 234 L${x} 252 L440 287" stroke="#b29145" fill="none" stroke-width="2"/>`).join('')}
  ${mark('A',216,74,292,95)}${mark('B',493,144,463,191)}${mark('C',215,296,299,282)}${mark('D',610,258,477,238)}${mark('E',244,143,311,164)}${mark('F',401,307,342,222)}
  ${label(348,362,'Basilar membrane, uncoiled',15)}
  <path d="M190 399 L526 378 L526 430 L190 410 Z" fill="#c2b4df" stroke="#7e70a6" stroke-width="2"/>
  ${label(152,407,'Base',15)}${label(567,407,'Apex',15)}
`,452);

const vestibularAlt = 'Two enlarged receptor arrangements. The left has a flat patch of hair cells beneath a horizontal gelatinous layer weighted with small crystals. A points to the hair-cell patch; C points to the crystals. The right has a raised mound of hair cells with their hairs projecting into a tall gelatinous cap, without crystals. B points to the raised mound; D points to the tall cap. A curved arrow above the right represents rotation; a straight arrow above the left represents straight-line acceleration.';
const vestibularDiagram = svg('vestibular','Compare vestibular receptors',vestibularAlt,`
  <rect x="42" y="53" width="302" height="276" rx="22" fill="#e1eef0"/>
  <rect x="376" y="53" width="302" height="276" rx="22" fill="#e7e8f5"/>
  <path d="M103 78 H273" stroke="#304965" stroke-width="3" marker-end="url(#lab-pointer)"/>
  <path d="M462 92 Q523 27 584 92" stroke="#304965" stroke-width="3" fill="none" marker-end="url(#lab-pointer)"/>
  <rect x="81" y="235" width="224" height="29" rx="7" fill="#b292b8"/>
  <path d="M421 262 Q463 196 528 200 Q586 201 628 262" fill="#b292b8" stroke="#7f6b98" stroke-width="2"/>
  <rect x="81" y="146" width="224" height="47" rx="11" fill="#92bfc6" fill-opacity="0.85"/>
  <path d="M468 217 Q466 171 487 124 Q527 73 566 126 Q588 173 588 217 Z" fill="#a5b7e0" stroke="#7085b7" stroke-width="2"/>
  ${[111,151,191,231,271].map(x=>`<rect x="${x-9}" y="204" width="18" height="44" rx="8" fill="#d2a8b6" stroke="#916679" stroke-width="2"/>${line(x,204,x,167,'#775f84',2)}${line(x+5,204,x+5,172,'#775f84',2)}${line(x-5,204,x-5,179,'#775f84',2)}`).join('')}
  ${[491,527,563].map(x=>`<rect x="${x-9}" y="219" width="18" height="37" rx="8" fill="#d2a8b6" stroke="#916679" stroke-width="2"/>${line(x,219,x,157,'#775f84',2)}${line(x+5,219,x+5,168,'#775f84',2)}${line(x-5,219,x-5,179,'#775f84',2)}`).join('')}
  ${[102,133,164,195,226,257,288].map((x,i)=>`<path d="M${x} ${134+i%2*5} l8 -7 l7 9 l-8 7 Z" fill="#faf9e1" stroke="#848777" stroke-width="1.5"/>`).join('')}
  ${mark('A',118,295,162,244)}${mark('B',624,300,572,248)}${mark('C',61,108,126,138)}${mark('D',641,118,559,143)}
  ${label(193,350,'Left receptor arrangement',15)}${label(527,350,'Right receptor arrangement',15)}
`,375);

const skinAlt = 'A cutaway of skin with its surface at the top. A points to bare branching nerve endings extending into the superficial layer. B points to a flattened ending touching a cell at the base of the epidermis. C points to a small oval capsule just beneath that layer. D points to a nerve coil around a hair follicle. E points to a large, onion-layered capsule deeper in the skin. F points to an elongated capsule containing branching nerve fibers.';
const skinDiagram = svg('skin','Cutaneous receptor identification',skinAlt,`
  <rect x="67" y="70" width="586" height="57" fill="#efd9df"/>
  <path d="M67 127 Q96 111 125 127 T183 127 T241 127 T299 127 T357 127 T415 127 T473 127 T531 127 T589 127 T653 127 V326 H67 Z" fill="#f4e9d5" stroke="#c7afa0" stroke-width="2"/>
  ${label(109,59,'Surface',14)}${label(601,99,'Epidermis',14)}${label(607,312,'Dermis',14)}
  <path d="M130 234 L130 125 L102 94 M130 125 L142 96 M130 137 L163 111 M111 106 L97 112 M145 98 L158 86" fill="none" stroke="#ad843f" stroke-width="4"/>
  <path d="M224 231 L224 138 L234 127" stroke="#ad843f" stroke-width="4" fill="none"/><ellipse cx="241" cy="124" rx="14" ry="8" fill="#7bafa1" stroke="#487e72" stroke-width="2"/>
  <ellipse cx="316" cy="164" rx="19" ry="31" fill="#c3b2cd" stroke="#806b96" stroke-width="3"/>
  <path d="M316 228 L316 186 l-9 -7 l18 -9 l-18 -8 l18 -9 l-9 -8" fill="none" stroke="#ad843f" stroke-width="3"/>
  <path d="M387 229 Q373 159 408 90 L437 28" fill="none" stroke="#9e795b" stroke-width="15"/>
  <path d="M407 221 Q383 220 387 207 Q411 197 389 188 Q375 179 396 172 M407 221 L424 257" fill="none" stroke="#ad843f" stroke-width="3"/>
  ${[1,.76,.52,.26].map(s=>`<ellipse cx="232" cy="275" rx="${58*s}" ry="${34*s}" fill="${s===1?'#dbbca8':'none'}" stroke="#9c7d68" stroke-width="2"/>`).join('')}
  <path d="M103 293 L213 275 H242" stroke="#ad843f" stroke-width="4" fill="none"/>
  <ellipse cx="519" cy="235" rx="68" ry="24" fill="#d1bdab" stroke="#8a7565" stroke-width="3"/>
  <path d="M427 293 L488 238 L544 230 M488 238 L511 222 M511 235 L538 246 M521 232 L553 217" fill="none" stroke="#ad843f" stroke-width="3"/>
  ${mark('A',82,173,121,119)}${mark('B',226,55,238,119)}${mark('C',325,71,318,137)}${mark('D',461,143,394,187)}${mark('E',191,349,211,297)}${mark('F',592,177,544,220)}
`);

const classificationAlt = 'Three independent questions can be asked about the same sensory receptor: modality asks what kind of stimulus it detects; origin asks where that stimulus comes from; distribution asks how receptors for the sense are arranged in the body. The categories from different axes may apply to the same receptor.';
const classificationDiagram = svg('classification','Keep classification axes separate',classificationAlt,`
  ${[[30,'1','MODALITY','What kind of stimulus?','#e4e9f7'],[270,'2','ORIGIN','Where does it arise?','#e1f0e8'],[510,'3','DISTRIBUTION','How is it distributed?','#f3e8da']].map(([x,n,t,s,c])=>`<rect x="${x}" y="35" width="180" height="145" rx="18" fill="${c}" stroke="#a5b3c3" stroke-width="2"/><circle cx="${x+90}" cy="64" r="17" fill="#fff"/>${label(x+90,70,n,17)}${label(x+90,116,t,16)}${label(x+90,148,s,13)}`).join('')}
  ${label(360,222,'One receptor can have a classification on every axis.',16)}
`,250);

export const SENSES_LABS = {
  vision: [
    { id:'eye', title:'Eye anatomy & focusing', description:'Follow the light, identify the marked structures, then predict the near response.', source:V('pp. 2, 6, 37–39'), diagram:eyeDiagram, alternative:eyeAlt, questions:[
      q('lab-eye-a','Which structure is marked A?','Cornea',['Lens','Retina','Ciliary muscle'],'The cornea is the transparent curved surface at the front of the eye. It provides more refraction than the lens.',V('pp. 2, 37'),'A'),
      q('lab-eye-b','What fills the space marked B?','Aqueous humor',['Vitreous body','Endolymph','Perilymph'],'Aqueous humor occupies the anterior space behind the cornea and in front of the lens.',V('p. 2'),'B'),
      q('lab-eye-c','Which structure is marked C?','Lens',['Cornea','Retina','Optic nerve'],'The lens is the transparent biconvex structure that fine-tunes focus.',V('pp. 2, 37'),'C'),
      q('lab-eye-d','Which structure occupies the large space D?','Vitreous body',['Aqueous humor','Suspensory ligament','Iris'],'The vitreous body fills the large compartment behind the lens.',V('p. 2'),'D'),
      q('lab-eye-e','The focused image reaches the inner lining E. What is it?','Retina',['Sclera','Cornea','Lens'],'The retina contains the light-sensitive circuitry at the back of the eye.',V('pp. 2, 8'),'E'),
      q('lab-eye-f','What happens to the muscle at F when you focus on a nearby object?','It contracts',['It relaxes','It becomes a photoreceptor','It closes the optic nerve'],'Near accommodation contracts the ciliary muscle, reducing tension on the suspensory ligaments.',V('pp. 6, 39'),'F'),
      q('lab-eye-g','During near accommodation, what happens to the fibers G and to the lens?','Fibers slacken; lens becomes thicker',['Fibers tighten; lens becomes thinner','Fibers tighten; lens becomes thicker','Fibers slacken; lens becomes thinner'],'Relaxed suspensory ligaments allow the elastic lens to become more convex, increasing refractive power for near vision.',V('pp. 6, 39'),'G'),
      q('lab-eye-order','Which is the correct light path through the lettered structures?','A → B → C → D → E',['E → D → C → B → A','A → C → E → B → D','B → A → D → E → C'],'Light passes through the cornea, aqueous humor, lens, and vitreous body before reaching the retina.',V('p. 2'))
    ]},
    { id:'retina', title:'Retina & rod–cone comparison', description:'Use the shapes, layer positions, and convergence patterns. The two bottom circuits illustrate a principle, not every retinal connection.', source:V('pp. 8–12, 20–21, 25, 40–43'), diagram:retinaDiagram, alternative:retinaAlt, questions:[
      q('lab-retina-a','Which photoreceptor has the cylindrical outer segment A?','Rod',['Cone','Bipolar cell','Ganglion cell'],'Rods have long cylindrical outer segments and support sensitive, dim-light vision.',V('pp. 9, 11'),'A'),
      q('lab-retina-b','Which photoreceptor has the tapered outer segment B?','Cone',['Rod','Bipolar cell','Ganglion cell'],'Cones have tapered outer segments and support color vision in brighter light.',V('pp. 10–11'),'B'),
      q('lab-retina-c','Which cell type is C in this simplified main pathway?','Bipolar cell',['Ganglion cell','Pigment epithelial cell','Rod'],'Bipolar cells receive photoreceptor signals and relay them to ganglion cells.',V('pp. 8, 40'),'C'),
      q('lab-retina-d','Which cell type at D sends its axon into the optic nerve?','Ganglion cell',['Bipolar cell','Cone','Pigment epithelial cell'],'Ganglion-cell axons form the optic nerve and carry action potentials out of the retina.',V('pp. 21, 31, 40'),'D'),
      q('lab-retina-direction','How do the two arrows compare?','Light and the main neural signal travel in opposite directions',['Both travel from ganglion cells to photoreceptors','Both travel from photoreceptors toward ganglion cells','Light travels along optic-nerve axons'],'Light passes through inner retinal layers to reach photoreceptors near the back wall; signals then pass toward bipolar and ganglion cells.',V('pp. 8, 40')),
      q('lab-retina-convergence','The lower-left circuit pools several receptors into one output. Which advantage and trade-off fit rod-dominated vision?','High sensitivity with lower spatial resolution',['High color resolution with poor sensitivity','Separate output from every receptor with no pooling','Maximum detail only in bright light'],'Convergence lets weak inputs combine, increasing sensitivity but reducing the ability to identify exactly which receptor was stimulated.',V('pp. 12, 25, 41–42'),'A'),
      q('lab-retina-fovea','Which description best fits the high-acuity foveal cone pathway represented by the lower-right inset?','Bright-light color vision with little convergence',['Dim-light grayscale vision with strong convergence','A circuit with no bipolar or ganglion cells','A pathway in which every cone shares one output'],'Foveal cone circuits have little convergence and preserve fine spatial detail; this should not be generalized to every cone circuit in the retina.',V('pp. 25, 43'),'B'),
      q('lab-retina-light','When a rod absorbs light, what happens to its glutamate release?','It decreases',['It increases continuously','It becomes acetylcholine release','It remains unchanged at all light levels'],'Light reduces glutamate release from rods. Different bipolar-cell pathways respond differently to that reduction.',V('p. 20'),'A')
    ]}
  ],
  chemical: [
    { id:'taste', title:'Taste-bud labeling & transduction', description:'Identify the microscopic structures, then distinguish the two taste-transduction routes.', source:C('pp. 2–7'), diagram:tasteDiagram, alternative:tasteAlt, questions:[
      q('lab-taste-a','Which opening is marked A?','Taste pore',['Olfactory foramen','Synaptic cleft','Auditory tube'],'The taste pore is the opening through which dissolved tastants reach the receptor-cell projections.',C('p. 3'),'A'),
      q('lab-taste-b','What are the projections at B?','Taste hairs (microvilli)',['Olfactory axons','Auditory stereocilia','Myelin sheaths'],'Taste-cell microvilli extend toward the taste pore and contact dissolved tastants.',C('p. 3'),'B'),
      q('lab-taste-c','What is the elongated receptor cell marked C?','Taste cell',['Mitral cell','Retinal ganglion cell','Cochlear hair cell'],'Taste cells are receptor cells clustered with supporting and basal cells in a taste bud.',C('pp. 2–3'),'C'),
      q('lab-taste-d','Which structure at D receives neurotransmitter released by taste cells?','Sensory nerve endings',['Olfactory glomeruli','Suspensory ligaments','Otoliths'],'Taste cells release neurotransmitters to stimulate sensory dendrites at their bases.',C('pp. 3–4'),'D'),
      q('lab-taste-gpcr','Which set uses G protein-coupled receptors in the course model?','Sweet, bitter, and umami',['Salty and sour only','Sweet and salty only','All tastes use direct ion entry only'],'Sugars, bitter compounds such as alkaloids, and glutamate activate receptor and second-messenger pathways.',C('pp. 4–5')),
      q('lab-taste-ions','Which set is associated with direct ion-driven depolarization in the course model?','Salty and sour',['Sweet, bitter, and umami','Sweet and umami only','Bitter and sour only'],'The slides contrast sodium and acids with the GPCR pathways used by sweet, bitter, and umami. This is the simplified course distinction.',C('pp. 4, 6')),
      q('lab-taste-relay','Taste signals carried by cranial nerves VII, IX, and X first converge in which central relay?','Solitary nucleus in the medulla',['Olfactory bulb','Lateral geniculate nucleus','Primary visual cortex'],'The three taste nerves synapse in the solitary nucleus. A thalamic relay then supports conscious taste perception in the insula.',C('p. 7'))
    ]},
    { id:'smell', title:'Olfactory labeling & pathway', description:'Trace odorant contact from the nasal surface to the first bulb synapse. Compare the olfactory receptor neuron with the taste receptor cell.', source:C('pp. 9–14'), diagram:smellDiagram, alternative:smellAlt, questions:[
      q('lab-smell-a','Which structures are marked A within the mucus?','Olfactory hairs (immobile cilia)',['Taste pores','Myelinated axons','Otolith crystals'],'Olfactory hairs extend from the receptor neuron’s modified dendritic ending into mucus, where odorants contact receptors.',C('pp. 10, 12'),'A'),
      q('lab-smell-b','What is the elongated cell marked B?','Olfactory receptor neuron',['Taste receptor cell','Mitral cell','Supporting cell only'],'Unlike a taste receptor cell, an olfactory receptor cell is itself a neuron with an axon extending to the bulb.',C('pp. 3–4, 10, 12'),'B'),
      q('lab-smell-c','Which bony structure is marked C?','Cribriform plate',['Basilar membrane','Tympanic membrane','Otolithic membrane'],'Olfactory receptor axons pass through cribriform foramina in the cribriform plate.',C('pp. 10, 12'),'C'),
      q('lab-smell-d','Which synaptic cluster is marked D in the olfactory bulb?','Glomerulus',['Taste bud','Macula','Spiral organ'],'Olfactory receptor axons synapse with mitral and tufted cell dendrites in glomeruli.',C('pp. 10, 14'),'D'),
      q('lab-smell-signal','Which sequence best describes initial olfactory transduction?','Odorant → GPCR → cAMP pathway → ion channels open',['Odorant → photopsin → bleaching → less glutamate','Odorant → otolith movement → cupula bends','Odorant → lens contraction → action potential'],'Odorant binding activates a G protein-coupled receptor and cAMP signaling, opening channels and depolarizing the olfactory neuron.',C('pp. 10, 13')),
      q('lab-smell-output','Which cells send axons from the bulb into the olfactory tract?','Mitral and tufted cells',['Taste cells and basal cells','Rods and cones','Cochlear and vestibular hair cells'],'Mitral and tufted cells relay glomerular output through the olfactory tract to olfactory cortex and associated targets.',C('p. 14'),'D'),
      q('lab-smell-combinations','How does the system distinguish complex odors?','By patterns across receptor types and glomeruli',['Each glomerulus identifies every possible smell alone','By assigning one odor exclusively to each nostril','Only by changing the number of taste buds'],'The brain interprets combinations of receptor/glomerular activity; receptor type does not imply a one-to-one mapping between one neuron and an entire real-world odor.',C('pp. 13–14'))
    ]}
  ],
  hearing: [
    { id:'cochlea', title:'Cochlear anatomy & frequency', description:'Identify the fluid spaces and membranes in one cochlear turn. The lower strip shows the base-to-apex change in an uncoiled membrane.', source:H('pp. 4–7'), diagram:cochleaDiagram, alternative:cochleaAlt, questions:[
      q('lab-cochlea-a','Which chamber is marked A?','Scala vestibuli',['Scala media (cochlear duct)','Scala tympani','Auditory tube'],'Scala vestibuli is the upper perilymph-filled chamber in this cross-section.',H('p. 4'),'A'),
      q('lab-cochlea-b','Which chamber is marked B?','Scala media (cochlear duct)',['Scala vestibuli','Scala tympani','Middle-ear cavity'],'The cochlear duct contains endolymph and houses the spiral organ on its floor.',H('p. 4'),'B'),
      q('lab-cochlea-c','Which chamber is marked C?','Scala tympani',['Scala vestibuli','Scala media (cochlear duct)','Semicircular duct'],'Scala tympani is the perilymph-filled chamber below the basilar membrane.',H('p. 4'),'C'),
      q('lab-cochlea-d','Which vibrating floor is marked D?','Basilar membrane',['Tectorial membrane','Tympanic membrane','Otolithic membrane'],'The basilar membrane supports the spiral organ; its motion contributes to bending the hair bundles relative to the overlying structures.',H('pp. 4–5'),'D'),
      q('lab-cochlea-e','Which overlying sheet is marked E?','Tectorial membrane',['Basilar membrane','Tympanic membrane','Vestibular membrane'],'The tectorial membrane lies above the cochlear hair cells and participates in the shearing relationship that bends hair bundles.',H('p. 4'),'E'),
      q('lab-cochlea-f','What converts bundle deflection into an electrical receptor response at F?','Mechanically gated ion channels in hair cells',['Rhodopsin bleaching','Contraction of a taste pore','Otolith secretion by ganglion cells'],'Deflection of the stereocilia changes mechanically gated channel opening. Inward potassium current from endolymph helps depolarize cochlear hair cells.',H('p. 6'),'F'),
      q('lab-cochlea-base','A high-frequency tone maximally stimulates which end of the basilar membrane?','Base, near the oval window',['Apex, near the helicotrema','Every point equally','Only the round-window membrane'],'The basal region responds best to high frequencies. Low-frequency peaks occur farther toward the apex.',H('p. 7')),
      q('lab-cochlea-apex','A low-frequency tone peaks toward which end of the membrane?','Apex',['Base','External auditory canal','Tympanic membrane only'],'The broader apical region responds best to lower frequencies. Place along the membrane contributes to pitch discrimination.',H('p. 7'))
    ]},
    { id:'vestibular', title:'Balance: macula or crista?', description:'Compare two real receptor arrangements. Use the crystal-bearing sheet and the tall cap to reason about gravity, linear acceleration, and rotation.', source:H('pp. 10–16'), diagram:vestibularDiagram, alternative:vestibularAlt, questions:[
      q('lab-vestibular-a','The flat receptor patch A belongs to which structure?','Macula of the utricle or saccule',['Crista ampullaris','Spiral organ of the cochlea','Tympanic membrane'],'A macula is a patch of hair and supporting cells with bundles embedded in an otolith-weighted membrane.',H('pp. 11, 14'),'A'),
      q('lab-vestibular-b','The raised receptor mound B is which structure?','Crista ampullaris',['Macula of the utricle','Macula of the saccule','Olfactory glomerulus'],'The crista ampullaris is a mound of hair and supporting cells inside a semicircular duct’s ampulla.',H('pp. 12, 16'),'B'),
      q('lab-vestibular-c','What are the weighted particles C?','Otoliths',['Photopsins','Auditory ossicles','Glomeruli'],'Otoliths are calcium carbonate–protein granules that add weight and inertia to the otolithic membrane.',H('p. 14'),'C'),
      q('lab-vestibular-d','What is the tall gelatinous cap D?','Cupula',['Otolithic membrane','Tectorial membrane','Basilar membrane'],'The cupula contains the crista’s hair bundles. It bends when endolymph lags behind during changes in rotation.',H('p. 16'),'D'),
      q('lab-vestibular-linear','Which arrangement best detects an elevator starting upward?','Left: macula with otoliths',['Right: crista and cupula','Neither, because the head is not rotating','Both must contain cochlear hair cells'],'An elevator’s acceleration is linear. The saccular macula is nearly vertical and is especially suited to vertical acceleration.',H('pp. 10, 14–15'),'A'),
      q('lab-vestibular-rotation','Which arrangement responds when you begin turning your head?','Right: crista and cupula',['Left: macula with otoliths','Only the basilar membrane','Only the tympanic membrane'],'Angular acceleration causes endolymph to lag, bending the cupula. Semicircular ducts are especially responsive to changes in rotation, not a permanent readout of constant rotational speed.',H('pp. 10, 16'),'B'),
      q('lab-vestibular-tilt','Which arrangement can indicate a maintained head tilt relative to gravity?','Left: macula with otoliths',['Right: crista and cupula only','Only the cochlear duct','Neither receptor arrangement'],'Gravity shifts the heavy otolithic membrane and bends macular hair bundles, contributing to static equilibrium.',H('p. 15'),'A'),
      q('lab-vestibular-channel','Vestibular hair cells send information to the brain through fibers of which cranial nerve?','CN VIII',['CN I','CN II','CN VII'],'Vestibular nerve fibers, part of CN VIII, receive signals from the hair cells and project to vestibular nuclei.',H('p. 17'))
    ]}
  ],
  general: [
    { id:'skin', title:'Skin-receptor identification', description:'Match microscopic shapes and depth to receptor names, then connect structure to stimulus. Positions are schematic; receptor density varies by body region.', source:G('pp. 14–17'), diagram:skinDiagram, alternative:skinAlt, questions:[
      q('lab-skin-a','Which receptor is marked A?','Free nerve endings',['Lamellar corpuscle','Tactile corpuscle','Bulbous corpuscle'],'Free nerve endings are unencapsulated branches. Different free endings detect temperature or potentially damaging stimuli.',G('pp. 14, 17'),'A'),
      q('lab-skin-b','Which ending is marked B at the base of the epidermis?','Tactile (Merkel) disc',['Hair receptor','Lamellar corpuscle','Muscle spindle'],'Tactile discs contact tactile cells in the basal epidermis and detect light touch, texture, edges, and shape.',G('pp. 14, 17'),'B'),
      q('lab-skin-c','Which small superficial capsule is marked C?','Tactile (Meissner) corpuscle',['Lamellar (Pacinian) corpuscle','Bulbous (Ruffini) corpuscle','Free nerve endings'],'Tactile corpuscles sit in dermal papillae, especially in hairless skin, and detect light touch and texture.',G('pp. 15, 17'),'C'),
      q('lab-skin-d','Which receptor is marked D around the follicle?','Hair receptor (root hair plexus)',['Tactile disc','Lamellar corpuscle','Tendon organ'],'Dendrites coiled around a follicle respond when the hair moves.',G('pp. 14, 17'),'D'),
      q('lab-skin-e','Which onion-layered deep receptor is marked E?','Lamellar (Pacinian) corpuscle',['Tactile (Meissner) corpuscle','Tactile (Merkel) disc','Free nerve endings'],'Lamellar corpuscles have concentric layers around a nerve ending and detect deep pressure and vibration.',G('pp. 16–17'),'E'),
      q('lab-skin-f','Which elongated capsule is marked F?','Bulbous (Ruffini) corpuscle',['Lamellar (Pacinian) corpuscle','Tactile (Merkel) disc','Hair receptor'],'Bulbous corpuscles are elongated receptors associated with skin stretch, heavy touch, and deformation.',G('pp. 16–17'),'F'),
      q('lab-skin-vibration','Which marked receptor is especially associated with deep pressure and vibration?','E',['B','C','D'],'The deep, layered lamellar corpuscle is specialized for pressure changes and vibration.',G('p. 16'),'E')
    ]},
    { id:'classification', title:'Classify without mixing axes', description:'Each question names ONE classification axis. A single receptor can be a mechanoreceptor, a proprioceptor, and a general-sense receptor at the same time.', source:G('pp. 9–11'), diagram:classificationDiagram, alternative:classificationAlt, questions:[
      q('lab-class-modality-stretch','By stimulus MODALITY, a receptor activated by muscle stretch is a…','Mechanoreceptor',['Chemoreceptor','Photoreceptor','Thermoreceptor'],'Stretch physically deforms a receptor, so its modality classification is mechanoreceptor.',G('p. 9')),
      q('lab-class-origin-stretch','By stimulus ORIGIN, a muscle-spindle receptor reporting limb position is a…','Proprioceptor',['Exteroceptor','Interoceptor','Origin cannot be determined'],'Proprioceptors in muscles, tendons, and joint capsules report body position and movement.',G('p. 10')),
      q('lab-class-modality-hearing','By stimulus MODALITY, cochlear hair cells are…','Mechanoreceptors',['Chemoreceptors','Photoreceptors','Nociceptors'],'Hearing begins with physical deformation of hair bundles; the modality is mechanical.',G('p. 9')),
      q('lab-class-origin-touch','By stimulus ORIGIN, a receptor detecting a cool object touching the skin is a…','Exteroceptor',['Interoceptor','Proprioceptor','Origin cannot be determined'],'An external object produces the cutaneous stimulus, so the origin category is exteroceptor.',G('p. 10')),
      q('lab-class-origin-bladder','By stimulus ORIGIN, a bladder-wall receptor detecting filling is a…','Interoceptor',['Exteroceptor','Proprioceptor','Origin cannot be determined'],'A filling bladder produces an internal visceral stimulus.',G('p. 10')),
      q('lab-class-modality-chemistry','By stimulus MODALITY, a receptor responding to blood chemistry is a…','Chemoreceptor',['Mechanoreceptor','Photoreceptor','Thermoreceptor'],'Chemical composition is the stimulus modality. Its internal location is a separate classification axis.',G('p. 9')),
      q('lab-class-dist-touch','By DISTRIBUTION, touch receptors spread through the skin belong to…','General senses',['Special senses','Both general and special senses','Neither general nor special senses'],'General sensory receptors are widely distributed in skin and other body tissues.',G('p. 11')),
      q('lab-class-dist-balance','By DISTRIBUTION, the specialized receptors for equilibrium belong to…','Special senses',['General senses','Both general and special senses','Neither general nor special senses'],'Equilibrium is a special sense localized to specialized structures in the head. It is also mechanical by modality; that is a different axis.',G('pp. 9, 11')),
      q('lab-class-modality-injury','By stimulus MODALITY, a receptor activated by potentially tissue-damaging stimulation is a…','Nociceptor',['Photoreceptor','Chemoreceptor','Thermoreceptor'],'Nociceptors respond to actual or threatened tissue damage. Different nociceptors can respond to mechanical, thermal, or chemical threats.',G('p. 9'))
    ]}
  ]
};

let instanceCount = 0;
export function renderSensesLab(host, secId, mountQuiz){
  host.replaceChildren();
  const activities = SENSES_LABS[secId];
  if (!activities?.length) {
    const message=document.createElement('p');
    message.className='hint'; message.textContent='No sensory lab is available for this section.';
    host.appendChild(message); return;
  }
  const instance=++instanceCount;
  const control=document.createElement('label'); control.className='select-label';
  control.textContent='Choose a practice activity';
  const select=document.createElement('select'); select.className='study-select';
  select.id=`senses-activity-${instance}`; control.htmlFor=select.id;
  activities.forEach(activity=>{const option=document.createElement('option');option.value=activity.id;option.textContent=activity.title;select.appendChild(option);});
  const content=document.createElement('div');content.className='senses-lab-content';
  host.append(control,select,content);
  function show(){
    const activity=activities.find(a=>a.id===select.value) || activities[0];
    content.replaceChildren();
    const intro=document.createElement('p');intro.className='lab-description';intro.textContent=activity.description;
    const figure=document.createElement('figure');figure.className='lab-diagram';figure.style.margin='16px 0';
    figure.setAttribute('role','region');figure.setAttribute('aria-label','Study diagram');figure.tabIndex=-1;
    const zoomControls=document.createElement('div');zoomControls.className='controls diagram-controls';
    const zoomButton=document.createElement('button');zoomButton.className='btn small diagram-zoom';zoomButton.textContent='Enlarge diagram';zoomButton.setAttribute('aria-pressed','false');zoomControls.appendChild(zoomButton);
    let enlarged=false;
    function centerMarker(){
      if(!enlarged)return;
      const circle=figure.querySelector('.active-marker circle'),drawing=figure.querySelector('svg');
      if(circle && drawing)figure.scrollLeft=Math.max(0,Number(circle.getAttribute('cx'))*((drawing.clientWidth||720)/720)-(figure.clientWidth||0)/2);
    }
    // Unique SVG IDs allow multiple independently mounted labs on one page.
    figure.innerHTML=activity.diagram.replace(/id="([^"]+)"/g,(_,id)=>`id="${id}-${instance}"`).replace(/url\(#([^)]+)\)/g,(_,id)=>`url(#${id}-${instance})`).replace(/aria-labelledby="([^"]+)"/g,(_,ids)=>`aria-labelledby="${ids.split(' ').map(id=>`${id}-${instance}`).join(' ')}"`);
    const caption=document.createElement('figcaption');caption.className='hint';caption.textContent='Original schematic • not to scale. Letter pointers identify structures; the current question highlights its target.';figure.appendChild(caption);
    zoomButton.onclick=event=>{
      if(event.detail>1)return;enlarged=!enlarged;
      zoomButton.textContent=enlarged?'Fit diagram':'Enlarge diagram';zoomButton.setAttribute('aria-pressed',String(enlarged));
      figure.classList.toggle('is-enlarged',enlarged);figure.tabIndex=enlarged?0:-1;
      figure.querySelector('svg').style.minWidth=enlarged?Math.max(720,(figure.clientWidth||0)*1.4)+'px':'';
      caption.textContent=enlarged?'Enlarged view: scroll sideways to explore. Use Fit diagram to see the whole schematic.':'Original schematic • not to scale. Letter pointers identify structures; the current question highlights its target.';
      if(enlarged)centerMarker();else figure.scrollLeft=0;
    };
    const alternative=document.createElement('details');alternative.className='lab-description';
    const summary=document.createElement('summary');summary.textContent='Text description of the diagram';
    const alternativeText=document.createElement('p');alternativeText.textContent=activity.alternative;alternative.append(summary,alternativeText);
    const source=document.createElement('p');source.className='source-note';source.textContent=`Study basis: ${activity.source}. Original artwork; source slide images are not reproduced.`;
    const quiz=document.createElement('div');quiz.className='lab-quiz';
    content.append(intro,zoomControls,figure,alternative,source,quiz);
    mountQuiz(quiz,activity.questions,`lab:${secId}:${activity.id}`,question=>{
      figure.querySelectorAll('[data-marker]').forEach(marker=>{
        const active=Boolean(question?.marker && marker.dataset.marker===question.marker);
        marker.classList.toggle('active-marker',active);
        const badge=marker.querySelector('circle');
        badge?.setAttribute('fill',active?'#ffe299':'#fff');
        badge?.setAttribute('stroke-width',active?'4':'2');
      });
      centerMarker();
    });
  }
  select.addEventListener('change',show);
  show();
}

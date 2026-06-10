/* =============================================================
 *  BI231 Final Exam Study Data
 *  All wording grounded in:
 *    - Final exam study guide (BI231 Fall 2025)
 *    - Lab 6: Axial Muscles
 *    - Lab 7: Muscles of the Limbs
 *    - Lab 8: Nervous Tissue & Spinal Cord
 *  Use [[term]] to mark a term as a highlightable / quizzable token.
 * ============================================================= */

window.DATA = {

/* ============================================================
 *  1. NERVOUS TISSUE
 * ============================================================ */
nervous: {
  id: 'nervous',
  title: 'Nervous Tissue',
  emoji: '🧠',
  blurb: 'Divisions, glia, action potentials, neurotransmission.',
  learn: [
    {
      lead: 'Divisions of the nervous system',
      text: 'The nervous system splits into the [[Central Nervous System (CNS)]] — [[brain]] and [[spinal cord]] — and the [[Peripheral Nervous System (PNS)]] — everything else. The PNS divides into [[sensory (afferent)]] and [[motor (efferent)]]. Motor splits into [[somatic]] (voluntary skeletal muscle) and [[autonomic]] (involuntary). Autonomic splits into [[sympathetic]] (fight-or-flight) and [[parasympathetic]] (rest-and-digest).'
    },
    {
      lead: 'Glial cells of the PNS',
      text: '[[Schwann cells]] wrap PNS axons to form [[myelin]] (one cell per internode). [[Satellite cells]] surround neuron cell bodies in PNS [[ganglia]] for support.'
    },
    {
      lead: 'Glial cells of the CNS',
      text: '[[Oligodendrocytes]] myelinate CNS axons (one cell, many internodes). [[Astrocytes]] support neurons and form the blood-brain barrier. [[Microglia]] are CNS phagocytes. [[Ependymal cells]] line ventricles and make [[cerebrospinal fluid]].'
    },
    {
      lead: 'Cerebrospinal fluid (CSF)',
      text: 'CSF [[cushions]] the CNS, provides [[buoyancy]] (so the brain effectively weighs ~50 g instead of 1.4 kg), and delivers [[nutrients]] / removes [[waste]]. Made by [[ependymal cells]] in the [[choroid plexus]].'
    },
    {
      lead: 'Naming clusters and bundles',
      text: 'A cluster of [[cell bodies (somas)]] inside the CNS is a [[nucleus]]; outside the CNS it is a [[ganglion]]. A bundle of [[axons]] inside the CNS is a [[tract]] (white matter); outside the CNS it is a [[nerve]]. A network of nerves in the PNS is a [[plexus]].'
    },
    {
      lead: 'Refractory periods',
      text: 'During the [[absolute refractory period]] the neuron CANNOT fire another action potential at any stimulus strength — [[voltage-gated Na+ channels]] are inactivated. During the [[relative refractory period]] a stronger-than-normal stimulus can fire one — Na+ channels reset but [[K+ channels]] are still open, hyperpolarizing the membrane.'
    },
    {
      lead: 'Neuron anatomy',
      text: 'A neuron has a [[soma]] (cell body) containing the nucleus; [[dendrites]] receive input; the [[axon hillock]] is the trigger zone where an [[action potential]] starts (lots of voltage-gated Na+ channels). The [[axon]] conducts the AP, wrapped by [[myelin sheath]] with bare gaps called [[nodes of Ranvier]] (saltatory conduction). The [[axon terminal]] releases [[neurotransmitter]] into the synapse. The [[axolemma]] is the axon membrane; [[neurilemma]] is the outer Schwann-cell layer.'
    },
    {
      lead: 'Transmembrane proteins by location',
      text: '[[Dendrites & soma]]: [[ligand-gated]] (chemical-gated) channels — make [[graded potentials]]. [[Axon hillock]]: dense [[voltage-gated Na+ channels]] — where threshold decides if an AP fires. [[Axon]]: alternating [[voltage-gated Na+ and K+ channels]] (at nodes only, if myelinated). [[Axon terminal]]: [[voltage-gated Ca²⁺ channels]] open and trigger neurotransmitter release.'
    },
    {
      lead: 'Neuron types by structure',
      text: '[[Multipolar]] — many dendrites, one axon — most common (motor neurons, interneurons). [[Bipolar]] — one dendrite, one axon — found in special senses ([[retina]], [[olfactory epithelium]]). [[Unipolar (pseudounipolar)]] — one process splitting in two — found in [[sensory neurons of the PNS]] (dorsal root ganglia).'
    },
    {
      lead: 'Interneurons',
      text: '[[Interneurons]] (association neurons) are confined to the [[CNS]]. They process and integrate signals between sensory input and motor output.'
    },
    {
      lead: 'Graded potentials',
      text: 'Two types: [[EPSP]] (excitatory) — [[ligand-gated Na+]] channels open, depolarize toward threshold. [[IPSP]] (inhibitory) — [[ligand-gated K+]] (or Cl⁻) channels open, hyperpolarize away from threshold. Graded potentials are [[decremental]] (fade with distance) and [[summate]] at the axon hillock.'
    },
    {
      lead: 'Botulism',
      text: '[[Botulinum toxin]] blocks the release of [[acetylcholine (ACh)]] at the [[neuromuscular junction]] (it cleaves SNARE proteins so vesicles cannot fuse). Result: [[flaccid paralysis]] — muscles cannot contract.'
    },
    {
      lead: 'Role of myelin',
      text: 'Myelin is a lipid-rich [[insulator]]. It allows [[saltatory conduction]] — the AP "jumps" from [[node of Ranvier]] to node, dramatically [[speeding]] signal propagation and reducing the energy cost (fewer ions to pump back out).'
    }
  ],
  cards: [
    { front: 'CNS components', back: 'Brain + spinal cord' },
    { front: 'PNS components', back: 'Everything outside the CNS (nerves + ganglia)' },
    { front: 'Somatic vs autonomic NS', back: 'Somatic = voluntary skeletal muscle. Autonomic = involuntary smooth/cardiac muscle + glands' },
    { front: 'Sympathetic vs parasympathetic', back: 'Sympathetic = fight-or-flight. Parasympathetic = rest-and-digest' },
    { front: 'Glia that myelinate PNS axons', back: 'Schwann cells (one Schwann cell per internode)' },
    { front: 'Glia that myelinate CNS axons', back: 'Oligodendrocytes (one cell wraps many internodes)' },
    { front: 'Glia that line CNS ventricles + make CSF', back: 'Ependymal cells (via the choroid plexus)' },
    { front: 'Glia that form blood-brain barrier', back: 'Astrocytes' },
    { front: 'CNS phagocytes', back: 'Microglia' },
    { front: 'PNS support cells around ganglion somas', back: 'Satellite cells' },
    { front: 'Functions of CSF', back: 'Cushion, buoyancy, nutrient delivery, waste removal' },
    { front: 'Cluster of cell bodies in CNS', back: 'Nucleus' },
    { front: 'Cluster of cell bodies in PNS', back: 'Ganglion' },
    { front: 'Bundle of axons in CNS', back: 'Tract (white matter)' },
    { front: 'Bundle of axons in PNS', back: 'Nerve' },
    { front: 'Network of nerves in PNS', back: 'Plexus' },
    { front: 'Absolute refractory period — why can\'t we fire?', back: 'Voltage-gated Na+ channels are inactivated; no stimulus can produce an AP' },
    { front: 'Relative refractory period — why is it harder to fire?', back: 'K+ channels still open → membrane hyperpolarized; needs stronger stimulus' },
    { front: 'Trigger zone of the neuron', back: 'Axon hillock (dense voltage-gated Na+ channels — threshold decided here)' },
    { front: 'Channels on dendrites & soma', back: 'Ligand-gated (chemical-gated) → make graded potentials' },
    { front: 'Channels at axon terminal', back: 'Voltage-gated Ca²⁺ channels (trigger neurotransmitter release)' },
    { front: 'Multipolar neurons — where?', back: 'Most common; motor neurons, interneurons' },
    { front: 'Bipolar neurons — where?', back: 'Special senses: retina, olfactory epithelium' },
    { front: 'Unipolar (pseudounipolar) neurons — where?', back: 'PNS sensory neurons (dorsal root ganglia)' },
    { front: 'Interneurons are confined to…', back: 'The CNS' },
    { front: 'EPSP vs IPSP ions', back: 'EPSP = ligand-gated Na+ in (depolarize). IPSP = ligand-gated K+ out (or Cl⁻ in) → hyperpolarize' },
    { front: 'Graded potentials are decremental — meaning?', back: 'They fade with distance from the source; they summate at the axon hillock' },
    { front: 'What does botulinum toxin do?', back: 'Blocks ACh release at the NMJ → flaccid paralysis' },
    { front: 'Why does myelin speed AP conduction?', back: 'Saltatory conduction — AP jumps node to node; fewer channels needed → faster + cheaper' }
  ],
  sequences: [
    {
      id: 'ap-phases',
      title: 'Action Potential Phases',
      desc: 'The four phases of an AP, ion channels, and ion movement.',
      cbcRange: null,
      steps: [
        '[[Resting membrane potential]] (~-70 mV): [[K+]] leak channels keep the membrane polarized; voltage-gated Na+ and K+ channels closed.',
        '[[Depolarization]]: stimulus reaches [[threshold (~-55 mV)]] → [[voltage-gated Na+ channels]] open, [[Na+ rushes in]], voltage rises toward +30 mV.',
        '[[Repolarization]]: at peak, Na+ channels [[inactivate]] and [[voltage-gated K+ channels]] open. [[K+ flows out]], driving voltage back down.',
        '[[Hyperpolarization]]: K+ channels are slow to close, so K+ keeps leaving → voltage dips below resting (-80 mV). This is the [[relative refractory period]].',
        'Return to rest: K+ channels close and the [[Na+/K+ pump]] restores the original ion gradients.'
      ]
    }
  ],
  quizzes: [
    { q: 'Which glial cell myelinates PNS axons?', a: 'Schwann cell', options: ['Schwann cell','Oligodendrocyte','Astrocyte','Microglia'] },
    { q: 'Which glial cell makes CSF?', a: 'Ependymal cell', options: ['Astrocyte','Ependymal cell','Schwann cell','Satellite cell'] },
    { q: 'Voltage-gated Ca²⁺ channels are concentrated where?', a: 'Axon terminal', options: ['Dendrites','Soma','Axon hillock','Axon terminal'] },
    { q: 'During the absolute refractory period, what blocks a new AP?', a: 'Inactivated voltage-gated Na+ channels', options: ['Inactivated voltage-gated Na+ channels','Closed K+ leak channels','Open Ca²⁺ channels','Saturated Na+/K+ pump'] },
    { q: 'A cluster of cell bodies OUTSIDE the CNS is called a…', a: 'Ganglion', options: ['Nucleus','Ganglion','Tract','Plexus'] },
    { q: 'Botulism causes paralysis by…', a: 'Blocking ACh release at the NMJ', options: ['Blocking ACh release at the NMJ','Blocking Ca²⁺ reuptake into the SR','Permanently opening Na+ channels','Destroying AChE'] },
    { q: 'Which neuron type is found in DORSAL ROOT GANGLIA?', a: 'Unipolar (pseudounipolar)', options: ['Multipolar','Bipolar','Unipolar (pseudounipolar)','Anaxonic'] },
    { q: 'Bipolar neurons are found in…', a: 'Retina and olfactory epithelium', options: ['Retina and olfactory epithelium','Dorsal root ganglia','Motor cortex','NMJ'] },
    { q: 'Saltatory conduction is enabled by…', a: 'Myelin sheath + nodes of Ranvier', options: ['Myelin sheath + nodes of Ranvier','High density of dendrites','Astrocyte endfeet','Larger axon diameter alone'] },
    { q: 'EPSP is caused by which channel opening?', a: 'Ligand-gated Na+', options: ['Ligand-gated Na+','Ligand-gated K+','Voltage-gated Na+','Voltage-gated K+'] }
  ]
},

/* ============================================================
 *  2. MUSCLE TISSUE  (incl. the original 9-step sequence)
 * ============================================================ */
muscle: {
  id: 'muscle',
  title: 'Muscle Tissue',
  emoji: '💪',
  blurb: 'Sarcomere, sliding filament, NMJ, metabolism, contraction types.',
  learn: [
    {
      lead: 'Characteristics of muscle',
      text: 'Four properties: [[excitability]] (responds to stimuli), [[contractility]] (shortens with force), [[extensibility]] (can be stretched), and [[elasticity]] (returns to resting length).'
    },
    {
      lead: 'CT layers of skeletal muscle',
      text: 'From outside in: [[epimysium]] wraps the [[whole muscle]]; [[perimysium]] wraps each [[fascicle]] (bundle of fibers); [[endomysium]] wraps each individual [[muscle fiber]].'
    },
    {
      lead: 'Sarcomere microanatomy',
      text: 'A sarcomere runs from one [[Z-disc]] to the next. The [[A-band]] is the dark region (full length of [[myosin]] thick filaments). The [[I-band]] is the light region (only [[actin]] thin filaments, spans the Z-disc). The [[H-zone]] is the centre of the A-band (only myosin). The [[M-line]] bisects the H-zone. During contraction, [[I-band]] and [[H-zone]] [[shorten]]; the [[A-band]] [[stays the same]].'
    },
    {
      lead: 'Calcium storage in muscle',
      text: '[[Sarcoplasmic reticulum (SR)]] stores Ca²⁺. The Ca²⁺-binding protein inside the SR is [[calsequestrin]] (binds calcium for storage). On the membrane, the [[SERCA pump]] actively pumps Ca²⁺ back into the SR to end contraction.'
    },
    {
      lead: 'Tension factors — whole muscle',
      text: 'Whole-muscle tension depends on: [[number of motor units recruited]] (recruitment), [[size of each motor unit]] (large for power, small for precision), [[frequency of stimulation]] (twitch → wave summation → tetanus), and the [[length-tension relationship]] (optimal overlap of thick and thin filaments).'
    },
    {
      lead: 'Tension factors — single fiber',
      text: 'A single fiber\'s tension depends on: [[fiber diameter]], [[stimulation frequency]] (summation/tetanus), and the [[length-tension relationship]] (sarcomere starting length).'
    },
    {
      lead: 'Motor unit recruitment',
      text: 'A [[motor unit]] = one motor neuron + every fiber it innervates. [[Precise]] movements (eye, finger) use [[small]] motor units (few fibers per neuron). [[Gross/powerful]] movements (thigh) use [[large]] motor units (many fibers per neuron). Recruitment of more motor units increases force ([[size principle]] — small units first, large last).'
    },
    {
      lead: 'Contraction types — by length change',
      text: '[[Isotonic]] — muscle length CHANGES. [[Concentric]] = shortens while contracting (lifting). [[Eccentric]] = lengthens while contracting (lowering). [[Isometric]] — tension develops but length DOES NOT change (holding a weight static).'
    },
    {
      lead: 'Aerobic vs anaerobic metabolism',
      text: '[[Aerobic]] needs [[oxygen]]; happens in [[mitochondria]]; produces ~[[32 ATP]] per glucose; uses glucose, fatty acids, amino acids; main fuel during [[long, steady]] activity. [[Anaerobic]] (glycolysis) does not need oxygen; happens in the [[cytosol]]; produces [[2 ATP]] per glucose plus [[lactic acid]]; main fuel during [[short, intense]] activity. Both start from glucose and both produce ATP.'
    },
    {
      lead: 'ATP synthesis through exercise',
      text: 'Order of energy sources during a bout of exercise: (1) [[stored ATP]] (a few seconds); (2) [[creatine phosphate]] (~10 s); (3) [[anaerobic glycolysis]] (~30–60 s, produces lactic acid); (4) [[aerobic respiration]] (sustained exercise, mitochondrial).'
    },
    {
      lead: 'Causes of muscle fatigue',
      text: 'Depleted [[glycogen]] / [[ATP]], buildup of [[lactic acid]] (lowered pH), accumulation of [[inorganic phosphate (Pi)]] from ATP hydrolysis, reduced [[Ca²⁺ release]] from the SR, and [[ion imbalance]] (Na+/K+ along the sarcolemma).'
    },
    {
      lead: 'Returning a muscle to rest',
      text: '[[ACh]] is degraded by [[acetylcholinesterase (AChE)]] in the synaptic cleft. The motor end-plate repolarizes. [[Ca²⁺]] is pumped back into the SR by the [[SERCA pump]] (using ATP). [[Tropomyosin]] re-covers the actin binding sites. The muscle returns to resting length (passive recoil + antagonist contraction).'
    },
    {
      lead: 'Neuromuscular junction',
      text: 'An AP arrives at the [[axon terminal]] of a motor neuron → opens [[voltage-gated Ca²⁺ channels]] → Ca²⁺ entry triggers exocytosis of [[ACh]] into the [[synaptic cleft]] → ACh binds [[nicotinic ACh receptors]] on the [[motor end-plate]] → Na+ enters → end-plate potential triggers a [[muscle action potential]] on the [[sarcolemma]] → AP travels down [[T-tubules]] → Ca²⁺ released from [[SR]].'
    }
  ],
  cards: [
    { front: 'Four characteristics of muscle', back: 'Excitability, contractility, extensibility, elasticity' },
    { front: 'CT layer around the whole muscle', back: 'Epimysium' },
    { front: 'CT layer around a fascicle', back: 'Perimysium' },
    { front: 'CT layer around a single fiber', back: 'Endomysium' },
    { front: 'What protein stores Ca²⁺ in the SR?', back: 'Calsequestrin' },
    { front: 'Pump that returns Ca²⁺ to the SR', back: 'SERCA (uses ATP)' },
    { front: 'Sarcomere runs from … to …', back: 'Z-disc to Z-disc' },
    { front: 'A-band contains', back: 'Full length of myosin (overlap with actin too)' },
    { front: 'I-band contains', back: 'Only actin thin filaments; spans the Z-disc' },
    { front: 'H-zone contains', back: 'Only myosin (centre of A-band)' },
    { front: 'During contraction, which bands SHORTEN?', back: 'I-band and H-zone shorten; A-band stays the same' },
    { front: 'Concentric contraction', back: 'Muscle shortens while generating force (lifting)' },
    { front: 'Eccentric contraction', back: 'Muscle lengthens while generating force (lowering)' },
    { front: 'Isometric contraction', back: 'Tension generated but length does NOT change (static hold)' },
    { front: 'Small motor units used for…', back: 'Precise movements (eye, finger)' },
    { front: 'Large motor units used for…', back: 'Gross/powerful movements (thigh)' },
    { front: 'Size principle', back: 'Small motor units recruited first; larger last as force demand grows' },
    { front: 'Anaerobic glycolysis yields how much ATP?', back: '2 ATP per glucose (+ lactic acid)' },
    { front: 'Aerobic respiration yields how much ATP?', back: '~32 ATP per glucose' },
    { front: 'Energy source order during exercise', back: 'Stored ATP → creatine phosphate → anaerobic glycolysis → aerobic respiration' },
    { front: 'NMJ neurotransmitter', back: 'Acetylcholine (ACh)' },
    { front: 'Enzyme that breaks down ACh', back: 'Acetylcholinesterase (AChE)' },
    { front: 'Receptor type on the motor end-plate', back: 'Nicotinic ACh receptor (ligand-gated Na+)' },
    { front: 'What triggers Ca²⁺ release from the SR?', back: 'AP travelling down T-tubules' },
    { front: 'What causes muscle fatigue?', back: 'Depleted ATP/glycogen, lactic acid, Pi buildup, reduced SR Ca²⁺ release, ion imbalance' }
  ],
  sequences: [
    {
      id: 'contraction',
      title: 'Sequence of Muscle Contraction (9 steps)',
      desc: 'Cross-bridge cycle = steps 4–8.',
      cbcRange: [4,8],
      steps: [
        'An [[action potential]] travels down a [[motor neuron]] to the [[neuromuscular junction]].',
        '[[Acetylcholine (ACh)]] is released, crosses the [[synaptic cleft]], and initiates a [[muscle action potential]] on the [[sarcolemma]].',
        'The action potential travels down the [[T-tubules]], triggering the release of [[Calcium]] from the [[Sarcoplasmic Reticulum]].',
        '[[Calcium]] binds to [[troponin]], which shifts [[tropomyosin]] away from the active binding sites on [[actin]].',
        '[[Myosin heads]] (pre-energized by [[ATP]] hydrolysis) bind to the exposed [[active sites]] on [[actin]].',
        '[[Myosin]] releases [[ADP]] and [[Phosphate]], pivoting to pull the actin filament toward the [[M-line]] (the "power stroke").',
        'A new [[ATP]] molecule binds to the [[myosin head]], causing it to [[detach]] from the [[actin]].',
        '[[ATP]] is hydrolyzed into [[ADP]] and [[Phosphate]], re-cocking the [[myosin head]] to repeat the cycle.',
        '[[Relaxation]]: ACh is destroyed by [[acetylcholinesterase (AChE)]], [[Calcium]] is actively pumped back into the [[SR]], and [[tropomyosin]] covers the [[active sites]] again.'
      ]
    }
  ],
  quizzes: [
    { q: 'What protein stores calcium in muscle?', a: 'Calsequestrin', options: ['Calsequestrin','Troponin','Calmodulin','Tropomyosin'] },
    { q: 'During contraction, which sarcomere region does NOT change?', a: 'A-band', options: ['A-band','I-band','H-zone','Z-disc spacing'] },
    { q: 'Eccentric contraction is when the muscle…', a: 'Generates force while lengthening', options: ['Generates force while shortening','Generates force while lengthening','Maintains length under tension','Relaxes completely'] },
    { q: 'Which energy source dominates during the first ~10 seconds of intense exercise?', a: 'Creatine phosphate', options: ['Aerobic respiration','Anaerobic glycolysis','Creatine phosphate','Fatty acid β-oxidation'] },
    { q: 'Tension on a single fiber depends on all EXCEPT:', a: 'Number of motor units recruited', options: ['Fiber diameter','Stimulation frequency','Length-tension relationship','Number of motor units recruited'] },
    { q: 'Precision movements (eye, finger) rely on…', a: 'Small motor units', options: ['Small motor units','Large motor units','Mixed motor units only','Anaerobic metabolism'] },
    { q: 'The pump that returns Ca²⁺ to the SR is…', a: 'SERCA', options: ['SERCA','Na+/K+ ATPase','Na+/Ca²⁺ exchanger','H+/K+ ATPase'] },
    { q: 'Which connective tissue layer surrounds each fascicle?', a: 'Perimysium', options: ['Endomysium','Perimysium','Epimysium','Sarcolemma'] }
  ]
},

/* ============================================================
 *  3. SPINAL CORD & REFLEXES
 * ============================================================ */
spinal: {
  id: 'spinal',
  title: 'Spinal Cord & Reflexes',
  emoji: '🔗',
  blurb: 'Cord anatomy, plexuses, reflex arcs.',
  learn: [
    {
      lead: 'Ascending vs descending tracts',
      text: '[[Ascending tracts]] carry [[sensory]] information UP toward the brain. [[Descending tracts]] carry [[motor]] commands DOWN to the body. Tracts are bundles of axons inside the CNS (white matter).'
    },
    {
      lead: 'Functions of the spinal cord',
      text: 'Three jobs: (1) [[two-way conduction]] of signals between body and brain; (2) [[reflex integration]] (most reflexes finish here without involving the brain); (3) [[central pattern generation]] (locomotion rhythms).'
    },
    {
      lead: 'Spinal cord cross-section',
      text: '[[Gray matter]] (cell bodies) forms a central butterfly shape with [[dorsal horns]] (sensory), [[ventral horns]] (motor cell bodies), and [[lateral horns]] (autonomic, thoracic only). The [[gray commissure]] bridges the two sides and the [[central canal]] runs through it. [[White matter]] (myelinated axons) surrounds the gray matter and is divided into [[posterior]], [[lateral]], and [[anterior]] [[columns (funiculi)]] containing the tracts.'
    },
    {
      lead: 'Dorsal vs ventral roots',
      text: 'The [[dorsal (posterior) root]] carries [[sensory]] (afferent) info INTO the cord — its [[cell bodies]] live in the [[dorsal root ganglion]] (unipolar neurons). The [[ventral (anterior) root]] carries [[motor]] (efferent) info OUT — its [[cell bodies]] live in the [[ventral horn]] (multipolar neurons). The two roots merge to form a [[spinal nerve]], which is therefore [[mixed]] (sensory + motor).'
    },
    {
      lead: 'Spinal nerve branching (medial → lateral)',
      text: 'Order from cord outward: [[rootlets]] → [[root]] (dorsal or ventral) → [[spinal nerve]] (mixed) → [[ramus]] (dorsal or ventral) → distal branches. Anterior rami of most spinal nerves form the [[plexuses]] that supply the limbs.'
    },
    {
      lead: 'Spinal nerves — by the numbers',
      text: '[[31 pairs]] total: [[8 cervical]] (C1–C8), [[12 thoracic]] (T1–T12), [[5 lumbar]] (L1–L5), [[5 sacral]] (S1–S5), and [[1 coccygeal]]. C1 exits between the skull and atlas; all others exit through [[intervertebral foramina]]. Spinal nerves are MOSTLY [[both sensory and motor]] (mixed).'
    },
    {
      lead: 'Cord enlargements & end',
      text: 'The cord has a [[cervical enlargement]] (supplies upper limbs via [[brachial plexus]]) and a [[lumbar enlargement]] (lower limbs via [[lumbar]] and [[sacral plexuses]]). It tapers into the [[medullary cone (conus medullaris)]], anchored by the [[terminal filum]]. Beyond the cone, lumbar/sacral roots form the [[cauda equina]] ("horse\'s tail").'
    },
    {
      lead: 'Meninges & denticulate ligaments',
      text: 'Three meninges from outer to inner: [[dura mater]] (tough outer), [[arachnoid mater]] (web-like middle, with subarachnoid space holding CSF), and [[pia mater]] (delicate, hugs the cord). [[Denticulate ligaments]] are extensions of the pia that anchor the cord to the dura, limiting side-to-side movement.'
    },
    {
      lead: 'Nerve plexuses (must-know)',
      text: 'A plexus is a network of anterior rami. The four exam plexuses: [[cervical (C1–C5)]] — neck, diaphragm (phrenic nerve); [[brachial (C5–T1)]] — upper limb; [[lumbar (L1–L4)]] — anterior thigh; [[sacral (L4–S4)]] — posterior thigh, leg, foot (sciatic nerve).'
    },
    {
      lead: 'Three orders of ascending tracts',
      text: 'A typical sensory pathway uses three neurons in series: [[first-order]] — from receptor to the cord/brainstem (cell body in dorsal root ganglion); [[second-order]] — from cord/brainstem to [[thalamus]] (decussates here); [[third-order]] — from thalamus to [[cerebral cortex]] (conscious perception).'
    },
    {
      lead: 'Reflex arc — order of events',
      text: 'Standard 5-component arc: (1) [[receptor]] detects stimulus; (2) [[sensory neuron]] carries signal in via dorsal root; (3) [[integration center]] in the CNS (cord) — may be one synapse ([[monosynaptic]]) or many ([[polysynaptic]]); (4) [[motor neuron]] carries response out via ventral root; (5) [[effector]] (muscle/gland) produces the response.'
    },
    {
      lead: 'Properties of spinal reflexes',
      text: 'Reflexes are: [[stereotyped]] (same response each time), [[involuntary]] (don\'t need conscious thought), [[unlearned]] (innate), and [[quick]] (few synapses, no brain detour).'
    },
    {
      lead: 'Reflex types',
      text: '[[Stretch reflex]] (e.g. [[knee jerk]] / patellar L2-L4, [[Achilles]] S1-S2) — [[monosynaptic]] and [[ipsilateral]]; muscle contracts in response to passive stretch (via [[muscle spindles]]). [[Deep tendon reflex (DTR)]] uses [[Golgi tendon organs]] which detect tension. [[Withdrawal reflex]] — quick flexor contraction to pull a limb from a harmful stimulus; [[polysynaptic]] and [[ipsilateral]]. [[Crossed extensor reflex]] — opposite limb extends to maintain balance; [[contralateral]] (paired with the withdrawal reflex). [[Pupillary reflex]] — autonomic; light in one eye constricts both pupils ([[consensual]] reflex).'
    }
  ],
  cards: [
    { front: 'Ascending tracts carry…', back: 'Sensory info up to the brain' },
    { front: 'Descending tracts carry…', back: 'Motor commands down to the body' },
    { front: 'Cell bodies of sensory neurons live in…', back: 'Dorsal root ganglion' },
    { front: 'Cell bodies of somatic motor neurons live in…', back: 'Ventral (anterior) horn of the cord' },
    { front: 'Spinal nerves are…', back: 'Mostly mixed (sensory AND motor)' },
    { front: 'Number of spinal nerve pairs', back: '31 (8 C, 12 T, 5 L, 5 S, 1 Co)' },
    { front: 'Cervical plexus level', back: 'C1–C5 (phrenic nerve → diaphragm)' },
    { front: 'Brachial plexus level', back: 'C5–T1 (upper limb)' },
    { front: 'Lumbar plexus level', back: 'L1–L4 (anterior thigh)' },
    { front: 'Sacral plexus level', back: 'L4–S4 (sciatic → posterior thigh + leg)' },
    { front: 'Stretch reflex — # of synapses + side', back: 'Monosynaptic, ipsilateral' },
    { front: 'Withdrawal reflex — # of synapses + side', back: 'Polysynaptic, ipsilateral' },
    { front: 'Crossed extensor reflex — side?', back: 'Contralateral (opposite limb extends)' },
    { front: 'Knee jerk reflex level', back: 'L2–L4 (patellar / stretch reflex)' },
    { front: 'Achilles reflex level', back: 'S1–S2 (ankle jerk / stretch reflex)' },
    { front: 'Deep tendon reflex receptor', back: 'Golgi tendon organ (proprioceptor — detects tension)' },
    { front: 'Stretch reflex receptor', back: 'Muscle spindle (detects passive stretch)' },
    { front: 'Pupillary reflex — type?', back: 'Autonomic; consensual (one eye stim → both pupils constrict)' },
    { front: 'Reflex arc — 5 components in order', back: 'Receptor → sensory neuron → integration center → motor neuron → effector' },
    { front: 'First-order ascending neuron cell body location', back: 'Dorsal root ganglion (PNS, unipolar)' },
    { front: 'Second-order ascending neurons decussate at…', back: 'Cord or brainstem; synapse in the thalamus' },
    { front: 'Third-order ascending neurons end at…', back: 'Cerebral cortex (conscious perception)' },
    { front: 'Denticulate ligaments anchor cord to…', back: 'Dura mater (extensions of the pia)' },
    { front: 'Cauda equina is…', back: 'Lumbar/sacral roots descending below the conus medullaris' }
  ],
  sequences: [
    {
      id: 'reflex-arc',
      title: 'Stretch (Patellar) Reflex Arc',
      desc: 'Classic monosynaptic, ipsilateral reflex.',
      cbcRange: null,
      steps: [
        '[[Receptor]] in the quadriceps ([[muscle spindle]]) detects sudden stretch from the patellar tendon tap.',
        '[[Sensory (afferent) neuron]] fires an AP that travels via the [[dorsal root]] into the spinal cord.',
        'The sensory axon synapses directly on a [[motor neuron]] in the [[ventral horn]] ([[monosynaptic]] — no interneuron).',
        'The [[motor (efferent) neuron]] sends an AP out via the [[ventral root]] back to the quadriceps.',
        '[[Effector]] (quadriceps) contracts, extending the leg — the [[knee jerk]] response (ipsilateral).'
      ]
    }
  ],
  quizzes: [
    { q: 'Anterior rami of which level form the brachial plexus?', a: 'C5–T1', options: ['C1–C5','C5–T1','L1–L4','L4–S4'] },
    { q: 'Cell bodies in the dorsal root ganglion are…', a: 'Unipolar sensory neurons', options: ['Multipolar motor neurons','Unipolar sensory neurons','Bipolar interneurons','Astrocyte somas'] },
    { q: 'The withdrawal reflex is…', a: 'Polysynaptic and ipsilateral', options: ['Monosynaptic and ipsilateral','Polysynaptic and ipsilateral','Polysynaptic and contralateral','Monosynaptic and contralateral'] },
    { q: 'The crossed extensor reflex is best described as…', a: 'Contralateral extension paired with ipsilateral withdrawal', options: ['Bilateral flexion','Contralateral extension paired with ipsilateral withdrawal','Pure monosynaptic','Autonomic only'] },
    { q: 'Which structure anchors the spinal cord laterally to the dura?', a: 'Denticulate ligaments', options: ['Cauda equina','Terminal filum','Denticulate ligaments','Arachnoid trabeculae'] },
    { q: 'The cervical enlargement supplies which plexus?', a: 'Brachial plexus', options: ['Cervical plexus','Brachial plexus','Lumbar plexus','Sacral plexus'] },
    { q: 'Number of cervical spinal nerves?', a: '8', options: ['7','8','12','5'] },
    { q: 'Second-order sensory neurons synapse in the…', a: 'Thalamus', options: ['Dorsal root ganglion','Thalamus','Primary motor cortex','Cerebellum'] }
  ]
},

/* ============================================================
 *  4. AXIAL MUSCLES (Lab 6)
 * ============================================================ */
axial: {
  id: 'axial',
  title: 'Axial Muscles',
  emoji: '🗿',
  blurb: 'Head, neck, back, anterior torso. Origin / Insertion / Action.',
  learn: [
    {
      lead: 'Origin, Insertion, Action',
      text: '[[Origin (O)]] — fixed end; attaches to a bone, cartilage, or connective tissue. [[Insertion (I)]] — movable end; attaches to another structure. [[Action (A)]] — movement caused by the muscle shortening.'
    }
  ],
  cards: [],
  muscles: [
    { name: 'Occipitofrontalis — frontal belly', group: 'Head', deep: false,
      origin: 'Epicranial aponeurosis',
      insertion: 'Skin over eyebrow and bridge of nose',
      action: 'Elevates eyebrows, wrinkles skin of forehead' },
    { name: 'Occipitofrontalis — occipital belly', group: 'Head', deep: false,
      origin: 'Occipital and temporal bones',
      insertion: 'Epicranial aponeurosis',
      action: 'Pulls scalp posteriorly' },
    { name: 'Orbicularis oculi', group: 'Head', deep: false,
      origin: 'Frontal bone and maxilla',
      insertion: 'Skin surrounding eye',
      action: 'Closes eyelids' },
    { name: 'Temporalis', group: 'Head', deep: false,
      origin: 'Temporal fossa',
      insertion: 'Coronoid process of mandible',
      action: 'Elevates and retracts mandible' },
    { name: 'Masseter', group: 'Head', deep: false,
      origin: 'Zygomatic process (and arch)',
      insertion: 'Ramus of mandible',
      action: 'Elevates mandible' },
    { name: 'Buccinator', group: 'Head', deep: true,
      origin: 'Alveolar processes of maxilla and mandible',
      insertion: 'Orbicularis oris',
      action: 'Compresses cheek against teeth and gums (chewing, sucking, whistling, smiling, blowing)' },
    { name: 'Orbicularis oris', group: 'Head', deep: false,
      origin: 'Modiolus of mouth',
      insertion: 'Skin of mouth',
      action: 'Closes and purses lips (not a true sphincter)' },
    { name: 'Zygomaticus major', group: 'Head', deep: false,
      origin: 'Zygomatic bone',
      insertion: 'Modiolus (skin/muscle at corners) of mouth',
      action: 'Elevates corner of mouth (laughing)' },
    { name: 'Risorius', group: 'Head', deep: false,
      origin: 'Fascia of masseter',
      insertion: 'Modiolus (corner of mouth)',
      action: 'Draws corner of mouth laterally (laughing, horror, disdain)' },
    { name: 'Sternocleidomastoid (SCM)', group: 'Neck/Back', deep: false,
      origin: 'Manubrium and medial third of clavicle',
      insertion: 'Mastoid process of temporal bone',
      action: 'Unilateral: laterally flexes / rotates neck. Bilateral: flexes neck' },
    { name: 'Scalenes (anterior, middle, posterior)', group: 'Neck/Back', deep: false,
      origin: 'Transverse processes of cervical vertebrae',
      insertion: 'Ribs 1–2',
      action: 'Flexes and rotates neck; elevates ribs' },
    { name: 'Levator scapulae', group: 'Neck/Back', deep: false,
      origin: 'Transverse processes of C1–C4',
      insertion: 'Medial border of scapula',
      action: 'Elevates and adducts scapula' },
    { name: 'Trapezius', group: 'Neck/Back', deep: false,
      origin: 'Occipital protuberance, spinous processes of C7–T12',
      insertion: 'Scapular spine, acromion process',
      action: 'Extends and laterally flexes neck; elevates / retracts / depresses / upward-rotates scapula' },
    { name: 'Latissimus dorsi', group: 'Neck/Back', deep: false,
      origin: 'Spinous processes of T6–L5, iliac crest, ribs 8–12',
      insertion: 'Intertubercular groove of humerus',
      action: 'Adducts, extends, and medially rotates humerus' },
    { name: 'Rhomboid major', group: 'Neck/Back', deep: true,
      origin: 'Spinous processes of T2–T5',
      insertion: 'Medial border of scapula (below spine)',
      action: 'Retracts and stabilizes scapula during arm movements' },
    { name: 'Rhomboid minor', group: 'Neck/Back', deep: true,
      origin: 'Spinous processes of C7–T1',
      insertion: 'Medial border of scapula (at base of spine)',
      action: 'Same as rhomboid major (retracts and stabilizes scapula)' },
    { name: 'Serratus anterior', group: 'Neck/Back', deep: false,
      origin: 'Lateral surface of ribs',
      insertion: 'Anterior medial border of scapula',
      action: 'Protracts scapula forward; rotates scapula laterally (upward)' },
    { name: 'Erector spinae (iliocostalis, longissimus, spinalis)', group: 'Neck/Back', deep: false,
      origin: 'Thoracic and lumbar vertebrae, ribs 3–12',
      insertion: 'Ribs, vertebrae, occipital bone, mastoid process',
      action: 'Extends vertebral column (sitting and standing erect)' },
    { name: 'Diaphragm', group: 'Anterior Torso', deep: true,
      origin: 'Xiphoid process, ribs/costal cartilage 7–12, lumbar vertebrae',
      insertion: 'Central diaphragm tendon',
      action: 'Prime mover of inspiration' },
    { name: 'External intercostals', group: 'Anterior Torso', deep: false,
      origin: 'Inferior border of rib above',
      insertion: 'Superior border of rib below',
      action: 'Elevate rib cage during inspiration (fibers slope downward and anteriorly)' },
    { name: 'Internal intercostals', group: 'Anterior Torso', deep: true,
      origin: 'Superior border of rib below',
      insertion: 'Inferior border of rib above',
      action: 'Depress rib cage during expiration (fibers slope downward and posteriorly)' },
    { name: 'Pectoralis major', group: 'Anterior Torso', deep: false,
      origin: 'Clavicle, sternum, costal cartilage of ribs 1–6',
      insertion: 'Intertubercular groove of humerus',
      action: 'Flexes, adducts, medially rotates humerus; draws body upward in climbing' },
    { name: 'Pectoralis minor', group: 'Anterior Torso', deep: true,
      origin: 'Anterior surface of ribs 3–5',
      insertion: 'Coracoid process of scapula',
      action: 'Draws scapula down and forward; elevates ribs' },
    { name: 'Rectus abdominis', group: 'Anterior Torso', deep: false,
      origin: 'Pubic symphysis and crest of pubis',
      insertion: 'Xiphoid process and cartilages of ribs 5–7',
      action: 'Tenses abdominal wall; flexes vertebral column' },
    { name: 'External abdominal oblique', group: 'Anterior Torso', deep: false,
      origin: 'Anterior surface of lower 8 ribs (ribs 5–12)',
      insertion: 'Anterior half of iliac crest, pubic symphysis',
      action: 'Compresses abdomen; contralaterally rotates and flexes vertebral column' },
    { name: 'Internal abdominal oblique', group: 'Anterior Torso', deep: true,
      origin: 'Iliac crest',
      insertion: 'Ribs 10–12, pubis',
      action: 'Compresses abdomen; ipsilaterally rotates and flexes vertebral column' },
    { name: 'Transverse abdominis', group: 'Anterior Torso', deep: true,
      origin: 'Costal cartilage of ribs 6–12, iliac crest',
      insertion: 'Pubis',
      action: 'Compresses abdomen' }
  ],
  quizzes: [],
  sequences: []
},

/* ============================================================
 *  5. LIMB MUSCLES (Lab 7)
 * ============================================================ */
limb: {
  id: 'limb',
  title: 'Limb Muscles',
  emoji: '🦵',
  blurb: 'Shoulder / arm / forearm / hip / thigh / leg.',
  learn: [
    {
      lead: 'The rotator cuff (SITS)',
      text: 'Four muscles stabilize the shoulder joint — [[Supraspinatus]], [[Infraspinatus]], [[Teres minor]], [[Subscapularis]]. Mnemonic: [[SITS]].'
    },
    {
      lead: 'Hamstrings — three muscles',
      text: 'On the [[posterior thigh]]; all originate from the [[ischial tuberosity]]; all [[extend the femur and flex the leg]]: [[biceps femoris]], [[semitendinosus]], [[semimembranosus]].'
    },
    {
      lead: 'Quadriceps — four muscles',
      text: 'On the [[anterior thigh]]; all [[insert on the tibial tuberosity]] (via the patellar tendon); all [[extend the knee]]: [[rectus femoris]] (also flexes hip), [[vastus lateralis]], [[vastus medialis]], [[vastus intermedius]].'
    },
    {
      lead: 'Calcaneal tendon group',
      text: 'Three muscles share the [[calcaneal (Achilles) tendon]] insertion on the calcaneus: [[gastrocnemius]], [[soleus]], [[plantaris]]. All [[plantar flex the foot]].'
    }
  ],
  cards: [
    { front: 'Rotator cuff mnemonic', back: 'SITS — Supraspinatus, Infraspinatus, Teres minor, Subscapularis' },
    { front: 'Hamstring common origin', back: 'Ischial tuberosity' },
    { front: 'Quadriceps common insertion', back: 'Tibial tuberosity (via patellar tendon)' },
    { front: 'Three muscles using the calcaneal tendon', back: 'Gastrocnemius, soleus, plantaris (all plantar flex)' },
    { front: 'Prime mover of elbow flexion', back: 'Brachialis' },
    { front: 'Prime mover of forearm extension', back: 'Triceps brachii' },
    { front: 'Hip-flexion pair', back: 'Psoas major + iliacus (iliopsoas)' },
    { front: 'Principal extensor and lateral rotator of thigh', back: 'Gluteus maximus' },
    { front: 'Most lateral superficial anterior forearm muscle', back: 'Brachioradialis' }
  ],
  muscles: [
    // ---- SHOULDER / ARM ----
    { name: 'Deltoid', group: 'Shoulder/Arm', deep: false, tag: 'sup', fma: 'FMA32521',
      origin: 'Anterior surface of clavicle, acromion process, and spine of scapula',
      insertion: 'Deltoid tuberosity',
      action: 'Abducts humerus; aids in flexion, extension, internal and external rotation of humerus' },
    { name: 'Supraspinatus', group: 'Shoulder/Arm', deep: true, tag: 'sits', fma: 'FMA9629',
      origin: 'Supraspinous fossa of scapula',
      insertion: 'Greater tubercle of humerus',
      action: 'Abducts humerus' },
    { name: 'Infraspinatus', group: 'Shoulder/Arm', deep: true, tag: 'sits', fma: 'FMA32546',
      origin: 'Infraspinous fossa',
      insertion: 'Greater tubercle of humerus',
      action: 'Rotates humerus laterally' },
    { name: 'Teres minor', group: 'Shoulder/Arm', deep: true, tag: 'sits', fma: 'FMA32550',
      origin: 'Lateral border of scapula',
      insertion: 'Greater tubercle of humerus',
      action: 'Rotates humerus laterally' },
    { name: 'Subscapularis', group: 'Shoulder/Arm', deep: true, tag: 'sits', fma: 'FMA13413',
      origin: 'Subscapular fossa',
      insertion: 'Lesser tubercle of humerus',
      action: 'Rotates humerus medially' },
    { name: 'Teres major', group: 'Shoulder/Arm', deep: true, fma: 'FMA32549',
      origin: 'Inferior corner of scapula',
      insertion: 'Intertubercular groove of humerus',
      action: 'Extends, adducts, and medially rotates humerus' },
    { name: 'Biceps brachii', group: 'Shoulder/Arm', deep: false, fma: 'FMA37670',
      origin: 'Short head: coracoid process. Long head: supraglenoid tubercle',
      insertion: 'Radial tuberosity of radius',
      action: 'Flexes elbow and shoulder; supinates forearm' },
    { name: 'Brachialis', group: 'Shoulder/Arm', deep: false, fma: 'FMA37667',
      origin: 'Distal humerus',
      insertion: 'Coronoid process of ulna',
      action: 'Flexes elbow (prime mover!)' },
    { name: 'Coracobrachialis', group: 'Shoulder/Arm', deep: true, fma: 'FMA37664',
      origin: 'Coracoid process of scapula',
      insertion: 'Medial side of humerus shaft',
      action: 'Flexes and adducts humerus' },
    { name: 'Triceps brachii', group: 'Shoulder/Arm', deep: false, fma: 'FMA37688',
      origin: 'Posterior humerus and glenoid cavity',
      insertion: 'Olecranon process of ulna',
      action: 'Extends forearm (prime mover!)' },
    // ---- FOREARM ----
    { name: 'Pronator teres', group: 'Forearm', deep: false, fma: 'FMA38450',
      origin: 'Medial epicondyle of humerus and coronoid process of ulna',
      insertion: 'Middle portion of radius',
      action: 'Pronates and flexes forearm' },
    { name: 'Flexor carpi radialis', group: 'Forearm', deep: false, fma: 'FMA38459',
      origin: 'Medial epicondyle of humerus',
      insertion: 'Base of 2nd and 3rd metacarpals',
      action: 'Flexes and abducts wrist' },
    { name: 'Palmaris longus', group: 'Forearm', deep: false, fma: 'FMA38462',
      origin: 'Medial epicondyle of humerus',
      insertion: 'Base of metacarpals II–III (palmar aponeurosis)',
      action: 'Flexes wrist' },
    { name: 'Flexor carpi ulnaris', group: 'Forearm', deep: false, fma: 'FMA38465',
      origin: 'Medial epicondyle of humerus, olecranon process, posterior ulna',
      insertion: 'Pisiform, hamate, base of V metacarpal',
      action: 'Flexes and adducts wrist' },
    { name: 'Brachioradialis', group: 'Forearm', deep: false, fma: 'FMA38485',
      origin: 'Lateral, distal humerus',
      insertion: 'Styloid process of radius',
      action: 'Flexes forearm (most lateral superficial anterior forearm muscle)' },
    { name: 'Flexor digitorum superficialis', group: 'Forearm', deep: true, fma: 'FMA38469',
      origin: 'Medial epicondyle of humerus and coronoid process of ulna',
      insertion: 'Middle phalanges of digits II–V',
      action: 'Flexes fingers and wrist' },
    { name: 'Flexor pollicis longus', group: 'Forearm', deep: true, fma: 'FMA38481',
      origin: 'Anterior shaft of radius, interosseous membrane',
      insertion: 'Distal phalanx of thumb (phalanx I)',
      action: 'Flexes thumb and wrist' },
    { name: 'Extensor carpi radialis longus', group: 'Forearm', deep: false, fma: 'FMA38494',
      origin: 'Lateral condyle of humerus',
      insertion: 'Base of metacarpal II',
      action: 'Extends and abducts wrist' },
    { name: 'Extensor carpi radialis brevis', group: 'Forearm', deep: false, fma: 'FMA38497',
      origin: 'Lateral epicondyle of humerus',
      insertion: 'Base of metacarpal III',
      action: 'Extends and abducts wrist' },
    { name: 'Extensor digitorum', group: 'Forearm', deep: false, fma: 'FMA38500',
      origin: 'Lateral epicondyle of humerus',
      insertion: 'Extensor expansions of digits II–V',
      action: 'Finger extension' },
    { name: 'Extensor carpi ulnaris', group: 'Forearm', deep: false, fma: 'FMA38506',
      origin: 'Lateral epicondyle of humerus and posterior surface of ulna',
      insertion: 'Base of metacarpal V',
      action: 'Extends and adducts wrist' },
    { name: 'Supinator', group: 'Forearm', deep: true, fma: 'FMA38512',
      origin: 'Lateral epicondyle of humerus, supinator crest of ulna',
      insertion: 'Lateral surface and posterior border of radius',
      action: 'Supinates forearm' },
    // ---- HIP / GLUTE ----
    { name: 'Gluteus maximus', group: 'Hip/Glute', deep: false, fma: 'FMA22314',
      origin: 'Upper and posterior ilium, sacrum, and coccyx',
      insertion: 'Femur (gluteal tuberosity + iliotibial tract)',
      action: 'Principal extensor and lateral rotator of thigh' },
    { name: 'Gluteus medius', group: 'Hip/Glute', deep: true, fma: 'FMA22315',
      origin: 'Middle portion of ilium',
      insertion: 'Greater trochanter of femur',
      action: 'Abducts and medially rotates femur' },
    { name: 'Piriformis', group: 'Hip/Glute', deep: true, fma: 'FMA19082',
      origin: 'Pelvic surface of sacrum',
      insertion: 'Greater trochanter of femur',
      action: 'Lateral rotation of femur' },
    { name: 'Psoas major', group: 'Hip/Glute', deep: true, fma: 'FMA18060',
      origin: 'Transverse processes and bodies of lumbar vertebrae',
      insertion: 'Lesser trochanter of femur (with iliacus)',
      action: 'Hip flexion' },
    { name: 'Iliacus', group: 'Hip/Glute', deep: true, fma: 'FMA22310',
      origin: 'Iliac fossa',
      insertion: 'Lesser trochanter of femur (with psoas major)',
      action: 'Hip flexion' },
    // ---- HAMSTRINGS (Posterior thigh) ----
    { name: 'Biceps femoris', group: 'Hamstrings', deep: false, tag: 'ham', fma: 'FMA22356',
      origin: 'Ischial tuberosity',
      insertion: 'Head of fibula and lateral condyle of tibia',
      action: 'Extends femur and flexes leg' },
    { name: 'Semitendinosus', group: 'Hamstrings', deep: false, tag: 'ham', fma: 'FMA22357',
      origin: 'Ischial tuberosity',
      insertion: 'Medial surface of proximal tibia',
      action: 'Extends femur and flexes leg' },
    { name: 'Semimembranosus', group: 'Hamstrings', deep: false, tag: 'ham', fma: 'FMA22438',
      origin: 'Ischial tuberosity',
      insertion: 'Medial condyle of tibia',
      action: 'Extends femur and flexes leg' },
    // ---- ANTERIOR THIGH ----
    { name: 'Sartorius', group: 'Anterior Thigh', deep: false, fma: 'FMA22353',
      origin: 'Anterior superior iliac spine (ASIS)',
      insertion: 'Medial surface of proximal tibia',
      action: 'Flexes knee and hip; lateral rotation of femur' },
    { name: 'Rectus femoris', group: 'Anterior Thigh', deep: false, tag: 'quad', fma: 'FMA22430',
      origin: 'Anterior inferior iliac spine and upper margin of acetabulum',
      insertion: 'Tibial tuberosity',
      action: 'Extends tibia (knee) and flexes femur (hip)' },
    { name: 'Vastus lateralis', group: 'Anterior Thigh', deep: false, tag: 'quad', fma: 'FMA22431',
      origin: 'Linea aspera of femur',
      insertion: 'Tibial tuberosity',
      action: 'Extends knee' },
    { name: 'Vastus medialis', group: 'Anterior Thigh', deep: false, tag: 'quad', fma: 'FMA22432',
      origin: 'Greater trochanter of femur and linea aspera',
      insertion: 'Tibial tuberosity',
      action: 'Extends knee' },
    { name: 'Vastus intermedius', group: 'Anterior Thigh', deep: true, tag: 'quad', fma: 'FMA22433',
      origin: 'Upper shaft of femur',
      insertion: 'Tibial tuberosity',
      action: 'Extends knee' },
    // ---- MEDIAL / LATERAL THIGH ----
    { name: 'Adductor longus', group: 'Medial Thigh', deep: false, fma: 'FMA22441',
      origin: 'Inferior ramus of pubis',
      insertion: 'Linea aspera of femur',
      action: 'Adducts, flexes, and medially rotates femur' },
    { name: 'Adductor magnus', group: 'Medial Thigh', deep: false, fma: 'FMA22443',
      origin: 'Inferior ramus of pubis and ischial tuberosity',
      insertion: 'Linea aspera',
      action: 'Adducts, flexes, medially rotates, extends and laterally rotates femur' },
    { name: 'Gracilis', group: 'Medial Thigh', deep: false, fma: 'FMA43882',
      origin: 'Inferior ramus of pubis near symphysis',
      insertion: 'Medial surface of proximal tibia',
      action: 'Adducts, flexes, and medially rotates tibia' },
    { name: 'Tensor fasciae latae', group: 'Lateral Thigh', deep: false, fma: 'FMA22423',
      origin: 'Iliac crest, lateral surface of ASIS',
      insertion: 'Iliotibial tract',
      action: 'Flexes and medially rotates femur; laterally stabilizes knee' },
    // ---- POSTERIOR LEG ----
    { name: 'Gastrocnemius', group: 'Posterior Leg', deep: false, fma: 'FMA22541',
      origin: 'Medial and lateral condyles of femur',
      insertion: 'Calcaneus via calcaneal tendon',
      action: 'Flexes tibia (knee) and plantar flexes foot' },
    { name: 'Soleus', group: 'Posterior Leg', deep: true, fma: 'FMA22542',
      origin: 'Fibula and tibia',
      insertion: 'Calcaneus via calcaneal tendon',
      action: 'Plantar flexion of foot' },
    { name: 'Plantaris', group: 'Posterior Leg', deep: false, fma: 'FMA22543',
      origin: 'Supracondylar line of femur',
      insertion: 'Calcaneus via calcaneal tendon',
      action: 'Assists in flexion of leg and plantar flexion of foot' },
    { name: 'Popliteus', group: 'Posterior Leg', deep: true, fma: 'FMA22590',
      origin: 'Lateral condyle of femur',
      insertion: 'Posterior surface of tibia just below condyles',
      action: 'Flexes and unlocks knee joint' },
    { name: 'Tibialis posterior', group: 'Posterior Leg', deep: true, fma: 'FMA51099',
      origin: 'Posterior surface of tibia and fibula',
      insertion: 'Navicular, cuneiforms, cuboid, metatarsals II–IV',
      action: 'Plantar flexion and inversion of foot' },
    { name: 'Flexor digitorum longus', group: 'Posterior Leg', deep: true, fma: 'FMA51071',
      origin: 'Posteromedial surface of tibia',
      insertion: 'Inferior surfaces of distal phalanges of digits 2–5',
      action: 'Flexion of toes 2–5' },
    { name: 'Flexor hallucis longus', group: 'Posterior Leg', deep: true, fma: 'FMA22593',
      origin: 'Posterior surface of fibula',
      insertion: 'Distal phalanx of great toe',
      action: 'Flexes great toe' },
    // ---- ANTERIOR LEG ----
    { name: 'Tibialis anterior', group: 'Anterior Leg', deep: false, fma: 'FMA22532',
      origin: 'Upper ½ of tibia and interosseous membrane',
      insertion: 'Metatarsal I and medial cuneiform',
      action: 'Dorsiflexes and inverts foot' },
    { name: 'Extensor hallucis longus', group: 'Anterior Leg', deep: true, fma: 'FMA22533',
      origin: 'Anterior surface of fibula and interosseous membrane',
      insertion: 'Distal phalanx of great toe',
      action: 'Dorsiflexes foot and extends great toe' },
    { name: 'Extensor digitorum longus', group: 'Anterior Leg', deep: false, fma: 'FMA22534',
      origin: 'Tibia, fibula, interosseous membrane',
      insertion: 'Tendons to middle and distal phalanges II–V',
      action: 'Dorsiflexes foot and extends toes' },
    // ---- LATERAL LEG ----
    { name: 'Fibularis (peroneus) longus', group: 'Lateral Leg', deep: false, fma: 'FMA22539',
      origin: 'Head and upper 2/3 of shaft of fibula',
      insertion: 'Metatarsal I, medial cuneiform',
      action: 'Plantar flexes and everts foot' },
    { name: 'Fibularis (peroneus) brevis', group: 'Lateral Leg', deep: false, fma: 'FMA22540',
      origin: 'Lower 2/3 of shaft of fibula',
      insertion: 'Metatarsal V',
      action: 'Plantar flexes and everts foot' }
  ],
  quizzes: [],
  sequences: []
}

}; // end DATA

/* ============================================================
 *  3D MUSCLE → FMA MAP
 *  Built from data above (limb section). Used by Three.js viewer
 *  to load STL/OBJ files keyed by FMA id.
 * ============================================================ */
window.MUSCLE_FMA = (function(){
  var out = {};
  (window.DATA.limb.muscles || []).forEach(function(m){ if (m.fma) out[m.name] = m.fma; });
  return out;
})();

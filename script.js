/* ---------- helpers ---------- */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let lastFocus=null;
function openModal(html){lastFocus=document.activeElement;$('#mbox').innerHTML=html+'<p><button class="btn alt" data-close>Close</button></p>';$('#modal').hidden=false;$('#mbox').querySelector('button').focus()}
function closeModal(){$('#modal').hidden=true;lastFocus&&lastFocus.focus()}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal'||e.target.closest('[data-close]'))closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modal').hidden)closeModal()});

/* ---------- tabs & persistent navigation ---------- */

/* ---- Section music: game + map only ---- */
const bioquestMusic = document.getElementById('bioquest-music');
let musicAreaActive = false;
let musicMuted = false;
function updateMusicButton(){
  const button=document.getElementById('music-toggle');
  if(!button)return;
  button.textContent=musicMuted?'♪ Music: Off':'♪ Music: On';
  button.setAttribute('aria-pressed',String(musicMuted));
  button.setAttribute('aria-label',musicMuted?'Unmute background music':'Mute background music');
  button.title=musicMuted?'Unmute background music':'Mute background music';
}
if(bioquestMusic){
  document.getElementById('music-toggle')?.addEventListener('click',()=>{
    musicMuted=!musicMuted;
    bioquestMusic.muted=musicMuted;
    updateMusicButton();
    // If autoplay was previously blocked, this click is a user gesture that can start playback.
    if(!musicMuted&&musicAreaActive&&bioquestMusic.paused){
      const attempt=bioquestMusic.play();
      if(attempt&&typeof attempt.catch==='function')attempt.catch(()=>{});
    }
  });
  updateMusicButton();
}

function syncSectionMusic(section) {
  if (!bioquestMusic) return;
  const shouldPlay = section === 'game' || section === 'map';
  if (!shouldPlay) {
    bioquestMusic.pause();
    bioquestMusic.currentTime = 0;
    musicAreaActive = false;
    return;
  }
  // Game and Map share one continuous music session.
  if (musicAreaActive) return;
  musicAreaActive = true;
  bioquestMusic.currentTime = 0;
  const playAttempt = bioquestMusic.play();
  if (playAttempt && typeof playAttempt.catch === 'function') {
    playAttempt.catch(() => {
      // Browser autoplay restrictions may prevent playback until interaction.
    });
  }
}

function showTab(t){
  syncSectionMusic(t);
['home','game','map'].forEach(id=>$('#'+id).hidden=id!==t);
  $$('.tab').forEach(b=>{
    if(b.dataset.tab===t){
      b.setAttribute('aria-current','page');
    } else {
      b.removeAttribute('aria-current');
    }
  });

  // Toggle persistent navigation header visibility
  const pNav = $('#persistent-nav');
  if (pNav) {
    pNav.hidden = (t === 'home');
  }

  window.scrollTo(0,0);
}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-tab]');
  if(b) showTab(b.dataset.tab);
});
document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ') && e.target.matches('.feature-card[data-tab]')){
    e.preventDefault();showTab(e.target.dataset.tab);
  }
});

/* Smooth scroll for Get Started button */
const startBtn = $('#start');
if (startBtn) {
  startBtn.onclick=()=>{
    const homeScreen = $('#home-screen');
    if (homeScreen) {
      homeScreen.scrollIntoView({behavior:'smooth'});
    }
  };
}

showTab('home');

/* ================= GAME ================= */
const TRAITS=['Innovation / Curiosity','Decision-Making','Teamwork / Problem-Solving','Communication / Ethics','Patience / Research'];
const MAJORS=[
 ['Biotechnology, Molecular Biology, Biochemistry'],
 ['Bioengineering, Biostatistics, Data Science'],
 ['Biomedical Engineering, Public Health, Business of Science'],
 ['Regulatory Science, Bioethics, Science Communication'],
 ['Chemistry, Microbiology, Medical Laboratory Science']];

const R=s=>{const p=s.split('|');return{n:p[0],d:p[1],k:p[2],e:p[3],t:[+p[4][0],+p[4][1]]}};
const Q=(q,...a)=>({q,a});

const SECT=[
{n:'Pharma / Healthcare',th:'th-pharma',m:'Dr. Lena Ruiz',c:'#567792',ic:['dna','flask'],
 d:'Our cleanroom team turns discoveries into safe, effective medicines and treatments, from first molecule to patient.',
 path:'Intern or lab associate, then scientist or specialist, then senior scientist or manager, then director.',
 prog:['Rutgers Ernest Mario School of Pharmacy (PharmD)','RAPS Regulatory Affairs Certification (RAC)','Biotechnology and clinical research certificates at NJ colleges'],
 roles:['Medicinal Chemist|Designs and improves drug molecules.|Organic chemistry, analysis|B.S. or Ph.D. in chemistry|04','Pharmacologist|Tests how drugs act in the body.|Assay design, dose-response|Ph.D. in pharmacology|40','Clinical Research Associate|Monitors trial sites for quality and safety.|Monitoring, GCP rules|B.S. in a life science|43','Clinical Trial Manager|Leads studies on time and on budget.|Planning, leadership|B.S. plus PMP or M.S.|12','Regulatory Affairs Specialist|Guides products through FDA approval.|Technical writing, regulations|B.S. plus RAC certificate|34','Pharmacovigilance Scientist|Tracks drug safety after launch.|Data review, medical writing|PharmD or B.S./M.S.|41','Biostatistician|Analyzes clinical trial data.|Statistics, R/SAS|M.S. in biostatistics|14','Process Development Scientist|Scales recipes into manufacturing.|Bioprocess, optimization|B.S./M.S. in chemical engineering|01','Quality Assurance Specialist|Keeps manufacturing GMP-compliant.|Auditing, documentation|B.S. in a life science|43','Formulation Scientist|Turns drugs into tablets and injections.|Chemistry, stability testing|B.S./Ph.D. in pharmaceutical science|04','Medical Science Liaison|Explains new science to physicians.|Presenting, clinical knowledge|PharmD or Ph.D.|32','Pharmacist|Dispenses medicine and counsels patients.|Pharmacology, counseling|PharmD|34','Bioinformatics Scientist|Mines genomic data for drug targets.|Python, genomics|B.S./M.S. in bioinformatics|10','Biomedical Engineer|Builds devices and delivery systems.|Design, prototyping|B.S. in biomedical engineering|02','Genetic Counselor|Guides patients through genetic results.|Empathy, genetics|M.S. in genetic counseling|34','Medical Writer|Writes clinical and regulatory documents.|Writing, scientific accuracy|B.S./M.S. in life science|34'].map(R),
 qs:[]},
{n:'Agricultural & Environmental',th:'th-agri',m:'Ms. Hana Green',c:'#567792',ic:['leaf','drop'],
 d:'Step into our hydroponics greenhouse, where biotechnology helps crops grow stronger, safer and more sustainably.',
 path:'Lab or field technician, then crop or plant scientist, then project lead, then research director or consultant.',
 prog:['Rutgers School of Environmental and Biological Sciences (plant and food science)','Rutgers Cooperative Extension programs','Controlled-environment agriculture certificates'],
 roles:['Agricultural Biotechnologist|Engineers crops for resilience.|Genomics, lab methods|M.S. or Ph.D. in plant biotechnology|04','Crop Scientist|Runs field trials to improve yield.|Agronomy, statistics|B.S./M.S. in crop science|41','Soil Scientist|Studies soil health and nutrients.|Sampling, chemistry|B.S. in soil science|40','Hydroponics Specialist|Optimizes soil-free growing systems.|Nutrient control, automation|B.S. in horticulture|02','Plant Pathologist|Diagnoses and prevents crop disease.|Microscopy, diagnostics|M.S./Ph.D. in plant pathology|41','Agricultural Engineer|Designs irrigation and farm machinery.|Engineering, sensors|B.S. in agricultural engineering|02','Food Scientist|Develops safe, nutritious foods.|Chemistry, sensory testing|B.S. in food science|01','Entomologist|Studies pests and helpful insects.|Identification, ecology|B.S./M.S. in entomology|40','Tissue Culture Technician|Grows plants from cells in sterile labs.|Sterile technique, media prep|A.S./B.S. in biology|42','Agronomist|Advises growers on crops and soil.|Field analysis, communication|B.S. in agronomy|23','Precision Ag Analyst|Uses drones and data to guide farms.|GIS, data science|B.S. in ag plus data skills|10','Seed Technologist|Tests seed quality and purity.|Lab testing, standards|B.S. in plant science|41','Biosafety Officer|Keeps crop biotech safe and compliant.|Regulations, ethics|B.S./M.S. plus policy training|31','Extension Educator|Teaches growers new practices.|Teaching, outreach|M.S. in agriculture|32','Sustainable Farm Manager|Runs operations with eco-friendly methods.|Leadership, budgeting|B.S. in agriculture or business|12','Plant Breeder|Selects and crosses plants for better traits.|Genetics, patience|M.S./Ph.D. in plant breeding|40'].map(R),
 qs:[]},
{n:'Regulatory Science',th:'th-env',m:'Dr. Sam Okafor',c:'#567792',ic:['globe','bars'],
 d:'Ensure compliance, ethics, safety standards, and global approvals across biotech products.',
 path:'Regulatory Associate, then Regulatory Affairs Specialist, then Regulatory Manager, then Director of Regulatory Affairs.',
 prog:['RAPS Regulatory Affairs Certification (RAC)','Rutgers Bioethics and Regulatory Certificate','NJIT Healthcare Regulations Course'],
 roles:['Regulatory Affairs Specialist|Guides products through FDA approval.|Technical writing, regulations|B.S. plus RAC certificate|34','Quality Assurance Specialist|Keeps manufacturing GMP-compliant.|Auditing, documentation|B.S. in a life science|43','Biosafety Officer|Keeps biotech safe and compliant.|Regulations, ethics|B.S./M.S. plus policy training|31','Compliance Officer|Makes sure projects follow regulations.|Regulations, auditing|B.S. in environmental science|31','Medical Writer|Writes clinical and regulatory documents.|Writing, scientific accuracy|B.S./M.S. in life science|34','Biostatistician|Analyzes trial data for compliance.|Statistics, SAS/R|M.S. in biostatistics|14'].map(R),
 qs:[]},
{n:'Detection',th:'th-detect',m:'Dr. Jun Park',c:'#567792',ic:['bars','dna'],
 d:'Our high-throughput bio-analytics lab reads DNA, proteins and signals to detect disease, pathogens and evidence.',
 path:'Lab technician or analyst, then scientist or specialist, then senior scientist or lab manager, then director.',
 prog:['Rutgers and NJIT biomedical engineering and biochemistry programs','Medical laboratory science programs with ASCP certification','Bioinformatics certificate programs'],
 roles:['Molecular Diagnostics Scientist|Develops DNA and RNA tests.|PCR, assay design|B.S./M.S. in molecular biology|04','Forensic DNA Analyst|Analyzes DNA evidence for cases.|PCR, chain of custody|B.S. in forensic science|43','Clinical Lab Scientist|Runs patient lab tests.|Instruments, accuracy|B.S. in medical laboratory science|41','Assay Development Scientist|Builds new detection assays.|Immunoassays, validation|M.S. in biochemistry|01','Sequencing Specialist|Runs genome sequencers.|NGS, library prep|B.S. in genetics|42','Bioinformatics Analyst|Interprets sequence data.|Python, statistics|B.S./M.S. in bioinformatics|14','Biosensor Engineer|Designs devices that detect biomarkers.|Electronics, biochemistry|B.S./M.S. in biomedical engineering|02','Mass Spectrometry Specialist|Identifies molecules by mass.|Instrument tuning, analysis|B.S./Ph.D. in analytical chemistry|40','Quality Control Analyst|Verifies test quality and consistency.|SOPs, documentation|B.S. in chemistry or biology|43','Public Health Lab Scientist|Detects outbreaks and pathogens.|Microbiology, surveillance|M.S. in public health or microbiology|42','Flow Cytometry Specialist|Analyzes cells by their markers.|Cell analysis, software|B.S. in biology or immunology|41','Lab Automation Engineer|Builds robotics for high-throughput screening.|Robotics, coding|B.S. in engineering|10','Pathogen Detection Specialist|Tests food and water for pathogens.|Culturing, PCR|B.S. in microbiology|41','Diagnostics Product Manager|Guides tests from idea to market.|Strategy, communication|B.S. plus MBA|13','Cytogenetic Technologist|Examines chromosomes under the microscope.|Microscopy, patience|B.S. in genetics|42','Toxicology Analyst|Detects drugs and toxins in samples.|Chromatography, validation|B.S. in chemistry|41'].map(R),
 qs:[]},
{n:'Marine',th:'th-marine',m:'Capt. Maria Reyes',c:'#567792',ic:['fish','drop'],
 d:'Dive into our deep-sea aquaculture facility, where ocean organisms inspire new medicines, foods and conservation tools.',
 path:'Research or aquaculture technician, then marine scientist, then project lead, then program director.',
 prog:['Rutgers Institute of Marine and Coastal Sciences','Stockton University marine science','Scientific diving training'],
 roles:['Marine Biologist|Studies ocean life and ecosystems.|Fieldwork, species ID|B.S./M.S. in marine biology|40','Marine Natural Products Chemist|Finds medicines in sea organisms.|Chromatography, NMR|Ph.D. in chemistry|04','Aquaculture Technician|Raises fish and shellfish sustainably.|Water chemistry, husbandry|A.S./B.S. in aquaculture|42','Fisheries Scientist|Assesses fish populations.|Statistics, sampling|M.S. in fisheries science|41','Oceanographer|Studies currents and ocean chemistry.|Instruments, modeling|B.S./Ph.D. in oceanography|04','Marine Microbiologist|Studies microbes of the sea.|Sequencing, culturing|Ph.D. in microbiology|40','Coral Restoration Specialist|Grows and restores reefs.|Diving, propagation|B.S. in marine science|20','Marine Biotechnologist|Applies marine organisms to products.|Genetics, bioprocess|M.S. in marine biotechnology|01','Ocean Engineer|Operates underwater robots (ROVs).|Robotics, navigation|B.S. in ocean engineering|12','Shellfish Health Specialist|Monitors oyster and clam disease.|Histology, diagnostics|M.S. in aquatic health|41','Marine Policy Analyst|Shapes ocean conservation rules.|Policy, writing|M.S. in marine policy|31','Marine Mammal Scientist|Studies whales and dolphins.|Observation, data analysis|M.S./Ph.D. in marine mammal science|40','Marine Data Scientist|Analyzes ocean sensor data.|Python, statistics|B.S./M.S. in data science|10','Seafood Safety Inspector|Checks seafood for contaminants.|Testing, regulations|B.S. in food or marine science|43','Ocean Educator|Teaches the public about the sea.|Teaching, outreach|B.S. plus education training|32','Algal Biotechnologist|Grows algae for foods and fuels.|Cultivation, biochemistry|M.S. in biotechnology|01'].map(R),
 qs:[]}
];

const IC={dna:'M8 2c0 9 16 11 16 28M24 2c0 9-16 11-16 28M10 9h12M10 23h12',flask:'M12 3h8M14 3v10L5 28h22L18 13V3M9 22h14',leaf:'M4 28C4 12 14 4 28 4c0 14-8 24-24 24zM4 28 18 14',drop:'M16 3C10 12 7 16 7 20a9 9 0 0 0 18 0c0-4-3-8-9-17z',fish:'M3 16c6-9 15-9 20 0-5 9-14 9-20 0zM23 16l6-6v12z',bars:'M5 28V14M12 28V6M19 28V18M26 28V10',globe:'M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24zM4 16h24M16 4c-6 8-6 16 0 24M16 4c6 8 6 16 0 24'};
const icon=(k,cls='fl',st='')=>`<svg class="${cls}" style="${st}" viewBox="0 0 32 32" aria-hidden="true"><path d="${IC[k]}"/></svg>`;
const decor=s=>`<div class="decor" aria-hidden="true">${Array.from({length:8},(_,i)=>icon(s.ic[i%2],'fl',`left:${(i*13+4)%92}%;top:${(i*29+8)%78}%;animation-duration:${6+i%4}s;animation-delay:-${i*1.3}s`)).join('')}</div>`;

const spr = (src, l) => `<img class="spr sprite-placeholder" src="${src}" alt="${l}" draggable="false">`;

const NATALIE = spr('director.png', 'Natalie, facility director');
const PLAYER = spr('character-placeholder.svg', 'You');
const MANAGER = spr('manager.png', 'Manager');
const PHARMA = spr('pharmacist.png', 'Pharmacist');
const DETECT = spr('detection.png', 'idk the name for this yet');
const AGRI = spr('agriculture.png', 'idk name yet');
//const MARINE = spr('marine.png', 'idk name yet2'); (yikes, i forgot to make this guy  T_T   imma add him in later)

//overall variable for sprites that changes based on what sector is chosen
const PERSON_SPRITE = [
  PHARMA,//PHARMA
  MANAGER,//AGRI
  DETECT,//REGULATORY
  AGRI//DETECT
  //,  MARINE//MARINE
];

const say = (sp, who, txt, extra = '') => `<div class="scene">${sp}<div class="bubble glass"><b>${who}</b><p>${txt}</p>${extra}</div></div>`;

const G={sec:0,team:[],tr:[0,0,0,0,0],sourceTraitScores:{},q:0,res:{}};
const stage=$('#stage');
let raf=0;
function draw(theme,html,sec){
  cancelAnimationFrame(raf);
  stage.className='stage '+theme;
  stage.innerHTML=(sec?decor(sec):'')+html;
  const f=stage.querySelector('button');f&&f.focus({preventScroll:true});
}

/* ---- 1. facility entry ---- */
const K={},NPC={x:57,y:66},P={x:12,y:88,f:1};
function entry(){
  P.x=12;P.y=88;
  const wins=[0,1,2,3,4,5,6,7].map(i=>[92,132].map(y=>`<rect x="${48+i*42}" y="${y}" width="28" height="26" fill="#B9D2E7" stroke="#567792" stroke-width="2"/>`).join('')).join('')+[0,1,2,5,6,7].map(i=>`<rect x="${48+i*42}" y="172" width="28" height="26" fill="#B9D2E7" stroke="#567792" stroke-width="2"/>`).join('');
  draw('th-entry',`
  <div class="entry-actions"><button class="btn alt" data-g="hub">Skip walking</button><span class="note">Use WASD or arrow keys to reach Natalie.</span></div>
  <div class="world" id="world" style="margin-top:.7rem">
   <div class="bldg"><svg viewBox="0 0 400 250" role="img" aria-label="Bioquest Labs facility"><rect x="30" y="50" width="340" height="200" rx="6" fill="#FFFFFF" stroke="#567792" stroke-width="3"/><rect x="30" y="50" width="340" height="28" fill="#567792"/><text x="200" y="70" text-anchor="middle" font-family="Cinzel Decorative,serif" font-size="16" font-weight="700" fill="#FFFFFF">BIOQUEST LABS</text>${wins}<rect x="172" y="190" width="56" height="60" fill="#567792" stroke="#567792" stroke-width="3"/><path d="M200 190v60" stroke="#567792" stroke-width="2"/><rect x="60" y="20" width="14" height="30" fill="#B9D2E7" stroke="#567792" stroke-width="2"/></svg></div>
   <div class="ground"></div>
   <div class="npc" style="left:${NPC.x}%;top:${NPC.y}%">${NATALIE}</div>
   <div class="glass hint" id="hint">Walk up to Natalie at the entrance.</div>
   <div class="glass say" id="say" hidden><b>Natalie, Director</b><p>Welcome to Bioquest Labs! I run this facility. We have five research sectors, from cleanrooms to deep-sea tanks, and I will help you find where you fit. Ready to come inside?</p><button class="btn" data-g="hub" id="playbtn">Play</button> <span class="note">or press Enter</span></div>
   <div class="pl" id="pl" style="left:${P.x}%;top:${P.y}%">${PLAYER}</div></div>`);
  let t0=performance.now(),near=false;
  const loop=t=>{
    const pl=$('#pl');if(!pl)return;
    const dt=Math.min(.05,(t-t0)/1000);t0=t;
    const dx=(K.ArrowRight||K.d?1:0)-(K.ArrowLeft||K.a?1:0),dy=(K.ArrowDown||K.s?1:0)-(K.ArrowUp||K.w?1:0);
    if(!$('#game').hidden&&(dx||dy)){
      P.x=Math.max(4,Math.min(96,P.x+dx*30*dt));P.y=Math.max(66,Math.min(96,P.y+dy*22*dt));
      if(dx)P.f=dx;pl.style.left=P.x+'%';pl.style.top=P.y+'%';
    }
    pl.classList.toggle('walk',!!(dx||dy));pl.firstChild.style.transform=`scaleX(${P.f})`;
    const n=Math.abs(P.x-NPC.x)<15&&Math.abs(P.y-NPC.y)<12;
    if(n!==near){near=n;$('#say').hidden=!n;$('#hint').hidden=n;if(n)$('#playbtn').focus({preventScroll:true})}
    raf=requestAnimationFrame(loop);
  };
  raf=requestAnimationFrame(loop);
}
const gameKey=e=>$('#game').hidden||(!$('#pl')&&!$('#campus-player'))||!$('#modal').hidden;
document.addEventListener('keydown',e=>{
  if(gameKey(e)||e.target.closest('input, textarea, select, [contenteditable=true]'))return;const k=e.key.length===1?e.key.toLowerCase():e.key;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d'].includes(k)){K[k]=1;e.preventDefault()}
  else if((k==='e'||k==='Enter')&&$('#campus-player')&&G.nearCampus>=0){campusInteraction(G.nearCampus);e.preventDefault();return} else if(k==='Enter'&&$('#say')&&!$('#say').hidden&&e.target.tagName!=='BUTTON')hub();
});
document.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;delete K[k]});
window.addEventListener('blur',()=>Object.keys(K).forEach(k=>delete K[k]));

/* ---- 2. walkable top-down research campus ---- */
let campusRAF=0,campusLast=0;
const CP={x:50,y:72,speed:23};
// Percent coordinates refer to the original 1024x820 campus artwork.
// IMPORTANT: The avatar may walk ONLY on the broad tan roads, NOT on grass,
// lakes, buildings, thin ornamental paths, or the fountain.
// Edit CAMPUS_MAIN_ROADS when changing the background; keep each corridor
// connected at the wide junctions so the upper and lower campus remain reachable.
const CAMPUS_LOCATIONS=[
  {name:'Pharma / Healthcare',x:30,y:33,kind:'sector',sector:0,short:'Pharma Lab'},
  {name:'Agricultural & Environmental',x:85,y:33,kind:'sector',sector:1,short:'Greenhouse'},
  {name:'Regulatory Science',x:33,y:64.5,kind:'sector',sector:2,short:'Regulatory Lab'},
  {name:'Detection',x:74,y:64.5,kind:'sector',sector:3,short:'Detection Lab'},
  {name:'Marine',x:63,y:87,kind:'sector',sector:4,short:'Marine Lab'},
  {name:'Team HQ',x:29,y:87,kind:'hq',short:'Team HQ'},
  {name:'Main Research Center',x:55,y:29,kind:'research',short:'Research Center'}
];
// Only the wide central north/south avenue and three wide east/west roads.
// These are inclusive [left, top, right, bottom] percentage rectangles.
// East/west branches begin AFTER the buildings, not in their roof footprints.
// The upper crossroad is intentionally a little narrower near the outside labs.
const CAMPUS_MAIN_ROADS=[
  [0,0,90,90]
];
// Fountain is solid even where a nearby road meets its stone border.

const CAMPUS_BLOCKED_AREAS=[
  [0,0]
];

// A small foot radius keeps the sprite away from road edges, preventing water
// traversal without creating invisible walls across the middle of the path.
const CAMPUS_FOOT_RADIUS={x:0.65,y:0.65};
function campusPointInPolygon(x,y,poly){
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[i],b=poly[j];
    if(((a[1]>y)!==(b[1]>y)) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
function campusEdgeDistance(x,y,a,b){
  const sx=1024/820, dx=(b[0]-a[0])*sx,dy=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((x-a[0])*sx*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));
  return Math.hypot((x-a[0]-(b[0]-a[0])*t)*sx,y-a[1]-(b[1]-a[1])*t);
}
function campusTouchesObstacle(x,y,poly){
  if(campusPointInPolygon(x,y,poly))return true;
  const radius=Math.max(CAMPUS_FOOT_RADIUS.x*(1024/820),CAMPUS_FOOT_RADIUS.y);
  for(let i=0;i<poly.length;i++){
    if(campusEdgeDistance(x,y,poly[i],poly[(i+1)%poly.length])<radius)return true;
  }
  return false;
}
function campusOnMainRoad(x,y){
  const r=CAMPUS_FOOT_RADIUS;
  // Test the same swept foot corners against the union of road rectangles.
  // This lets the character move freely through intersections without snagging.
  for(const [ox,oy] of [[0,0],[-r.x,0],[r.x,0],[0,-r.y],[0,r.y]]){
    if(!CAMPUS_MAIN_ROADS.some(([l,t,rr,bb])=>x+ox>=l&&x+ox<=rr&&y+oy>=t&&y+oy<=bb))return false;
  }
  return true;
}
function isCampusWalkable(x,y){
  if(!Number.isFinite(x)||!Number.isFinite(y))return false;
  if(x<7||x>94||y<26||y>98.5)return false;
  return campusOnMainRoad(x,y) && !CAMPUS_BLOCKED_AREAS.some(poly=>campusTouchesObstacle(x,y,poly));
}
function moveCampus(dx,dy,dt){
  if(!dx&&!dy)return;
  const norm=dx&&dy?Math.SQRT1_2:1;
  const vx=dx*CP.speed*dt*norm,vy=dy*CP.speed*dt*norm;
  // Substeps prevent tunneling through walls on slower machines or when frames are dropped.
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(vx),Math.abs(vy))/.45));
  for(let i=0;i<steps;i++){
    const nx=CP.x+vx/steps,ny=CP.y+vy/steps;
    if(isCampusWalkable(nx,CP.y))CP.x=nx;
    if(isCampusWalkable(CP.x,ny))CP.y=ny;
  }
}
function campusInteraction(i){
  const b=CAMPUS_LOCATIONS[i];if(!b)return;
  if(b.kind==='sector'){enterCampus(b.sector);return}
  if(b.kind==='hq'){
    openModal('<h3>Team HQ</h3><p>Welcome to Team HQ! Plan your biotech startup team here, then explore any of the five research buildings to recruit your specialists and begin the scenario quizzes.</p><p><strong>Next step:</strong> Approach a sector building and press E to build your six-person team.</p>');
    return;
  }
  openModal('<h3>Main Research Center</h3><p>The Research Center connects Bioquest’s five biotechnology fields: Pharma / Healthcare, Agricultural &amp; Environmental, Regulatory Science, Detection, and Marine.</p><p>Visit a field’s lab to select a team of six and try research decisions based on that field. Your answers shape your career compatibility profile.</p>');
}
function campusNearIndex(){
  let best=Infinity,chosen=-1;
  CAMPUS_LOCATIONS.forEach((p,i)=>{
    const d=Math.hypot((CP.x-p.x)*1.25,CP.y-p.y);
    if(d<best){best=d;chosen=i}
  });
  return best<6.8?chosen:-1;
}
function hub(){
  cancelAnimationFrame(campusRAF);
  Object.keys(K).forEach(k=>delete K[k]);
  CP.x=50;CP.y=72;G.nearCampus=-1;
  draw('th-hub',`<div class="hud campus-title-hud"><h3>Bioquest Research Campus</h3><span class="count">WASD / Arrows to walk · E to interact</span></div>
  <p>Follow the widest campus roads to each entrance, then press E to explore a lab, Team HQ, or the Main Research Center.</p>
  <div class="campus-hud"><span id="campus-msg" aria-live="polite">Stay on the wide roads; water, grass and buildings are off limits.</span><button class="btn alt" data-g="entry">Return to entrance</button></div>
  <div class="campus" id="campus" tabindex="0" aria-label="Pixel-art campus with walkable paths, building collisions and seven interactable locations.">
    ${CAMPUS_LOCATIONS.map((b,i)=>`<button class="campus-building" style="left:${b.x}%;top:${b.y}%" data-campus="${i}" aria-label="Interact with ${b.name}; stand nearby" title="${b.name}"><span>${b.short}</span></button>`).join('')}
<div class="campus-player" id="campus-player" style="left:${CP.x}%;top:${CP.y}%"><img src="character-placeholder.svg" alt="Player character"></div>  </div>
  <p class="campus-help note">Use WASD / arrow keys to move. Press E when close to a building entrance. Only the broad roads are walkable. Water, narrow trails, grass, and buildings are blocked.</p>`);

  const canvas=$('#campus'),player=$('#campus-player');
  campusLast=performance.now();
  const updateNear=()=>{
    G.nearCampus=campusNearIndex();
    const location=G.nearCampus>=0?CAMPUS_LOCATIONS[G.nearCampus]:null;
    $('#campus-msg').textContent=location?`Nearby: ${location.name} — press E to interact.`:'Follow the wide roads to a labeled entrance.';
    canvas.querySelectorAll('[data-campus]').forEach(b=>b.classList.toggle('near',+b.dataset.campus===G.nearCampus));
  };
  const loop=t=>{
    if(!$('#campus-player'))return;
    const dt=Math.min(.04,(t-campusLast)/1000);campusLast=t;
    const dx=(K.ArrowRight||K.d?1:0)-(K.ArrowLeft||K.a?1:0);
    const dy=(K.ArrowDown||K.s?1:0)-(K.ArrowUp||K.w?1:0);
    if(!$('#game').hidden&&(dx||dy)){
      moveCampus(dx,dy,dt);
      player.style.left=CP.x+'%';player.style.top=CP.y+'%';
      player.classList.add('walking');
      if(dx)player.style.transform=`translate(-50%,-50%) scaleX(${dx<0?-1:1})`;
    } else player.classList.remove('walking');
    updateNear();campusRAF=requestAnimationFrame(loop);
  };
  updateNear();canvas.focus({preventScroll:true});campusRAF=requestAnimationFrame(loop);
}
function enterCampus(i){
  if(!Number.isInteger(i)||i<0||i>=SECT.length)return;
  cancelAnimationFrame(campusRAF);
  G.sec=i;G.team=[];G.tr=[0,0,0,0,0];G.sourceTraitScores={};G.q=0;
  team();
}

/* ---- 3. team selection ---- */
function team(){
  const s=SECT[G.sec],n=G.team.length;
  draw(s.th,`<div class="hud"><h3>Build Your Team: ${s.n}</h3><span class="count" id="cnt">YOUR TEAM: ${n}/6</span></div>
  <p>Click an occupation to add it instantly. Click it again to remove it. Select six roles to continue.</p>
  <div class="roles">${s.roles.map((r,i)=>`<button class="role ${G.team.includes(i)?'in':''}" data-role="${i}" aria-pressed="${G.team.includes(i)}" ${n>=6&&!G.team.includes(i)?'disabled':''}>${r.n}</button>`).join('')}</div>
  <button class="btn" data-g="quiz" ${n<6?'disabled':''}>Continue to scenarios</button> <button class="btn alt" data-g="hub">Back to facility</button>`,s);
}
function toggleTeamRole(i){
  const roles=SECT[G.sec]?.roles;
  if(!roles||!Number.isInteger(i)||i<0||i>=roles.length)return;
  const found=G.team.indexOf(i);
  if(found>=0)G.team.splice(found,1);
  else if(G.team.length<6)G.team.push(i);
  team();
}

const QUIZ_AREAS = [
  {
    name: 'Pharma, Med, and Drug',
    scenarios: [
      {
        title: 'R&D finance',
        dialogue: '"We have been struggling to find investors for our product. We reached out to many investors, and venture capitalists. Although we already have a few, we do not have enough funding to continue in our product development." "The company officials informed us that their satisfactory requirements have tightened, and it needs to be worth investing in the long-run. We tried so many times, what should we do?"',
        answers: [
          ['Re-enter the lab, and collect stronger data in order to prove to investors through numbers its long-term efficacy', 'Scientific Curiosity', 'Precision'],
          ['We need to rethink what we have, sharpen our ideas, take a look at our pitch deck and make the model targeted to these corporate partners.', 'Strategic Thinking', 'Communication'],
          ['Decide to scratch your teams whole idea and start again', 'Innovation', 'Risk Taking'],
          ['Bring the research, business, and development team into one big meeting together and find a solution that addresses many concerns', 'Collaboration', 'Risk Taking']
        ]
      },
      {
        title: 'Testing',
        dialogue: `"Your startup has been testing a potential drug. Your team has collected weeks of data, however something doesn\'t add up: the drug works extremely well in one group of cells but barely works in the other". Quality Control Analyst: "We didn\'t expect this, we know our numbers are right, but we don\'t know what\'s causing this"`,
        answers: [
          ['Run another set of experiments to see if the same pattern happens again', 'Precision', 'Scientific Curiosity'],
          ['Go back to the results and scope for a pattern that would explain why the response are different', 'Analytical Thinking', 'Scientific Curiosity'],
          ['Take a step back, analyse whether this difference could be something useful about who the drug might be best for.', 'Impact Orientation', 'Clinical Thinking'],
          ['Closely investigate the two groups of cells for differences', 'Scientific Curiosity', 'Analytical Thinking']
        ]
      },
      {
        title: 'Manufacturing: inconsistency in batches',
        dialogue: `"We have been preparing for large-scale production. We have made so many batches of drugs but something's wrong: when we were storing the batches, we realized that the cell competency lost 55% of its viability!"`,
        answers: [
          ['Repeat stability tests under controlled storage conditions to confirm the 55% viability loss and document when it begins', 'Precision', 'Scientific Curiosity'],
          ['Investigate the storage conditions and biological mechanisms that may be causing the loss of viability', 'Scientific Curiosity', 'Analytical Thinking'],
          ['Redesign the formulation or storage process, then test whether the change improves viability', 'Innovation', 'Precision'],
          ['Bring quality control, manufacturing, and research together to identify the cause before scaling production', 'Collaboration', 'Analytical Thinking']
        ]
      },
      {
        title: 'FDA approval',
        dialogue: '"A product you and your team have been working on developing for the past few months finally makes it to the stage of getting FDA approval. The reviewers request additional documentation before making an official decision."',
        answers: [
          ['Review the request line by line and prepare a complete, well-organized response using the existing evidence', 'Precision', 'Analytical Thinking'],
          ['Run additional studies to address the evidence gaps identified by the reviewers', 'Scientific Curiosity', 'Precision'],
          ['Meet with the regulatory team to clarify the request and coordinate a response across departments', 'Communication', 'Collaboration'],
          ['Reassess the submission timeline and prioritize the missing documentation that is most important to the decision', 'Strategic Thinking', 'Impact Orientation']
        ]
      }
    ]
  },
  {
    name: 'Agricultural and Environmental',
    scenarios: [
      {
        title: 'Scenario #1: Drought-resistant corn',
        dialogue: 'We are trying to genetically engineer a corn line so it is drought-resistant. It turns out that the plant is able to grow under dry weather, but it produces 35% less seeds than expected because something malfunctioned with the edited gene.',
        answers: [
          ['Consider whether the trade-off could be useful in other environmental conditions and re-shape the purpose of the product', 'Impact Orientation', 'Innovation'],
          ['Redesign the experiment and test a different version of the genetic modification', 'Innovation', 'Scientific Curiosity'],
          ['Analyze the growth data to determine when the plants began performing differently to make connections', 'Analytical Thinking', 'Precision'],
          ['Closely examine what happened to the edited gene and determine why it affected seed production', 'Scientific Curiosity', 'Analytical Thinking']
        ]
      },
      {
        title: 'Scenario 2: Biofertilizer storage',
        dialogue: 'To help the drought-resilient corn to grow under these conditions, the team has developed a biofertilizer that can help absorb the soil. While we were trying to store the product, we learned it loses 65% of its viability when it is left for 30 days. How will we be able to prepare for large-scale production?',
        answers: [
          ['Monitor and Track storage temperature, moisture, and time metrics to find the exact point where the biofertilizer starts to degrade rapidly', 'Precision', 'Analytical Thinking'],
          ['Work with the supply chain logistics team to move the product quickly from production facility to farms', 'Impact Orientation', 'Innovation'],
          ['Redesign the formula or delivery systems so the biofertilizer stays stable in storing for longer periods of time', 'Innovation', 'Precision'],
          ['Investigate the chemical breakdown process in the lab to identify why the components derided after 30 days and what could be prevented', 'Scientific Curiosity', 'Analytical Thinking']
        ]
      },
      {
        title: 'Regulatory Block',
        dialogue: 'Midway through the regulation process, the agency changed their standards for gene-edited traits, demanding that our product needs stronger research to back up our idea.',
        answers: [
          ['Collect more evidence to proof long-term safety through analysing biological mechanisms', 'Scientific Curiosity', 'Precision'],
          ['Review the new regulatory criteria, comparing it to our dataset to identify any gaps', 'Precision', 'Analytical Thinking'],
          ['Outline new field trials to gather more evidence as needed for approval', 'Analytical Thinking', 'Impact Orientation'],
          ['Use the existing evidence into alternative regulatory frameworks or change the focus towards different markets with existing approvals', 'Impact Orientation', 'Innovation']
        ]
      },
      {
        title: 'Marketing',
        dialogue: 'Our drought-resistant corn is now ready to go into the market, but because production costs were so high, the seeds are priced 15% higher than the average hybrid crop. Thus, farmers are reluctant to buy the product.',
        answers: [
          ['Fix the manufacturing pipeline and see where we can cut costs per unit and lower the wholesale seed price', 'Precision', 'Innovation'],
          ['Calculate the long-term saving during drought years to demonstrate the return on investment (ROI) to farmers and hopefully convince them to buy the product', 'Analytical Thinking', 'Impact Orientation'],
          ['Survey farmers to understand their economic concerts and compare this behavior across regions to tailor our product back to their wants and needs', 'Scientific Curiosity', 'Precision'],
          ['Partner with insurance providers or create a money-back guarantee model tied to severe climate change effects', 'Innovation', 'Impact Orientation']
        ]
      },
      {
        title: 'Consumer brand backlash / sales',
        dialogue: 'We received results from our surveys from the people, and most farmers and consumers responded that they did not feel comfortable purchasing or consuming the product because it was genetically engineered.',
        answers: [
          ['Survey demographics and data to target specific regions or groups most open to biotechnology to focus marketing efforts on them', 'Analytical Thinking', 'Precision'],
          ['Launch a transparent campaign explaining the science and safety testing behind the gene editing to alleviate any concerns', 'Precision', 'Scientific Curiosity'],
          ['To build trust, host Q&A sessions and interactive workshops to hear concerns from the communities directly', 'Scientific Curiosity', 'Impact Orientation'],
          ['Re-evaluate the product strategy to focus on non-food applications', 'Impact Orientation', 'Innovation']
        ]
      }
    ]
  },
  {
    name: 'Regulatory',
    scenarios: [
      {
        title: 'R&D: Selecting target training database',
        dialogue: 'The team wants to develop an AI monitoring platform that tracks gene-edited organisms in environmental and industrial settings to ensure they align with global regulatory standards. Before writing the code for the AI platform, we need to define what it needs to look for? Project Manager: How do we select our target training database?',
        answers: [
          ['Build a more advanced AI model that predicts many possible artificial gene edits, even if that takes extra years so code', 'Scientific Curiosity', 'Innovation'],
          ['Stick strictly to official government databases that list known high-risk pathogens and GMOs to ensure legal alignment', 'Precision', 'Analytical Thinking'],
          ['Use an open-source DNA library to build a working prototype and launch the software onto the market faster', 'Impact Orientation', 'Innovation'],
          ['Partner with universities and organizations to create a free, crowdsourced genetic database open to all researchers', 'Innovation', 'Scientific Curiosity']
        ]
      },
      {
        title: 'Scenario 2: False alerts in field tests',
        dialogue: 'During early field tests around the lab, the model misinterprets harmless soil bacteria that is naturally occurring as an invasive gene-edited crop, triggering a false alert and panic system. How can we fix the system?',
        answers: [
          ['Rewrite the core algorithm using another DNA verification filter to eliminate this problem', 'Innovation', 'Analytical Thinking'],
          ['Add a mandatory manual review step where a human biosafety officer must verify alerts before notifying authorities', 'Precision', 'Impact Orientation'],
          ['Lower the sensitivity setting so the software only flags exact matches, avoiding costly false alarms', 'Impact Orientation', 'Precision'],
          ['Look into the genomic data of the bacteria in the soil to identify specific base pairs causing this', 'Analytical Thinking', 'Scientific Curiosity']
        ]
      },
      {
        title: 'Scenario 3: DNA privacy vs inspection',
        dialogue: 'Biotech companies voice that if they use our platform demand that their valuable DNA sequences must be encrypted. However, government inspectors say they would need full visibility into their DNA feeds to verify safety.',
        answers: [
          ['Make a secure, high-clearance workflow where only third-party inspectors can view decrypted data', 'Analytical Thinking', 'Precision'],
          ['Host a roundtable between tech executives and regulators to draft a data privacy standard', 'Impact Orientation', 'Scientific Curiosity'],
          ['Implement cryptographic proofs so regulators can verify compliance without viewing the raw sequence data', 'Innovation', 'Precision'],
          ['Design a standard, anonymized data summary that satisfies regulatory requirements while hiding proprietary code', 'Precision', 'Analytical Thinking']
        ]
      },
      {
        title: 'Scenario 4: Different regulatory classifications',
        dialogue: 'European regulators claim our product as a heavy-duty "biosecurity device" requiring 3 more years of testing before anyone can use it. US regulators treat it as an software "Data Analytics tool" and it can be put into the market. Market person: We really want to prioritize market expansion, what can we do?',
        answers: [
          ['Create two distinct softwares, one biosecurity version for Europe and an analytics version for the US', 'Innovation', 'Analytical Thinking'],
          ['Work directly with European regulators to change testing protocols and get approval through targeted safety data', 'Precision', 'Scientific Curiosity'],
          ['Conduct a detailed regulatory impact assessment to evaluable long-term brand positioning and legal risks across both markets if we release the product now or wait.', 'Analytical Thinking', 'Precision'],
          ['Launch immediately into the US to quickly gain revenue and feedback while running European trials at the same time', 'Impact Orientation', 'Innovation']
        ]
      },
      {
        title: 'Scenario 5: Pricing for smaller labs',
        dialogue: 'Smaller university labs and startups complain that the subscription fees are too expensive, but bigger companies can afford the software. How can we handle pricing?',
        answers: [
          ['Analyze user usage data across tier sizes to make a flexible plan where they pay per scan, so they don\'t have to buy a full subscription', 'Analytical Thinking', 'Precision'],
          ['Partner with agencies for grants to subsidize software licenses', 'Scientific Curiosity', 'Impact Orientation'],
          ['Introduce a tiered pricing model that offers free tools to academic labs while charging higher prices for more advanced features', 'Impact Orientation', 'Innovation'],
          ['Reduce the amount of features and introduce software packages to tailor to smaller labs and project', 'Innovation', 'Precision']
        ]
      }
    ]
  },
  {
    name: 'Detection',
    scenarios: [
      {
        title: 'Scenario 1: Sequencer accuracy in blood samples',
        dialogue: 'Manager: We will engineer a portable DNA sequencer to identify unknown bacterial pathogens in clinical samples efficiently and in a timely manner. It turned out that while the sequencing chemistry works well on pure bacterial cultures, the instrument misidentifies sequences 35% of the time when processing complex human blood samples. Bioinformatic: What do we do?',
        answers: [
          ['Fix and correct the lab sample extraction protocols to clean and isolate the bacterial DNA before it enters the channel', 'Precision', 'Analytical Thinking'],
          ['Investigate the chemical binding behavior in the blood components to understand why the reading accuracy is lower than expected', 'Scientific Curiosity', 'Innovation'],
          ['Train a new bioinformatics model to filter out human DNA contamination before analyzing the bacterial sequences', 'Innovation', 'Precision'],
          ['Examine the error logs to pinpoint which genomic regions are most misidentified in blood matches', 'Analytical Thinking', 'Scientific Curiosity']
        ]
      },
      {
        title: 'Scenario 2: Silicon chip supply setback',
        dialogue: 'In our sequencer it needs specialized sensors and our factory relied on pure, high-grade silicon chips. While scaling up, our primary supplier experienced a major production setback, resulting in a 58% supply drop. How will we be able to prepare for large-scale production',
        answers: [
          ['Run more precise stress tests on lower-grade chips to identity which quality standard we need for reliable performance', 'Analytical Thinking', 'Precision'],
          ['Negotiate priority contracts with different global foundries and adjust assembly timelines to match supply rates', 'Impact Orientation', 'Precision'],
          ['Research alternate semiconductor materials to see if it can replace our silicon sensors', 'Scientific Curiosity', 'Innovation'],
          ['Redesign the sensor so it can use widely available, standard grade silicon to cut costs without sacrificing performance.', 'Innovation', 'Impact Orientation']
        ]
      },
      {
        title: 'Scenario 3: Rare mutation accuracy standards',
        dialogue: 'Midway through the process, the regulatory agency updated its standards for sequencing platforms, demanding that our instrument needs to have a higher accuracy rate on rare genomic mutation before getting official approval.',
        answers: [
          ['Engage with regulatory officers to petition for a phased approval process based on primary clinical use cases', 'Impact Orientation', 'Innovation'],
          ['Research biochemical mechanisms behind the mutation miscalls to improve base accuracy', 'Scientific Curiosity', 'Analytical Thinking'],
          ['Design targeted studies focused on low-frequency, rare genomic mutations to satisfy agency demands', 'Precision', 'Impact Orientation'],
          ['Re-analyze existing sequencing validation data using stricter statistical standards to prove current accuracy limits', 'Analytical Thinking', 'Precision']
        ]
      },
      {
        title: 'Scenario 4: Sequencer launch price',
        dialogue: 'Our DNA sequencer is now ready to be launched into the market. However, that supply setback and using those high-grade chips made the manufacturing cost super high. The instrument is now priced 20% more than traditional competitors. How do we fix this',
        answers: [
          ['Re-engineer the device body and storing components to cut total manufacturing costs by 15%', 'Precision', 'Innovation'],
          ['Launch a trade-in program of leasing equipment model to reduce upfront costs', 'Impact Orientation', 'Innovation'],
          ['Build a Return on Investment projection models to show how effective and faster diagnosis speeds reduce overall hospital stay costs to justify', 'Analytical Thinking', 'Impact Orientation'],
          ['Conduct market research to determine which diagnostic features clinicians value most and tailor our product to that', 'Scientific Curiosity', 'Precision']
        ]
      },
      {
        title: 'Scenario 5: Pricing for smaller labs',
        dialogue: 'Smaller companies, startups, and universities are reluctant to purchase our product because of the costs and deem it unfair because it seems only bigger companies can afford it. We really prioritize market expansion, and we know the impact it can have, how can we fix this.',
        answers: [
          ['Track costs per run across different lab sizes to make a tiered pay per sample pricing', 'Analytical Thinking', 'Precision'],
          ['Create grant partnerships and academic discount programs for resource-constrained research centers to increase market expansion', 'Impact Orientation', 'Precision'],
          ['Survey startup labs to understand their operational limits beyond the purchase price', 'Scientific Curiosity', 'Analytical Thinking'],
          ['Make a model where smaller labs can rent processing capacity on demand rather than buying a subscription or units', 'Innovation', 'Impact Orientation']
        ]
      }
    ]
  },
  {
    name: 'Marine',
    scenarios: [
    {
        "title": "Scenario 1: Deep-sea kelp enzyme extraction",
        "dialogue": "“We are trying to extract and synthesize a growth enzyme from deep-sea kelp to create a biostimulant that maximizes ocean crop growth. It turns out that while the enzyme yields plant growth significantly, the current process to extract the kelp damages 40% of active proteins, making the yield far less than expected.”",
        "answers": [
            [
                "Refine temperature and pH controls step-by-step during processing to preserve protein stability",
                "Precision",
                "Analytical Thinking"
            ],
            [
                "Study the structural properties of the deep-sea enzymes to understand why pressure changes disrupt their viability",
                "Scientific Curiosity",
                "Innovation"
            ],
            [
                "Develop a low-shear extraction method that protects protein structure during harvest",
                "Innovation",
                "Precision"
            ],
            [
                "Map protein points throughout the extraction pipeline to identify where damage occurs",
                "Analytical Thinking",
                "Scientific Curiosity"
            ]
        ],
        "speaker": "Manager"
    },
    {
        "title": "Scenario 2: Biostimulant storage",
        "dialogue": "“For storing our biostimulant, technicians from our team used large outdoor tanks to cultivate the algae host. However, while storing the batches, we learned that the product loses 50% of its viability within 20 days. How will we be able to prepare large-scale production?”",
        "answers": [
            [
                "Redesign the storage containers with automated climate controls and bio-preservative formulations to maximize shelf life",
                "Innovation",
                "Precision"
            ],
            [
                "Change the cultivation model so the product is grown closer to local ocean farmers, cutting storage times",
                "Impact Orientation",
                "Innovation"
            ],
            [
                "Perform daily degradation assays to model when the batch's viability starts to decline under different storage conditions",
                "Precision",
                "Analytical Thinking"
            ],
            [
                "Investigate the metabolic pathways of the algae host to know why active compounds break down rapidly in storage",
                "Scientific Curiosity",
                "Analytical Thinking"
            ]
        ],
        "speaker": "Cultivation Lead"
    },
    {
        "title": "Scenario 3: Coastal runoff safety",
        "dialogue": "“Through our environmental safety review, the regulatory agency informed us that they have updated their rules regarding ocean-harvested materials. They explicitly told us that our product needs more proof that it leaves less than 10% of residues in coastal runoff before approval.\n\nRegulatory person: 'With this updated policy, this would slow us down by several years, maybe even 4!'”",
        "answers": [
            [
                "Design precise runoff simulation models and environmental assays to gather residue evidence required",
                "Precision",
                "Analytical Thinking"
            ],
            [
                "Reformulate the compound so it binds more tightly to ocean crops and naturally breaks down in water faster",
                "Innovation",
                "Precision"
            ],
            [
                "Work with environmental regulators to establish a real-time coastal monitoring program in place of long delays",
                "Impact Orientation",
                "Innovation"
            ],
            [
                "Research the biological degradation rates of the residue in natural marine environments to demonstrate ecological safety",
                "Scientific Curiosity",
                "Analytical Thinking"
            ]
        ],
        "speaker": "Regulatory Rep"
    },
    {
        "title": "Scenario 4: Biostimulant market price",
        "dialogue": "“Our product is finally ready to enter the market after long periods of testing. Since the research and development phase, testing, processing, and harvesting was very costly, our final product is priced 20% higher than traditional chemical alternatives.\n\nMarketing Analyst: 'Now people are reluctant to buy it, and we need more buyers to get profit to recuperate from the costs!'”",
        "answers": [
            [
                "Conduct controlled field trials to calculate crop yield improvements and demonstrate long-term ROI to ocean farmers",
                "Analytical Thinking",
                "Impact Orientation"
            ],
            [
                "Create a risk-sharing trial program where farmers pay a reduced rate until harvest goals are successfully met",
                "Impact Orientation",
                "Innovation"
            ],
            [
                "Streamline processing steps to reduce total production overhead and bring retail pricing down toward chemical alternatives",
                "Precision",
                "Innovation"
            ],
            [
                "Analyze farm purchasing habits to target high-yield aquaculture sectors that are less price-sensitive",
                "Scientific Curiosity",
                "Precision"
            ]
        ],
        "speaker": "Marketing Analyst"
    },
    {
        "title": "Scenario 5: Concerns about kelp harvesting",
        "dialogue": "“From our marketing surveys, results show that many responded that they were uncomfortable with using the product because they believe harvesting deep-sea kelp harms coral reefs and ocean ecosystems. How do we change the perspective?”",
        "answers": [
            [
                "Launch a public transparency campaign demonstrating sustainable off-shore aquaculture harvesting methods",
                "Precision",
                "Impact Orientation"
            ],
            [
                "Shift primary sourcing to land-based bioreactors that synthesize the enzyme without harvesting wild kelp beds",
                "Innovation",
                "Impact Orientation"
            ],
            [
                "Publish independent ecological impact data showing zero harm to nearby reef systems during harvest operations",
                "Analytical Thinking",
                "Precision"
            ],
            [
                "Host community panels with ocean conservation groups to gather feedback and co-design sustainable harvesting guidelines",
                "Scientific Curiosity",
                "Impact Orientation"
            ]
        ],
        "speaker": "PR Lead"
    }
]
  }
];

const QUIZ_TRAIT_MAP = {
  'Innovation': 0, 'Risk Taking': 0,
  'Analytical Thinking': 1, 'Strategic Thinking': 1, 'Impact Orientation': 1, 'Clinical Thinking': 1,
  'Collaboration': 2,
  'Communication': 3,
  'Scientific Curiosity': 4, 'Precision': 4, 'Quality': 4
};

const quizAreaIndex = sector => ({
  0: 0, // Pharma
  1: 1, // Agri / Env
  2: 2, // Regulatory
  3: 3, // Detection -> QUIZ_AREAS[3] (Detection)
  4: 4  // Marine -> QUIZ_AREAS[4] (Marine)
})[sector] ?? 0;


/* Marine decision-simulator companion content, adapted from marinegame.txt. */
const MARINE_ARCHETYPES = {"Precision":{"title":"Marine Precision Strategist","focus":"Process Optimization & Quality Assurance","desc":"You excel at structured optimization, meticulous controls, and operational rigor.","analysis":"You prioritize procedural controls, standardized daily assays, overhead cost trimming, and verified operational transparency."},"Analytical Thinking":{"title":"Analytical Marine Scientist","focus":"Diagnostic Modeling & Empirical Data","desc":"You navigate complex ocean biotechnology challenges through rigorous data and trial metrics.","analysis":"You consistently choose diagnostic protein mapping, runoff simulation modeling, crop ROI calculation, and independent ecological audits."},"Scientific Curiosity":{"title":"Curious Marine Researcher","focus":"Biological Kinetics & Discovery","desc":"Driven by deep scientific inquiry, you seek to understand underlying cellular mechanics.","analysis":"Your decisions highlight enzyme structural properties, host metabolic pathways, natural marine degradation rates, and community panel dialogue."},"Innovation":{"title":"Oceanic Innovator","focus":"Breakthrough Biosynthesis & Hardware","desc":"You bypass industry bottlenecks by re-engineering physical systems and smart automated storage.","analysis":"You pioneer low-shear harvesting, fast-degrading chemical reformulations, smart automated climate storage, and land-based bioreactors."},"Impact Orientation":{"title":"Impact-Driven Aquaculturist","focus":"Coastal Partnerships & Adoption","desc":"You prioritize market adoption, coastal farmer partnerships, and collaborative regulatory monitoring.","analysis":"You focus on real-world impact by bringing production closer to ocean farmers, real-time regulatory monitoring, risk-sharing trials, and conservation co-design."}};
let marineChoicesHistory = [];
function escapeMarineText(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}
function marineFeedback(choiceIndex){
  const area=QUIZ_AREAS[4], scene=area.scenarios[G.q], a=scene.answers[choiceIndex];
  marineChoicesHistory.push({scenario:G.q+1,speaker:scene.speaker,letter:'ABCD'[choiceIndex],answer:a[0],primary:a[1],secondary:a[2]});
  draw(SECT[G.sec].th,`<div class="prof glass marine-feedback">
    <p class="note">Marine Decision Simulator · Scenario ${G.q+1} of ${area.scenarios.length}</p>
    <h3>Decision Recorded</h3><p>${escapeMarineText(a[0])}</p>
    <h4>Competency points earned</h4>
    <div class="marine-point-tags"><span>+3 ${escapeMarineText(a[1])}</span><span>+1 ${escapeMarineText(a[2])}</span></div>
    <p class="note">There is no single correct choice. Each decision contributes to your competency profile.</p>
    <button class="btn" data-g="marine-next">${G.q+1===area.scenarios.length?'View your results':'Continue to next scenario'}</button>
  </div>`,SECT[G.sec]);
}
function marineAdvance(){
  if(++G.q<QUIZ_AREAS[4].scenarios.length)quiz();
  else {G.res[G.sec]=compat(G.sec,G.tr,G.team);result(G.sec);}
}
function marineResultsPanel(){
  const entries=Object.entries(MARINE_ARCHETYPES);
  const ordered=entries.map(([name,meta])=>({name,meta,points:G.sourceTraitScores[name]||0})).sort((a,b)=>b.points-a.points);
  const winner=ordered[0], max=Math.max(1,...ordered.map(x=>x.points));
  return `<div class="prof glass marine-results">
    <p class="note">Marine Biostimulant Assessment · 5 scenarios completed</p>
    <h3>${escapeMarineText(winner.meta.title)}</h3><p>${escapeMarineText(winner.meta.desc)}</p>
    <p><strong>Strategic focus:</strong> ${escapeMarineText(winner.meta.focus)}</p>
    <p>${escapeMarineText(winner.meta.analysis)}</p>
    <h4>Competency profile</h4>
    ${ordered.map(x=>`<div class="marine-score"><span>${escapeMarineText(x.name)}</span><div class="bar2"><i style="width:${Math.round(100*x.points/max)}%"></i></div><b>${x.points} pts</b></div>`).join('')}
    <details><summary>Review all five decisions</summary>
      ${marineChoicesHistory.map(x=>`<p><strong>Scenario ${x.scenario} · ${escapeMarineText(x.speaker)} · ${x.letter}</strong><br>${escapeMarineText(x.answer)}<br><small>+3 ${escapeMarineText(x.primary)}; +1 ${escapeMarineText(x.secondary)}</small></p>`).join('')}
    </details>
  </div>`;
}
/* ---- 4. scenario quiz ---- */
function quiz(){
  const area=QUIZ_AREAS[quizAreaIndex(G.sec)]||QUIZ_AREAS[0],q=area.scenarios[G.q];
  if (!q) { result(G.sec); return; }
  const answers = Array.isArray(q.answers) ? q.answers : [];
  draw(SECT[G.sec].th,`<div class="hud"><h3>${area.name}</h3><span class="count">Scenario ${G.q+1}/${area.scenarios.length}</span></div>
  ${say(PERSON_SPRITE[G.sec],SECT[G.sec].m,q.title,`<p>${q.dialogue}</p><div class="ans">${answers.map((a,i)=>`<button data-ans="${i}">${String.fromCharCode(65+i)}. ${a[0]}</button>`).join('')}</div>`)}`,SECT[G.sec]);
}

/* ---- 5. results ---- */
function compat(i,tr,tm){
  const s=SECT[i],t=tr.slice();tm.forEach(k=>t[s.roles[k].t[0]]+=1);
  const o=[...t].sort((a,b)=>b-a),den=2*o[0]+o[1]||1;
  return{t,list:s.roles.map(r=>({r,p:Math.min(100,Math.round(100*(2*t[r.t[0]]+t[r.t[1]])/den))})).sort((a,b)=>b.p-a.p)};
}
function result(i){
  const s=SECT[i],{t,list}=G.res[i]||compat(i,G.tr,G.team),best=list[0],top=t.map((v,k)=>[v,k]).sort((a,b)=>b[0]-a[0]),mx=top[0][0]||1;
  draw(s.th,`<div class="prof glass"><p class="note">${s.n} · your best-fit career match</p>
  <div class="best">${best.r.n} · ${best.p}%</div><p>${best.r.d} Typical education: ${best.r.e}.</p>
  <h4>Compatibility across ${s.n} roles</h4>
  ${list.slice(0,6).map(x=>`<div class="pct"><span>${x.r.n}</span><div class="bar2"><i style="width:${x.p}%"></i></div><b>${x.p}%</b></div>`).join('')}
  ${i===4?marineResultsPanel():''}
  <h4>Explore your career pathway</h4>
  <p class="note">Choose a step to see how careers can progress in this sector.</p>
  <div class="path-steps" aria-label="Career pathway steps">${s.path.replace(/\.$/,'').split(/,\s*then\s*/i).map((p,index)=>`<button class="path-step" data-path-step="${index}" aria-pressed="${index===0}">Step ${index+1}</button>`).join('')}</div>
  <p id="career-step-detail" class="career-step-detail" aria-live="polite">${s.path.replace(/\.$/,'').split(/,\s*then\s*/i)[0]}</p>
  <h4>Training &amp; education programs to explore</h4><ul>${s.prog.map(p=>`<li>${p}</li>`).join('')}</ul></div>
  <p style="text-align:center"><button class="btn" data-g="hub">Explore another sector</button> <button class="btn alt" data-g="restart">Play again</button></p>`,s);
}

/* ---- events ---- */
stage.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;const d=t.dataset;
  if(d.campus!==undefined){if(G.nearCampus===+d.campus)campusInteraction(+d.campus);else $('#campus-msg').textContent='Walk up to this entrance before interacting.';return}
  if(d.pathStep!==undefined){
    const steps=SECT[G.sec].path.replace(/\.$/,'').split(/,\s*then\s*/i);
    const idx=+d.pathStep,detail=$('#career-step-detail');
    if(detail&&steps[idx]){detail.textContent=steps[idx];stage.querySelectorAll('[data-path-step]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.pathStep===idx)))}
    return;
  }
  if(d.role!==undefined)toggleTeamRole(+d.role);
  else if(d.ans!==undefined){
    const area=QUIZ_AREAS[quizAreaIndex(G.sec)]||QUIZ_AREAS[0],scenario=area.scenarios[G.q],a=scenario && scenario.answers && scenario.answers[+d.ans];
    if (!a || !Array.isArray(a)) return;
    G.sourceTraitScores[a[1]]=(G.sourceTraitScores[a[1]]||0)+3;G.sourceTraitScores[a[2]]=(G.sourceTraitScores[a[2]]||0)+1;
    if (QUIZ_TRAIT_MAP[a[1]] !== undefined) G.tr[QUIZ_TRAIT_MAP[a[1]]]+=3;
    if (QUIZ_TRAIT_MAP[a[2]] !== undefined) G.tr[QUIZ_TRAIT_MAP[a[2]]]+=1;
    if(G.sec===4){marineFeedback(+d.ans)}
    else if(++G.q<area.scenarios.length)quiz();else{G.res[G.sec]=compat(G.sec,G.tr,G.team);result(G.sec)}}
  else if(d.g){if(d.g==='marine-next'){marineAdvance();return;} if(d.g==='quiz'&&G.sec===4&&G.q===0)marineChoicesHistory=[]; ({hub,quiz,entry,restart:()=>{G.res={};entry()}})[d.g]()}
});
entry();

/* ================= MAP ================= */
const COUNTY_GEOMETRIES = [{"name":"Atlantic","path":"M362.2,714.9 L348.9,721.6 L327.8,736.6 L320.9,736.9 L316.1,733.3 L307.4,739.1 L302.4,738.0 L299.0,740.4 L297.5,739.6 L297.8,737.6 L295.2,737.4 L293.6,740.3 L292.7,737.5 L287.4,740.2 L286.2,738.4 L282.6,739.3 L281.7,737.1 L274.9,738.4 L272.2,736.8 L266.7,737.0 L265.0,734.2 L254.6,734.9 L251.3,731.6 L245.3,730.1 L244.6,727.2 L245.6,716.0 L247.7,710.8 L246.0,704.7 L247.5,699.3 L246.6,695.1 L213.3,664.9 L277.5,592.8 L295.6,609.1 L298.6,627.4 L300.4,627.0 L302.5,628.8 L304.2,627.2 L305.3,629.6 L307.0,627.4 L315.6,632.4 L319.0,636.9 L324.6,637.1 L327.9,641.3 L328.6,644.9 L331.5,646.6 L334.7,645.1 L337.5,646.6 L340.2,651.0 L343.3,650.4 L344.9,652.6 L348.1,651.0 L349.9,654.0 L351.9,650.0 L353.2,651.2 L352.4,653.8 L354.8,656.2 L354.5,651.9 L359.8,650.7 L369.3,670.3 L380.4,667.5 L386.9,669.9 L386.6,671.9 L389.6,676.9 L389.0,679.4 L381.1,692.6 L372.8,702.6 L362.6,710.8 L362.2,714.9Z","x":291.0,"y":666.2},{"name":"Bergen","path":"M486.5,198.3 L477.1,221.7 L471.5,231.7 L463.1,222.8 L458.2,228.1 L451.9,228.9 L447.7,232.1 L444.5,237.7 L444.2,243.8 L442.9,243.7 L441.5,239.1 L439.3,238.6 L437.1,241.0 L434.7,240.5 L429.5,235.5 L431.8,230.9 L432.3,224.6 L435.8,222.1 L436.9,210.6 L439.1,212.0 L440.0,210.6 L437.9,205.5 L434.0,201.5 L433.0,197.0 L434.1,189.9 L431.6,188.7 L431.6,185.1 L429.3,182.5 L431.2,174.1 L423.6,168.1 L423.4,170.4 L409.5,168.8 L403.4,165.2 L397.2,156.3 L412.5,116.6 L492.1,163.4 L494.9,163.5 L486.5,198.3Z","x":460.8,"y":178.3},{"name":"Burlington","path":"M206.6,494.8 L227.0,478.9 L233.0,478.3 L245.4,473.8 L247.0,470.6 L252.0,467.0 L255.3,459.3 L264.9,461.4 L271.7,456.8 L276.4,456.4 L285.2,447.5 L285.7,445.0 L284.3,445.7 L283.5,442.7 L286.3,439.8 L293.5,443.5 L292.7,445.9 L296.7,446.3 L304.1,451.7 L306.5,451.7 L307.0,454.4 L315.8,455.4 L366.9,578.2 L366.8,637.6 L364.1,645.7 L359.5,646.9 L360.7,649.0 L359.8,650.7 L354.5,651.9 L355.2,656.0 L352.4,653.8 L352.5,650.2 L350.9,650.4 L349.9,654.0 L348.1,651.0 L344.9,652.6 L343.3,650.4 L340.2,651.0 L337.5,646.6 L334.7,645.1 L331.5,646.6 L328.6,644.9 L327.9,641.3 L324.6,637.1 L319.0,636.9 L315.6,632.4 L307.0,627.4 L305.3,629.6 L304.2,627.2 L302.5,628.8 L300.4,627.0 L298.6,627.4 L297.4,625.8 L297.1,613.3 L293.1,605.7 L268.1,585.8 L259.2,574.8 L251.6,572.5 L241.3,575.4 L236.4,574.6 L234.4,572.2 L227.0,539.8 L222.5,536.2 L219.4,529.3 L213.7,526.6 L215.6,522.3 L209.9,522.1 L205.6,520.0 L206.1,516.6 L204.4,512.3 L206.8,508.8 L204.6,505.6 L200.4,503.4 L194.0,504.8 L197.3,499.0 L206.6,494.8Z","x":294.2,"y":556.0},{"name":"Camden","path":"M173.3,539.5 L176.5,531.7 L174.3,524.2 L175.9,515.9 L181.6,512.0 L190.9,508.5 L194.0,504.8 L202.4,504.1 L206.8,508.8 L204.4,512.3 L206.1,516.6 L205.6,520.0 L209.9,522.1 L215.6,522.3 L213.7,526.6 L219.4,529.3 L222.5,536.2 L227.0,539.8 L234.4,572.2 L236.4,574.6 L241.3,575.4 L251.6,572.5 L259.2,574.8 L268.1,585.8 L277.5,592.8 L241.2,633.6 L234.5,625.7 L232.5,618.8 L233.0,614.5 L227.4,605.9 L220.0,601.8 L212.8,600.7 L210.9,597.4 L203.3,592.6 L203.8,587.3 L198.3,582.1 L195.3,574.7 L193.1,574.0 L190.3,578.0 L189.4,575.7 L187.0,576.1 L188.3,572.3 L190.7,571.5 L190.7,568.4 L186.6,564.3 L188.0,555.2 L182.4,550.9 L182.1,548.0 L180.3,549.3 L179.0,546.6 L178.8,548.2 L177.4,545.1 L178.3,544.9 L175.6,543.3 L176.1,541.2 L173.3,539.5Z","x":212.3,"y":569.9},{"name":"Cape May","path":"M223.5,828.9 L235.8,803.6 L238.9,788.7 L238.6,783.7 L233.9,778.3 L231.4,777.4 L231.7,774.0 L229.5,773.7 L230.4,771.8 L228.6,771.0 L228.7,763.8 L229.6,761.7 L236.0,758.4 L239.9,733.9 L244.4,728.5 L245.3,730.1 L251.3,731.6 L254.6,734.9 L265.0,734.2 L266.7,737.0 L272.2,736.8 L274.9,738.4 L281.7,737.1 L282.6,739.3 L286.2,738.4 L287.4,740.2 L292.7,737.5 L293.6,740.3 L295.2,737.4 L297.8,737.6 L297.5,739.6 L299.0,740.4 L302.4,738.0 L307.4,739.1 L316.1,733.3 L320.9,736.9 L327.4,736.1 L322.8,743.7 L313.2,750.4 L300.7,766.0 L299.4,770.4 L294.3,776.7 L283.2,796.7 L285.4,802.3 L277.0,811.6 L266.6,828.8 L263.0,839.1 L256.1,843.3 L244.4,856.3 L239.8,855.8 L230.0,860.0 L217.9,858.6 L216.7,856.3 L223.5,828.9Z","x":261.7,"y":792.7},{"name":"Cumberland","path":"M181.8,766.2 L173.6,776.6 L166.6,769.3 L166.9,764.4 L163.7,755.7 L159.9,754.7 L156.3,749.1 L147.1,745.3 L144.5,736.7 L139.4,735.3 L134.9,740.1 L128.1,733.1 L123.3,721.5 L117.7,720.7 L115.3,722.8 L108.8,717.2 L106.4,710.1 L104.0,707.5 L102.7,708.5 L101.9,707.5 L101.6,704.9 L104.3,704.6 L103.3,702.9 L104.9,701.4 L103.4,700.4 L102.5,701.7 L101.2,699.5 L104.1,694.9 L101.4,692.5 L103.7,691.0 L101.9,690.4 L103.9,688.9 L102.4,685.8 L106.3,682.5 L114.5,684.3 L118.9,679.4 L121.1,673.0 L125.3,673.7 L127.4,672.5 L147.6,650.0 L187.8,684.1 L190.5,674.7 L188.9,669.4 L190.8,661.7 L190.3,654.9 L193.5,646.9 L246.6,695.1 L247.5,699.3 L246.0,704.7 L247.7,710.8 L244.3,723.8 L245.3,728.7 L239.9,733.9 L236.0,758.4 L229.6,761.7 L228.7,763.8 L228.6,771.0 L230.2,771.2 L229.5,773.7 L231.7,774.0 L232.2,777.1 L215.6,772.5 L202.7,772.1 L203.4,768.4 L200.3,764.8 L187.2,767.2 L181.8,766.2Z","x":177.3,"y":714.0},{"name":"Essex","path":"M432.3,224.6 L431.6,231.9 L424.7,248.8 L425.8,252.7 L427.5,253.5 L432.1,250.8 L437.2,251.4 L436.2,257.8 L438.4,263.9 L432.3,273.6 L425.6,268.4 L415.5,269.5 L410.1,262.5 L393.9,257.4 L389.6,260.4 L386.0,258.4 L383.5,259.1 L375.8,253.0 L371.6,251.6 L372.8,248.1 L375.3,246.3 L372.8,244.1 L371.0,245.2 L370.2,244.1 L371.8,243.1 L373.1,232.6 L377.5,226.5 L379.9,226.5 L381.3,224.6 L383.5,215.9 L382.4,214.1 L385.6,208.7 L381.6,207.3 L380.7,208.2 L380.3,207.0 L381.3,205.8 L379.8,203.8 L380.1,198.8 L382.5,193.8 L385.4,194.2 L385.3,195.6 L392.3,194.9 L392.4,196.8 L394.8,196.4 L394.1,198.4 L397.7,197.8 L400.5,202.3 L405.5,203.5 L416.8,210.5 L434.0,224.0 L432.3,224.6Z","x":400.8,"y":237.9},{"name":"Gloucester","path":"M146.6,550.9 L160.6,542.1 L170.6,541.5 L173.3,539.5 L176.1,541.2 L175.6,543.3 L178.3,544.9 L177.4,545.1 L178.8,548.2 L179.0,546.6 L180.3,549.3 L182.1,548.0 L182.4,550.9 L188.0,555.2 L186.6,564.3 L190.7,568.4 L190.7,571.5 L188.3,572.3 L187.0,576.1 L189.4,575.7 L190.3,578.0 L193.1,574.0 L195.3,574.7 L198.3,582.1 L203.8,587.3 L203.3,592.6 L210.9,597.4 L212.8,600.7 L225.0,604.0 L233.0,614.5 L234.1,624.8 L241.2,633.6 L213.3,664.9 L157.9,614.0 L149.4,615.7 L145.4,614.6 L144.6,610.7 L141.9,609.0 L135.5,609.6 L130.1,606.3 L125.2,606.2 L125.5,604.1 L116.4,598.4 L112.4,594.1 L112.2,587.8 L107.3,584.6 L108.9,582.5 L107.1,582.2 L106.6,583.5 L104.7,581.5 L107.5,578.0 L106.2,578.3 L105.6,575.1 L104.1,575.6 L104.2,573.5 L95.7,575.7 L104.9,570.5 L102.3,568.7 L121.3,553.8 L146.6,550.9Z","x":170.8,"y":602.3},{"name":"Hudson","path":"M464.0,245.6 L461.2,261.7 L457.6,261.3 L449.9,278.4 L443.3,282.0 L430.6,284.7 L425.9,283.9 L438.4,263.9 L436.2,257.8 L437.2,251.4 L432.1,250.8 L427.5,253.5 L425.3,251.6 L425.1,245.8 L429.5,235.5 L434.7,240.5 L437.1,241.0 L439.3,238.6 L441.5,239.1 L442.9,243.7 L444.2,243.8 L444.5,237.7 L447.7,232.1 L451.9,228.9 L458.2,228.1 L464.0,223.0 L464.3,225.4 L471.5,231.7 L464.0,245.6Z","x":449.4,"y":255.6},{"name":"Hunterdon","path":"M159.2,306.2 L160.3,301.8 L164.3,299.3 L167.7,293.0 L170.8,292.0 L171.9,289.2 L181.1,285.7 L196.9,271.9 L205.2,266.8 L208.6,267.1 L214.8,261.2 L217.3,261.5 L227.4,247.4 L234.6,240.5 L234.1,237.4 L237.9,235.0 L254.9,250.5 L261.6,250.6 L269.4,252.9 L281.7,259.8 L282.8,264.8 L280.8,269.2 L282.3,270.4 L281.1,275.1 L279.0,276.7 L281.9,281.3 L280.0,287.9 L283.5,288.5 L285.9,291.7 L281.3,298.7 L280.5,302.8 L283.5,304.3 L280.5,310.5 L275.9,314.6 L267.4,331.7 L261.6,327.6 L274.5,358.6 L258.9,361.2 L260.6,371.9 L243.1,374.3 L246.6,384.9 L224.2,386.6 L218.4,367.7 L210.4,363.3 L203.1,365.7 L195.0,361.4 L191.3,348.1 L193.5,337.5 L191.8,318.6 L183.6,309.9 L179.2,308.0 L172.8,307.3 L165.9,311.1 L162.2,310.0 L159.2,306.2Z","x":232.3,"y":310.8},{"name":"Mercer","path":"M268.7,429.6 L250.2,417.4 L243.5,402.3 L224.2,386.6 L246.6,384.9 L243.1,374.3 L260.6,371.9 L258.9,361.2 L274.5,358.6 L281.2,375.2 L298.8,369.9 L306.8,372.1 L308.2,374.3 L304.9,386.9 L307.0,392.4 L316.4,396.2 L317.7,399.3 L323.7,403.4 L328.3,404.6 L331.1,402.6 L332.8,405.2 L343.1,409.6 L341.7,416.9 L343.3,419.9 L327.4,428.9 L320.3,439.3 L314.4,441.4 L312.8,439.0 L309.0,440.4 L315.8,455.4 L307.0,454.4 L306.5,451.7 L304.1,451.7 L296.7,446.3 L292.7,445.9 L293.5,443.5 L286.3,439.8 L283.5,442.7 L284.3,445.7 L285.7,445.0 L285.2,447.5 L280.7,452.3 L281.1,447.8 L277.3,442.1 L272.9,439.5 L268.7,429.6Z","x":291.8,"y":407.4},{"name":"Middlesex","path":"M414.2,300.8 L411.2,313.5 L407.8,312.8 L403.4,316.1 L404.0,325.8 L397.2,336.8 L400.0,344.9 L410.1,349.5 L403.7,356.2 L403.5,364.3 L369.9,399.2 L365.8,404.6 L366.0,407.6 L348.6,417.2 L342.6,416.5 L343.1,409.6 L332.8,405.2 L331.1,402.6 L328.3,404.6 L323.7,403.4 L317.7,399.3 L316.4,396.2 L307.0,392.4 L304.9,386.9 L306.3,378.5 L307.6,375.5 L312.0,373.4 L315.9,368.8 L316.4,360.9 L329.2,353.8 L343.1,339.1 L348.9,336.0 L346.9,329.9 L343.1,328.7 L331.5,312.7 L334.4,305.3 L341.0,303.5 L346.2,299.5 L349.3,300.8 L389.3,295.9 L388.8,298.7 L392.4,301.7 L400.4,299.8 L400.9,298.2 L406.7,298.1 L407.7,299.3 L412.0,297.6 L414.2,300.8Z","x":362.2,"y":358.5},{"name":"Monmouth","path":"M473.4,400.9 L459.8,460.6 L459.3,467.9 L454.7,466.9 L449.2,471.9 L443.2,465.7 L442.8,458.6 L439.8,455.8 L428.9,468.7 L426.2,465.9 L421.4,464.6 L409.6,465.2 L405.7,464.1 L404.4,462.0 L405.1,458.4 L403.0,453.4 L400.5,451.7 L399.5,445.2 L362.6,443.8 L331.5,471.6 L324.8,475.3 L309.0,440.4 L312.8,439.0 L314.4,441.4 L320.3,439.3 L327.4,428.9 L343.3,419.9 L341.8,416.5 L348.6,417.2 L366.0,407.6 L365.8,404.6 L369.9,399.2 L403.5,364.3 L403.7,356.2 L406.8,351.8 L408.8,351.7 L409.5,348.8 L413.4,350.8 L414.1,354.8 L422.4,348.0 L422.3,351.0 L423.7,349.7 L428.2,350.8 L432.5,348.1 L455.2,360.4 L467.9,363.1 L469.7,352.3 L466.0,344.9 L463.0,342.3 L463.9,340.9 L468.7,343.5 L473.2,353.2 L474.9,376.4 L473.4,400.9Z","x":414.4,"y":412.1},{"name":"Morris","path":"M245.2,229.7 L248.0,229.6 L252.9,221.2 L256.4,218.2 L255.5,214.3 L260.6,208.8 L259.0,207.1 L259.3,202.8 L263.2,200.1 L266.4,194.6 L274.7,189.9 L278.7,189.6 L283.5,193.9 L284.0,197.0 L299.0,189.4 L299.0,186.9 L303.6,181.4 L302.6,173.8 L337.8,133.2 L341.7,136.9 L341.9,140.1 L339.8,141.5 L338.0,149.2 L339.2,150.9 L345.0,146.1 L351.9,144.2 L357.3,150.3 L355.5,155.6 L357.8,156.0 L358.2,153.1 L359.8,152.8 L367.8,158.6 L376.2,158.0 L376.9,161.0 L380.2,160.2 L387.6,163.1 L390.4,161.6 L392.0,166.7 L390.8,169.5 L395.0,169.4 L395.9,171.3 L394.9,173.1 L395.5,181.9 L392.9,186.9 L394.3,190.8 L397.4,191.4 L398.7,193.7 L397.5,193.3 L397.1,194.7 L397.7,197.8 L394.1,198.4 L394.8,196.4 L392.4,196.8 L392.3,194.9 L389.4,194.3 L385.3,195.6 L385.4,194.2 L382.5,193.8 L381.2,195.0 L379.8,203.8 L381.1,204.4 L380.7,208.2 L381.6,207.3 L385.6,208.7 L382.4,214.1 L383.5,215.9 L381.3,224.6 L379.9,226.5 L377.5,226.5 L373.1,232.6 L371.8,243.1 L370.2,244.1 L375.3,245.8 L374.7,247.5 L372.8,248.1 L371.5,253.4 L369.4,253.6 L370.1,254.7 L368.4,256.6 L366.7,256.2 L366.7,258.7 L363.7,258.8 L357.4,264.3 L356.4,267.2 L350.9,269.9 L350.2,273.7 L337.5,278.7 L335.2,282.1 L332.4,282.0 L331.9,278.3 L329.6,276.1 L331.9,274.8 L331.3,270.2 L332.2,268.5 L334.2,268.6 L334.9,264.6 L331.6,261.2 L331.1,255.3 L325.8,253.4 L324.1,245.2 L278.5,258.1 L269.4,252.9 L254.0,249.9 L237.9,235.0 L243.6,232.3 L245.2,229.7Z","x":320.1,"y":207.7},{"name":"Ocean","path":"M394.2,667.0 L389.5,669.8 L388.9,667.5 L387.3,667.6 L386.9,669.9 L380.4,667.5 L369.3,670.3 L363.5,656.3 L360.0,652.8 L360.7,649.0 L359.5,646.9 L364.1,645.7 L366.8,637.6 L366.9,578.2 L324.8,475.3 L331.5,471.6 L362.6,443.8 L399.5,445.2 L400.5,451.7 L403.0,453.4 L405.1,458.4 L404.4,462.0 L407.5,464.8 L421.4,464.6 L426.2,465.9 L428.9,468.7 L439.8,455.8 L442.8,458.6 L443.2,465.7 L449.2,471.9 L454.7,466.9 L459.5,468.1 L451.0,509.0 L442.5,581.7 L431.0,606.4 L405.5,651.5 L394.2,667.0Z","x":399.9,"y":543.6},{"name":"Passaic","path":"M337.8,133.2 L373.1,93.0 L412.5,116.6 L397.2,156.3 L403.4,165.2 L409.5,168.8 L423.4,170.4 L423.6,168.1 L431.2,174.1 L429.3,182.5 L431.6,185.1 L431.6,188.7 L434.1,189.9 L433.0,197.0 L434.0,201.5 L437.9,205.5 L440.0,210.6 L439.1,212.0 L436.9,210.6 L435.0,223.7 L416.8,210.5 L399.3,201.2 L397.2,197.4 L397.5,193.3 L398.7,193.7 L397.4,191.4 L394.3,190.8 L392.9,186.9 L395.5,181.9 L394.9,173.1 L395.9,171.3 L395.0,169.4 L390.8,169.5 L392.0,166.7 L390.4,161.6 L387.6,163.1 L380.2,160.2 L376.9,161.0 L376.2,158.0 L367.8,158.6 L359.8,152.8 L356.7,156.3 L355.5,155.6 L357.2,149.9 L351.9,144.2 L345.0,146.1 L339.2,150.9 L338.0,149.2 L339.8,141.5 L341.9,140.1 L341.7,136.4 L337.8,133.2Z","x":387.4,"y":158.3},{"name":"Salem","path":"M86.2,597.8 L90.9,580.8 L95.7,575.7 L104.1,573.4 L104.1,575.6 L105.6,575.1 L106.2,578.3 L107.5,578.0 L104.7,581.5 L106.6,583.5 L107.1,582.2 L108.9,582.5 L107.3,584.6 L112.2,587.8 L112.4,594.1 L116.4,598.4 L125.5,604.1 L125.2,606.2 L130.1,606.3 L135.5,609.6 L141.9,609.0 L144.6,610.7 L145.4,614.6 L149.4,615.7 L157.9,614.0 L193.5,646.9 L190.3,654.9 L190.8,661.7 L188.9,669.4 L190.5,674.7 L187.8,684.1 L147.6,650.0 L127.4,672.5 L125.3,673.7 L121.1,673.0 L118.9,679.4 L114.5,684.3 L106.3,682.5 L104.2,683.6 L102.4,685.8 L103.9,688.9 L101.9,690.4 L103.7,691.0 L101.4,692.5 L104.1,694.9 L101.2,698.8 L102.5,701.7 L104.8,700.7 L103.3,702.9 L104.3,704.6 L101.6,704.9 L101.9,707.5 L102.7,708.5 L104.0,707.5 L104.3,709.3 L100.5,707.8 L98.0,706.1 L89.4,690.3 L84.7,689.6 L79.0,685.6 L78.3,683.5 L71.0,683.0 L69.0,676.7 L69.4,671.0 L73.4,669.8 L73.5,659.3 L71.6,656.2 L76.6,648.9 L77.1,643.7 L66.6,635.7 L65.1,626.4 L76.6,613.4 L78.6,603.9 L81.4,602.4 L83.4,597.9 L86.2,597.8Z","x":128.8,"y":639.7},{"name":"Somerset","path":"M332.4,282.0 L335.2,282.1 L337.5,278.7 L348.5,274.0 L351.0,280.5 L356.7,276.7 L358.8,279.2 L363.0,275.9 L363.8,277.4 L362.0,284.4 L357.2,293.3 L342.9,302.5 L334.4,305.3 L331.8,309.6 L331.5,312.7 L333.5,314.1 L334.7,318.4 L339.7,322.9 L343.1,328.7 L346.9,329.9 L348.9,336.0 L343.1,339.1 L329.2,353.8 L316.8,360.5 L315.9,368.8 L309.2,375.1 L307.6,375.5 L306.8,372.1 L298.8,369.9 L281.2,375.2 L261.6,327.6 L267.4,331.7 L275.9,314.6 L280.5,310.5 L283.5,304.3 L280.5,302.8 L281.3,298.7 L285.9,291.7 L279.8,286.7 L281.9,281.3 L279.0,276.7 L281.1,275.1 L282.3,270.4 L280.8,269.2 L282.8,264.8 L280.6,258.3 L324.1,245.2 L325.8,253.4 L331.1,255.3 L331.6,261.2 L334.9,264.6 L334.2,268.6 L332.2,268.5 L331.3,270.2 L331.9,274.8 L329.6,276.1 L331.9,278.3 L332.4,282.0Z","x":306.3,"y":310.1},{"name":"Sussex","path":"M288.2,40.0 L373.1,93.0 L302.6,173.8 L303.6,181.4 L299.0,186.9 L299.0,189.4 L284.0,197.0 L283.5,193.9 L278.7,189.6 L269.4,192.7 L217.9,129.9 L211.6,132.1 L214.7,124.8 L218.7,123.5 L223.6,118.4 L229.3,115.3 L233.9,109.3 L239.9,100.6 L245.5,88.1 L244.0,83.0 L246.3,77.3 L249.2,75.2 L251.2,67.5 L255.4,61.9 L263.0,56.1 L262.4,52.7 L268.4,51.1 L273.2,43.9 L281.5,43.5 L288.2,40.0Z","x":285.0,"y":120.9},{"name":"Union","path":"M425.9,283.9 L419.5,283.3 L415.4,288.4 L414.2,300.8 L412.0,297.6 L407.7,299.3 L406.7,298.1 L400.9,298.2 L400.4,299.8 L392.4,301.7 L388.8,298.7 L389.3,295.9 L349.3,300.8 L348.0,299.2 L358.0,292.4 L363.8,277.4 L363.0,275.9 L358.8,279.2 L356.7,276.7 L351.0,280.5 L348.5,274.0 L350.8,273.0 L350.9,269.9 L356.4,267.2 L357.4,264.3 L363.7,258.8 L366.7,258.7 L366.7,256.2 L368.4,256.6 L371.6,251.6 L375.8,253.0 L383.5,259.1 L386.0,258.4 L389.6,260.4 L393.9,257.4 L410.1,262.5 L415.5,269.5 L426.0,268.7 L432.3,273.6 L425.9,283.9Z","x":396.9,"y":276.3},{"name":"Warren","path":"M190.3,199.2 L189.0,192.0 L182.2,184.3 L179.1,178.6 L178.4,173.4 L174.5,171.5 L175.8,165.6 L186.3,157.6 L191.3,156.2 L202.8,148.9 L206.2,139.9 L217.0,133.4 L217.9,130.2 L269.4,192.7 L259.3,202.8 L260.3,209.7 L255.5,214.3 L256.4,218.2 L252.9,221.2 L252.0,224.3 L248.0,229.6 L244.4,229.9 L243.6,232.3 L234.1,237.4 L234.6,240.5 L227.4,247.4 L217.3,261.5 L214.8,261.2 L208.6,267.1 L205.2,266.8 L196.9,271.9 L181.1,285.7 L171.9,289.2 L170.8,292.0 L167.7,293.0 L164.3,299.3 L160.3,301.8 L157.4,293.1 L160.8,290.6 L159.8,285.1 L157.7,282.2 L163.8,273.2 L158.6,271.3 L156.8,267.8 L162.5,254.2 L158.7,247.3 L163.3,243.8 L165.2,238.4 L174.8,239.8 L177.7,235.4 L181.5,233.9 L183.5,230.9 L183.6,228.3 L187.8,222.5 L184.4,217.4 L184.7,214.8 L192.4,214.6 L196.3,208.5 L190.3,199.2Z","x":220.3,"y":216.1}];
const COUNTIES=Object.fromEntries(COUNTY_GEOMETRIES.map(c=>[c.name,{cx:c.x,cy:c.y}]));
const TYPES = ['Internships', 'Volunteering', 'Programs', 'Entry-Level Jobs', 'Mid/High-Level Jobs'];
const SECTORS = ['Pharma / Healthcare', 'Agricultural & Environmental', 'Regulatory Science', 'Detection', 'Marine'];

const OPPS = [
  {"org":"Walgreens","loc":"Atlantic County, NJ","county":"Atlantic","type":"Internships","sector":"Pharma / Healthcare","url":"https://www.walgreens.com/careers","jobs":["Pharmacy Intern"],"lat":39.47,"lng":-74.55},
  {"org":"Rowan RISER Program","loc":"Atlantic County, NJ","county":"Atlantic","type":"Internships","sector":"Pharma / Healthcare","url":"https://www.rowan.edu","jobs":["Biomedical Research Fellow"],"lat":39.47,"lng":-74.55},
  {"org":"Atlantic Cape Community College","loc":"Mays Landing, NJ","county":"Atlantic","type":"Entry-Level Jobs","sector":"Pharma / Healthcare","url":"https://www.atlantic.edu","jobs":["Lab Assistant"],"lat":39.47,"lng":-74.55},
  {"org":"CVS Health","loc":"Lumberton, NJ","county":"Burlington","type":"Internships","sector":"Pharma / Healthcare","url":"https://jobs.cvshealth.com","jobs":["Supply Chain & Logistics Summer Intern","Pharmacy Intern"],"lat":39.88,"lng":-74.67},
  {"org":"Burlington County Health Dept","loc":"Mount Holly, NJ","county":"Burlington","type":"Internships","sector":"Regulatory","url":"https://www.co.burlington.nj.us","jobs":["Public Health Student Intern"],"lat":39.88,"lng":-74.67},
  {"org":"EMSL Analytical","loc":"Cinnaminson, NJ","county":"Burlington","type":"Internships","sector":"Detection","url":"https://www.emsl.com","jobs":["Laboratory Intern / Tech"],"lat":39.88,"lng":-74.67},
  {"org":"Coriell Institute for Medical Research","loc":"Camden, NJ","county":"Camden","type":"Internships","sector":"Pharma / Healthcare","url":"https://www.coriell.org","jobs":["Lab Research Intern","Bioinformatics Intern","QA & Safety Intern","Business Development Intern"],"lat":39.8,"lng":-74.96},
  {"org":"Rowan University","loc":"Camden, NJ","county":"Camden","type":"Programs","sector":"Pharma / Healthcare","url":"https://www.rowan.edu","jobs":["Research Immersion in Biomedical Science & Engineering"],"lat":39.8,"lng":-74.96},
  {"org":"Cape May County Health Dept","loc":"Cape May Court House, NJ","county":"Cape May","type":"Internships","sector":"Regulatory","url":"https://capemaycountynj.gov","jobs":["Public Health Lab Intern"],"lat":39.08,"lng":-74.86},
  {"org":"Cape Regional Medical Center","loc":"Cape May Court House, NJ","county":"Cape May","type":"Internships","sector":"Pharma / Healthcare","url":"https://www.caperegional.com","jobs":["Clinical / Health Intern"],"lat":39.08,"lng":-74.86},
  {"org":"Wetlands Institute","loc":"Stone Harbor, NJ","county":"Cape May","type":"Volunteering","sector":"Agricultural / Environmental","url":"https://wetlandsinstitute.org","jobs":["Coastal & Marine Conservation Volunteer"],"lat":39.08,"lng":-74.86},
  {"org":"Cape May Shellfish Hatchery & Aquaculture","loc":"Cape May, NJ","county":"Cape May","type":"Entry-Level Jobs","sector":"Marine","url":"https://capemaycountynj.gov","jobs":["Aquaculture & Shellfish Hatchery Tech"],"lat":39.08,"lng":-74.86},
  {"org":"Rutgers Agricultural Research & Extension Center (RAREC)","loc":"Bridgeton, NJ","county":"Cumberland","type":"Internships","sector":"Agricultural / Environmental","url":"https://rarec.rutgers.edu","jobs":["Agricultural Biotech Research Intern"],"lat":39.33,"lng":-75.13},
  {"org":"Inspira Health System","loc":"Vineland, NJ","county":"Cumberland","type":"Internships","sector":"Pharma / Healthcare","url":"https://www.inspirahealthnetwork.org","jobs":["Clinical / Healthcare Intern","Hospital Volunteer"],"lat":39.33,"lng":-75.13},
  {"org":"NJIT / BioNJ Innovation Center","loc":"Newark, NJ","county":"Essex","type":"Internships","sector":"Pharma / Healthcare","url":"https://www.njit.edu","jobs":["Biomedical Engineering & Biotech Innovation Intern"],"lat":40.78,"lng":-74.24},
  {"org":"Rutgers Biomedical and Health Sciences (RBHS)","loc":"Newark, NJ","county":"Essex","type":"Internships","sector":"Pharma / Healthcare","url":"https://rbhs.rutgers.edu","jobs":["Biomedical Research Intern"],"lat":40.78,"lng":-74.24},
  {"org":"ON3 Life Science Campus","loc":"Nutley, NJ","county":"Essex","type":"Mid/High-Level Jobs","sector":"Pharma / Healthcare","url":"https://on3nj.com","jobs":["Biotech Scientist","Biomanufacturing Specialist"],"lat":40.78,"lng":-74.24},
  {"org":"Sanofi","loc":"Bridgewater, NJ","county":"Somerset","type":"Internships","sector":"Pharma / Healthcare","url":"https://www.sanofi.com","jobs":["Pharma R&D Summer Intern","Bioprocess Intern"],"lat":40.56,"lng":-74.61},
  {"org":"Johnson & Johnson / Janssen","loc":"Raritan, NJ","county":"Somerset","type":"Internships","sector":"Pharma / Healthcare","url":"https://www.jnj.com","jobs":["HFE Human Factors Engineering Intern","Pharmaceutical Sciences Intern"],"lat":40.56,"lng":-74.61},
  {"org":"Gloucester R&D Labs","loc":"Glassboro, NJ","county":"Gloucester","type":"Internships","sector":"Pharma / Healthcare","url":"#","jobs":["Chemist R&D Intern (Summer 2027)"],"lat":39.71,"lng":-75.14},
  {"org":"Stevens Institute of Technology","loc":"Hoboken, NJ","county":"Hudson","type":"Programs","sector":"Detection","url":"https://www.stevens.edu","jobs":["Bioengineering & Sensing Technology Research Program"],"lat":40.73,"lng":-74.07},
  {"org":"Roche Diagnostics","loc":"Hunterdon County, NJ","county":"Hunterdon","type":"Mid/High-Level Jobs","sector":"Detection","url":"https://careers.roche.com/global/en","jobs":["Diagnostic Systems Specialist","R&D Scientist"],"lat":40.56,"lng":-74.9},
  {"org":"NJ Public Health & Environmental Laboratories (PHEL)","loc":"Trenton, NJ","county":"Mercer","type":"Internships","sector":"Regulatory","url":"https://www.nj.gov/health/phel/student-outreach/","jobs":["Public Health Student Outreach / Lab Intern"],"lat":40.28,"lng":-74.7},
  {"org":"Evotec","loc":"Princeton, NJ","county":"Mercer","type":"Mid/High-Level Jobs","sector":"Pharma / Healthcare","url":"https://careers.evotec.com","jobs":["Drug Discovery Scientist","Research Associate"],"lat":40.28,"lng":-74.7},
  {"org":"Rocket Pharmaceuticals","loc":"Cranbury, NJ","county":"Mercer","type":"Mid/High-Level Jobs","sector":"Pharma / Healthcare","url":"https://rocketpharma.com/join-us/careers/","jobs":["Gene Therapy Specialist","QA Engineer"],"lat":40.28,"lng":-74.7},
  {"org":"Waksman Institute of Microbiology","loc":"Piscataway, NJ","county":"Middlesex","type":"Programs","sector":"Pharma / Healthcare","url":"https://waksman.rutgers.edu/","jobs":["Waksman Student Research Program"],"lat":40.44,"lng":-74.43},
  {"org":"Center for Advanced Biotechnology and Medicine (CABM)","loc":"Piscataway, NJ","county":"Middlesex","type":"Internships","sector":"Pharma / Healthcare","url":"https://cabm.rutgers.edu/","jobs":["Molecular Biology Research Intern"],"lat":40.44,"lng":-74.43},
  {"org":"Biotechnology High School","loc":"Freehold, NJ","county":"Monmouth","type":"Programs","sector":"Agricultural / Environmental","url":"https://www.bths.mcvsd.org","jobs":["Biotechnology Career Academy Program"],"lat":40.27,"lng":-74.16},
  {"org":"Legend Biotech","loc":"Somerset / Monmouth Hub, NJ","county":"Monmouth","type":"Internships","sector":"Pharma / Healthcare","url":"https://www.monmouth.edu","jobs":["Cell Therapy Summer Intern 2027"],"lat":40.27,"lng":-74.16},
  {"org":"Hackensack Meridian Health","loc":"Hackensack, NJ","county":"Bergen","type":"Internships","sector":"Pharma / Healthcare","url":"https://www.hackensackmeridianhealth.org/en/research","jobs":["Biomedical Engineering Intern (Summer 2027)","Clinical Affairs Intern (Summer 2027)"],"lat":40.96,"lng":-74.07},
  {"org":"Minaris Advanced Therapies","loc":"Allendale, NJ","county":"Bergen","type":"Mid/High-Level Jobs","sector":"Pharma / Healthcare","url":"#","jobs":["Senior Supply Chain Director - Biotech"],"lat":40.96,"lng":-74.07},
  {"org":"Fusion Medical Staffing / Clinical Labs","loc":"Englewood / Clifton, NJ","county":"Bergen","type":"Entry-Level Jobs","sector":"Detection","url":"#","jobs":["Lab Technician","Medical Laboratory Scientist"],"lat":40.96,"lng":-74.07},
  {"org":"Sanofi US Headquarters","loc":"Morristown, NJ","county":"Morris","type":"Internships","sector":"Pharma / Healthcare","url":"https://www.sanofi.com","jobs":["Sales Analyst Intern","Vaccines Marketing & Sales Associate","Supply Chain Management Intern"],"lat":40.86,"lng":-74.54},
  {"org":"Biomedical Research Institute of NJ (BRInj)","loc":"Cedar Knolls, NJ","county":"Morris","type":"Volunteering","sector":"Pharma / Healthcare","url":"#","jobs":["Biomedical Research Volunteer"],"lat":40.86,"lng":-74.54},
  {"org":"Ocean County College / Kean Ocean","loc":"Toms River, NJ","county":"Ocean","type":"Internships","sector":"Agricultural / Environmental","url":"#","jobs":["Science Research Intern","Biotechnology Degree Pathway Student"],"lat":39.87,"lng":-74.26},
  {"org":"Hackensack Meridian Ocean University Medical Center","loc":"Brick, NJ","county":"Ocean","type":"Volunteering","sector":"Pharma / Healthcare","url":"#","jobs":["Clinical Lab & Hospital Volunteer"],"lat":39.87,"lng":-74.26},
  {"org":"William Paterson University","loc":"Wayne, NJ","county":"Passaic","type":"Internships","sector":"Agricultural / Environmental","url":"#","jobs":["STEM Research Fellow"],"lat":41.04,"lng":-74.3},
  {"org":"Passaic County Technical Institute & PCCC","loc":"Paterson, NJ","county":"Passaic","type":"Programs","sector":"Detection","url":"#","jobs":["Bio-Science Academy","STEM Academy Program"],"lat":41.04,"lng":-74.3},
  {"org":"Salem Community College Glass Center","loc":"Carneys Point, NJ","county":"Salem","type":"Programs","sector":"Detection","url":"#","jobs":["Scientific Glass Technology Program"],"lat":39.58,"lng":-75.35},
  {"org":"South Jersey Agricultural Biotech Enterprises","loc":"Salem County, NJ","county":"Salem","type":"Internships","sector":"Agricultural / Environmental","url":"#","jobs":["Agricultural Biotech Intern"],"lat":39.58,"lng":-75.35},
  {"org":"EMSL Analytical","loc":"Sparta, NJ","county":"Sussex","type":"Internships","sector":"Detection","url":"https://www.emsl.com","jobs":["Environmental Lab Analyst Intern","Lab Technician"],"lat":41.14,"lng":-74.69},
  {"org":"Sussex County Dept of Health","loc":"Newton, NJ","county":"Sussex","type":"Volunteering","sector":"Regulatory","url":"#","jobs":["Public Health & Environmental Volunteer"],"lat":41.14,"lng":-74.69},
  {"org":"Merck & Co. World Headquarters","loc":"Rahway, NJ","county":"Union","type":"Internships","sector":"Pharma / Healthcare","url":"https://jobs.merck.com","jobs":["Pharmaceutical R&D Intern","Biomanufacturing Co-op"],"lat":40.66,"lng":-74.31},
  {"org":"Kean University Center for STEM Studies","loc":"Union, NJ","county":"Union","type":"Programs","sector":"Pharma / Healthcare","url":"https://www.kean.edu","jobs":["Biotechnology Certificate & STEM Research"],"lat":40.66,"lng":-74.31},
  {"org":"Warren County Community College","loc":"Washington, NJ","county":"Warren","type":"Programs","sector":"Agricultural / Environmental","url":"#","jobs":["Drone & Precision Agriculture Certification"],"lat":40.86,"lng":-74.99},
  {"org":"Musconetcong Watershed Association","loc":"Asbury, NJ","county":"Warren","type":"Volunteering","sector":"Agricultural / Environmental","url":"#","jobs":["Water Quality Monitoring Volunteer"],"lat":40.86,"lng":-74.99},
  {"org":"New Jersey Academy of Science (NJAS)","loc":"Statewide, NJ","county":"Middlesex","type":"Programs","sector":"Pharma / Healthcare","url":"https://www.njas.org/Biotechnology-Research-Fellowship-Program","jobs":["Biotechnology Research Fellowship"],"lat":40.44,"lng":-74.43},
  {"org":"NJ Office of Higher Education","loc":"Trenton, NJ","county":"Mercer","type":"Programs","sector":"Regulatory","url":"https://www.nj.gov/highereducation/caigp-students.shtml","jobs":["Community Innovation & Biotech Grant Student Program"],"lat":40.28,"lng":-74.7}
];

/* ---- Interactive county map: vector boundaries, keyboard access and side panel ---- */
const SVG_NS='http://www.w3.org/2000/svg';
let mapSelectedCounty=null;
let filteredMapOpps=[];
const safeText=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const box=(id,list)=>{
  const el=$(id);
  if(el)el.innerHTML=list.map(v=>`<label><input type="checkbox" value="${safeText(v)}"> ${safeText(v)}</label>`).join('');
};
function svgElement(tag,attrs={}){
  const el=document.createElementNS(SVG_NS,tag);
  Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,value));
  return el;
}
function createCountyMap(){
  const svg=$('#nj');if(!svg)return;
  svg.replaceChildren();
  const layer=svgElement('g',{'id':'nj-county-layer'});
  COUNTY_GEOMETRIES.forEach(c=>{
    const g=svgElement('g',{'class':'county-group','data-county':c.name});
    const path=svgElement('path',{'d':c.path,'class':'county-shape','tabindex':'0','role':'button','aria-label':`Show opportunities in ${c.name} County`,'data-county':c.name});
    path.addEventListener('click',()=>selectMapCounty(c.name));
    path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectMapCounty(c.name)}});
    g.append(path);
    // Shaped counties remain clickable even where a numeric marker is drawn above them.
    layer.append(g);
  });
  svg.append(layer,svgElement('g',{'id':'nj-pin-layer','aria-hidden':'true'}));
}
function normalizedSector(v){
  const s=String(v||'').toLowerCase().replace(/&|\//g,' and ').replace(/\s+/g,' ').trim();
  if(s.startsWith('agricultural'))return 'agricultural and environmental';
  if(s.startsWith('regulatory'))return 'regulatory science';
  if(s.startsWith('pharma'))return 'pharma healthcare';
  return s;
}
const sel=id=>new Set($$(id+' input:checked').map(i=>i.value));
function filterMap(){
  const T=sel('#f-type'),S=sel('#f-sector'),C=sel('#f-county');
  // AND across *all* selections, as requested in site testing feedback.
  filteredMapOpps=OPPS.filter(o=>
    [...T].every(type=>type===o.type)&&
    [...S].every(sector=>normalizedSector(sector)===normalizedSector(o.sector))&&
    [...C].every(county=>county===o.county));
  const statusEl=$('#status');
  if(statusEl)statusEl.textContent=`${filteredMapOpps.length} of ${OPPS.length} listed opportunities match all selected filters.`;
  updateMapAppearance();renderMapPanel();
}
function selectMapCounty(county){
  mapSelectedCounty=county;
  updateMapAppearance();renderMapPanel();
}
function updateMapAppearance(){
  const counts=Object.create(null);
  filteredMapOpps.forEach(o=>counts[o.county]=(counts[o.county]||0)+1);
  $$('#nj .county-group').forEach(g=>{
    const name=g.dataset.county,on=name===mapSelectedCounty,has=!!counts[name];
    g.classList.toggle('is-selected',on);
    g.classList.toggle('no-results',!has);
    g.querySelector('path').setAttribute('aria-pressed',String(on));
  });
  const layer=$('#nj-pin-layer');if(!layer)return;
  layer.replaceChildren();
  COUNTY_GEOMETRIES.forEach(c=>{
    if(!counts[c.name])return;
    const badge=svgElement('g',{'class':'county-count','transform':`translate(${c.x} ${c.y})`});
    badge.append(svgElement('circle',{'r':13}),svgElement('text',{'text-anchor':'middle','y':'4'}));
    badge.querySelector('text').textContent=String(counts[c.name]);
    layer.append(badge);
  });
}
function renderMapPanel(){
  const title=$('#opportunity-title'),sub=$('#opportunity-subtitle'),list=$('#opportunity-list');
  if(!title||!sub||!list)return;
  const county=mapSelectedCounty;
  const rows=county?filteredMapOpps.filter(o=>o.county===county):filteredMapOpps;
  title.textContent=county?`${county} County`:'New Jersey opportunities';
  sub.textContent=county?`${rows.length} matching listing${rows.length===1?'':'s'} in this county.`:'Select a county on the map or browse the matching opportunities below.';
  if(!rows.length){
    list.innerHTML='<p class="map-empty">No opportunities match these selections. Try clearing one or more filters.</p>';
    return;
  }
  list.innerHTML=rows.map(o=>`<article class="opp-card">
    <p class="opp-type">${safeText(o.type)} · ${safeText(o.sector)}</p>
    <h4>${safeText(o.org)}</h4><p class="opp-loc">${safeText(o.loc)} · ${safeText(o.county)} County</p>
    <ul>${o.jobs.map(j=>`<li>${safeText(j)}</li>`).join('')}</ul>
    ${o.url&&/^https?:\/\//i.test(o.url)?`<a href="${safeText(o.url)}" target="_blank" rel="noopener noreferrer">Organization website</a>`:'<span class="opp-unverified">Website link not provided</span>'}
  </article>`).join('');
}
function initMap(){
  box('#f-type',TYPES);box('#f-sector',SECTORS);box('#f-county',Object.keys(COUNTIES).sort());
  createCountyMap();
  const filters=$('#map-filters');
  if(filters)filters.addEventListener('change',filterMap);
  $('#clear')?.addEventListener('click',()=>{$$('#map-filters input').forEach(i=>i.checked=false);mapSelectedCounty=null;filterMap()});
  $('#view-all-counties')?.addEventListener('click',()=>{mapSelectedCounty=null;updateMapAppearance();renderMapPanel()});
  filterMap();
}
document.addEventListener('DOMContentLoaded',initMap);

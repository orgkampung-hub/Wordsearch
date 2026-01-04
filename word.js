const gridSize=13;
const wordsPerGame=15;
let grid=[],cells=[],selected=[],placedWords=[];
let snapDir=null,score=0;

const continents={
Asia:[
"MALAYSIA","INDONESIA","THAILAND","VIETNAM","CAMBODIA","LAOS","MYANMAR","PHILIPPINES","JAPAN","CHINA",
"INDIA","PAKISTAN","IRAN","IRAQ","SAUDI","QATAR","UAE","OMAN","YEMEN","JORDAN",
"NEPAL","BHUTAN","SRI LANKA","BANGLADESH","MONGOLIA","SOUTH KOREA","NORTH KOREA","SINGAPORE","BRUNEI","TAIWAN"
],
Europe:[
"FRANCE","GERMANY","ITALY","SPAIN","PORTUGAL","NORWAY","SWEDEN","FINLAND","POLAND","UK",
"IRELAND","DENMARK","NETHERLANDS","BELGIUM","AUSTRIA","SWITZERLAND","GREECE","HUNGARY","CZECH","SLOVAKIA",
"ROMANIA","BULGARIA","SERBIA","CROATIA","SLOVENIA","LITHUANIA","LATVIA","ESTONIA","ICELAND","MALTA"
],
Africa:[
"EGYPT","NIGERIA","KENYA","GHANA","MOROCCO","TUNISIA","ALGERIA","SUDAN","ETHIOPIA","SENEGAL",
"UGANDA","TANZANIA","ZAMBIA","ZIMBABWE","BOTSWANA","NAMIBIA","LIBYA","MALI","MAURITANIA","BURKINA FASO",
"CAMEROON","IVORY COAST","NIGER","CHAD","SOUTH AFRICA","CONGO","DEMOCRATIC REPUBLIC OF CONGO","ANGOLA","SOMALIA","GABON"
],
Americas:[
"USA","CANADA","MEXICO","BRAZIL","ARGENTINA","CHILE","PERU","COLOMBIA","CUBA","PANAMA",
"VENEZUELA","ECUADOR","BOLIVIA","PARAGUAY","URUGUAY","JAMAICA","HAITI","DOMINICAN REPUBLIC","GUATEMALA","HONDURAS",
"COSTA RICA","NICARAGUA","EL SALVADOR","BAHAMAS","TRINIDAD AND TOBAGO","BARBADOS","SURINAME","GUYANA","BELIZE","BARBADOS"
],
Oceania:[
"AUSTRALIA","NEW ZEALAND","FIJI","SAMOA","TONGA","PAPUA NEW GUINEA","VANUATU","SOLOMON ISLANDS","MICRONESIA","PALAU",
"KIRIBATI","MARSHALL ISLANDS","NAURU","TUVALU","NEW CALEDONIA","FRENCH POLYNESIA","GUAM","NORTHERN MARIANA ISLANDS","COOK ISLANDS","NIUE",
"AMERICAN SAMOA","TOKELAU","WAKE ISLAND","NORFOLK ISLAND","PITCAIRN ISLAND","VANUATU","FIJI","TONGA","SAMOA","FIJI"
]
};

// ======== DOM ========
const gridEl=document.getElementById("grid");
const listEl=document.getElementById("wordList");
const scoreEl=document.getElementById("score");
const canvas=document.getElementById("traceCanvas");
const ctx=canvas.getContext("2d");
const hintBtn=document.getElementById("hintBtn");

// ======== UTILS ========
function resize(){
  const r=gridEl.getBoundingClientRect();
  canvas.width=r.width;
  canvas.height=r.height;
}
window.addEventListener("resize",resize);
function rand(a){return a[Math.floor(Math.random()*a.length)]}

// ======== GENERATE GRID ========
function generate(){
  grid=Array.from({length:gridSize},()=>Array(gridSize).fill(""));
  cells=[];selected=[];placedWords=[];snapDir=null;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  gridEl.innerHTML="";listEl.innerHTML="";
  score=0;scoreEl.textContent="Score: 0";
  hintBtn.classList.remove("hintActive");

  const cont=document.getElementById("continent").value;
  const bank=[...continents[cont]].sort(()=>Math.random()-0.5);
  const words=bank.slice(0,wordsPerGame);

  const dirs=[[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]];

  for(let w of words){
    let placed=false;
    for(let a=0;a<100&&!placed;a++){
      let [dr,dc]=rand(dirs);
      let r=Math.floor(Math.random()*gridSize);
      let c=Math.floor(Math.random()*gridSize);
      let ok=true;
      for(let i=0;i<w.length;i++){
        let rr=r+dr*i,cc=c+dc*i;
        if(rr<0||cc<0||rr>=gridSize||cc>=gridSize||
          (grid[rr][cc] && grid[rr][cc]!=w[i])) ok=false;
      }
      if(ok){
        let coords=[];
        for(let i=0;i<w.length;i++){
          let rr=r+dr*i,cc=c+dc*i;
          grid[rr][cc]=w[i];coords.push([rr,cc]);
        }
        placedWords.push({word:w,coords,hint:1});
        placed=true;
      }
    }
  }

  const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for(let r=0;r<gridSize;r++)
    for(let c=0;c<gridSize;c++)
      if(!grid[r][c]) grid[r][c]=letters[Math.floor(Math.random()*26)];

  for(let r=0;r<gridSize;r++){
    for(let c=0;c<gridSize;c++){
      const d=document.createElement("div");
      d.className="cell";
      d.textContent=grid[r][c];
      d.dataset.r=r;d.dataset.c=c;
      d.onclick=()=>selectCell(d);
      gridEl.appendChild(d);
      cells.push(d);
    }
  }

  words.forEach(w=>{
    const e=document.createElement("div");
    e.className="word";e.textContent=w;e.dataset.word=w;
    listEl.appendChild(e);
  });

  resize();
}

// ======== GAME FUNCTIONS ========
function direction(a,b){
  return{
    dr:Math.sign(b.dataset.r-a.dataset.r),
    dc:Math.sign(b.dataset.c-a.dataset.c)
  };
}

function aligned(){
  if(selected.length<2) return true;
  let d=direction(selected[0],selected[1]);
  for(let i=2;i<selected.length;i++){
    if(
      selected[i].dataset.r-selected[i-1].dataset.r!=d.dr||
      selected[i].dataset.c-selected[i-1].dataset.c!=d.dc
    ) return false;
  }
  return true;
}

function selectCell(cell){
  selected.push(cell);
  if(!aligned()){
    selected.forEach(c=>c.classList.remove("selected"));
    selected=[cell];
  }
  cell.classList.add("selected");
  draw();
  checkWord();
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(selected.length<2) return;
  ctx.strokeStyle="#3498db";ctx.lineWidth=5;
  ctx.beginPath();
  selected.forEach((c,i)=>{
    const r=c.getBoundingClientRect();
    const g=gridEl.getBoundingClientRect();
    let x=r.left-g.left+r.width/2;
    let y=r.top-g.top+r.height/2;
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  });
  ctx.stroke();
}

function checkWord(){
  let sel=selected.map(c=>c.dataset.r+","+c.dataset.c);
  for(let p of placedWords){
    let wc=p.coords.map(a=>a[0]+","+a[1]);
    if(wc.every(c=>sel.includes(c))){
      wc.forEach(k=>{
        let c=cells.find(x=>x.dataset.r+","+x.dataset.c===k);
        c.classList.add("found");
      });
      document.querySelector(`[data-word="${p.word}"]`).classList.add("found");
      score++;scoreEl.textContent="Score: "+score;
      selected.forEach(c=>c.classList.remove("selected"));
      selected=[];ctx.clearRect(0,0,canvas.width,canvas.height);
      return;
    }
  }
}

// ======== HINT BUTTON ========
hintBtn.onclick = ()=>{
  let left=placedWords.filter(p=>p.hint>0 &&
    !document.querySelector(`[data-word="${p.word}"]`).classList.contains("found"));
  if(!left.length) return alert("Tiada hint");
  let p=rand(left);
  let [r,c]=rand(p.coords);
  let cell=cells.find(x=>x.dataset.r==r&&x.dataset.c==c);
  cell.classList.add("hint");
  p.hint=0;

  score--;
  if(score<0) score=0;
  scoreEl.textContent="Score: "+score;

  // 🔥 Glow effect (safe)
  hintBtn.classList.remove("hintActive");
  void hintBtn.offsetWidth;
  hintBtn.classList.add("hintActive");
};

// ======== NEXT GRID ========
document.getElementById("nextBtn").onclick=generate;
document.getElementById("continent").onchange=generate;

// ======== INIT ========
generate();
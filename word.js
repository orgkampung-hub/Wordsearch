const themes = {
  'Nama Negara': [
    "AFGHANISTAN","ALBANIA","ALGERIA","ANDORRA","ANGOLA","ANTIGUA AND BARBUDA","ARGENTINA","ARMENIA","AUSTRALIA","AUSTRIA",
    "AZERBAIJAN","BAHAMAS","BAHRAIN","BANGLADESH","BARBADOS","BELARUS","BELGIUM","BELIZE","BENIN","BHUTAN","BOLIVIA",
    "BOSNIA AND HERZEGOVINA","BOTSWANA","BRAZIL","BRUNEI","BULGARIA","BURKINA FASO","BURUNDI","CABO VERDE","CAMBODIA",
    "CAMEROON","CANADA","CENTRAL AFRICAN REPUBLIC","CHAD","CHILE","CHINA","COLOMBIA","COMOROS","CONGO","COSTA RICA",
    "CROATIA","CUBA","CYPRUS","CZECHIA","DENMARK","DJIBOUTI","DOMINICA","DOMINICAN REPUBLIC","ECUADOR","EGYPT",
    "EL SALVADOR","EQUATORIAL GUINEA","ERITREA","ESTONIA","ESWATINI","ETHIOPIA","FIJI","FINLAND","FRANCE","GABON",
    "GAMBIA","GEORGIA","GERMANY","GHANA","GREECE","GRENADA","GUATEMALA","GUINEA","GUINEA-BISSAU","GUYANA",
    "HAITI","HONDURAS","HUNGARY","ICELAND","INDIA","INDONESIA","IRAN","IRAQ","IRELAND","ISRAEL","ITALY","JAMAICA",
    "JAPAN","JORDAN","KAZAKHSTAN","KENYA","KIRIBATI","KOSOVO","KUWAIT","KYRGYZSTAN","LAOS","LATVIA","LEBANON",
    "LESOTHO","LIBERIA","LIBYA","LIECHTENSTEIN","LITHUANIA","LUXEMBOURG","MADAGASCAR","MALAWI","MALAYSIA","MALDIVES",
    "MALI","MALTA","MARSHALL ISLANDS","MAURITANIA","MAURITIUS","MEXICO","MICRONESIA","MOLDOVA","MONACO","MONGOLIA",
    "MONTENEGRO","MOROCCO","MOZAMBIQUE","MYANMAR","NAMIBIA","NAURU","NEPAL","NETHERLANDS","NEW ZEALAND","NICARAGUA",
    "NIGER","NIGERIA","NORTH KOREA","NORTH MACEDONIA","NORWAY","OMAN","PAKISTAN","PALAU","PALESTINE","PANAMA",
    "PAPUA NEW GUINEA","PARAGUAY","PERU","PHILIPPINES","POLAND","PORTUGAL","QATAR","ROMANIA","RUSSIA","RWANDA",
    "SAINT KITTS AND NEVIS","SAINT LUCIA","SAINT VINCENT AND THE GRENADINES","SAMOA","SAN MARINO","SAO TOME AND PRINCIPE",
    "SAUDI ARABIA","SENEGAL","SERBIA","SEYCHELLES","SIERRA LEONE","SINGAPORE","SLOVAKIA","SLOVENIA","SOLOMON ISLANDS",
    "SOMALIA","SOUTH AFRICA","SOUTH KOREA","SOUTH SUDAN","SPAIN","SRI LANKA","SUDAN","SURINAME","SWEDEN","SWITZERLAND",
    "SYRIA","TAIWAN","TAJIKISTAN","TANZANIA","THAILAND","TIMOR-LESTE","TOGO","TONGA","TRINIDAD AND TOBAGO","TUNISIA",
    "TURKEY","TURKMENISTAN","TUVALU","UGANDA","UKRAINE","UNITED ARAB EMIRATES","UNITED KINGDOM","UNITED STATES",
    "URUGUAY","UZBEKISTAN","VANUATU","VATICAN CITY","VENEZUELA","VIETNAM","YEMEN","ZAMBIA","ZIMBABWE"
  ]
};

let currentTheme = 'Nama Negara';
let wordList = [];
let usedWords = new Set(); // untuk pastikan tak ulang sesi sebelumnya
let grid = [];
let selectedCells = [];
let cellElements = [];
let placedWords = [];
const gridSize = 13;
const numWords = 15;

const gridDiv = document.getElementById('grid');
const wordDiv = document.getElementById('wordList');
const confirmBtn = document.getElementById('confirmBtn');
const nextBtn = document.getElementById('nextBtn');
const canvas = document.getElementById('traceCanvas');
const ctx = canvas.getContext('2d');

function shuffleArray(array){ return array.sort(()=> Math.random()-0.5); }
function resizeCanvas(){ canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function generateGrid(){
  grid = Array(gridSize).fill(0).map(()=> Array(gridSize).fill(''));
  selectedCells=[];
  cellElements=[];
  placedWords=[];
  gridDiv.innerHTML='';
  wordDiv.innerHTML='';
  ctx.clearRect(0,0,canvas.width,canvas.height);

  let bank = shuffleArray([...themes[currentTheme]]).filter(w=>!usedWords.has(w));
  wordList = bank.slice(0,numWords);
  wordList.forEach(w=>usedWords.add(w));

  const directions = [[0,1],[1,0],[1,1],[-1,0],[0,-1],[-1,-1],[-1,1],[1,-1]];

  for(let word of wordList){
    let placed=false, attempts=0;
    while(!placed && attempts<100){
      attempts++;
      let dir = directions[Math.floor(Math.random()*directions.length)];
      let row = Math.floor(Math.random()*gridSize);
      let col = Math.floor(Math.random()*gridSize);
      let canPlace=true;
      for(let i=0;i<word.length;i++){
        let r=row+dir[0]*i;
        let c=col+dir[1]*i;
        if(r<0||r>=gridSize||c<0||c>=gridSize) canPlace=false;
        else if(grid[r][c]!='' && grid[r][c]!=word[i]) canPlace=false;
      }
      if(canPlace){
        let coords=[];
        for(let i=0;i<word.length;i++){
          let r=row+dir[0]*i;
          let c=col+dir[1]*i;
          grid[r][c]=word[i];
          coords.push([r,c]);
        }
        placedWords.push({word, coords});
        placed=true;
      }
    }
  }

  const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for(let r=0;r<gridSize;r++){
    for(let c=0;c<gridSize;c++){
      if(grid[r][c]=='') grid[r][c]=letters[Math.floor(Math.random()*letters.length)];
    }
  }

  for(let r=0;r<gridSize;r++){
    for(let c=0;c<gridSize;c++){
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row=r;
      cell.dataset.col=c;
      cell.innerText=grid[r][c];
      cell.addEventListener('click', ()=> selectCell(cell));
      gridDiv.appendChild(cell);
      cellElements.push(cell);
    }
  }

  for(let w of wordList){
    const wEl = document.createElement('div');
    wEl.classList.add('wordItem');
    wEl.dataset.word=w;
    wEl.innerText=w;
    wordDiv.appendChild(wEl);
  }
}

function selectCell(cell){
  if(cell.classList.contains('found')) return;
  if(selectedCells.includes(cell)){
    cell.classList.remove('selected');
    selectedCells = selectedCells.filter(c=>c!==cell);
  } else {
    cell.classList.add('selected');
    selectedCells.push(cell);
  }
  drawTrace();
}

function drawTrace(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(selectedCells.length<1) return;
  ctx.strokeStyle = '#f1c40f';
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for(let i=0;i<selectedCells.length;i++){
    const rect = selectedCells[i].getBoundingClientRect();
    const parentRect = canvas.getBoundingClientRect();
    const x = rect.left - parentRect.left + rect.width/2;
    const y = rect.top - parentRect.top + rect.height/2;
    if(i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  }
  ctx.stroke();
}

function clearSelection(){
  for(let cell of selectedCells){
    cell.classList.remove('selected');
  }
  selectedCells=[];
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

confirmBtn.addEventListener('click', ()=>{
  if(selectedCells.length<2) return;

  let selectedCoords = selectedCells.map(c=>c.dataset.row+','+c.dataset.col);
  let found = false;

  for(let pw of placedWords){
    let wordCoords = pw.coords.map(a=>a.join(','));
    // check all coordinates exist in selectedCoords (order doesn’t matter)
    if(wordCoords.every(coord => selectedCoords.includes(coord))){
      found = true;
      for(let cell of selectedCells){
        cell.classList.remove('selected');
        cell.classList.add('found');
      }
      const wEl = [...document.querySelectorAll('.wordItem')].find(el=>el.dataset.word===pw.word);
      if(wEl) wEl.classList.add('found');
      break;
    }
  }

  clearSelection(); // kalau tak jumpa, hilangkan highlight sahaja
});

nextBtn.addEventListener('click', ()=>{ generateGrid(); });

generateGrid();
const themes = {
  'Asia': ["AFGHANISTAN","ARMENIA","AZERBAIJAN","BAHRAIN","BANGLADESH","BHUTAN","BRUNEI","CAMBODIA","CHINA","GEORGIA","INDIA","INDONESIA","IRAN","IRAQ","ISRAEL","JAPAN","JORDAN","KAZAKHSTAN","KUWAIT","KYRGYZSTAN","LAOS","LEBANON","MALAYSIA","MALDIVES","MONGOLIA","MYANMAR","NEPAL","NORTH KOREA","OMAN","PAKISTAN","PALESTINE","PHILIPPINES","QATAR","SAUDI ARABIA","SINGAPORE","SOUTH KOREA","SRI LANKA","SYRIA","TAIWAN","TAJIKISTAN","THAILAND","TIMOR-LESTE","TURKMENISTAN","UAE","UZBEKISTAN","VIETNAM","YEMEN"],
  'Europe': ["ALBANIA","ANDORRA","AUSTRIA","BELARUS","BELGIUM","BOSNIA AND HERZEGOVINA","BULGARIA","CROATIA","CYPRUS","CZECHIA","DENMARK","ESTONIA","FINLAND","FRANCE","GERMANY","GREECE","HUNGARY","ICELAND","IRELAND","ITALY","KOSOVO","LATVIA","LIECHTENSTEIN","LITHUANIA","LUXEMBOURG","MALTA","MOLDOVA","MONACO","MONTENEGRO","NETHERLANDS","NORTH MACEDONIA","NORWAY","POLAND","PORTUGAL","ROMANIA","RUSSIA","SAN MARINO","SERBIA","SLOVAKIA","SLOVENIA","SPAIN","SWEDEN","SWITZERLAND","UK","VATICAN CITY"],
  'Africa': ["ALGERIA","ANGOLA","BENIN","BOTSWANA","BURKINA FASO","BURUNDI","CABO VERDE","CAMEROON","CENTRAL AFRICAN REPUBLIC","CHAD","COMOROS","CONGO","DJIBOUTI","EGYPT","EQUATORIAL GUINEA","ERITREA","ESWATINI","ETHIOPIA","GABON","GAMBIA","GHANA","GUINEA","GUINEA-BISSAU","IVORY COAST","KENYA","LESOTHO","LIBERIA","LIBYA","MADAGASCAR","MALAWI","MALI","MAURITANIA","MAURITIUS","MOROCCO","MOZAMBIQUE","NAMIBIA","NIGER","NIGERIA","RWANDA","SAO TOME AND PRINCIPE","SENEGAL","SEYCHELLES","SIERRA LEONE","SOMALIA","SOUTH AFRICA","SOUTH SUDAN","SUDAN","TANZANIA","TOGO","TUNISIA","UGANDA","ZAMBIA","ZIMBABWE"],
  'Americas': ["ANTIGUA AND BARBUDA","ARGENTINA","BAHAMAS","BARBADOS","BELIZE","BOLIVIA","BRAZIL","CANADA","CHILE","COLOMBIA","COSTA RICA","CUBA","DOMINICA","DOMINICAN REPUBLIC","ECUADOR","EL SALVADOR","GRENADA","GUATEMALA","GUYANA","HAITI","HONDURAS","JAMAICA","MEXICO","NICARAGUA","PANAMA","PARAGUAY","PERU","SAINT KITTS AND NEVIS","SAINT LUCIA","SAINT VINCENT AND THE GRENADINES","SURINAME","TRINIDAD AND TOBAGO","USA","URUGUAY","VENEZUELA"],
  'Oceania': ["AUSTRALIA","FIJI","KIRIBATI","MARSHALL ISLANDS","MICRONESIA","NAURU","NEW ZEALAND","PALAU","PAPUA NEW GUINEA","SAMOA","SOLOMON ISLANDS","TONGA","TUVALU","VANUATU"]
};

let currentTheme = document.getElementById('theme').value;
let wordList = [];
let usedWords = new Set();
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

document.getElementById('theme').addEventListener('change', ()=>{
  currentTheme = document.getElementById('theme').value;
  generateGrid();
});

function generateGrid(){
  grid = Array(gridSize).fill(0).map(()=> Array(gridSize).fill(''));
  selectedCells=[]; cellElements=[]; placedWords=[];
  gridDiv.innerHTML=''; wordDiv.innerHTML=''; ctx.clearRect(0,0,canvas.width,canvas.height);

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
  for(let r=0;r<gridSize;r++)
    for(let c=0;c<gridSize;c++)
      if(grid[r][c]=='') grid[r][c]=letters[Math.floor(Math.random()*letters.length)];

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
  if(selectedCells.includes(cell)){ cell.classList.remove('selected'); selectedCells = selectedCells.filter(c=>c!==cell); }
  else { cell.classList.add('selected'); selectedCells.push(cell); }
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
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();
}

function clearSelection(){
  for(let cell of selectedCells) cell.classList.remove('selected');
  selectedCells=[];
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

confirmBtn.addEventListener('click', ()=>{
  if(selectedCells.length<2) return;

  // Pool = selected + found letters (reuse allowed)
  let selectedCoords = selectedCells.map(c=>c.dataset.row+','+c.dataset.col);
  let foundCoords = cellElements.filter(c=>c.classList.contains('found')).map(c=>c.dataset.row+','+c.dataset.col);
  let poolCoords = [...new Set([...selectedCoords, ...foundCoords])];

  for(let pw of placedWords){
    let wordCoords = pw.coords.map(a=>a.join(','));
    if(wordCoords.every(c=>poolCoords.includes(c))){
      for(let cell of selectedCells){
        if(wordCoords.includes(cell.dataset.row+','+cell.dataset.col)){
          cell.classList.remove('selected');
          cell.classList.add('found');
        }
      }
      const wEl = [...document.querySelectorAll('.wordItem')].find(el=>el.dataset.word===pw.word);
      if(wEl) wEl.classList.add('found');
    }
  }

  clearSelection();
});

nextBtn.addEventListener('click', ()=>{ generateGrid(); });
generateGrid();
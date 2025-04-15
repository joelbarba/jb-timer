console.log('Ini');

document.getElementById('start-btn').addEventListener('click',  (event) => startTimer());
document.getElementById('reset-btn').addEventListener('click',  (event) => resetTimer());

document.getElementById('big-btn').addEventListener('mousedown',  (event) => iniStep());
document.getElementById('big-btn').addEventListener('mouseup',    (event) => endStep());
document.getElementById('big-btn').addEventListener('touchstart', (event) => iniStep());
document.getElementById('big-btn').addEventListener('touchend',   (event) => endStep());



const timerEl = document.getElementById('timer');
const contrEl = document.getElementById('contr-time');
timerEl.textContent = '';
contrEl.textContent = '';

function startTimer() {
  if (!iniTime) {
    console.log(new Date(), 'START');
    iniTime = new Date();
    timerEl.textContent = formatTime(0);
    document.getElementById('start-btn').textContent = 'STOP';
    document.getElementById('start-time').textContent = formatDate(iniTime);
  } else { // STOP
    console.log(new Date(), 'STOP');
    if (interval) { 
      // clearInterval(interval); 
      iniTime = undefined; 
    }
  }
}

function resetTimer() {
  console.log(new Date(), 'RESET');
  iniTime = undefined;
  startTimer();
}


let iniTime;      // Initial time for the whole counter
let stepTime;     // Current contraction ini time
const steps = []; // Contractions

const tLine = document.getElementById('start-line');
const timelineEl = document.getElementById('left-timeline');
const timelineHeight = Math.round(timelineEl.getBoundingClientRect().height);
tLine.style.top = 0 + 'px';

const maxSeconds = 1 * 20;
const pxPerMs = timelineHeight / maxSeconds / 1000;




function iniStep() {
  stepTime = new Date();
  const el = document.createElement('div');
  el.setAttribute('id', 'step-' + steps.length);
  el.setAttribute('class', 'contraction-box');
  timelineEl.appendChild(el);
  steps.push({ ini: stepTime, end: null, el });
  contrEl.textContent = `Contraction Time: 00:00`;
}

function endStep() {
  if (steps.length) { steps.at(-1).end = new Date(); }
  console.log(steps);
  stepTime = undefined;
}

function render() {
  if (iniTime) {
    const elapsedTimeMs = (new Date() - iniTime);
    const elapsedTime = Math.round(elapsedTimeMs / 1000);
    timerEl.textContent = formatTime(elapsedTimeMs);
    if (stepTime) {
      contrEl.textContent = `Contraction Time: ${formatContractionTime(new Date() - stepTime)}`
    }

    if (elapsedTime <= maxSeconds) { tLine.style.top = Math.round(elapsedTimeMs * pxPerMs) + 'px'; }    

    steps.filter(step => !step.isOut).forEach(step => {
      if (step.ini) {
        const bottom = Math.round((new Date() - step.ini) * pxPerMs);        
        if (!step.end) {
          step.el.style.top = 0 + 'px';
          step.el.style.height = bottom + 'px';
        } else {
          const top = Math.round((new Date() - step.end) * pxPerMs);
          step.el.style.top = top + 'px';
          step.el.style.height = (bottom - top) + 'px';
          if (top > timelineHeight) { step.isOut = true; }
        }
      }      
    });


  }
}




startTimer();
const interval = setInterval(() => render(), 100);

// ---------------------------------------------

function formatTime(ms) {
  if (ms < 1000) { return `00:00`; }
  if (ms < 60000) {
    const sec = Math.round(ms / 1000);
    return `00:${pad(sec, 2, '0')}`;
  }
  const min = Math.floor(ms / 60000);
  const sec = Math.round((ms - (min * 60000)) / 1000);
  return `${pad(min, 2, '0')}:${pad(sec, 2, '0')}`;
}

function formatContractionTime(ms) {
  if (ms < 100) { return `00:00.0`; }
  if (ms < 60000) {
    let sec = Math.round(ms / 100) / 10;
    if (!(sec * 10 % 10)) { sec = sec + '.0'; }
    // console.log(sec, `00:${pad(sec, 4, '0')}`);
    return `00:${pad(sec, 4, '0')}`;
  }
  const min = Math.floor(ms / 60000);
  const sec = Math.round((ms - (min * 60000)) / 1000);
  return `${pad(min, 2, '0')}:${pad(sec, 2, '0')}`;
}

function formatDate(ms = 0) {
  const dateObj = new Date(ms);
  const dPad = (v) => pad(v, 2, '0');
  const ddmmyyyy = `${dPad(dateObj.getDate())}-${dPad(dateObj.getMonth() + 1)}-${dateObj.getFullYear()}`;
  const hhmmss = `${dPad(dateObj.getHours())}:${dPad(dateObj.getMinutes())}:${dPad(dateObj.getSeconds())}`;
  return `${ddmmyyyy} ${hhmmss}`;
}

function pad(string, width = 10, placeholder = '0') { // lPad
  return (string + '').padStart(width, placeholder);
  // const n = number + '';
  // return n.length >= width ? n : new Array(width - n.length + 1).join(placeholder) + n;
}

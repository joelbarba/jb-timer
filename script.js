console.log('Ini');

document.getElementById('stop-btn').addEventListener('click',  (event) => stopTimer());
document.getElementById('reset-btn').addEventListener('click', (event) => resetTimer());
document.getElementById('undo-btn').addEventListener('click',  (event) => undoStep());

document.getElementById('big-btn').addEventListener('mousedown',  (e) => switchBtn(e));
// document.getElementById('big-btn').addEventListener('mouseup',    (event) => endStep());
document.getElementById('big-btn').addEventListener('touchstart', (e) => switchBtn(e, 'start'));
// document.getElementById('big-btn').addEventListener('touchend',   (e) => switchBtn(e, 'stop'));
// document.getElementById('big-btn').addEventListener('touchend',   (event) => endStep());

function switchBtn(e, evName) {
  e.stopPropagation();
  e.preventDefault();
  if (!stepTime) { iniStep(); } else { endStep(); }
  // if (!stepTime && evName === 'start') { iniStep(); } 
  // else if (stepTime && evName === 'stop') { endStep(); }
}

const timerEl = document.getElementById('timer');
const contrEl = document.getElementById('contr-time');
timerEl.textContent = '';
contrEl.textContent = '';

function startTimer() {
  if (!iniTime) {
    console.log(new Date(), 'START');
    iniTime = new Date();
    timerEl.textContent = formatTime(0);
    document.getElementById('start-time').textContent = formatDate(iniTime);
  }
}

function stopTimer() {
  console.log(new Date(), 'STOP');
  iniTime = undefined; 
}

function resetTimer() {
  console.log(new Date(), 'RESET');
  iniTime = undefined;
  steps.forEach(step => timelineEl.removeChild(step.el));
  steps = [];
  startTimer();
  render();
}


let iniTime;      // Initial time for the whole counter
let stepTime;     // Current contraction ini time
let steps = [];   // Contractions
let offset = 0;

const startLine = document.getElementById('start-line');
const timelineEl = document.getElementById('left-timeline');
const timelineHeight = Math.round(timelineEl.getBoundingClientRect().height);
startLine.style.top = 0 + 'px';

const maxSeconds = 60 * 60;  // Total time on the left (vertical) timeline
const pxPerMs = timelineHeight / maxSeconds / 1000;

const currentContractionBox = document.getElementById('current-contraction-box');
const currContWidth = Math.round(document.getElementById('top-timeline').getBoundingClientRect().width);
const currPxPerMs = currContWidth / 60 / 1000; // Total time on the top (horizontal)


function undoStep() {
  if (steps.length) {
    timelineEl.removeChild(steps.at(-1).el);
    steps = steps.slice(0, -1);
    console.log(steps);
    stepTime = undefined;
    printData();
    render(); 
  }
}


function iniStep() {  
  stepTime = new Date();
  const el = document.createElement('div');
  el.setAttribute('id', 'step-' + steps.length);
  el.setAttribute('class', 'contraction-box');
  timelineEl.appendChild(el);
  steps.push({ ini: stepTime, end: null, el });
  if (steps.length > 1) {
    const ms = (steps.at(-1).ini - steps.at(-2).end);
    document.getElementById('time-since-last').textContent = `Time Since Last: ${formatContractionTime(ms)}`;
  }
  render();
  document.getElementById('big-btn').setAttribute('class', 'tracking');
  document.getElementById('big-btn').textContent = 'STOP';
}


function endStep() {
  if (steps.length) {
    const currStep = steps.at(-1);
    currStep.end = new Date();
    const posX = Math.round((currStep.end - currStep.ini) * currPxPerMs);
    document.getElementById('last-contraction-line').style.left = posX + 'px';
    currentContractionBox.style.width = 0 + 'px';
    printData();
  }
  console.log(steps);
  stepTime = undefined;  
  render();
  document.getElementById('big-btn').removeAttribute('class');
  document.getElementById('big-btn').textContent = 'START';
}

function printData() {
  if (steps.length) {
    let tBetween = 0;
    for (let t = 1; t < steps.length; t++) { tBetween += (steps[t].ini - steps[t-1].end) / 1000; }
    document.getElementById('total-contractions').textContent   = steps.length;
    document.getElementById('avg-contraction-time').textContent = Math.round(10 * steps.reduce((a,v) => a + ((v.end - v.ini) / 1000), 0) / steps.length) / 10 + ' sec';
    document.getElementById('avg-time-between').textContent     = Math.round(10 * tBetween / steps.length) / 10  + ' sec';
  } else {
    document.getElementById('total-contractions').textContent   = '0';
    document.getElementById('avg-contraction-time').textContent = '0';
    document.getElementById('avg-time-between').textContent     = '0';
  }
}

function render() {
  if (iniTime) {
    const elapsedTimeMs = (new Date() - iniTime);
    const elapsedTime = Math.round(elapsedTimeMs / 1000);
    timerEl.textContent = formatTime(elapsedTimeMs);
    if (stepTime) {
      contrEl.textContent = `Contraction Time: ${formatContractionTime(new Date() - stepTime)}`;
    }

    const currentStep = steps.at(-1);
    if (currentStep && !currentStep.end) {
      currentContractionBox.style.width = Math.round((new Date() - currentStep.ini) * currPxPerMs) + 'px';
    }

    // If the time reaches the end, offset it a bit
    if (elapsedTime - offset > maxSeconds) {
      const delta = 10 * 60;  // Add 10 min (600sec)
      offset += delta;
      steps.forEach(step => { // Move all boxes up
        const newTop = Math.round(+step.el.style.top.split('px')[0] - (delta * 1000 * pxPerMs));
        step.el.style.top = newTop + 'px';
      });
    }

    let nowLine = (elapsedTimeMs - (offset * 1000)) * pxPerMs;
    startLine.style.height = Math.round(nowLine) + 'px';
    
    // Print contraction boxes
    steps.filter(step => !step.end).forEach(step => {
      if (step.ini) {
        const top = Math.round((step.ini - iniTime - (offset * 1000)) * pxPerMs);
        step.el.style.top = top + 'px';
        step.el.style.height = (nowLine - top) + 'px';
      }      
    });


    // if (elapsedTime <= maxSeconds) { startLine.style.height = Math.round(nowLine) + 'px'; }

    // Boxes Moving down
    // steps.filter(step => !step.isOut).forEach(step => {
    //   if (step.ini) {
    //     const bottom = Math.round((new Date() - step.ini) * pxPerMs);        
    //     if (!step.end) {
    //       step.el.style.top = 0 + 'px';
    //       step.el.style.height = bottom + 'px';
    //     } else {
    //       const top = Math.round((new Date() - step.end) * pxPerMs);
    //       step.el.style.top = top + 'px';
    //       step.el.style.height = (bottom - top) + 'px';
    //       if (top > timelineHeight) { step.isOut = true; }
    //     }
    //   }      
    // });


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

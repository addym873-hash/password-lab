'use strict';
// A transparent teaching heuristic, NOT a breach check or professional strength estimator.
const input = document.querySelector('#password');
const toggle = document.querySelector('#toggle');
const bar = document.querySelector('#bar');
const meter = document.querySelector('.meter');
const rating = document.querySelector('#rating');
const scoreElement = document.querySelector('#score');
const feedback = document.querySelector('#feedback');
const common = new Set(['password','password123','123456','123456789','qwerty','qwerty123','letmein','welcome','admin','iloveyou','12345678','111111','abc123','dragon','monkey']);

function analyzePassword(password) {
  const chars = Array.from(password); const length = chars.length;
  if (!length) return {score:0,label:'Not analyzed yet',notes:['Enter a sample password to see feedback.']};
  let score = Math.min(70, length * 4);
  const notes = [];
  const lower = password.toLowerCase();
  if (length < 15) {score -= 18; notes.push('Try 15 or more characters, especially for a password used without MFA.');}
  else notes.push('Good length: at least 15 characters.');
  if (length >= 20) score += 10;
  const categories = [/[a-z]/.test(password),/[A-Z]/.test(password),/[0-9]/.test(password),/[^a-zA-Z0-9]/.test(password)].filter(Boolean).length;
  score += Math.max(0, categories - 1) * 5; // Diversity is a small bonus, never a requirement.
  if (common.has(lower)) {score=0;notes.push('This appears in our small demonstration list of common passwords. Do not use it.');}
  else if (/password|qwerty|letmein|welcome|admin|123456|abc123|iloveyou/i.test(password)) {score -= 45;notes.push('Contains a common password or sequence. Avoid predictable terms.');}
  if (/(.)\1{2,}/u.test(password)) {score-=15;notes.push('Repeated characters make patterns more predictable.');}
  if (/^(.{2,})\1+$/u.test(password)) {
    score -= 35;
    notes.push('Avoid repeating groups of characters.');
}
  if (/0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf|zxcv/i.test(password)) {score-=20;notes.push('Avoid keyboard or counting sequences.');}
  if (/^(?:[a-zA-Z]+)(?:19|20)\d{2}[!?._]*$/.test(password)) {score-=25;notes.push('A word followed by a year and punctuation is a common pattern.');}
  if (new Set(chars).size <= Math.max(2, Math.floor(length / 4))) {score-=25;notes.push('Too many repeated characters reduce unpredictability.');}
  if (!notes.some(n=>/Avoid|Repeated|repeated|common|predictable|sequence/.test(n))) notes.push('Avoid personal details, reused passwords, and dictionary phrases.');
  score=Math.max(0,Math.min(100,score));
  const label=score<25?'Very weak':score<50?'Weak':score<75?'Fair':score<90?'Good':'Strong (estimated)';
  return {score,label,notes};
}
function render(){const result=analyzePassword(input.value);rating.textContent=result.label;scoreElement.textContent=`${result.score} / 100`;bar.style.width=`${result.score}%`;bar.style.background=result.score<50?'#f47b83':result.score<75?'#f3ba66':'#71e3c4';meter.setAttribute('aria-valuenow',String(result.score));feedback.replaceChildren(...result.notes.map(note=>{const li=document.createElement('li');li.textContent=note;return li;}));}
input.addEventListener('input',render);
toggle.addEventListener('click',()=>{const shown=input.type==='password';input.type=shown?'text':'password';toggle.textContent=shown?'Hide':'Show';toggle.setAttribute('aria-pressed',String(shown));});
document.querySelector('#clear').addEventListener('click',()=>{input.value='';input.type='password';toggle.textContent='Show';toggle.setAttribute('aria-pressed','false');document.querySelector('#generated').textContent='Click Generate to create an example';render();input.focus();});
const slider=document.querySelector('#length');slider.addEventListener('input',()=>{document.querySelector('#length-value').textContent=slider.value;});
// Rejection sampling avoids modulo bias in random character selection.
function secureRandomIndex(max){const limit=Math.floor(256/max)*max;const byte=new Uint8Array(1);do{crypto.getRandomValues(byte);}while(byte[0]>=limit);return byte[0]%max;}
function generatePassword(length){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_';let result='';for(let i=0;i<length;i++)result+=alphabet[secureRandomIndex(alphabet.length)];return result;}
document.querySelector('#generate').addEventListener('click',()=>{document.querySelector('#generated').textContent=generatePassword(Number(slider.value));});
render();

import puppeteer from 'puppeteer';
import fs from 'fs';

const out = 'D:/ABBAS/WORK/CLAUDE/CONCAVE 2.0/re-capture/demo';
fs.mkdirSync(out, { recursive: true });
const b = await puppeteer.launch({ headless: 'shell' });
const p = await b.newPage();
await p.setViewport({ width: 1600, height: 1000 });
const logs = [];
p.on('console', m => { const t = m.text(); if (/attention|skip|error|fail/i.test(t)) logs.push(`[${m.type()}] ${t.slice(0, 160)}`); });

const shot = (n) => p.screenshot({ path: `${out}/${n}.png`, fullPage: false });

await p.goto('https://concave-app.vercel.app/analyze', { waitUntil: 'domcontentloaded', timeout: 90000 });
await p.waitForSelector('input[type=file]', { timeout: 60000 });
await new Promise(r => setTimeout(r, 2000));

// 1. Pick Social
await p.evaluate(() => {
  const el = [...document.querySelectorAll('button,[role=button],[aria-pressed]')].find(e => (e.textContent || '').trim().startsWith('Social'));
  el?.click();
});
await new Promise(r => setTimeout(r, 1000));
await shot('1-social-selected');

// 2. Upload a generated test ad
await p.evaluate(async () => {
  const c = document.createElement('canvas'); c.width = 900; c.height = 1200;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 1200); g.addColorStop(0, '#0e1320'); g.addColorStop(1, '#27104a');
  x.fillStyle = g; x.fillRect(0, 0, 900, 1200);
  x.fillStyle = '#F59E0B'; x.beginPath(); x.arc(450, 430, 190, 0, 7); x.fill();
  x.fillStyle = '#111'; x.font = 'bold 42px Arial'; x.fillText('NOIR', 395, 445);
  x.fillStyle = '#fff'; x.font = 'bold 66px Arial'; x.fillText('KRONE NOIR', 215, 830);
  x.font = '34px Arial'; x.fillStyle = '#cbd5e1'; x.fillText('The scent of the night', 285, 895);
  x.fillStyle = '#3DDCC8'; x.fillRect(330, 985, 240, 72);
  x.fillStyle = '#04093a'; x.font = 'bold 32px Arial'; x.fillText('SHOP NOW', 362, 1032);
  x.fillStyle = '#fff'; x.font = 'bold 30px Arial'; x.fillText('KRONE', 40, 62);
  const blob = await new Promise(res => c.toBlob(res, 'image/png'));
  const file = new File([blob], 'KRONE-NOIR-social.png', { type: 'image/png' });
  const dt = new DataTransfer(); dt.items.add(file);
  const input = document.querySelector('input[type=file]');
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
});

// 3. Wait for attention measurement (model download first time ~30-60s)
let measured = false;
for (let i = 0; i < 75; i++) {
  await new Promise(r => setTimeout(r, 2000));
  const t = await p.evaluate(() => document.body.innerText);
  if (t.includes('Predicted attention measured')) { measured = true; break; }
}
console.log('MEASURED:', measured);
await shot('2-uploaded-measured');

// 4. Submit (wait for processing to finish enabling, then click the submit button)
for (let i = 0; i < 60; i++) {
  const clicked = await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button[type=submit]')][0];
    if (btn && !btn.disabled) { btn.click(); return true; }
    return false;
  });
  if (clicked) break;
  await new Promise(r => setTimeout(r, 2000));
}
await new Promise(r => setTimeout(r, 2500));
await shot('3-after-submit');

// 5. Clarification stage: proceed
await p.evaluate(() => {
  const el = [...document.querySelectorAll('button')].find(e => /proceed/i.test(e.textContent || ''));
  el?.click();
});

// 6. Wait for the report (up to 6 min)
let onReport = false;
for (let i = 0; i < 180; i++) {
  await new Promise(r => setTimeout(r, 2000));
  const url = p.url();
  const t = await p.evaluate(() => document.body.innerText);
  if (/\/analyze\/[0-9a-f-]{20,}/.test(url) && t.includes('CONCAVE SCORE')) { onReport = true; break; }
  if (t.includes('Analysis failed')) { console.log('FAILED:', (t.match(/Analysis failed[^\n]*/) || [''])[0].slice(0, 220)); break; }
}
console.log('REPORT:', onReport, p.url());
await new Promise(r => setTimeout(r, 2500));
await shot('4-report-overview');

if (onReport) {
  // open the Attention tile to show the heatmap
  await p.evaluate(() => {
    const el = [...document.querySelectorAll('button,[role=button]')].find(e => /^attention/i.test((e.textContent || '').trim()));
    el?.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await shot('5-attention-heatmap');
  await p.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 800));
  await shot('6-attention-detail');
}
console.log('LOGS:', logs.slice(-8).join(' || '));
await b.close();
console.log('DEMO DONE');

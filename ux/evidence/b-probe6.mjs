import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const out = {};
const scanFn = () => {
  const parse = (v) => { const m = String(v).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return { r:p[0],g:p[1],b:p[2],a:p[3]??1 }; };
  const lum = ({r,g,b}) => { const f=(v)=>{v/=255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
  const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);};
  const bgOf = (el) => { let n=el; while(n && n!==document.documentElement){ const c=parse(getComputedStyle(n).backgroundColor); if(c && c.a>0.9) return c; n=n.parentElement; } return parse(getComputedStyle(document.documentElement).backgroundColor); };
  const out=[];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg') || el.closest('script') || el.closest('style')) continue;
    const cs=getComputedStyle(el);
    if (cs.display==='none' || cs.visibility==='hidden' || +cs.opacity===0) continue;
    const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) continue;
    const nodes=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim());
    if (!nodes.length) continue;
    const txt=nodes.map(n=>n.textContent.trim()).join(' ').trim(); if(!txt) continue;
    const fg=parse(cs.color); const bg=bgOf(el); if(!fg||!bg) continue;
    const size=parseFloat(cs.fontSize); const weight=parseInt(cs.fontWeight)||400;
    const large=size>=24||(size>=18.66&&weight>=700); const need=large?3:4.5;
    const rr=Math.round(ratio(fg,bg)*100)/100;
    if (rr<need) out.push({ text:txt.slice(0,40), tag:el.tagName.toLowerCase(), cls:(el.className||'').toString().slice(0,40), fg:`rgb(${fg.r},${fg.g},${fg.b})`, bg:`rgb(${bg.r},${bg.g},${bg.b})`, size, weight, ratio:rr, need });
  }
  return { count: out.length, failures: out.slice(0,25) };
};
for (const path of ['/post/idempotency-keys-what-most-tutorials-dont-tell-you','/project/gencourse','/about','/writing','/projects']) {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const p = await c.newPage();
  await p.goto('http://localhost:4321'+path, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  out['dark'+path] = await p.evaluate(scanFn);
  await p.locator('#theme-toggle').click(); await p.waitForTimeout(900);
  out['light'+path] = await p.evaluate(scanFn);
  await c.close();
}
// 320 photo dialog + escape after 1.5s
{
  const c = await b.newContext({ viewport: { width: 320, height: 844 }, colorScheme: 'dark' });
  const p = await c.newPage();
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
  await p.locator('.photo-open').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
  await p.locator('.photo-open').first().click(); await p.waitForTimeout(1500);
  out.photo320 = await p.evaluate(() => { const d=document.querySelector('[data-photo-viewer]'); const r=d.getBoundingClientRect(); const s=d.querySelector('[data-viewer-stage]').getBoundingClientRect(); return { open:d.open, dialog:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}, stage:{w:Math.round(s.width),h:Math.round(s.height)}, btns:[...d.querySelectorAll('button')].map(x=>{const q=x.getBoundingClientRect();return {t:x.textContent.trim(),w:Math.round(q.width),h:Math.round(q.height)}}), scrollW:document.documentElement.scrollWidth, clientW:document.documentElement.clientWidth }; });
  const t0=Date.now(); await p.keyboard.press('Escape'); let closed=null;
  for(let i=0;i<30;i++){ if(!(await p.evaluate(()=>document.querySelector('[data-photo-viewer]').open))){closed=Date.now()-t0;break;} await p.waitForTimeout(50); }
  out.photo320.escapeMs = closed;
  await c.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();

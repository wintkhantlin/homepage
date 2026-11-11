import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const out = {};
const parse = (v) => { const m = String(v).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return { r:p[0],g:p[1],b:p[2],a:p[3]??1 }; };
const lum = ({r,g,b}) => { const f=(v)=>{v/=255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);};
async function scan(page, theme) {
  return await page.evaluate((theme) => {
    const parse = (v) => { const m = String(v).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return { r:p[0],g:p[1],b:p[2],a:p[3]??1 }; };
    const lum = ({r,g,b}) => { const f=(v)=>{v/=255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
    const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);};
    const bgOf = (el) => { let n=el; while(n && n!==document.documentElement){ const cs=getComputedStyle(n); const c=parse(cs.backgroundColor); if(c && c.a>0.9) return c; n=n.parentElement; } return parse(getComputedStyle(document.documentElement).backgroundColor); };
    const out=[];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('svg') || el.closest('script') || el.closest('style')) continue;
      const cs=getComputedStyle(el);
      if (cs.display==='none' || cs.visibility==='hidden' || +cs.opacity===0) continue;
      const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) continue;
      if (el.children.length && [...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())) {
        const txt=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim(); if(!txt) continue;
        const fg=parse(cs.color); if(!fg) continue;
        const bg=bgOf(el); if(!bg) continue;
        const size=parseFloat(cs.fontSize); const weight=parseInt(cs.fontWeight)||400;
        const large = size>=24 || (size>=18.66 && weight>=700);
        const need = large?3:4.5;
        const rr=Math.round(ratio(fg,bg)*100)/100;
        if (rr<need) out.push({ text:txt.slice(0,45), tag:el.tagName.toLowerCase(), cls:(el.className||'').toString().slice(0,50), fg:`rgb(${fg.r},${fg.g},${fg.b})`, bg:`rgb(${bg.r},${bg.g},${bg.b})`, size, weight, ratio:rr, need });
      }
    }
    return { theme, failures: out.slice(0,60), count: out.length };
  }, theme);
}
for (const theme of ['dark','light']) {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const p = await c.newPage();
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  if (theme==='light') { await p.locator('#theme-toggle').click(); await p.waitForTimeout(900); }
  out['home_'+theme] = await scan(p, theme);
  // heading levels
  out['headings_'+theme] = await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h=>getComputedStyle(h).display!=='none').map(h=>({l:+h.tagName[1], t:h.textContent.trim().slice(0,35)})));
  await c.close();
}
// headings on other routes
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const p = await c.newPage();
  for (const path of ['/projects','/writing','/about','/project/gencourse','/post/idempotency-keys-what-most-tutorials-dont-tell-you','/404']) {
    await p.goto('http://localhost:4321'+path, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
    out['headings'+path] = await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h=>getComputedStyle(h).display!=='none').map(h=>({l:+h.tagName[1], t:h.textContent.trim().slice(0,35)})));
  }
  await c.close();
}
// mobile photo dialog + diagram keyboard scroll
{
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  const p = await c.newPage();
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
  await p.locator('.photo-open').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
  await p.locator('.photo-open').first().click(); await p.waitForTimeout(700);
  out.mobilePhoto = await p.evaluate(() => { const d=document.querySelector('[data-photo-viewer]'); const s=d.querySelector('[data-viewer-stage]'); const r=d.getBoundingClientRect(); const btns=[...d.querySelectorAll('button')].map(b=>{const x=b.getBoundingClientRect();return {t:b.textContent.trim(),w:Math.round(x.width),h:Math.round(x.height)}}); return { open:d.open, dialog:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}, stage:{w:Math.round(s.getBoundingClientRect().width),h:Math.round(s.getBoundingClientRect().height)}, btns, htmlOverflow:getComputedStyle(document.documentElement).overflow, imgW:Math.round(d.querySelector('img').getBoundingClientRect().width) }; });
  await p.keyboard.press('Escape'); await p.waitForTimeout(900);
  // diagram keyboard scroll
  await p.goto('http://localhost:4321/project/gencourse', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
  await p.locator('[data-diagram]').scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  await p.locator('[data-diagram]').focus();
  const before = await p.evaluate(() => ({ sl: document.querySelector('[data-diagram]').scrollLeft, active: document.activeElement?.getAttribute('aria-label'), outline: getComputedStyle(document.activeElement).outline }));
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300);
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300);
  const after = await p.evaluate(() => ({ sl: document.querySelector('[data-diagram]').scrollLeft, outline: getComputedStyle(document.activeElement).outline }));
  out.diagramKeyboard = { before, after };
  await c.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();

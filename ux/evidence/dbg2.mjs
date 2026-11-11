import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chrome", headless: true });
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
for (const w of [320, 320, 360, 390]) {
  const c = await b.newContext({ viewport: { width: w, height: 844 }, colorScheme: "dark" });
  const p = await c.newPage();
  await p.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await p.evaluate(()=>document.fonts.ready); await sleep(900);
  const info = await p.evaluate(() => {
    const nav=document.querySelector('.site-nav');
    const btn=document.querySelector('#theme-toggle');
    const mail=[...document.querySelectorAll('.site-nav a')].find(a=>(a.getAttribute('href')||'').startsWith('mailto:'));
    const rr=(el)=>{const r=el.getBoundingClientRect();return {x:Math.round(r.x),w:Math.round(r.width),h:Math.round(r.height)};};
    return {
      innerWidth, scrollbar: innerWidth - document.documentElement.clientWidth,
      nav: rr(nav), navScrollW: nav.scrollWidth,
      btn: {...rr(btn), shrink:getComputedStyle(btn).flexShrink},
      mail: {...rr(mail), shrink:getComputedStyle(mail).flexShrink, text: mail.textContent.replace(/\s+/g,' ').trim()},
      spans: [...mail.querySelectorAll('span')].map(s=>({t:s.textContent.trim(), display:getComputedStyle(s).display, w:Math.round(s.getBoundingClientRect().width)})),
      children: [...nav.children].map(c=>({tag:c.tagName.toLowerCase(), text:c.textContent.replace(/\s+/g,' ').trim().slice(0,20), w:Math.round(c.getBoundingClientRect().width)})),
    };
  });
  console.log(w, JSON.stringify(info));
  await c.close();
}
// request initiator for full-size image on load
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const p = await c.newPage();
  const client = await p.context().newCDPSession(p);
  await client.send('Network.enable');
  const hits=[];
  client.on('Network.requestWillBeSent', e => { if (e.request.url.includes('w=1400')) hits.push({url:e.request.url.slice(-60), type:e.type, initiator:e.initiator}); });
  await p.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await sleep(1200);
  console.log('1400 hits', JSON.stringify(hits,null,1));
  console.log('imgs', await p.evaluate(()=>[...document.images].filter(i=>(i.currentSrc||'').includes('1400')).map(i=>({alt:i.alt.slice(0,20), inDialog:!!i.closest('dialog'), src:(i.currentSrc||'').slice(-40)}))));
  console.log('preloads', await p.evaluate(()=>[...document.querySelectorAll('link[rel=preload]')].map(l=>l.getAttribute('href'))));
  await c.close();
}
await b.close();

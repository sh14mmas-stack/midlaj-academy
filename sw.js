const C='hifz-v21',AC='hifz-audio',F=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./data/quran.json','./data/seg.json','./data/mutv.json','./data/mutp.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.allSettled(F.map(u=>c.add(u)))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C&&x!=AC).map(x=>caches.delete(x)))));self.clients.claim()});
async function aud(r){const u=new URL(r.url),c=await caches.open(AC),m=await c.match('audio/'+u.pathname.split('/').pop());if(!m)return fetch(r);
 const b=await m.blob(),n=b.size,rg=r.headers.get('range');if(!rg)return new Response(b,{status:200,headers:{'Content-Type':'audio/mpeg','Content-Length':n,'Accept-Ranges':'bytes'}});
 const x=/bytes=(\d*)-(\d*)/.exec(rg),s=x[1]?+x[1]:0,e=x[2]?Math.min(+x[2],n-1):n-1;
 return new Response(b.slice(s,e+1),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':`bytes ${s}-${e}/${n}`,'Content-Length':e-s+1,'Accept-Ranges':'bytes'}})}
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!='GET'||u.origin!=location.origin)return;
if(/\/audio\/\d{3}\.mp3$/.test(u.pathname)){e.respondWith(aud(r));return}
e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok&&res.status==200){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match('./index.html'))))});

const C='midlaj-v3-oct26',AC='hifz-audio';
self.addEventListener('install',e=>{
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(k=>Promise.all(k.map(x=>caches.delete(x)))).then(()=>self.clients.claim())
  );
});
async function aud(r){
  const u=new URL(r.url),c=await caches.open(AC),m=await c.match('audio/'+u.pathname.split('/').pop());
  if(!m)return fetch(r);
  const b=await m.blob(),n=b.size,rg=r.headers.get('range');
  if(!rg)return new Response(b,{status:200,headers:{'Content-Type':'audio/mpeg','Content-Length':n,'Accept-Ranges':'bytes'}});
  const x=/bytes=(\d*)-(\d*)/.exec(rg),s=x[1]?+x[1]:0,e=x[2]?Math.min(+x[2],n-1):n-1;
  return new Response(b.slice(s,e+1),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':`bytes ${s}-${e}/${n}`,'Content-Length':e-s+1,'Accept-Ranges':'bytes'}});
}
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!='GET'||u.origin!=location.origin)return;
  if(/\/audio\/\d{3}\.mp3$/.test(u.pathname)){e.respondWith(aud(r));return;}
  // For HTML documents and root navigation, ALWAYS fetch from network first so updates are immediate
  if(r.mode==='navigate'||u.pathname.endsWith('.html')||u.pathname.endsWith('/')||u.pathname.endsWith('midlaj-academy/')){
    e.respondWith(fetch(r).then(res=>{
      return res;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  // For other static assets, cache fallback
  e.respondWith(caches.match(r).then(m=>m||fetch(r)));
});

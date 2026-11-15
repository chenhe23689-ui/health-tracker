const CACHE_NAME='wellness-health-v6-20261116';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)))});
self.addEventListener('activate', event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('wellness-health-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('message', event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 const url=new URL(req.url);if(!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  try{const network=await fetch(req,{cache:'no-store'});if(network.ok)await cache.put(req,network.clone());return network}
  catch(err){const cached=await cache.match(req,{ignoreSearch:true});if(cached)return cached;
   if(req.mode==='navigate'){const fallback=await cache.match('./index.html');if(fallback)return fallback}
   throw err}
 })());
});

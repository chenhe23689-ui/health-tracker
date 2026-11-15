// 健康追蹤日記 V6.1：只快取網頁檔案，不清除 localStorage / IndexedDB。
const CACHE_NAME = 'wellness-health-v61-20261116';
const APP_PATH = '/health-tracker/';
const ASSETS = [APP_PATH, APP_PATH+'index.html',APP_PATH+'manifest.webmanifest',APP_PATH+'icon-192.png',APP_PATH+'icon-512.png'];
self.addEventListener('install', e=>{
 e.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  await cache.addAll(ASSETS);
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',e=>{
 e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('wellness-health-') && k!==CACHE_NAME).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
 const request=e.request;
 const url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(APP_PATH))return;
 e.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  try {
   const resp=await fetch(request,{cache:'no-store'});
   if(resp.ok)await cache.put(request,resp.clone());
   return resp;
  } catch(err) {
   const cached=await cache.match(request,{ignoreSearch:true});
   if(cached)return cached;
   if(request.mode==='navigate'){
    const fallback=await cache.match(APP_PATH+'index.html');
    if(fallback)return fallback;
   }
   throw err;
  }
 })());
});

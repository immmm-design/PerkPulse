// PerkPulse AI Service Worker
// Caches app shell for offline/installable PWA experience

const CACHE_NAME = 'perkpulse-v1'

// Shell resources to pre-cache
const SHELL = [
  '/',
  '/dashboard',
  '/manifest.json',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET, non-same-origin, and API requests
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  // Network-first strategy for navigation, cache-first for assets
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/dashboard') ?? caches.match('/'))
    )
  } else {
    event.respondWith(
      caches.match(request).then(cached => cached ?? fetch(request))
    )
  }
})

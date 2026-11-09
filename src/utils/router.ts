/**
 * Simple client-side router for VietTone AI:
 * - '/' : Public Marketing & Product Landing Page
 * - '/app' : VietTone Learning Application
 * 
 * Supports browser history, back/forward buttons, and hash fallbacks.
 */

export type AppRoute = '/' | '/app';

export const getInitialRoute = (): AppRoute => {
  if (typeof window === 'undefined') return '/';
  
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  // If path is /app or hash is #/app or #app, go to /app
  if (path === '/app' || path.startsWith('/app/') || hash === '#/app' || hash === '#app') {
    return '/app';
  }

  return '/';
};

/**
 * Reads a URL query parameter from window.location.search or window.location.hash
 */
export const getQueryParam = (name: string): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const val = searchParams.get(name);
    if (val) return val;

    const hash = window.location.hash;
    if (hash.includes('?')) {
      const hashParams = new URLSearchParams(hash.split('?')[1]);
      return hashParams.get(name);
    }
  } catch {
    // Graceful fallback
  }

  return null;
};

export const navigateTo = (route: AppRoute, queryParams?: Record<string, string>) => {
  if (typeof window === 'undefined') return;

  let url: string = route;
  if (queryParams && Object.keys(queryParams).length > 0) {
    const search = new URLSearchParams(queryParams).toString();
    url = `${route}?${search}`;
  }

  try {
    window.history.pushState({ route, queryParams }, '', url);
    window.dispatchEvent(new PopStateEvent('popstate', { state: { route, queryParams } }));
  } catch {
    const hashSuffix = url.includes('?') ? '?' + url.split('?')[1] : '';
    window.location.hash = route === '/app' ? `#/app${hashSuffix}` : '#/';
  }
};


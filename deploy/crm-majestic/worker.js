const ORIGIN = 'https://playbeat-crm.uzzirulzz.workers.dev';
const THEME_LINKS = '<link rel="stylesheet" href="/majestic/style.css"><link rel="stylesheet" href="/majestic/overrides.css">';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return Response.redirect(`${url.origin}/crm`, 302);
    }

    if (url.pathname.startsWith('/majestic/')) {
      return env.ASSETS.fetch(request);
    }

    const upstreamUrl = new URL(url.pathname + url.search, ORIGIN);
    const upstreamRequest = new Request(upstreamUrl, request);
    upstreamRequest.headers.set('host', new URL(ORIGIN).host);
    let response = await env.CRM.fetch(upstreamRequest);

    if (response.status >= 300 && response.status < 400) {
      const headers = new Headers(response.headers);
      const location = headers.get('location');
      if (location) {
        const target = new URL(location, upstreamUrl);
        if (target.origin === ORIGIN) {
          target.protocol = url.protocol;
          target.host = url.host;
          headers.set('location', target.toString());
        }
      }
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    response = new Response(response.body, response);
    const transformed = new HTMLRewriter()
      .on('head', {
        element(element) {
          element.append(THEME_LINKS, { html: true });
        },
      })
      .transform(response);
    transformed.headers.delete('content-length');
    transformed.headers.delete('content-encoding');
    transformed.headers.set('cache-control', 'no-store');
    return transformed;
  },
};

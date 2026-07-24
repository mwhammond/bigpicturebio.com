/**
 * Minimal Cloudflare Worker wrapper for the existing static multi-page site.
 * Sites provides the ASSETS binding from dist/client at deployment time.
 */
function assetRequest(request, pathname) {
  var url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url.toString(), {
    method: request.method,
    headers: request.headers
  });
}

async function serve(request, env, pathname) {
  return env.ASSETS.fetch(assetRequest(request, pathname));
}

var worker = {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { allow: "GET, HEAD" }
      });
    }

    var url = new URL(request.url);
    var pathname = url.pathname;
    var candidate = pathname.endsWith("/") ? pathname + "index.html" : pathname;
    var response = await serve(request, env, candidate);

    if (response.status === 404 && !pathname.endsWith("/")) {
      var finalSegment = pathname.slice(pathname.lastIndexOf("/") + 1);
      if (finalSegment.indexOf(".") === -1) {
        response = await serve(request, env, pathname + ".html");
        if (response.status === 404) {
          response = await serve(request, env, pathname + "/index.html");
        }
      }
    }

    if (response.status === 404) {
      return new Response("Page not found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }

    var headers = new Headers(response.headers);
    headers.set("x-content-type-options", "nosniff");
    headers.set("referrer-policy", "strict-origin-when-cross-origin");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  }
};

export default worker;

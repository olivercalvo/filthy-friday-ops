/**
 * Smoke test post-deploy: verifica que el HTML del root carga y que el primer
 * stylesheet `/_next/static/css/*.css` referenciado se sirve con HTTP 200,
 * Content-Type text/css y >10 KB. Cubre el bug E-005 (build cache de Vercel
 * inconsistente entre deploys → CSS rota).
 *
 *   npx tsx scripts/smoke-deploy.ts <url> [bypass-token]
 *
 * Para previews protegidos por Vercel SSO, pasar el bypass token como segundo
 * argumento o setear la env VERCEL_BYPASS_TOKEN. La prod no lo necesita.
 *
 * Exit codes: 0 OK, 1 smoke failed, 2 bad usage.
 */

const MIN_CSS_BYTES = 10_000;
const FETCH_TIMEOUT_MS = 15_000;

function withBypass(url: string, token: string | undefined): string {
  if (!token) return url;
  const u = new URL(url);
  u.searchParams.set("x-vercel-protection-bypass", token);
  // No setear x-vercel-set-bypass-cookie: con `ssoProtection.deploymentType=preview`
  // ese param devuelve 401 en este proyecto. Como añadimos el bypass a cada request
  // del smoke por separado (HTML + CSS), la cookie no aporta nada.
  return u.toString();
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { redirect: "follow", signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function smokeDeploy(rawUrl: string, bypassToken?: string): Promise<void> {
  const baseUrl = rawUrl.replace(/\/+$/, "");
  console.log(`> smoke ${baseUrl}`);

  const htmlUrl = withBypass(baseUrl + "/", bypassToken);
  const htmlRes = await fetchWithTimeout(htmlUrl);
  if (htmlRes.status === 401 && !bypassToken) {
    throw new Error(
      `HTML 401: el deployment requiere SSO bypass. Setear VERCEL_BYPASS_TOKEN o pasar el token como 2º arg.`
    );
  }
  if (htmlRes.status !== 200) {
    throw new Error(`HTML HTTP ${htmlRes.status} (esperado 200)`);
  }
  const html = await htmlRes.text();
  console.log(`  ✓ HTML 200 (${html.length}b)`);

  const cssMatch = html.match(/\/_next\/static\/css\/[a-zA-Z0-9_-]+\.css/);
  if (!cssMatch) {
    throw new Error(
      `no se encontró link a /_next/static/css/*.css en el HTML — el bundle está roto o la página no es de Next.js`
    );
  }
  const cssPath = cssMatch[0];
  console.log(`  ✓ CSS link: ${cssPath}`);

  const cssUrl = withBypass(baseUrl + cssPath, bypassToken);
  const cssRes = await fetchWithTimeout(cssUrl);
  if (cssRes.status !== 200) {
    throw new Error(
      `CSS HTTP ${cssRes.status} (esperado 200) — síntoma clásico de E-005: HTML referencia un hash que no existe en el bundle desplegado`
    );
  }
  const ct = cssRes.headers.get("content-type") ?? "";
  if (!ct.toLowerCase().startsWith("text/css")) {
    throw new Error(
      `CSS Content-Type "${ct}" (esperado text/css) — el server está devolviendo HTML donde debería ir CSS (E-005)`
    );
  }
  const cssBody = await cssRes.text();
  if (cssBody.length < MIN_CSS_BYTES) {
    throw new Error(
      `CSS body ${cssBody.length}b (mínimo ${MIN_CSS_BYTES}b) — Tailwind no compiló las clases o el bundle está incompleto`
    );
  }
  console.log(`  ✓ CSS 200, ${ct.split(";")[0]}, ${cssBody.length}b`);
  console.log(`✓ smoke OK: ${baseUrl}`);
}

const isCli =
  typeof process !== "undefined" &&
  process.argv[1] &&
  /smoke-deploy\.[cm]?[jt]sx?$/.test(process.argv[1].replace(/\\/g, "/"));

if (isCli) {
  const url = process.argv[2];
  const token = process.argv[3] ?? process.env.VERCEL_BYPASS_TOKEN;
  if (!url) {
    console.error("usage: npx tsx scripts/smoke-deploy.ts <url> [bypass-token]");
    process.exit(2);
  }
  smokeDeploy(url, token).catch((err: Error) => {
    console.error(`✗ ${err.message}`);
    process.exit(1);
  });
}

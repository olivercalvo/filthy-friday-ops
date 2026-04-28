/**
 * Deploy a Vercel con `--force` por default (evita cache de build inconsistente
 * — bug E-005) + smoke test automático del deployment resultante.
 *
 *   npx tsx scripts/deploy.ts preview   # vercel deploy --force --yes
 *   npx tsx scripts/deploy.ts prod      # vercel deploy --prod --force --yes
 *
 * En prod, smoke testea el alias estable (filthy-friday-ops.vercel.app).
 * En preview, smoke usa VERCEL_BYPASS_TOKEN si está seteado.
 */
import { spawn } from "node:child_process";
import { smokeDeploy } from "./smoke-deploy";

const targetArg = (process.argv[2] ?? "preview").toLowerCase();
const isProd = targetArg === "prod" || targetArg === "production";

const vercelArgs = ["deploy", "--force", "--yes"];
if (isProd) vercelArgs.push("--prod");

console.log(`> vercel ${vercelArgs.join(" ")}`);

const child = spawn("vercel", vercelArgs, {
  shell: true,
  stdio: ["inherit", "pipe", "pipe"],
});

let stdoutBuf = "";

child.stdout.on("data", (chunk: Buffer) => {
  const s = chunk.toString();
  process.stdout.write(s);
  stdoutBuf += s;
});
child.stderr.on("data", (chunk: Buffer) => {
  const s = chunk.toString();
  process.stderr.write(s);
  stdoutBuf += s;
});

child.on("close", async (code) => {
  if (code !== 0) {
    console.error(`\n✗ vercel deploy salió con code ${code}`);
    process.exit(code ?? 1);
  }

  // Para prod preferimos el alias (Aliased: <url>) — es lo que el cliente abre.
  // Para preview, el deployment URL (Preview: <url> o el .vercel.app crudo).
  const aliased = stdoutBuf.match(/Aliased:\s+(https:\/\/\S+?)(?:\s|\[|$)/);
  const targeted = stdoutBuf.match(/(?:Preview|Production):\s+(https:\/\/\S+?)(?:\s|\[|$)/);
  const anyVercelUrl = stdoutBuf.match(/https:\/\/[a-z0-9][a-z0-9-]*\.vercel\.app/);
  const url =
    (isProd ? aliased?.[1] : undefined) ?? targeted?.[1] ?? anyVercelUrl?.[0];

  if (!url) {
    console.error("\n✗ no pude extraer la URL del deployment de la salida de vercel");
    process.exit(1);
  }

  console.log("");
  try {
    await smokeDeploy(url, process.env.VERCEL_BYPASS_TOKEN);
    process.exit(0);
  } catch (err) {
    console.error(`✗ ${(err as Error).message}`);
    if (!isProd && !process.env.VERCEL_BYPASS_TOKEN) {
      console.error(
        `  hint: previews están detrás de Vercel SSO. Setear VERCEL_BYPASS_TOKEN para que el smoke test pueda entrar.`
      );
    }
    process.exit(1);
  }
});

import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url"; // 🔑 Import ini untuk ganti __dirname

// 🔥 Dapatkan __dirname di ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  // 🔧 Resolve path absolute ke folder shared
  const rootDir = path.resolve(__dirname, "..");
  const sharedPath = path.resolve(rootDir, "shared");

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
    // 🔥 KONFIGURASI ALIAS UNTUK @shared
    alias: {
      "@shared": sharedPath,
    },
    // 🔥 TAMBAHKAN plugins untuk resolve path dengan benar
    plugins: [
      {
        name: "alias-plugin",
        setup(build) {
          build.onResolve({ filter: /^@shared\// }, (args) => {
            const resolvedPath = path.join(sharedPath, args.path.replace("@shared/", ""));
            return { path: resolvedPath };
          });
        },
      },
    ],
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});

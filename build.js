const esbuild = require("esbuild");

async function build() {
  try {
    // Dashboard Lambda
    await esbuild.build({
      entryPoints: ["dashboard/index.ts"],
      bundle: true,
      platform: "node",
      target: "node18",
      outfile: "dist/dashboard.js",
      sourcemap: false,
      minify: true,
    });

    // Hello Lambda
    await esbuild.build({
      entryPoints: ["src/handlers/hello.ts"],
      bundle: true,
      platform: "node",
      target: "node18",
      outfile: "dist/hello.js",
      sourcemap: false,
      minify: true,
    });

    console.log("✅ Build completed");
  } catch (err) {
    console.error("❌ Build failed:", err);
    process.exit(1);
  }
}

build();
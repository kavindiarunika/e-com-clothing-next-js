const nextConfig = (phase) => ({
  distDir: phase === "phase-development-server" ? ".next-dev" : ".next",
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
});

export default nextConfig;

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/" || pathname === "") pathname = "/index.html";
    if (pathname === "/mockup") pathname = "/mockup.html";

    // Handle directory index resolution
    let filePath = "." + pathname;
    let file = Bun.file(filePath);

    if (await file.exists()) {
      // Check if it's a directory
      const stat = await file.stat();
      if (stat && stat.isDirectory()) {
        const indexFile = Bun.file(filePath.replace(/\/?$/, "/index.html"));
        if (await indexFile.exists()) {
          return new Response(indexFile);
        }
      } else {
        return new Response(file);
      }
    } else {
      // Check if path with /index.html exists
      const indexFile = Bun.file(filePath + "/index.html");
      if (await indexFile.exists()) {
        return new Response(indexFile);
      }
    }

    return new Response("Not Found: " + pathname, { status: 404 });
  },
});

console.log(`Bun server running at http://localhost:${server.port}`);

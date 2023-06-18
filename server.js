const http = require("http");
const next = require("next");
const app = next({
  dir: "./",
  dev: true,
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const port = 3000;
    const server = http.createServer((req, res) => {
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

      handle(req, res);
    });

    server.listen(port);
  })
  .catch((err) => {
    console.trace(err);
  });

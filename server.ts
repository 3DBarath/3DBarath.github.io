import express from 'express';
import path from 'path';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const rootDir = process.cwd();

app.get('/mockup', (_req, res, next) => {
  res.sendFile(path.join(rootDir, 'mockup.html'), (err) => {
    if (err) next();
  });
});

app.use(express.static(rootDir, { index: 'index.html' }));

app.use((req, res) => {
  res.status(404).send(`Not Found: ${req.path}`);
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

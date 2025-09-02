import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Servir arquivos estáticos da pasta dist
app.use(express.static(path.join(__dirname, '../dist')));

// Para qualquer rota que não seja um arquivo estático, servir o index.html (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
});
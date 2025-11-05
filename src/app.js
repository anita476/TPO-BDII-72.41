import express from 'express';
import compose from 'docker-compose';
import { fileURLToPath } from 'url';
import path from 'path';
import connectMongoDB from './config/mongodb.js';

// Define __dirname manually for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

async function startContainers() {
  console.log('Starting containers...');
  try {
    await compose.upAll({ cwd: path.resolve(__dirname, '../'), log: true });
    console.log('All containers started');
  } catch (err) {
    console.error('Error starting containers:', err);
  }
}

startContainers(); // auto-start containers

app.get('/', (req, res) => {
  res.send('Containers are up and Express is running!');
});

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));

process.on('SIGINT', async () => {
  console.log('\nStopping containers...');
  await compose.down({ cwd: __dirname });
  process.exit(0);
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectMongoDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
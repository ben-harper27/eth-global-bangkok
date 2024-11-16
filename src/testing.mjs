import express from 'express';
import coinbase from "./task/deps/coinbase.js";
import { Wallet } from '@coinbase/coinbase-sdk';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Get the project root directory (assuming src is one level deep from root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

app.get('/health', (req, res) => {
  res.status(200).send({ status: 200, message: 'OK' });
});

app.post('/create-wallet', async (req, res) => {
  try {
    const wallet = await Wallet.create();
    res.status(200).send({ status: 200, wallet: wallet.toString() });
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/app", (req, res) => {
  res.sendFile(path.join(projectRoot, 'src/client/main.html'));
});

function handleError(error, res) {
  console.error('Error:', error);
  if (error.code === 'ECONNABORTED') {
    res.status(504).send('Request Timed Out');
  } else if (error?.response?.status === 404) {
    res.status(404).send('Not found');
  } else {
    res.status(500).send('Internal Server Error');
  }
}

app.listen(port, () => {
  console.log(`IPFS server listening at http://localhost:${port}`);
});

export default app;

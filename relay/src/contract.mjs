import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const contractFile = path.join(dataDir, 'contract.json');

export function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function saveContractAddress(address) {
  ensureDataDir();
  fs.writeFileSync(contractFile, JSON.stringify({ address }, null, 2), 'utf-8');
}

export function loadContractAddress() {
  try {
    const raw = fs.readFileSync(contractFile, 'utf-8');
    const { address } = JSON.parse(raw);
    return address || null;
  } catch {
    return null;
  }
}

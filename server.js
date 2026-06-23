import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { ReceiptorX } from '@dev-ayokunle/receiptx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

const upload = multer({ storage: multer.memoryStorage() });

const EXPECTED_RECIPIENT = 'Ayodele Ganiyu';
const EXPECTED_BANK = 'SmartCash';
const EXPECTED_AMOUNT = 500;
const RCX_API_KEY = 'rcx_live_tdqc9aq0ot45zgalmnpoenkrapd91xf9';

const client = new ReceiptorX({
  rcxApiKey: RCX_API_KEY,
  expectedRecipientName: EXPECTED_RECIPIENT,
  expectedBankName: EXPECTED_BANK,
  expectedAmount: EXPECTED_AMOUNT,
});

app.post('/api/verify', upload.single('receiptImage'), async (req, res) => {
  try {
    let result;
    const { imageUrl } = req.body;
    const file = req.file;
    if (file) {
      console.log('Verifying uploaded file...');
      result = await client.verify(file.buffer);
    } 
    else if (imageUrl && imageUrl.trim() !== '') {
      console.log('Verifying URL...');
      result = await client.verify(imageUrl.trim());
    } 
    else {
      return res.status(400).json({ error: 'Please provide a file or a valid image URL.' });
    }

    return res.json(result);

  } catch (error) {
    console.error('Verification Error:', error.message);
    return res.status(500).json({ 
      valid: false,
      reason: 'Server error during verification. Check API key or network.',
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Test site running at http://localhost:${PORT}`);
});
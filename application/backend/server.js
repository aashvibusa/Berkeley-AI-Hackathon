import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const AGENT_ID = process.env.LETTA_AGENT_ID;
const API_KEY = process.env.LETTA_API_KEY;
const BASE_URL = `https://api.letta.ai/v1/agent/${AGENT_ID}/tool`;

app.post('/api/save-vocab', async (req, res) => {
  const { word, userId } = req.body;

  try {
    const response = await fetch(`${BASE_URL}/save_vocab/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input: word, user_id: userId })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save vocab' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
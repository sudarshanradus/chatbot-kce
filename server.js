const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.static('.')); // Serve index.html from /public

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await axios.post(
      process.env.OPENAI_API_URL,
      {
        model: 'meta-llama/llama-3-8b-instruct', // Free model on OpenRouter
        messages: [
  {
    role: 'system',
    content: 'You are a helpful assistant for Karpagam College of Engineering (KCE). Answer only questions related to KCE like admissions, departments, courses, hostel, fees, placements, etc. If the user asks anything unrelated, politely say you can only answer questions about KCE.',
  },
  {
    role: 'user',
    content: userMessage
  }
],

      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000', // Optional
          'X-Title': 'KCE Chatbot',                // Optional
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error('OpenRouter error:', error.response?.data || error.message);
    res.status(500).json({ error: 'OpenRouter API call failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

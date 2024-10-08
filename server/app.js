import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';  // Import the cors middleware

// Load environment variables from .env file
dotenv.config();

const app = express();

// Allow CORS for all origins (you can restrict this to specific origins if needed)
app.use(cors());

// Middleware for parsing application/json
app.use(bodyParser.json()); // Expect application/json content-type

// POST endpoint to send a message using Pushover
app.post('/send-text', async (req, res) => {
  const body = req.body; // Expect JSON object in the request body

  // Ensure the body exists and is a valid JSON object
  if (!body || typeof body !== 'object') {
    return res.status(400).send('Valid JSON body is required.');
  }

  // Extract 'fris' and 'team' from the JSON body
  const { fris, team } = body;

  // Ensure 'fris' and 'team' are provided
  if (!fris || !team) {
    return res.status(400).send('Both fris and team fields are required.');
  }

  // Pushover API details (token, user key)
  const pushoverToken = process.env.PUSHOVER_TOKEN;
  const pushoverUser = process.env.PUSHOVER_USER_KEY;

  // Pushover message parameters
  const messageParams = {
    token: pushoverToken,
    user: pushoverUser,
    message: `Hello Lad. Frisbee ${fris} has been collected by the ${team} team.`,
    title: 'Frisbee Collection Alert',
  };

  try {
    // Send a POST request to Pushover API
    const response = await axios.post('https://api.pushover.net/1/messages.json', new URLSearchParams(messageParams), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Log and send a response based on Pushover API's response
    console.log(`Pushover API response:`, response.data);
    res.status(200).send('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    res.status(500).send('Failed to send message');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

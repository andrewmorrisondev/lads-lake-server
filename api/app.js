import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

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
}

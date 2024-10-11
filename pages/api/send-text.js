import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://poweredbybackstage.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight (OPTIONS) request
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Return OK for preflight
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let body;

  try {
    // If the body is a string, attempt to parse it as JSON
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }
  } catch (error) {
    return res.status(400).send('Invalid JSON body.');
  }

  // Ensure the body exists and is a valid JSON object
  if (!body || typeof body !== 'object') {
    return res.status(400).send('Valid JSON body is required.');
  }

  // Extract message if provided
  const { message } = body;

  // Extract 'fris' and 'team' from the JSON body
  const { fris, team } = body;

  // Pushover API details (token, user key)
  const pushoverToken = process.env.PUSHOVER_TOKEN;
  const pushoverUser = process.env.PUSHOVER_USER_KEY;

  // Build the Pushover message
  let pushoverMessage;
  let title;

  // If a `message` field exists, use that
  if (message) {
    pushoverMessage = message;
    title = 'Custom Message';
  } 
  // If `fris` and `team` are provided, use the frisbee collection message
  else if (fris && team) {
    pushoverMessage = `Hello Lad. Frisbee ${fris} has been collected by the ${team} team.`;
    title = 'Frisbee Collection Alert';
  } else {
    // If neither format is correct, return an error
    return res.status(400).send('Either a "message" or both "fris" and "team" fields are required.');
  }

  // Pushover message parameters
  const messageParams = {
    token: pushoverToken,
    user: pushoverUser,
    message: pushoverMessage,
    title: title,
  };

  try {
    // Send a POST request to Pushover API
    const response = await axios.post(
      'https://api.pushover.net/1/messages.json',
      new URLSearchParams(messageParams),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Log and send a response based on Pushover API's response
    console.log('Pushover API response:', response.data);
    res.status(200).send('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    res.status(500).send('Failed to send message');
  }
}

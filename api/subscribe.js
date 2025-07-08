const webpush = require('web-push');

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BPIRTqVASFkgZXN7ZxhnAggIyVRH6odSACevMoSKKnOpjmfxXrebjNIFPNyQ0Ug6hdQBxQFXeYUBdj5pRI6XfSM';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'VlmDYHGprGSTxeecy63s7vqNbJ_76b7LASZh_e6PijM';

webpush.setVapidDetails(
  'mailto:your_email@example.com',
  publicVapidKey,
  privateVapidKey
);

// In a real application, you would store these subscriptions in a database.
// For this example, we'll use a simple in-memory array. This means subscriptions
// will be lost if the serverless function instance is reset.
const subscriptions = [];

module.exports = (req, res) => {
  console.log('subscribe.js function invoked');
  if (req.method === 'POST') {
    const subscription = req.body;
    subscriptions.push(subscription);
    console.log('Subscription added:', subscription);
    res.status(201).json({});
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

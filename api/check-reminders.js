const webpush = require('web-push');

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BPIRTqVASFkgZXN7ZxhnAggIyVRH6odSACevMoSKKnOpjmfxXrebjNIFPNyQ0Ug6hdQBxQFXeYUBdj5pRI6XfSM';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'VlmDYHGprGSTxeecy63s7vqNbJ_76b7LASZh_e6PijM';

webpush.setVapidDetails(
  'mailto:your_email@example.com',
  publicVapidKey,
  privateVapidKey
);

// This should ideally load reminders from a persistent store.
// For this example, we'll use a simple in-memory array (same as in schedule-reminder.js).
// In a real app, you'd need a shared database.
const remindersStore = []; // This will be empty on each invocation of the serverless function

module.exports = async (req, res) => {
  console.log('check-reminders.js function invoked by cron job');

  // In a real application, you would load reminders from a database here.
  // Since we're using an in-memory store, this function won't have access
  // to reminders added by schedule-reminder.js unless we implement a shared store.
  // For demonstration, let's assume reminders are loaded from somewhere.

  // *** IMPORTANT: This in-memory `remindersStore` will be empty on each cron invocation.
  // *** To make this work, you MUST use a persistent database (e.g., Supabase, Firebase, MongoDB Atlas free tier).
  // *** For now, this function will only demonstrate the push sending logic.

  // Example of how you would check and send notifications if reminders were persistent:
  // const now = Date.now();
  // for (const reminder of remindersStore) {
  //   if (!reminder.sent && new Date(reminder.date).getTime() <= now) {
  //     const payload = JSON.stringify({ title: 'Reminder!', body: reminder.text });
  //     try {
  //       await webpush.sendNotification(reminder.subscription, payload);
  //       console.log('Notification sent for:', reminder.text);
  //       reminder.sent = true; // Mark as sent
  //     } catch (error) {
  //       console.error('Error sending notification:', error);
  //     }
  //   }
  // }

  // For now, let's just send a test notification if a subscription exists (for demonstration).
  // In a real scenario, you'd iterate through actual due reminders.
  if (req.method === 'GET') { // Cron jobs typically trigger GET requests
    console.log('Cron job triggered check-reminders.');
    // This is where you'd query your database for due reminders
    // For now, we can't access the subscriptions from subscribe.js directly here
    // without a persistent store.

    res.status(200).json({ message: 'Reminder check initiated.' });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

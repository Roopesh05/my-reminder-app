const webpush = require('web-push');

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BPIRTqVASFkgZXN7ZxhnAggIyVRH6odSACevMoSKKnOpjmfxXrebjNIFPNyQ0Ug6hdQBxQFXeYUBdj5pRI6XfSM';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'VlmDYHGprGSTxeecy63s7vqNbJ_76b7LASZh_e6PijM';

webpush.setVapidDetails(
  'mailto:your_email@example.com',
  publicVapidKey,
  privateVapidKey
);

// This will store reminders in memory for now.
// In a real app, you'd use a database.
const remindersStore = [];

module.exports = async (req, res) => {
  console.log('schedule-reminder.js function invoked');
  if (req.method === 'POST') {
    const { subscription, reminderText, reminderDate } = req.body;

    const newReminder = {
      subscription: subscription,
      text: reminderText,
      date: reminderDate,
      sent: false, // Flag to track if notification has been sent
    };
    remindersStore.push(newReminder);
    console.log('Reminder stored:', newReminder);
    console.log('Current reminders in store:', remindersStore);

    res.status(200).json({ message: 'Reminder received and stored.' });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
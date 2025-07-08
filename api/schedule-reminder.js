const webpush = require('web-push');

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BPIRTqVASFkgZXN7ZxhnAggIyVRH6odSACevMoSKKnOpjmfxXrebjNIFPNyQ0Ug6hdQBxQFXeYUBdj5pRI6XfSM';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'VlmDYHGprGSTxeecy63s7vqNbJ_76b7LASZh_e6PijM';

webpush.setVapidDetails(
  'mailto:your_email@example.com',
  publicVapidKey,
  privateVapidKey
);

module.exports = async (req, res) => {
  console.log('schedule-reminder.js function invoked');
  if (req.method === 'POST') {
    const { subscription, reminderText, reminderDate } = req.body;

    // In a real application, you would save the reminder and schedule a job
    // to send the push notification at the specified reminderDate.
    // For this example, we'll simulate scheduling by setting a timeout.
    console.log('Received subscription:', subscription);
    console.log('Reminder text:', reminderText);
    console.log('Reminder date:', reminderDate);

    const payload = JSON.stringify({ title: 'Reminder!', body: reminderText });

    try {
      console.log('Attempting to send notification immediately for testing...');
      await webpush.sendNotification(subscription, payload);
      console.log('Notification sent successfully for:', reminderText);
      res.status(200).json({ message: 'Notification sent immediately for testing.' });
    } catch (error) {
      console.error('Error sending notification:', error);
      console.error('WebPush error details:', error.body); // Log error body for more details
      res.status(500).json({ error: 'Failed to send notification immediately.' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

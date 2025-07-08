const webpush = require('web-push');

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BPIRTqVASFkgZXN7ZxhnAggIyVRH6odSACevMoSKKnOpjmfxXrebjNIFPNyQ0Ug6hdQBxQFXeYUBdj5pRI6XfSM';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'VlmDYHGprGSTxeecy63s7vqNbJ_76b7LASZh_e6PijM';

webpush.setVapidDetails(
  'mailto:your_email@example.com',
  publicVapidKey,
  privateVapidKey
);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { subscription, reminderText, reminderDate } = req.body;

    // In a real application, you would save the reminder and schedule a job
    // to send the push notification at the specified reminderDate.
    // For this example, we'll simulate scheduling by setting a timeout.
    const delay = new Date(reminderDate).getTime() - Date.now();

    if (delay < 0) {
      // If the reminder date is in the past, send immediately
      const payload = JSON.stringify({ title: 'Reminder!', body: reminderText });
      try {
        await webpush.sendNotification(subscription, payload);
        console.log('Immediate notification sent:', reminderText);
        res.status(200).json({ message: 'Immediate reminder sent.' });
      } catch (error) {
        console.error('Error sending immediate notification:', error);
        res.status(500).json({ error: 'Failed to send immediate notification.' });
      }
    } else {
      // Schedule the notification
      setTimeout(async () => {
        const payload = JSON.stringify({ title: 'Reminder!', body: reminderText });
        try {
          await webpush.sendNotification(subscription, payload);
          console.log('Scheduled notification sent:', reminderText);
        } catch (error) {
          console.error('Error sending scheduled notification:', error);
        }
      }, delay);

      res.status(200).json({ message: 'Reminder scheduled.' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

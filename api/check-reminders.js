const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BPIRTqVASFkgZXN7ZxhnAggIyVRH6odSACevMoSKKnOpjmfxXrebjNIFPNyQ0Ug6hdQBxQFXeYUBdj5pRI6XfSM';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'VlmDYHGprGSTxeecy63s7vqNbJ_76b7LASZh_e6PijM';

webpush.setVapidDetails(
  'mailto:your_email@example.com',
  publicVapidKey,
  privateVapidKey
);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  console.log('check-reminders.js function invoked by cron job');

  if (req.method === 'GET') { // Cron jobs typically trigger GET requests
    try {
      const now = new Date().toISOString();

      // Fetch due reminders that haven't been sent yet
      const { data: dueReminders, error: fetchError } = await supabase
        .from('reminders')
        .select('id, text, date, subscription')
        .eq('sent', false)
        .lte('date', now);

      if (fetchError) {
        console.error('Error fetching due reminders:', fetchError);
        return res.status(500).json({ error: 'Failed to fetch due reminders.' });
      }

      console.log(`Found ${dueReminders.length} due reminders.`);

      for (const reminder of dueReminders) {
        const payload = JSON.stringify({ title: 'Reminder!', body: reminder.text });
        try {
          // Ensure the subscription object is correctly formatted for webpush
          const subscription = {
            endpoint: reminder.subscription.endpoint,
            keys: {
              p256dh: reminder.subscription.keys.p256dh,
              auth: reminder.subscription.keys.auth,
            },
          };

          await webpush.sendNotification(subscription, payload);
          console.log('Notification sent for:', reminder.text);

          // Update reminder status to sent
          const { error: updateError } = await supabase
            .from('reminders')
            .update({ sent: true })
            .eq('id', reminder.id);

          if (updateError) {
            console.error('Error updating reminder status:', updateError);
          }
        } catch (sendError) {
          console.error('Error sending notification for reminder:', reminder.id, sendError);
          console.error('WebPush error details:', sendError.body); // Log error body for more details
        }
      }

      res.status(200).json({ message: 'Reminder check completed.' });
    } catch (e) {
      console.error('Caught error in check-reminders.js:', e);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
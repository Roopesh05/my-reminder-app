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
  console.log('schedule-reminder.js function invoked');
  if (req.method === 'POST') {
    const { subscription, reminderText, reminderDate } = req.body;

    try {
      // Store the reminder in Supabase
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          text: reminderText,
          date: new Date(reminderDate).toISOString(),
          subscription: subscription, // Store the full subscription object
          sent: false,
        });

      if (error) {
        console.error('Error storing reminder:', error);
        return res.status(500).json({ error: 'Failed to store reminder.' });
      }

      console.log('Reminder stored in Supabase:', data);
      res.status(200).json({ message: 'Reminder received and stored.' });
    } catch (e) {
      console.error('Caught error in schedule-reminder.js:', e);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

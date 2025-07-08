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
  console.log('subscribe.js function invoked');
  if (req.method === 'POST') {
    const subscription = req.body;

    try {
      // Store the subscription in Supabase
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        });

      if (error) {
        console.error('Error storing subscription:', error);
        return res.status(500).json({ error: 'Failed to store subscription.' });
      }

      console.log('Subscription added to Supabase:', data);
      res.status(201).json({});
    } catch (e) {
      console.error('Caught error in subscribe.js:', e);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
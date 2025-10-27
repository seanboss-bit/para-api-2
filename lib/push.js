const webpush = require('web-push');

const publicKey = process.env.WEB_PUSH_PUBLIC_APIKEY;
const privateKey = process.env.WEB_PUSH_PRIVATE_APIKEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:paraplugs@gmail.com';

if (!publicKey || !privateKey) {
  console.warn('VAPID keys are not set. Push notifications will fail until env vars are set.');
}

webpush.setVapidDetails(subject, publicKey, privateKey);

module.exports = {
  webpush,
  getVapidPublicKey: () => publicKey,
};
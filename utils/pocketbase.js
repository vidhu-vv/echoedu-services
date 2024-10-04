const PocketBase = require('pocketbase/cjs');
const eventsource = require('eventsource');
global.EventSource = eventsource;

const pb = new PocketBase(process.env.PUBLIC_API_URL);

function authenticate() {
  console.log('> reauthenticating with database');
  pb.admins.authWithPassword(
    process.env.API_ADMIN_EMAIL,
    process.env.API_ADMIN_PASSWORD
  );
}

setInterval(authenticate, 86_400_000);

module.exports = {
  pb,
};

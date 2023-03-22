const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID, 
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];

  return {payload, userid};
}

module.exports = {
    verifyGoogleToken
}
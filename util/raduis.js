const radius = require('radius');
const dgram = require('dgram');
const crypto = require('crypto');

const RADIUS_SERVER = {
  host: process.env.RADIUS_SERVER_IP, 
  port: process.env.RADIUS_PORT,         
  secret: process.env.SHARED_SECRET,
};

const client = dgram.createSocket('udp4');

const authenticateUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const packet = {
      code: 'Access-Request',
      secret: RADIUS_SERVER.secret,
      authenticator: crypto.randomBytes(16),
      attributes: [
          ['User-Name', username],
          ['User-Password', password],
      ],
    };
    
    const encodedPacket = generateMessageAuthenticator(packet, RADIUS_SERVER.secret);
    client.send(encodedPacket, 0, encodedPacket.length, RADIUS_SERVER.port, RADIUS_SERVER.host, (err) => {
        if (err) return reject(err);
    });

    // Timeout to avoid hanging
    const timeout = setTimeout(() => {
      client.removeAllListeners('message');
      resolve({ success: false, message: 'RADIUS server did not respond in time' });
    }, 5000);

    // Listen for responses
    client.once('message', (msg) => {
      clearTimeout(timeout); // Clear timeout when a response is received
      const response = radius.decode({ packet: msg, secret: RADIUS_SERVER.secret });
      if (response.code === 'Access-Accept') {
        resolve({ success: true, message: 'Authentication successful' });
      } else if (response.code === 'Access-Reject') {
        resolve({ success: false, message: 'Authentication failed' });
      } else {
        resolve({ success: false, message: 'Unexpected response from RADIUS server' });
      }
    });
  });
};
const generateMessageAuthenticator = (packet, secret) => {
  const msgAuthenticator = Buffer.alloc(16, 0); // Placeholder for authenticator
  packet.attributes.push(['Message-Authenticator', msgAuthenticator]);

  // Temporarily encode the packet to compute hash
  const encodedPacket = radius.encode(packet);
  const hash = crypto.createHmac('md5', secret).update(encodedPacket).digest();

  // Replace placeholder with computed hash
  const index = encodedPacket.indexOf(msgAuthenticator);
  if (index !== -1) {
      hash.copy(encodedPacket, index);
  }
  return encodedPacket;
};

module.exports = { 
    authenticateUser 
};

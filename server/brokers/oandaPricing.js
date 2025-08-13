const https = require('https');

function getStreamHost(env) {
  return env === 'live' ? 'stream-fxtrade.oanda.com' : 'stream-fxpractice.oanda.com';
}

// Open an OANDA pricing stream for given instruments and call onData with each JSON line.
function openPricingStream({ apiKey, accountId, instruments, environment = 'practice', onData, onError }) {
  if (!apiKey || !accountId || !instruments || instruments.length === 0) {
    throw new Error('apiKey, accountId, instruments are required');
  }

  const host = getStreamHost(environment);
  const path = `/v3/accounts/${accountId}/pricing/stream?instruments=${encodeURIComponent(instruments.join(','))}`;

  const options = {
    host,
    path,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  };

  const req = https.request(options, (res) => {
    res.setEncoding('utf8');
    let buffer = '';
    res.on('data', (chunk) => {
      buffer += chunk;
      let index;
      while ((index = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, index).trim();
        buffer = buffer.slice(index + 1);
        if (!line) continue;
        try {
          const json = JSON.parse(line);
          onData && onData(json);
        } catch (e) {
          // Ignore parse errors for partial lines
        }
      }
    });
    res.on('end', () => {
      onError && onError(new Error('OANDA pricing stream ended'));
    });
  });

  req.on('error', (err) => onError && onError(err));
  req.end();

  return () => {
    try { req.destroy(); } catch {}
  };
}

module.exports = { openPricingStream };

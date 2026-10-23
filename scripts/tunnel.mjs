import { spawn } from 'node:child_process';

const PORT = 5173;

console.log(`\n========================================================================`);
console.log(`[Spacekit] Starting Cloudflare Quick Tunnel for http://localhost:${PORT}...`);
console.log(`========================================================================`);
console.log(`WARNING: This creates a public internet URL accessible to anyone.`);
console.log(`Do not transmit sensitive credentials or private tokens through the tunnel.`);
console.log(`========================================================================\n`);

const tunnel = spawn('npx', ['--yes', 'cloudflared', 'tunnel', '--url', `http://localhost:${PORT}`], {
  stdio: ['inherit', 'pipe', 'pipe'],
});

let foundUrl = false;

function parseOutput(data) {
  const text = data.toString();
  process.stdout.write(text);

  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match && !foundUrl) {
    foundUrl = true;
    const tunnelUrl = match[0];
    console.log(`\n========================================================================`);
    console.log(`TUNNEL READY! Public URL: ${tunnelUrl}`);
    console.log(`========================================================================`);
    console.log(`Code Injection Snippet (for Safari / Mobile / Canary testing):`);
    console.log(`------------------------------------------------------------------------`);
    console.log(`<script src="${tunnelUrl}/sitekit.core.js" defer></script>`);
    console.log(`------------------------------------------------------------------------`);
    console.log(`Press Ctrl+C to close the tunnel.`);
    console.log(`========================================================================\n`);
  }
}

tunnel.stdout.on('data', parseOutput);
tunnel.stderr.on('data', parseOutput);

tunnel.on('close', (code) => {
  console.log(`\nTunnel process exited with code ${code}`);
});

process.on('SIGINT', () => {
  tunnel.kill();
  process.exit();
});


/**
 * Start script for GUI server
 *
 * Usage: npx tsx src/gui/start-gui.ts
 * Or: npm run gui
 */

import { GuiServer } from './server.js';
import { EventBus } from '../logging/index.js';

async function main() {
  const port = parseInt(process.env.GUI_PORT || '3847', 10);
  const host = process.env.GUI_HOST || 'localhost';

  console.log('Starting RWM Puppet Master GUI Server...\n');

  // Create event bus for real-time events
  const eventBus = new EventBus();

  // Create and start server
  const server = new GuiServer(
    {
      port,
      host,
      corsOrigins: [`http://${host}:${port}`],
    },
    eventBus
  );

  try {
    await server.start();
    console.log(`GUI Server running at ${server.getUrl()}`);
    console.log(`\nOpen your browser to: ${server.getUrl()}\n`);
    console.log('Press Ctrl+C to stop the server.\n');

    // Emit a test event to verify WebSocket is working
    setTimeout(() => {
      eventBus.emit({
        type: 'state_changed',
        from: 'idle',
        to: 'idle',
      });
    }, 1000);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down...');
      await server.stop();
      console.log('Server stopped.');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nReceived SIGTERM. Shutting down...');
      await server.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start GUI server:', error);
    process.exit(1);
  }
}

main();

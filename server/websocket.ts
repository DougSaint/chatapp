import { Server as WebSocketServer, WebSocket } from 'ws';
import { verifyToken, JwtPayload } from './auth';
import { dbPromise } from './database/db';

const wss = new WebSocketServer({ port: 8080 });

 wss.on('connection', (ws: WebSocket, req) => {
  console.log('Client connected');

  let user: JwtPayload | null = null;

  ws.on('message', async (message: string) => {
    const parts = message.split(' ');
    const command = parts[0];
    const payload = parts.slice(1).join(' ');
  
    if (command === 'auth') {
      user = verifyToken(payload);
  
      if (user) {
        ws.send('Authenticated');
      } else {
        ws.send('Authentication failed');
      }
    } else if (command === 'message') {
      if (user) {
        const db = await dbPromise;
        await db.run('INSERT INTO messages (user_id, content, timestamp) VALUES (?, ?, ?)', [user.id, payload, Date.now()]);
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(`${user?.username}: ${payload}`);
          }
        });
      } else {
        ws.send('Not authenticated');
      }
    } else {
      ws.send('Invalid command or not authenticated');
    }
  });
  

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server started on port 8080');

export default wss;
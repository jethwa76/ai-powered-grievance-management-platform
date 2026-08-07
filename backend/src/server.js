import http from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

const app = createApp(); const server = http.createServer(app); const io = new Server(server, { cors: { origin: env.clientUrl, credentials:true } });
io.on('connection', (socket) => { socket.on('complaint:subscribe', (id) => socket.join(`complaint:${id}`)); socket.on('citizen:subscribe', (id) => socket.join(`citizen:${id}`)); });
app.set('io', io);
if (process.env.NODE_ENV !== 'test') connectDatabase().then(() => server.listen(env.port, () => console.log(`API listening on ${env.port}`))).catch((error) => { console.error(error); process.exit(1); });
export { app, server, io };

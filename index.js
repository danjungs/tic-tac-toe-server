import express from 'express';
import http from 'http';
import cors from 'cors';
import { appIO } from './socket/socketController.js';

const app = express();

app.use(cors());

const server = http.createServer(app);

appIO(server);

server.listen(4000, ()=> console.log('Server is running on port 4000'));
import cors from 'cors';
import express from 'express';
import router from './routers/index.js';
import cookieParser from 'cookie-parser';
import pino from 'pino-http';
import { env } from './utils/env.js';

const allowedOrigins = [
  'https://scory-game.vercel.app',
  'https://scory-game-preview.vercel.app',
  'http://localhost:3000',
  'http://localhost:4000',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

const PORT = Number(env('PORT', '3000'));

// ------
export const setupServer = () => {
  const app = express();

  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );
  app.get('/', (req, res) => {
    res.json({
      message: 'Hello world!',
    });
  });

  app.use(router);
  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  app.use((err, req, res) => {
    res.status(500).json({
      message: 'Something went wrong',
      error: err.message,
    });
  });
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
};

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import authRouter from './auth.ts';
import profilesRouter from './profiles.ts';

const app = express();
const port = Number(process.env.PORT || 3001);

// Basic request logger to aid debugging
app.use((req, _res, next) => {
  console.log(`[api] ${req.method} ${req.path}`);
  next();
});

// CORS: allow localhost & 127.0.0.1 in dev, exact origins in prod
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const configured = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = configured.length ? configured : defaultOrigins;

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser or same-origin
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/profiles', profilesRouter);

app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});

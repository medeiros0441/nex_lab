require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { saveImage, downloadImage, adminPanel, healthCheck } = require('./controller');
const fs = require('fs');
const path = require('path');

const app = express();

const allowedOrigins =  [
      'https://projeto-nex-lab.vercel.app',
      'http://localhost:8081',
    ];


// Middleware de log de requisições
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// Middleware CORS
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
    allowedHeaders: ['Content-Type', 'x-api-key'],  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  
  credentials: true

}));

app.use(express.json({ limit: '50mb' }));

// 🔒 Middleware global para validar x-api-key
app.use((req, res, next) => {
  const clientKey = req.headers['x-api-key'];
  const expectedKey = "b5bW9jdAdC3zkGmn7UqV8kRMq7phgGKyO5Vds9XWeoM";
  if (!clientKey || clientKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  next();
});
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});
app.post('/api/save', saveImage);

app.get('/api/admin', adminPanel);

app.get('/api/health', healthCheck);

app.get('/api/uploads/:filename', downloadImage);

app.get('/', (req, res) => {
  res.status(403).sendFile(path.join(__dirname, 'default.html'));
});

app.get(/^\/(?!api\/).*/, (req, res) => {
  res.status(403).sendFile(path.join(__dirname, 'default.html'));
});

// Só inicia o servidor localmente
if (process.env.NODE_ENV !== 'production') {
  app.listen(4000, () => {
    console.log(`Backend rodando em http://localhost:${4000}`);
  });
}

module.exports = app;

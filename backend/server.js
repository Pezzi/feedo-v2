// backend/server.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middlewares
app.use(cors());

// --- ENDPOINTS DA API ---

// 1. Endpoint para os KPIs (usado por useDashboardStats)
app.get('/api/dashboard/stats', (req, res) => {
  console.log(`[OK] Requisição para /api/dashboard/stats`);
  const stats = {
    totalFeedbacks: 58,
    averageRating: 8.2,
    activeQRCodes: 4,
    pendingFeedbacks: 1
  };
  res.json(stats);
});

// 2. Endpoint para o gráfico de NPS (usado por useNpsTrend)
app.get('/api/dashboard/nps-trend', (req, res) => {
  console.log(`[OK] Requisição para /api/dashboard/nps-trend`);
  // Dados de exemplo para o gráfico de linha
  const trendData = [
    { day: '01/06', nps_score: 40 },
    { day: '05/06', nps_score: 55 },
    { day: '10/06', nps_score: 50 },
    { day: '15/06', nps_score: 65 },
    { day: '20/06', nps_score: 75 },
    { day: '25/06', nps_score: 70 },
  ];
  res.json(trendData);
});

// 3. Endpoint para o mapa (usado por useAllFeedbacksForMap)
app.get('/api/feedbacks/map', (req, res) => {
  console.log(`[OK] Requisição para /api/feedbacks/map`);
  // Dados de exemplo para o mapa (latitude/longitude)
  const mapData = [
    { id: 1, latitude: -28.2833, longitude: -52.7833 }, // Carazinho, RS
    { id: 2, latitude: -30.0346, longitude: -51.2177 }, // Porto Alegre, RS
    { id: 3, latitude: -23.5505, longitude: -46.6333 }, // São Paulo, SP
    { id: 4, latitude: -22.9068, longitude: -43.1729 }, // Rio de Janeiro, RJ
    { id: 5, latitude: -28.2910, longitude: -52.7950 }, // Outro em Carazinho
  ];
  res.json(mapData);
});

// --- INICIAR O SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT} e pronto para servir o dashboard completo!`);
});
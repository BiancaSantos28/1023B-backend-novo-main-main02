import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rotasAutenticadas from './rotas/rotas-autenticadas.js';
import rotasNaoAutenticadas from './rotas/rotas-nao-autenticadas.js';

const app = express();

// 🧩 Middlewares globais
app.use(cors());
app.use(express.json());

// 🔓 Rotas públicas (não exigem login)
app.use(rotasNaoAutenticadas);

// 🔒 Rotas protegidas (exigem login via Auth dentro delas)
app.use(rotasAutenticadas);

app.listen(8000, () => {
  console.log('✅ Servidor rodando na porta 8000');
});
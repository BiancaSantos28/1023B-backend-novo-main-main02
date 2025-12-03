import { Request, Response } from "express";

// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, requireRole } = require('../middleware/auth');

// criar produto — somente ADMIN
router.post('/', authenticateToken, requireRole('ADMIN'), async (req:Request, res:Response) => {
  try {
    const { name, price, category, description, imageUrl } = req.body;
    const product = new Product({ name, price, category, description, imageUrl });
    await product.save();
    return res.status(201).json(product);
  } catch (err) {
    console.error(err);
    if (err instanceof Error)
      return res.status(400).json({ message: 'Erro ao criar produto', error: err.message });
    return res.status(500).json({ message: 'Erro ao criar produto' });
  }
});

// listar produtos (público)
router.get('/', async (req:Request, res:Response) => {
  const q:{name?: any; category?: any} = {name:"", category:""};
  // permitir filtros via query string (ex: ?q=nome&cat=eletronicos)
  if (req.query.name) q.name = { $regex: req.query.name, $options: 'i' };
  if (req.query.category) q.category = req.query.category;
  const products = await Product.find(q);
  res.json(products);
});

module.exports = router;

import { Router } from "express";
import Auth from "../middleware/auth.js";
import AdminAuth from "../middleware/adminAuth.js";

import produtoController from "../produtos/produto.controller.js";
import carrinhoController from "../carrinho/carrinho.controller.js";
import usuarioController from "../usuarios/usuario.controller.js";
import pagamentoController from "../pagamento/pagamento.controller.js";

const rotasAutenticadas = Router();

// Todas as rotas abaixo exigem login
rotasAutenticadas.use(Auth);

// PAGAMENTO (STRIPE)
rotasAutenticadas.post(
  "/checkout",
  pagamentoController.criarPagamentoCartao
);

// PRODUTOS (ADMIN)
rotasAutenticadas.post("/produtos", AdminAuth, produtoController.adicionar);
rotasAutenticadas.delete("/produtos/:id", AdminAuth, produtoController.excluir);

// CARRINHO
rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
rotasAutenticadas.post("/removerItem", carrinhoController.removerItem);
rotasAutenticadas.get("/carrinho", carrinhoController.listarItens);
rotasAutenticadas.put("/alterarQuantidade", carrinhoController.alterarQuantidade);
rotasAutenticadas.delete("/limparCarrinho", carrinhoController.limparCarrinho);

// LISTAR USUÁRIOS (ADMIN)
rotasAutenticadas.get(
  "/admin/usuarios",
  AdminAuth,
  usuarioController.listarApenasAdmins
);

// PRODUTOS (USUÁRIO AUTENTICADO)
rotasAutenticadas.get("/produtos", produtoController.listar);

export default rotasAutenticadas;

import { Router } from "express";
import produtoController from "../produtos/produto.controller.js";
import usuarioController from "../usuarios/usuario.controller.js";

const rotasNaoAutenticadas = Router();

// 🧑‍💻 Usuários (cadastro, login, listagem)
rotasNaoAutenticadas.post("/usuarios", usuarioController.adicionar);
rotasNaoAutenticadas.get("/usuarios", usuarioController.listar);
rotasNaoAutenticadas.post("/login", usuarioController.login);

// 🛍️ Produtos (rota pública)
rotasNaoAutenticadas.get("/produtos", produtoController.listar);

export default rotasNaoAutenticadas;

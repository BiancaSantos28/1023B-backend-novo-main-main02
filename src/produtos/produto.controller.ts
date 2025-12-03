import { Request, Response } from 'express';
import { db } from '../database/banco-mongo.js';
import { ObjectId } from 'bson';

class ProdutoController {
    async adicionar(req: Request, res: Response) {
        const { nome, preco, descricao, urlfoto } = req.body;
        const produto = { nome, preco, descricao, urlfoto };
        const resposta = await db.collection('produtos').insertOne(produto);
        res.status(201).json({ ...produto, _id: resposta.insertedId });
    }

    async listar(req: Request, res: Response) {
        const produtos = await db.collection('produtos').find().toArray();
        res.status(200).json(produtos);
    }

    async excluir(req: Request, res: Response) {
        try {
            const produtoId = req.params.id;
            const tipoUsuario = req.headers['tipousuario']; // ou pegar do token JWT

            if (tipoUsuario !== 'admin') {
                return res.status(403).json({ mensagem: "Acesso negado. Apenas admin pode excluir produtos." });
            }

            const resultado = await db.collection('produtos').deleteOne({ _id: new ObjectId(produtoId) });

            if (resultado.deletedCount === 0) {
                return res.status(404).json({ mensagem: "Produto não encontrado." });
            }

            res.status(200).json({ mensagem: "Produto excluído com sucesso!" });
        } catch (error: any) {
            res.status(500).json({ mensagem: error.message });
        }
    }

    async atualizar(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const { nome, preco, urlfoto, descricao, categoria } = req.body;
    
        // Verifica autenticação
        const usuarioId = (req as any).usuarioId;
        if (!usuarioId) return res.status(401).json({ mensagem: "Usuário não autenticado." });
    
        const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(usuarioId) });
        if (!usuario?.isAdmin) {
          return res.status(403).json({ mensagem: "Apenas administradores podem editar produtos." });
        }
    
        const update: any = {};
        if (nome) update.nome = nome;
        if (preco) update.preco = preco;
        if (urlfoto) update.urlfoto = urlfoto;
        if (descricao) update.descricao = descricao;
        if (categoria) update.categoria = categoria;
    
        const result = await db.collection("produtos").updateOne({ _id: new ObjectId(id) }, { $set: update });
        if (result.matchedCount === 0) {
          return res.status(404).json({ mensagem: "Produto não encontrado 😢" });
        }
    
        const produtoAtualizado = await db.collection("produtos").findOne({ _id: new ObjectId(id) });
        return res.status(200).json(produtoAtualizado);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro ao atualizar produto 😞" });
      }
    }
}

// Exporta uma nova instância da classe ProdutoController
export default new ProdutoController();


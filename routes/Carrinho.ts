import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";

interface AlterarQuantidadeBody {
  produtoId: string;
  novaQuantidade: number;
}

interface LimparCarrinhoBody {
  usuarioId: string;
}

export async function carrinhoRoutes(app: FastifyInstance) {
  // ROTA PARA ALTERAR QUANTIDADE (JÁ EXISTENTE)
  app.put(
    "/alterarQuantidade",
    async (
      request: FastifyRequest<{ Body: AlterarQuantidadeBody }>,
      reply: FastifyReply
    ) => {
      const { produtoId, novaQuantidade } = request.body;

      if (!produtoId || typeof novaQuantidade !== "number") {
        return reply.status(400).send({
          mensagem: "Dados inválidos enviados.",
        });
      }

      if (novaQuantidade <= 0) {
        return reply.status(400).send({
          mensagem: "Quantidade deve ser maior que 0.",
        });
      }

      try {
        const carrinho = app.mongo.db?.collection("carrinho");
        if (!carrinho) {
          return reply.status(500).send({ mensagem: "Erro ao acessar o banco." });
        }

        const resultado = await carrinho.updateOne(
          { produtoId: new ObjectId(produtoId) },
          { $set: { quantidade: novaQuantidade } }
        );

        if (resultado.modifiedCount === 0) {
          return reply.status(404).send({
            mensagem: "Item não encontrado no carrinho.",
          });
        }

        return reply.send({
          mensagem: "Quantidade atualizada com sucesso!",
        });

      } catch (erro) {
        console.error(erro);
        return reply.status(500).send({
          mensagem: "Erro no servidor ao alterar quantidade.",
        });
      }
    }
  );

  // NOVA ROTA PARA LIMPAR CARRINHO COMPLETO
  app.delete(
    "/limparCarrinho",
    async (
      request: FastifyRequest<{ Body: LimparCarrinhoBody }>,
      reply: FastifyReply
    ) => {
      const { usuarioId } = request.body;

      if (!usuarioId) {
        return reply.status(400).send({
          mensagem: "ID do usuário é obrigatório.",
        });
      }

      try {
        const carrinhosCollection = app.mongo.db?.collection("carrinhos");
        if (!carrinhosCollection) {
          return reply.status(500).send({ mensagem: "Erro ao acessar o banco." });
        }

        // Verificar se o carrinho existe
        const carrinhoExistente = await carrinhosCollection.findOne({ 
          usuarioId: usuarioId 
        });

        if (!carrinhoExistente) {
          return reply.status(404).send({
            mensagem: "Carrinho não encontrado para este usuário.",
          });
        }

        // Verificar se o carrinho já está vazio
        if (!carrinhoExistente.itens || carrinhoExistente.itens.length === 0) {
          return reply.status(200).send({
            mensagem: "Carrinho já está vazio.",
            carrinho: {
              usuarioId,
              itens: [],
              total: 0,
              dataAtualizacao: new Date()
            }
          });
        }

        // Limpar o carrinho
        const resultado = await carrinhosCollection.updateOne(
          { usuarioId: usuarioId },
          { 
            $set: { 
              itens: [], 
              total: 0, 
              dataAtualizacao: new Date() 
            } 
          }
        );

        if (resultado.modifiedCount === 0) {
          return reply.status(500).send({
            mensagem: "Erro ao limpar carrinho.",
          });
        }

        return reply.send({
          mensagem: "Carrinho limpo com sucesso!",
          carrinho: {
            usuarioId,
            itens: [],
            total: 0,
            dataAtualizacao: new Date()
          }
        });

      } catch (erro) {
        console.error("Erro ao limpar carrinho:", erro);
        return reply.status(500).send({
          mensagem: "Erro no servidor ao limpar carrinho.",
        });
      }
    }
  );
}
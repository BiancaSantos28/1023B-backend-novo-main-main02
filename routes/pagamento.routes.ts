import { FastifyInstance } from "fastify";
import Stripe from "stripe";

export default async function pagamentoRotas(app: FastifyInstance) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  });

  app.post("/checkout", async (req, res) => {
    try {
      const { itens } = req.body as any;

      if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).send({
          erro: "Nenhum item enviado.",
        });
      }

      // Converte itens do carrinho → Stripe
      const line_items = itens.map((item: any) => ({
        price_data: {
          currency: "brl",
          product_data: {
            name: item.nome || "Produto",
          },
          unit_amount: Math.round(Number(item.precoUnitario) * 100), // R$ → centavos
        },
        quantity: Number(item.quantidade) || 1,
      }));

      // Cria sessão de Checkout Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: "http://localhost:5173/sucesso",
        cancel_url: "http://localhost:5173/cancelado",
      });

      return res.send({ url: session.url });
    } catch (err) {
      console.error("Erro Stripe:", err);
      return res.status(500).send({
        erro: "Erro ao criar pagamento.",
      });
    }
  });
}

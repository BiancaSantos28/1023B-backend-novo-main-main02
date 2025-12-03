import { Request, Response } from "express";
import Stripe from "stripe";

// Inicializa Stripe com a SECRET_KEY
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
});

class PagamentoController {
  async criarPagamentoCartao(req: Request, res: Response) {
    try {
      const { itens } = req.body;

      if (!itens || itens.length === 0) {
        return res.status(400).json({ erro: "Nenhum item enviado." });
      }

      // Converter itens do carrinho → Stripe
      const line_items = itens.map((item: any) => ({
        price_data: {
          currency: "brl",
          product_data: {
            name: item.nome,
          },
          unit_amount: Math.round(item.precoUnitario * 100), // R$ → centavos
        },
        quantity: item.quantidade,
      }));

      // Criar sessão de pagamento
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: "http://localhost:5173/sucesso",
        cancel_url: "http://localhost:5173/cancelado",
      });

      return res.json({ url: session.url });
    } catch (err: any) {
      console.error("Erro Stripe:", err);
      return res.status(500).json({ erro: "Erro ao criar pagamento." });
    }
  }
}

export default new PagamentoController();

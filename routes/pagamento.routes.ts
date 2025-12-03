import { FastifyInstance } from "fastify";
import Stripe from "stripe";

export default async function pagamentoRotas(app: FastifyInstance) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  });

  app.post("/criar-pagamento-cartao", async (req, res) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 5000, // 50,00 reais — sempre em centavos
        currency: "brl",
        payment_method_types: ["card"],
        metadata: {
          pedido_id: "123",
        },
      });

      return res.send({
        clientSecret: paymentIntent.client_secret,
      });

    } catch (err) {
      console.log(err);
      return res.status(400).send({
        mensagem: "Erro ao criar pagamento",
      });
    }
  });
}
 
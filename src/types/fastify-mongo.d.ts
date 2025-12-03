import "@fastify/mongodb";

declare module "fastify" {
  interface FastifyInstance {
    mongo: {
      db: any;
      client: any;
      ObjectId: any;
    };
  }
}

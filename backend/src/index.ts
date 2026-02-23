import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';

// Import validated configuration (validates at startup)
import { PORT, CORS_ORIGIN } from './config';
import { initSentry, captureException } from './utils/sentry';

import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { Context, createContext, prisma } from './types/context';
import healthRoutes from './routes/health';

// Initialize Sentry (no-op if SENTRY_DSN not set)
initSentry();

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers: resolvers as any,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  // Health check routes (before CORS for probe access)
  app.use('/', healthRoutes);

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: CORS_ORIGIN,
      credentials: true,
    }),
    bodyParser.json(),
    expressMiddleware(server, {
      context: createContext,
    })
  );

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));

  console.log(`Server ready at http://localhost:${PORT}/graphql`);
  console.log(`Health checks available at http://localhost:${PORT}/health, /ready, /live`);
}

startServer()
  .catch((error) => {
    console.error('Error starting server:', error);
    captureException(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

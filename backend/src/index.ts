import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { Context } from './types/context';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  userId: string;
}

const getContext = async ({ req }: { req: express.Request }): Promise<Context> => {
  const token = req.headers.authorization?.replace('Bearer ', '') || '';

  if (!token) {
    return { prisma, user: null, userId: null };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    return { prisma, user, userId: decoded.userId };
  } catch (error) {
    return { prisma, user: null, userId: null };
  }
};

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers: resolvers as any,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    }),
    bodyParser.json(),
    expressMiddleware(server, {
      context: getContext,
    })
  );

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const PORT = process.env.PORT || 4000;

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));

  console.log(`Server ready at http://localhost:${PORT}/graphql`);
}

startServer()
  .catch((error) => {
    console.error('Error starting server:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

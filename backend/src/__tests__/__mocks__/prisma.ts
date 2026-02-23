/**
 * Prisma Mock
 * Mock implementation for Prisma Client
 */

import { createMockPrisma } from '../utils/testUtils';

const mockPrisma = createMockPrisma();

export const prisma = mockPrisma;
export default mockPrisma;

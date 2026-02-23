/**
 * Auth Service
 * Business logic layer for authentication operations
 */

import { PrismaClient, User } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import { GamificationRepository } from '../repositories/gamification.repository';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { AuthenticationError, UserInputError } from '../utils/errors';
import { createLogger } from '../utils/logger';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const logger = createLogger('AuthService');

interface JwtPayload {
  userId: string;
}

export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
}

export class AuthService {
  private userRepo: UserRepository;
  private gameRepo: GamificationRepository;

  constructor(prisma: PrismaClient) {
    this.userRepo = new UserRepository(prisma);
    this.gameRepo = new GamificationRepository(prisma);
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(userId: string): { token: string; refreshToken: string } {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { token, refreshToken };
  }

  /**
   * Register a new user
   */
  async register(input: unknown): Promise<AuthResult> {
    // Validate input
    const validated = registerSchema.parse(input);
    logger.info('Registering user', { email: validated.email });

    // Check if user already exists
    const existingUser = await this.userRepo.findByEmail(validated.email);
    if (existingUser) {
      throw new UserInputError('User already exists with this email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 10);

    // Create user
    const user = await this.userRepo.create({
      email: validated.email,
      passwordHash,
      name: validated.name,
    });

    // Create gamification profile
    await this.gameRepo.getOrCreateProfile(user.id);

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    logger.info('User registered', { userId: user.id, email: user.email });

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Login a user
   */
  async login(input: unknown): Promise<AuthResult> {
    // Validate input
    const validated = loginSchema.parse(input);
    logger.info('Logging in user', { email: validated.email });

    // Find user
    const user = await this.userRepo.findByEmail(validated.email);
    if (!user || !user.passwordHash) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const validPassword = await bcrypt.compare(validated.password, user.passwordHash);
    if (!validPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Update last login
    await this.userRepo.updateLastLogin(user.id);

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    logger.info('User logged in', { userId: user.id });

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Refresh tokens
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;

      // Get user
      const user = await this.userRepo.findById(decoded.userId);
      if (!user) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user.id);

      logger.info('Tokens refreshed', { userId: user.id });

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  /**
   * Verify access token and get user
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      return this.userRepo.findById(decoded.userId);
    } catch {
      return null;
    }
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    logger.info('Changing password', { userId });

    const user = await this.userRepo.findById(userId);
    if (!user || !user.passwordHash) {
      throw new AuthenticationError('User not found');
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!validPassword) {
      throw new AuthenticationError('Invalid current password');
    }

    // Hash and update new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.updatePassword(userId, newPasswordHash);

    logger.info('Password changed', { userId });

    return true;
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    return this.userRepo.findById(userId);
  }
}

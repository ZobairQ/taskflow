/**
 * AuthService Unit Tests
 */

import { AuthService } from '../../../services/auth.service';
import { createMockPrisma, createMockUser } from '../../utils/testUtils';
import { AuthenticationError, UserInputError } from '../../../utils/errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock external dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = createMockPrisma();
    service = new AuthService(mockPrisma as any);
  });

  describe('register', () => {
    it('should throw error if user already exists', async () => {
      const input = {
        email: 'existing@test.com',
        password: 'SecurePassword123!',
        name: 'Existing User',
      };

      const existingUser = createMockUser({ email: input.email });
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.register(input)).rejects.toThrow(UserInputError);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid input', async () => {
      const input = {
        email: 'notanemail',
        password: '123', // Too short
        name: '',
      };

      await expect(service.register(input)).rejects.toThrow();
    });

    it('should register a new user successfully', async () => {
      const input = {
        email: 'newuser@test.com',
        password: 'SecurePassword123!',
        name: 'New User',
      };

      const mockUser = createMockUser({
        email: input.email.toLowerCase(),
        name: input.name,
      });

      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockPrisma.gamificationProfile.findUnique.mockResolvedValue(null);
      mockPrisma.gamificationProfile.create.mockResolvedValue({ userId: mockUser.id });
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await service.register(input);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: input.email.toLowerCase() },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(input.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });
  });

  describe('login', () => {
    it('should throw error for non-existent user', async () => {
      const input = {
        email: 'nonexistent@test.com',
        password: 'password123',
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(input)).rejects.toThrow(AuthenticationError);
    });

    it('should throw error for wrong password', async () => {
      const input = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = createMockUser({
        email: input.email.toLowerCase(),
        passwordHash: 'hashed-password',
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(input)).rejects.toThrow(AuthenticationError);
    });

    it('should login user with valid credentials', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser({
        email: input.email.toLowerCase(),
        passwordHash: 'hashed-password',
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await service.login(input);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: input.email.toLowerCase() },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(input.password, 'hashed-password');
      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe('mock-token');
    });
  });

  describe('refreshToken', () => {
    it('should throw error for invalid refresh token', async () => {
      const refreshToken = 'invalid-token';

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(AuthenticationError);
    });

    it('should throw error if user not found', async () => {
      const refreshToken = 'valid-refresh-token';

      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'nonexistent' });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(AuthenticationError);
    });

    it('should refresh tokens with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockUser = createMockUser();

      (jwt.verify as jest.Mock).mockReturnValue({ userId: mockUser.id });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('new-token');

      const result = await service.refreshToken(refreshToken);

      expect(jwt.verify).toHaveBeenCalled();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result.token).toBe('new-token');
      expect(result.refreshToken).toBe('new-token');
    });
  });

  describe('changePassword', () => {
    it('should throw error for wrong current password', async () => {
      const userId = 'user-1';
      const mockUser = createMockUser({ id: userId, passwordHash: 'old-hash' });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(userId, 'wrongpassword', 'newpassword')).rejects.toThrow(
        AuthenticationError
      );
    });

    it('should change password successfully', async () => {
      const userId = 'user-1';
      const currentPassword = 'oldpassword';
      const newPassword = 'newpassword123!';

      const mockUser = createMockUser({ id: userId, passwordHash: 'old-hash' });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await service.changePassword(userId, currentPassword, newPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, 'old-hash');
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { passwordHash: 'new-hash' },
      });
      expect(result).toBe(true);
    });
  });
});

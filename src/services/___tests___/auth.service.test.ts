import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth.service';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

// 1. Mockujemy zewnętrzne zależności (Bazę danych i generator hashów)
vi.mock('@/lib/prisma', () => {
  // Tworzymy jeden obiekt mocka
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };

  // Zwracamy go zarówno jako 'prisma' (named) jak i 'default'
  return {
    prisma: mockPrisma,
    default: mockPrisma,
  };
});

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}));

describe('authService', () => {
  // Czyścimy mocki przed każdym testem, żeby nie zachodziły na siebie
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validUserData = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Jan Kowalski',
  };

  it('powinien pomyślnie zarejestrować nowego użytkownika', async () => {
    // Przygotowanie mocków (Arrange)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null); // Użytkownik nie istnieje
    vi.mocked(
      bcrypt.hash as (...args: any[]) => Promise<string>,
    ).mockResolvedValue('hashed_password_123');
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: '1',
      email: validUserData.email,
      name: validUserData.name,
      password: 'hashed_password_123',
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Działanie (Act)
    const result = await authService.registerUser(validUserData);

    // Aserty (Assert)
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: validUserData.email },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(validUserData.password, 12);
    expect(prisma.user.create).toHaveBeenCalled();
    expect(result.email).toBe(validUserData.email);
  });

  it('powinien wyrzucić błąd, jeśli użytkownik już istnieje', async () => {
    // Przygotowanie mocków - symulujemy, że baza zwraca istniejącego użytkownika
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: validUserData.email,
      name: 'Istniejący Jan',
      password: 'old_hash',
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Działanie i Aserty - oczekujemy, że obietnica zostanie odrzucona
    await expect(authService.registerUser(validUserData)).rejects.toThrow(
      'Użytkownik o tym adresie e-mail już istnieje.',
    );

    // Upewniamy się, że hashowanie i zapis do bazy NIE zostały wywołane
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});

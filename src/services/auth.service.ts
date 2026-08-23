import bcrypt from 'bcryptjs';
import { RegisterInput } from '@/schemas/auth.schema';
import { authRepository } from '@/repositories/auth.repository';

const SALT_ROUNDS = 12;

export const authService = {
  async registerUser(data: RegisterInput) {
    const { email, password, name } = data;

    const existingUser = await authRepository.findUser(email);

    if (existingUser) {
      throw new Error('Użytkownik o tym adresie e-mail już istnieje.');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await authRepository.create({ email, password: hashedPassword, name });

    return user;
  },
};

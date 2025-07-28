import { expect, describe, it } from 'vitest';
import { compare } from 'bcryptjs';
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository';
import { RegisterUseCase } from './register';
import { UserAlreadyExistsError } from './errors/user-already-exists';

describe('Register Use Case', () => {
  it('should hash user password upon registration', async () => {
    const usersRepository = new InMemoryUsersRepository();
    const registerUseCase = new RegisterUseCase(usersRepository);

    const request = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '123456',
    };

    const { user } = await registerUseCase.execute(request);

    const isPasswordCorrectlyHashed = await compare(request.password, user.password_hash);

    expect(isPasswordCorrectlyHashed).toBe(true);
  });

  it('should not be able to register with an existing email', async () => {
    const usersRepository = new InMemoryUsersRepository();
    const registerUseCase = new RegisterUseCase(usersRepository);

    const email = 'john.doe@example.com';

    await registerUseCase.execute({
      name: 'John Doe',
      email,
      password: '123456',
    });

    await expect(
      registerUseCase.execute({
        name: 'John Doe',
        email,
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });

  it('should be able to register', async () => {
    const usersRepository = new InMemoryUsersRepository();
    const registerUseCase = new RegisterUseCase(usersRepository);

    const request = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '123456',
    };

    const { user } = await registerUseCase.execute(request);

    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: request.name,
        email: request.email,
      }),
    );
    expect(user.password_hash).toEqual(expect.any(String));
  });
});

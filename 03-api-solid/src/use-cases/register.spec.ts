import { expect, describe, it, beforeEach } from 'vitest'
import { compare } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { RegisterUseCase } from './register'
import { UserAlreadyExistsError } from './errors/user-already-exists'

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUseCase(usersRepository)
  })

  it('should hash user password upon registration', async () => {
    const request = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '123456',
    }

    const { user } = await sut.execute(request)

    const isPasswordCorrectlyHashed = await compare(
      request.password,
      user.password_hash,
    )

    expect(isPasswordCorrectlyHashed).toBe(true)
  })

  it('should not be able to register with an existing email', async () => {
    const email = 'john.doe@example.com'

    await sut.execute({
      name: 'John Doe',
      email,
      password: '123456',
    })

    await expect(
      sut.execute({
        name: 'John Doe',
        email,
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })

  it('should be able to register', async () => {
    const request = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '123456',
    }

    const { user } = await sut.execute(request)

    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: request.name,
        email: request.email,
      }),
    )
    expect(user.password_hash).toEqual(expect.any(String))
  })
})

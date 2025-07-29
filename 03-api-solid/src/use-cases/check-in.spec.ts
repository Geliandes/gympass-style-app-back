import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository';
import { CheckInUseCase } from './check-in';
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository';
import { Decimal } from '@prisma/client/runtime/library';

let checkInRepository: InMemoryCheckInsRepository;
let gymsRepository: InMemoryGymsRepository;
let sut: CheckInUseCase;

describe('Check-in Use Case', () => {
  beforeEach(() => {
    checkInRepository = new InMemoryCheckInsRepository();
    gymsRepository = new InMemoryGymsRepository();
    sut = new CheckInUseCase(checkInRepository, gymsRepository);
    vi.useFakeTimers();

    gymsRepository.items.push({
      id: 'gym-01',
      title: 'Gym 01',
      description: 'Description for Gym 01',
      latitude: new Decimal(-23.5336554),
      longitude: new Decimal(-47.5133974),
      phone: '',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be able to create a check-in', async () => {
    const { checkIn } = await sut.execute({
      userId: 'user-01',
      gymId: 'gym-01',
      userLatitude: -23.5336554,
      userLongitude: -47.5133974,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2025, 6, 28, 8, 0, 0));

    await sut.execute({
      userId: 'user-01',
      gymId: 'gym-01',
      userLatitude: -23.5336554,
      userLongitude: -47.5133974,
    });

    await expect(
      sut.execute({
        userId: 'user-01',
        gymId: 'gym-01',
        userLatitude: -23.5336554,
        userLongitude: -47.5133974,
      }),
    ).rejects.toBeInstanceOf(Error);
  });

  it('should not be able to check in twice but in different days', async () => {
    vi.setSystemTime(new Date(2025, 6, 28, 8, 0, 0));

    await sut.execute({
      userId: 'user-01',
      gymId: 'gym-01',
      userLatitude: -23.5336554,
      userLongitude: -47.5133974,
    });

    vi.setSystemTime(new Date(2025, 6, 29, 8, 0, 0));

    const { checkIn } = await sut.execute({
      userId: 'user-01',
      gymId: 'gym-01',
      userLatitude: -23.5336554,
      userLongitude: -47.5133974,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it('should not be able to check-in on distant gym', async () => {
    gymsRepository.items.push({
      id: 'gym-02',
      title: 'Gym 02',
      description: 'Description for Gym 01',
      latitude: new Decimal(-23.5336612),
      longitude: new Decimal(-47.4824978),
      phone: '',
    });

    expect(() =>
      sut.execute({
        userId: 'user-01',
        gymId: 'gym-02',
        userLatitude: -23.5336554,
        userLongitude: -47.5133974,
      }),
    ).rejects.toBeInstanceOf(Error);
  });
});

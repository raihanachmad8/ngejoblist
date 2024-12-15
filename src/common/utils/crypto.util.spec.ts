import { Test, TestingModule } from '@nestjs/testing';
import { CryptoUtil } from './crypto.util';
import { ConfigModule } from '@nestjs/config';

describe('CryptoUtil', () => {
  let cryptoUtil: CryptoUtil;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [CryptoUtil],
    }).compile();

    cryptoUtil = module.get<CryptoUtil>(CryptoUtil);
  });

  it('should be defined', () => {
    expect(cryptoUtil).toBeDefined();
  });

  it('should hash password', async () => {
    const password = 'password123';
    const hash = await cryptoUtil.hashPassword(password);
    expect(hash).not.toEqual(password);
    expect(await cryptoUtil.comparePassword(password, hash)).toBe(true);
  });

  it('should compare password', async () => {
    const password = 'password123';
    const hash = await cryptoUtil.hashPassword(password);
    expect(await cryptoUtil.comparePassword(password, hash)).toBe(true);
    expect(await cryptoUtil.comparePassword('wrongpassword', hash)).toBe(false);
  });

  it('should generate random token', () => {
    const length = 10;
    const randomString = cryptoUtil.generateRandomToken(length);
    expect(randomString).toHaveLength(length * 2);
  });
});
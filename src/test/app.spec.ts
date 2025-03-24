import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { AuthService } from '../app/modules/auth/auth.service';
import { UserService } from '../app/modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../app/modules/user/dtos/create-user.dto';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../app/modules/user/repositories/user.repository';
import { LoginDto } from '../app/modules/auth/dto/login.dto';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let userRepository: UserRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    userService = moduleFixture.get<UserService>(UserService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    userRepository = moduleFixture.get<UserRepository>(USER_REPOSITORY);

    await app.init();

    // Clean up any existing test users
    const allUsers = await userRepository.findAll();
    for (const user of allUsers) {
      if (user.username.includes('test')) {
        await userRepository.remove(user.id);
      }
    }

    // Login to get JWT token
    const loginDto: LoginDto = {
      username: 'testuser',
      password: 'TestPass!2025',
    };

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(200);

    console.log('JWT Token:', loginResponse.body.accessToken);
    jwtToken = loginResponse.body.accessToken;
  });

  afterEach(async () => {
    // Cleanup created users after each test
    const testUsers = await userRepository.findAll();
    for (const user of testUsers) {
      if (user.username.includes('test')) {
        await userRepository.remove(user.id);
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const dto: CreateUserDto = {
        username: `testuser${Date.now()}`,
        password: 'TestPass!2025',
        fullName: 'Test User',
        email: `testuser${Date.now()}@example.com`,
        isActive: true,
        roles: ['user'],
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(dto)
        .expect(201)
        .then(async (res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.username).toBe(dto.username);
          expect(res.body.email).toBe(dto.email);
          expect(res.body.password).toBeUndefined();

          // Verify password is hashed
          const user = await userRepository.findByUsername(dto.username);
          expect(user).toBeDefined();
          if (user) {
            expect(user.password).not.toBe(dto.password);
          }
        });
    });
  });

  describe('POST /auth/login', () => {
    let testUser: any;

    beforeEach(async () => {
      // Create test user before each test
      testUser = await userService.create({
        username: `testlogin${Date.now()}`,
        password: 'LoginTest!2025',
        fullName: 'Login Test',
        email: `testlogin${Date.now()}@example.com`,
        isActive: true,
        roles: ['user'],
      });
    });

    afterEach(async () => {
      // Delete test users after each test
      if (testUser) {
        await userRepository.remove(testUser.id);
      }
    });

    it('should login with valid credentials', () => {
      const loginDto: LoginDto = {
        username: testUser.username,
        password: 'LoginTest!2025',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.user).toBeDefined();
          expect(res.body.user.id).toBe(testUser.id);
          expect(res.body.user.username).toBe(testUser.username);
          expect(res.body.user.password).toBeUndefined();
        });
    });

    it('should fail with invalid password', () => {
      const loginDto: LoginDto = {
        username: testUser.username,
        password: 'wrongpassword',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('POST /auth/refresh-token', () => {
    let testUser: any;
    let loginRes: request.Response;

    beforeEach(async () => {
      // Create test user before each test
      testUser = await userService.create({
        username: `testrefresh${Date.now()}`,
        password: 'RefreshTest!2025',
        fullName: 'Refresh Test',
        email: `testrefresh${Date.now()}@example.com`,
        isActive: true,
        roles: ['user'],
      });

      // First login to get initial token
      const loginDto: LoginDto = {
        username: testUser.username,
        password: 'RefreshTest!2025',
      };

      loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);
    });

    afterEach(async () => {
      // Delete test users after each test
      if (testUser) {
        await userRepository.remove(testUser.id);
      }
    });

    it('should refresh token successfully', async () => {
      const refreshTokenRes = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect((res) => {
          console.log('Refresh Token Response:', res.body);
          expect(res.status).toBe(200);
        });

      // Verify token properties
      expect(refreshTokenRes.body).toHaveProperty('accessToken');
      expect(refreshTokenRes.body.accessToken).not.toBe(
        loginRes.body.accessToken,
      );

      // Validate new token payload
      const payload = jwtService.verify(refreshTokenRes.body.accessToken);
      expect(payload.sub).toBe(testUser.id);
      expect(payload.username).toBe(testUser.username);
    });
  });
});

describe('User Endpoints (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let userRepository: UserRepository;
  let adminJwtToken: string;
  let userJwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UserService>(UserService);
    userRepository = moduleFixture.get<UserRepository>(USER_REPOSITORY);

    await app.init();

    // Login to get JWT token
    const loginDto: LoginDto = {
      username: 'testuser',
      password: 'TestPass!2025',
    };

    // Create admin user
    await userService.create({
      username: 'adminuser',
      password: 'AdminPass!2025',
      fullName: 'Admin User',
      email: 'admin@example.com',
      isActive: true,
      roles: ['admin'],
    });

    // Login as admin
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'adminuser',
        password: 'AdminPass!2025',
      })
      .expect(200);
    adminJwtToken = adminLoginRes.body.accessToken;

    // Create regular user
    await userService.create({
      username: 'regularuser',
      password: 'UserPass!2025',
      fullName: 'Regular User',
      email: 'user@example.com',
      isActive: true,
      roles: ['user'],
    });

    // Login as regular user
    const userLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'regularuser',
        password: 'UserPass!2025',
      })
      .expect(200);
    userJwtToken = userLoginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should return a list of users', async () => {
      // Create some test users
      const user1 = await userService.create({
        username: `testuser1${Date.now()}`,
        password: 'TestPass!2025',
        fullName: 'Test User 1',
        email: `testuser1${Date.now()}@example.com`,
        isActive: true,
        roles: ['user'],
      });
      const user2 = await userService.create({
        username: `testuser2${Date.now()}`,
        password: 'TestPass!2025',
        fullName: 'Test User 2',
        email: `testuser2${Date.now()}@example.com`,
        isActive: true,
        roles: ['user'],
      });

      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeInstanceOf(Array);
          const users = res.body;
          expect(users.some((u) => u.id === user1.id)).toBe(true);
          expect(users.some((u) => u.id === user2.id)).toBe(true);
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should return a single user by ID', async () => {
      const testUser = await userService.create({
        username: `testuser${Date.now()}`,
        password: 'TestPass!2025',
        fullName: 'Test User',
        email: `testuser${Date.now()}@example.com`,
        isActive: true,
        roles: ['user'],
      });

      return request(app.getHttpServer())
        .get(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body.id).toBe(testUser.id);
          expect(res.body.username).toBe(testUser.username);
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.password).toBeUndefined();
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/999999') // Assuming this ID doesn't exist
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user details', async () => {
      const testUser = await userService.create({
        username: `testuser${Date.now()}`,
        password: 'TestPass!2025',
        fullName: 'Test User',
        email: `testuser${Date.now()}@example.com`,
        isActive: true,
        roles: ['user'],
      });

      const updateDto = {
        fullName: 'Updated Name',
        email: `updated${Date.now()}@example.com`,
      };

      return request(app.getHttpServer())
        .patch(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send(updateDto)
        .expect(200)
        .then((res) => {
          expect(res.body.fullName).toBe(updateDto.fullName);
          expect(res.body.email).toBe(updateDto.email);
        });
    });
  });

  describe('DELETE /users/:id with permissions', () => {
    it('should allow admin to delete any user', async () => {
      const testUser = await userService.create({
        username: `testuser${Date.now()}`,
        password: 'TestPass!2025',
        fullName: 'Test User',
        email: `testuser${Date.now()}@example.com`,
        isActive: true,
        roles: ['user'],
      });

      return request(app.getHttpServer())
        .delete(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(200)
        .then(() => {
          return userRepository.findById(testUser.id).then((deletedUser) => {
            expect(deletedUser).toBeNull();
          });
        });
    });

    it('should deny regular user from deleting other users', async () => {
      const otherUser = await userService.create({
        username: `otheruser${Date.now()}`,
        password: 'OtherPass!2025',
        fullName: 'Other User',
        email: `otheruser${Date.now()}@example.com`,
        isActive: true,
        roles: ['user'],
      });

      return request(app.getHttpServer())
        .delete(`/users/${otherUser.id}`)
        .set('Authorization', `Bearer ${userJwtToken}`)
        .expect(403);
    });

    it('should allow regular user to delete their own account', async () => {
      const selfUser = await userService.create({
        username: `selfuser${Date.now()}`,
        password: 'SelfPass!2025',
        fullName: 'Self User',
        email: `selfuser${Date.now()}@example.com`,
        isActive: true,
        roles: ['user'],
      });

      return request(app.getHttpServer())
        .delete(`/users/${selfUser.id}`)
        .set('Authorization', `Bearer ${userJwtToken}`)
        .expect(200)
        .then(() => {
          return userRepository.findById(selfUser.id).then((deletedUser) => {
            expect(deletedUser).toBeNull();
          });
        });
    });
  });
});

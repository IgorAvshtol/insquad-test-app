import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UserEntity } from '../src/user/entities/user.entity';
import { UserService } from '../src/user/user.service';
import { UserController } from '../src/user/user.controller';

describe('e2e test', () => {
  let mockUserService: UserService;
  let moduleRef: TestingModule;
  let app: INestApplication;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([UserEntity]),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: +process.env.POSTGRES_PORT,
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
          autoLoadEntities: true,
          synchronize: true,
          entities: [UserEntity],
        }),
      ],
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    mockUserService = moduleRef.get(UserService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await mockUserService.removeAll();
    await moduleRef.close();
  });

  it('create user', async () => {
    const createUserResponse = await request(app.getHttpServer())
      .post('/user')
      .send({
        firstName: 'first',
        lastName: 'last',
        age: 33,
        isFree: true,
      });
    expect(createUserResponse.status).toEqual(201);
    const userId = createUserResponse.body.id;

    const getUserResponse = await request(app.getHttpServer())
      .get(`/user/${userId}`)
      .send();
    expect(getUserResponse.status).toEqual(200);
    expect(createUserResponse.body.id).toEqual(getUserResponse.body.id);
    expect(createUserResponse.body.firstName).toEqual(
      getUserResponse.body.firstName,
    );
    expect(createUserResponse.body.lastName).toEqual(
      getUserResponse.body.lastName,
    );
    expect(createUserResponse.body.age).toEqual(getUserResponse.body.age);
    expect(createUserResponse.body.isFree).toEqual(getUserResponse.body.isFree);
  });

  it('get all users', async () => {
    try {
      const createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .send({
          firstName: 'first',
          lastName: 'last',
          age: 33,
          isFree: true,
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      const getUserResponse = await request(app.getHttpServer())
        .get(`/user`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      expect(getUserResponse.status).toBe(200);
      expect(typeof getUserResponse.body).toBe('object');
      expect(getUserResponse.body).toHaveLength(1);
      expect(getUserResponse.body[0].id).toBe(createUserResponse.body.id);
    } catch (err) {
      throw err;
    }
  });

  it('get user by Id', async () => {
    try {
      const createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .send({
          firstName: 'first',
          lastName: 'last',
          age: 33,
          isFree: true,
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
      const userId = createUserResponse.body.id;

      const getUserResponse = await request(app.getHttpServer())
        .get(`/user/${userId}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      expect(getUserResponse.status).toBe(200);
      expect(getUserResponse.body.id).toBe(createUserResponse.body.id);
      expect(getUserResponse.body.firstName).toBe(
        createUserResponse.body.firstName,
      );
      expect(getUserResponse.body.lastName).toBe(
        createUserResponse.body.lastName,
      );
      expect(getUserResponse.body.age).toBe(createUserResponse.body.age);
      expect(getUserResponse.body.isFree).toBe(createUserResponse.body.isFree);
    } catch (err) {
      throw err;
    }
  });

  it('patch user', async () => {
    const createUserResponse = await request(app.getHttpServer())
      .post('/user')
      .send({
        firstName: 'first',
        lastName: 'last',
        age: 33,
        isFree: true,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(createUserResponse.status).toEqual(201);
    const userId = createUserResponse.body.id;

    const getUserResponse = await request(app.getHttpServer())
      .patch(`/user/${userId}`)
      .send({
        firstName: 'new name',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(getUserResponse.status).toEqual(200);
    expect(createUserResponse.body.id).toEqual(getUserResponse.body.id);
    expect(getUserResponse.body.firstName).toEqual('new name');
    expect(createUserResponse.body.lastName).toEqual(
      getUserResponse.body.lastName,
    );
    expect(createUserResponse.body.age).toEqual(getUserResponse.body.age);
    expect(createUserResponse.body.isFree).toEqual(getUserResponse.body.isFree);
  });

  it('delete user by Id', async () => {
    const createUserResponse = await request(app.getHttpServer())
      .post('/user')
      .send({
        firstName: 'first',
        lastName: 'last',
        age: 33,
        isFree: true,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const deleteUserResponse = await request(app.getHttpServer())
      .delete(`/user/${createUserResponse.body.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(deleteUserResponse.status).toBe(200);
    expect(typeof deleteUserResponse.body).toBe('object');
    expect(deleteUserResponse.body.id).toBe(createUserResponse.body.id);
  });
});

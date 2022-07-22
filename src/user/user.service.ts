import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto) {
    return this.repository.save(dto);
  }

  async findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const find = await this.repository.findOneBy({ id: id });
    if (find) {
      return find;
    }
    throw new NotFoundException('User is not found.');
  }

  async update(id: number, dto: CreateUserDto) {
    const find = await this.repository.findOneBy({ id: id });
    if (find) {
      await this.repository.update(id, dto);
      return await this.repository.findOneBy({ id: id });
    }
    throw new NotFoundException('User is not found.');
  }

  async remove(id: number) {
    const find = await this.repository.findOneBy({ id: id });
    if (find) {
      await this.repository.delete(id);
      return find;
    }
    return `User with id=${id} has been deleted.`;
  }

  //this service only for e2e!
  async removeAll() {
    await this.repository.clear();
  }
}

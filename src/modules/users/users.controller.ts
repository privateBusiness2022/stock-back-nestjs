import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CursorPipe } from 'src/pipes/cursor.pipe';
import { OptionalIntPipe } from 'src/pipes/optional-int.pipe';
import { WherePipe } from 'src/pipes/where.pipe';
import { Expose } from 'src/providers/prisma/prisma.interface';
import { createUserDto, UpdateUserDto } from './users.dto';
import { UsersService } from './users.service';

@ApiSecurity('JWT')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Get users */
  @Get()
  async getAll(
    @Query('skip', OptionalIntPipe) skip?: number,
    @Query('take', OptionalIntPipe) take?: number,
    @Query('cursor', CursorPipe) cursor?: Record<string, number | string>,
    @Query('where', WherePipe) where?: Record<string, number | string>,
  ): Promise<Expose<User>[]> {
    return this.usersService.getUsers({ skip, take, cursor, where });
  }

  /** Get a user */
  @Get(':userId')
  async get(@Param('userId', ParseIntPipe) id: number): Promise<Expose<User>> {
    return this.usersService.getUser(id);
  }

  @Post()
  async create(@Body() data: createUserDto): Promise<Expose<User>> {
    return this.usersService.createUser(data);
  }

  /** Update a user */
  @Patch(':userId')
  async update(
    @Param('userId', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
  ): Promise<Expose<User>> {
    return this.usersService.updateUser(id, data);
  }

  @Put(':userId/activate')
  async activate(@Param('userId', ParseIntPipe) id: number): Promise<Expose<User>> {
    return this.usersService.activateUser(id);
  }
  
  /** Delete a user */
  @Delete(':userId')
  async remove(
    @Param('userId', ParseIntPipe) id: number,
  ): Promise<Expose<User>> {
    return this.usersService.deactivateUser(id);
  }
}

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
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { Prisma, Project } from '@prisma/client';
import { Expose } from 'src/providers/prisma/prisma.interface';
import { ProjectsCreateDto } from './projects.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async getAll(): Promise<Expose<Project>[]> {
    return this.projectsService.getAll();
  }

  @Post()
  async create(@Body() data: ProjectsCreateDto): Promise<Expose<Project>> {
    return this.projectsService.add(data);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Prisma.ProjectUpdateInput,
  ): Promise<Expose<Project>> {
    return this.projectsService.edit(id, data);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Expose<Project>> {
    return this.projectsService.delete(id);
  }
}

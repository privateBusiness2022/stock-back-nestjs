import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  Prisma,
  RequestToChange,
  RequestToWithdrawal,
} from '@prisma/client';
import { Project } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import randomColor from 'randomcolor';
import {
  EMAIL_USER_CONFLICT,
  OPTION_NOT_FOUND,
  USER_NOT_FOUND,
} from 'src/errors/errors.constants';
import { Expose } from 'src/providers/prisma/prisma.interface';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { LOGIN_ACCESS_TOKEN } from 'src/providers/tokens/tokens.constants';
import { ProjectsCreateDto } from './projects.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Expose<Project>[]> {
    return this.prisma.project.findMany({
      include: {
        projectFund: {
          include: {
            period: {
              include: {
                stocks: true,
                clients: true,
              }
            },
          },
        },
      },
    });
  }

  async add(data: ProjectsCreateDto): Promise<Expose<Project>> {
    const { periodsFund, ...rest } = data;

    periodsFund.map((stock, index) => {
      if (stock.stocks === undefined) {
        periodsFund.splice(index, 1);
      }
    });

    return this.prisma.project.create({
      data: {
        ...rest,
        projectFund: {
          create: periodsFund,
        },
      },
    });
  }

  async edit(
    id: number,
    data: Prisma.ProjectUpdateInput,
  ): Promise<Expose<Project>> {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
    });

    if (!project)
      throw new NotFoundException(`Project with id ${id} not found`);

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Expose<Project>> {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
    });

    if (!project)
      throw new NotFoundException(`Project with id ${id} not found`);

    return this.prisma.project.delete({
      where: { id },
    });
  }
}

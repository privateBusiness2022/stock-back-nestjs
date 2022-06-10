import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  ClientProfit,
  ClintStocks,
  Prisma,
  RequestToChange,
  Stage,
  User,
} from '@prisma/client';
import { Period, Client, Stock } from '@prisma/client';
import randomColor from 'randomcolor';
import {
  EMAIL_USER_CONFLICT,
  USER_NOT_FOUND,
} from 'src/errors/errors.constants';
import { Expose } from 'src/providers/prisma/prisma.interface';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { PeriodCreateDto, ProfitUpdateDto } from './periods.dto';
@Injectable()
export class PeriodsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Expose<Period>[]> {
    return await this.prisma.period.findMany({
      include: { stocks: true, ceratedBy: true, stages: true, clients: true },
    });
  }

  async getClients(id: number): Promise<Expose<Client>[]> {
    const period = await this.prisma.client.findMany({
      where: { period: { id } },
    });
    return period;
  }

  async findOne(id: number): Promise<Expose<Period>> {
    return await this.prisma.period.findUnique({
      where: { id },
      include: { stocks: true, ceratedBy: true, stages: true },
    });
  }

  async create(data: PeriodCreateDto): Promise<Expose<Period>> {
    let { stocks, stocksPrice, start, name, createdBy, agentStocks } = data;

    const createStocks = await this.prisma.stock.create({
      data: { number: stocks, priceOfOne: stocksPrice },
    });

    const startDate = new Date(start);
    const endDate = await this.after60Days(startDate);
    const dividendEndDate = await this.after7Days(endDate);
    let testAgentsStocks = 0;
    agentStocks.map(({ number }) => (testAgentsStocks = +number));
    if (testAgentsStocks > stocks) {
      throw new NotFoundException(
        'The number of stocks for agents is greater than the number of stocks',
      );
    }
    const period = await this.prisma.period.create({
      data: {
        name,
        ceratedBy: { connect: { id: Number(createdBy) } },
        stocks: { connect: { id: createStocks.id } },
      },
      include: { stocks: true, ceratedBy: true, stages: true },
    });

    await this.prisma.stage.create({
      data: {
        period: { connect: { id: period.id } },
        start: startDate,
        end: endDate,
        dividendEnd: dividendEndDate,
      },
    });

    for (let i = 0; i < agentStocks.length; i++) {
      await this.prisma.agentStock.create({
        data: {
          agent: { connect: { id: agentStocks[i].id } },
          period: { connect: { id: period.id } },
          number: agentStocks[i].number,
        },
      });
    }

    return period;
  }

  async update(
    id: number,
    period: Prisma.PeriodUpdateInput,
  ): Promise<Expose<Period>> {
    return this.prisma.period.update({
      where: { id },
      data: period,
      include: { stocks: true, ceratedBy: true, stages: true },
    });
  }

  async delete(id: number): Promise<Expose<Period>> {
    return this.prisma.period.delete({
      where: { id },
    });
  }

  async getStages(userId: number): Promise<Expose<Stage>[]> {
    return this.prisma.stage.findMany({
      where: { status: 'DIVIDEND_STARTED' },
      include: {
        period: {
          include: {
            stocks: true,
            clientsStocks: true,
            clients: {
              include: {
                stocks: true,
                period: true,
              },
            },
          },
        },
        clientsProfit: {
          where: { user: { id: userId } },
          include: {
            user: true,
            client: true,
          },
        },
      },
    });
  }

  async updateStageProfit(
    stageId: number,
    data: ProfitUpdateDto,
  ): Promise<Stage> {
    const { profit, usersIds } = data;
    const stage = await this.prisma.stage.findUnique({
      where: { id: stageId },
      include: { period: true },
    });

    if (stage.status !== 'DIVIDEND_STARTED')
      throw new NotFoundException('Dividing is not started');

    const users = [];

    for (let i = 0; i < usersIds.length; i++) {
      const user = await this.prisma.user.findUnique({
        where: { id: usersIds[i].id },
      });
      users.push(user);
    }

    await this.dividingClientsToUsers(stageId, users);

    return this.prisma.stage.update({
      where: { id: stageId },
      data: { profit },
    });
  }

  async doneDividing(id: number): Promise<Expose<ClientProfit>> {
    const clientProfit = await this.prisma.clientProfit.findUnique({
      where: { id },
    });

    if (clientProfit.stutus === 'APPROVED')
      throw new ConflictException('The profit is already approved');

    return this.prisma.clientProfit.update({
      where: { id },
      data: { stutus: 'APPROVED' },
    });
  }

  async after60Days(day: Date) {
    const date = new Date(day);
    const newDate = new Date(date.setDate(date.getDate() + 60));
    return newDate;
  }

  async after30Days(day: Date) {
    const date = new Date(day);
    const newDate = new Date(date.setDate(date.getDate() + 30));
    return newDate;
  }

  async after7Days(day: Date) {
    const date = new Date(day);
    const newDate = new Date(date.setDate(date.getDate() + 7));
    return newDate;
  }

  // dividing clients to users and create ClientProfit for each user
  async dividingClientsToUsers(stageId: number, users: User[]) {
    const stage = await this.prisma.stage.findUnique({
      where: { id: stageId },
      include: { period: true },
    });

    const clients = await this.prisma.clintStocks.findMany({
      where: { period: { id: stage.periodId } },
      include: { client: true, stock: true },
    });

    const partIndex = Math.ceil(clients.length / users.length);
    const clientsProfit = [];

    for (let i = 0; i < users.length; i++) {
      const clientsPart = clients.slice(i * partIndex, (i + 1) * partIndex);
      const clientsProfitPart = await this.createClientProfit(
        stage,
        clientsPart,
        users[i],
      );
      clientsProfit.push(...clientsProfitPart);
    }

    return clientsProfit;
  }

  async createClientProfit(stage: Stage, clients: ClintStocks[], user: User) {
    const clientsProfit = [];
    clients.map(async (client) => {
      const agent = await this.prisma.client.findUnique({
        where: { id: client.clientId },
        select: {
          ceratedBy: {
            select: {
              role: true,
              id: true,
            },
          },
        },
      });

      if (agent.ceratedBy.role === 'AGENT') {
        const clientProfit = await this.prisma.clientProfit.create({
          data: {
            profit: stage.profit,
            stocksNumber: client.number,
            price: client.price,
            stage: { connect: { id: stage.id } },
            client: { connect: { id: client.id } },
            user: { connect: { id: agent.ceratedBy.id } },
          },
        });
        clientsProfit.push(clientProfit);
      } else {
        const clientProfit = await this.prisma.clientProfit.create({
          data: {
            profit: stage.profit,
            stocksNumber: client.number,
            price: client.price,
            stage: { connect: { id: stage.id } },
            client: { connect: { id: client.id } },
            user: { connect: { id: user.id } },
          },
        });
        clientsProfit.push(clientProfit);
      }
    });
    return clientsProfit;
  }

  async numbers(): Promise<Expose<{}>> {
    const clients = await this.prisma.client.findMany({});
    const activeClients = await this.prisma.client.findMany({
      where: { status: 'ACTIVE' },
    });
    const period = await this.prisma.period.findMany({});
    const stage = await this.prisma.stage.findMany({});
    const activeStage = await this.prisma.stage.findMany({
      where: { status: 'DIVIDEND_STARTED' },
    });
    const stocks = await this.prisma.stock.findMany({});
    const users = await this.prisma.user.findMany({});
    const requestToWithdrawal = await this.prisma.requestToWithdrawal.findMany(
      {},
    );
    const pendingRequestToWithdrawal =
      await this.prisma.requestToWithdrawal.findMany({
        where: { status: 'PENDING' },
      });
    const requestToChange = await this.prisma.requestToChange.findMany({});
    const pendingRequestToChange = await this.prisma.requestToChange.findMany({
      where: { status: 'PENDING' },
    });

    return {
      clients: { active: activeClients.length, total: clients.length },
      period: period,
      stages: { active: activeStage.length, total: stage.length, data: stage },
      stocks: stocks,
      users: { active: users.length, total: users.length },
      requestsToWithdrawal: {
        pending: pendingRequestToWithdrawal.length,
        total: requestToWithdrawal.length,
      },
      requestsToChange: {
        pending: pendingRequestToChange.length,
        total: requestToChange.length,
      },
    };
  }
}

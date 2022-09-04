import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  Prisma,
  RequestToChange,
  RequestToWithdrawal,
} from '@prisma/client';
import { Client } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import {
  EMAIL_USER_CONFLICT,
  OPTION_NOT_FOUND,
  PERIOD_ALREADY_STARTED,
  USER_NOT_FOUND,
} from 'src/errors/errors.constants';
import { Expose } from 'src/providers/prisma/prisma.interface';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { LOGIN_ACCESS_TOKEN } from 'src/providers/tokens/tokens.constants';
import { TokensService } from 'src/providers/tokens/tokens.service';
import { AccessTokenClaims } from '../auth/auth.interface';
import { PeriodsService } from '../periods/periods.service';
import { ClientCreateDto, RequestToChangeDto } from './clients.dto';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private tokensService: TokensService,
    private periodService: PeriodsService,
  ) {}

  async findAll(token: string): Promise<Expose<Client>[]> {
    const payload = (await this.tokensService.verify(
      LOGIN_ACCESS_TOKEN,
      token.split(' ')[1],
    )) as AccessTokenClaims;
    const { id, role } = payload;
    if (role === 'AGENT') {
      return await this.prisma.client.findMany({
        where: {
          ceratedById: id,
        },
        include: {
          stocks: true,
          period: true,
          reference: true,
        },
      });
    }
    return await this.prisma.client.findMany({
      include: {
        stocks: true,
        period: true,
        reference: true,
        ceratedBy: true,
      },
    });
  }

  async findOne(id: number): Promise<Expose<Client>> {
    return await this.prisma.client.findUnique({ where: { id } });
  }

  async create(
    client: ClientCreateDto,
    token: string,
  ): Promise<Expose<Client>> {
    const { reference, period, stocksPrice, createdBy, ...rest } = client;
    const payload = (await this.tokensService.verify(
      LOGIN_ACCESS_TOKEN,
      token.split(' ')[1],
    )) as AccessTokenClaims;
    const { id, role } = payload;

    const existingClient = await this.prisma.client.findUnique({
      where: { phone: rest.phone },
    });
    if (existingClient) {
      throw new ConflictException(EMAIL_USER_CONFLICT);
    }

    const tessPeriod = await this.periodService.findOne(period);

    if (tessPeriod.status !== 'PENDING') {
      throw new NotFoundException(PERIOD_ALREADY_STARTED);
    }

    const clintStocks = await this.getStocksForClient(stocksPrice, period);

    if (role === 'AGENT') {
      return this.prisma.client.create({
        data: {
          ...rest,
          reference: { connect: { id: id } },
          period: { connect: { id: Number(period) } },
          stocks: { connect: { id: clintStocks.id } },
          ceratedBy: { connect: { id: id } },
        },
      });
    }
    return this.prisma.client.create({
      data: {
        ...rest,
        reference: { connect: { id: Number(reference) } },
        period: { connect: { id: Number(period) } },
        stocks: { connect: { id: clintStocks.id } },
        ceratedBy: { connect: { id: Number(id) } },
      },
    });
  }

  async updateClient(
    clientId: number,
    data: Prisma.ClientUpdateInput,
  ): Promise<Expose<Client>> {
    const existingClient = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!existingClient) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    return this.prisma.client.update({
      where: { id: clientId },
      data,
    });
  }

  async updateRequest(
    clientId: number,
    userId: number,
    requestToChange: RequestToChangeDto,
  ): Promise<Expose<{}>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const existingClient = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!existingClient) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    if (user.role !== 'AGENT') {
      return this.prisma.requestToChange.create({
        data: {
          ...requestToChange,
          client: { connect: { id: clientId } },
          user: { connect: { id: userId } },
        },
      });
    }
    return this.prisma.client.update({
      where: { id: clientId },
      data: {
        ...requestToChange,
      },
    });
  }

  async update(requestToChangeId: number): Promise<Expose<Client>> {
    const updatedRequest = await this.prisma.requestToChange.update({
      where: { id: requestToChangeId },
      data: {
        status: 'APPROVED',
      },
    });

    const { clientId, userId, id, status, date, ...data } = updatedRequest;

    for (const key in data) {
      if (data[key] === null) {
        delete data[key];
      }
    }

    console.log(data);

    return this.prisma.client.update({
      where: { id: updatedRequest.clientId },
      data: {
        name: data?.name,
        phone: data?.phone,
        account: data?.account,
      },
    });
  }

  async rejectUpdate(
    requestToChangeId: number,
  ): Promise<Expose<RequestToChange>> {
    return this.prisma.requestToChange.update({
      where: { id: requestToChangeId },
      data: {
        status: 'REJECTED',
      },
    });
  }

  async disActive(id: number): Promise<Expose<Client>> {
    const existingClient = await this.prisma.client.findUnique({
      where: { id },
    });
    if (existingClient) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    const deletedClient = await this.prisma.client.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
    return deletedClient;
  }

  async active(id: number): Promise<Expose<Client>> {
    const existingClient = await this.prisma.client.findUnique({
      where: { id },
    });
    if (existingClient) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    const deletedClient = await this.prisma.client.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
    return deletedClient;
  }

  async stocksWithdrawal(
    token: string,
    clintId: number,
    data: Prisma.RequestToWithdrawalCreateInput,
  ): Promise<Expose<RequestToWithdrawal>> {
    const payload = (await this.tokensService.verify(
      LOGIN_ACCESS_TOKEN,
      token.split(' ')[1],
    )) as AccessTokenClaims;
    const { id } = payload;
    const date = new Date();
    return this.prisma.requestToWithdrawal.create({
      data: {
        date,
        withdrawDate: await this.periodService.after30Days(date),
        client: { connect: { id: clintId } },
        price: new Decimal(data.price),
        user: { connect: { id: id } },
      },
    });
  }

  async getStocksWithdrawal(): Promise<Expose<RequestToWithdrawal>[]> {
    return await this.prisma.requestToWithdrawal.findMany({
      include: {
        client: {
          include: {
            stocks: {
              include: {
                stock: true,
              },
            },
            period: true,
          },
        },
        user: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async stocksWithdrawalAccept(
    id: number,
  ): Promise<Expose<RequestToWithdrawal>> {
    const existingRequest = await this.prisma.requestToWithdrawal.findUnique({
      where: { id },
    });
    if (!existingRequest) {
      throw new NotFoundException(OPTION_NOT_FOUND);
    }
    const request = await this.prisma.requestToWithdrawal.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
      include: {
        client: {
          include: {
            stocks: {
              include: {
                stock: true,
              },
            },
            period: {
              include: {
                stocks: true,
              },
            },
          },
        },
      },
    });

    if (Number(request.price) < Number(request.client.stocks[0].price)) {
      const returnedStock =
        Number(request.price) / Number(request.client.period.stocks.priceOfOne);

      await this.prisma.clintStocks.update({
        where: { id: request.client.stocks[0].id },
        data: {
          number:
            Number(request.client.stocks[0].number) - Number(returnedStock),
          price: Number(request.client.stocks[0].price) - Number(request.price),
        },
      });

      await this.prisma.stock.update({
        where: { id: request.client.stocks[0].stockId },
        data: {
          number: returnedStock + Number(request.client.stocks[0].stock.number),
        },
      });

      return request;
    }

    await this.prisma.client.update({
      where: { id: request.client.id },
      data: {
        status: 'INACTIVE',
      },
    });

    await this.prisma.clintStocks.delete({
      where: { id: request.client.stocks[0].id },
    });

    await this.prisma.stock.update({
      where: { id: request.client.stocks[0].stockId },
      data: {
        number:
          Number(request.client.stocks[0].number) +
          Number(request.client.stocks[0].stock.number),
      },
    });

    await this.prisma.period.update({
      where: { id: request.client.periodId },
      data: {
        clients: { disconnect: { id: request.client.id } },
      },
    });

    return request;
  }

  async stocksWithdrawalReject(
    id: number,
  ): Promise<Expose<RequestToWithdrawal>> {
    const existingRequest = await this.prisma.requestToWithdrawal.findUnique({
      where: { id },
    });
    if (!existingRequest) {
      throw new NotFoundException(OPTION_NOT_FOUND);
    }
    return this.prisma.requestToWithdrawal.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
    });
  }

  async getRequestToChange(): Promise<Expose<RequestToChange>[]> {
    return await this.prisma.requestToChange.findMany({
      include: { client: true, user: true },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async getStocksForClient(stocksPrice: number, periodId: number) {
    const period = await this.prisma.period.findUnique({
      where: { id: periodId },
      include: {
        stocks: true,
      },
    });

    const stocksNumber = (
      stocksPrice / Number(period.stocks.priceOfOne)
    ).toFixed(1);

    if (new Number(period.stocks.number) < new Number(stocksNumber))
      throw new ConflictException('Not enough stocks');

    const stocks = await this.prisma.stock.update({
      where: { id: period.stocks.id },
      data: {
        number: Number(period.stocks.number) - Number(stocksNumber),
      },
    });

    return this.prisma.clintStocks.create({
      data: {
        number: Number(stocksNumber),
        price: Number(period.stocks.priceOfOne) * Number(stocksNumber),
        stock: { connect: { id: period.stocks.id } },
        period: { connect: { id: period.id } },
      },
    });
  }

  async checkAgentStocks(
    agentId: number,
    periodId: number,
    stocksNumber: number,
  ) {
    const agentStocks = await this.prisma.agentStock.findFirst({
      where: {
        agent: { id: agentId },
        period: { id: periodId },
      },
      select: { number: true },
    });

    if (new Decimal(stocksNumber) < agentStocks.number) {
      throw new ConflictException('Not enough stocks');
    }
  }
}

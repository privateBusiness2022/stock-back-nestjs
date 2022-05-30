import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import {
  Client,
  Prisma,
  RequestToChange,
  RequestToWithdrawal,
} from '@prisma/client';
import { Expose } from 'src/providers/prisma/prisma.interface';
import { ClientCreateDto, RequestToChangeDto } from './clients.dto';
import { ClientsService } from './clients.service';

@ApiSecurity('JWT')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async getAll(
    @Headers('Authorization') token: string,
  ): Promise<Expose<Client>[]> {
    return this.clientsService.findAll(token);
  }

  @Get('requests')
  async getRequests(): Promise<Expose<RequestToChange>[]> {
    return this.clientsService.getRequestToChange();
  }

  @Get('requests-to-withdrawal')
  async getRequestsToWithdrawal(): Promise<Expose<RequestToWithdrawal>[]> {
    return this.clientsService.getStocksWithdrawal();
  }

  @Get(':clientId')
  async get(
    @Param('clientId', ParseIntPipe) id: number,
  ): Promise<Expose<Client>> {
    return this.clientsService.findOne(id);
  }

  @Post()
  async create(
    @Body() data: ClientCreateDto,
    @Headers('Authorization') token: string,
  ): Promise<Expose<Client>> {
    return this.clientsService.create(data, token);
  }

  @Patch(':clientId')
  async update(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Body() data: Prisma.ClientUpdateInput,
  ): Promise<Expose<Client>> {
    return this.clientsService.updateClient(clientId, data);
  }

  @Put('requests-to-update/:userId/:clientId')
  async updateRequest(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateRequest: RequestToChangeDto,
  ): Promise<Expose<{}>> {
    return this.clientsService.updateRequest(clientId, userId, updateRequest);
  }

  @Get('requests-to-update/approve/:requestId')
  async approveUpdate(
    @Param('requestId', ParseIntPipe) id: number,
  ): Promise<Expose<Client>> {
    return this.clientsService.update(id);
  }

  @Get('requests-to-update/reject/:requestId')
  async rejectUpdate(
    @Param('requestId', ParseIntPipe) id: number,
  ): Promise<Expose<RequestToChange>> {
    return this.clientsService.rejectUpdate(id);
  }

  @Delete(':clientId')
  async delete(
    @Param('clientId', ParseIntPipe) id: number,
  ): Promise<Expose<Client>> {
    return this.clientsService.disActive(id);
  }

  @Put(':clientId/activate')
  async activate(
    @Param('clientId', ParseIntPipe) id: number,
  ): Promise<Expose<Client>> {
    return this.clientsService.active(id);
  }

  @Post('stocks-withdrawal/:clientId')
  async getStocksWithdrawal(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Headers('Authorization') token: string,
  ): Promise<Expose<RequestToWithdrawal>> {
    return this.clientsService.stocksWithdrawal(token, clientId);
  }

  @Get('stocks-withdrawal/approve/:id')
  async getStocksWithdrawalApprove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Expose<RequestToWithdrawal>> {
    return this.clientsService.stocksWithdrawalAccept(id);
  }

  @Get('stocks-withdrawal/reject/:id')
  async getStocksWithdrawalReject(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Expose<RequestToWithdrawal>> {
    return this.clientsService.stocksWithdrawalReject(id);
  }
}

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
import { Client, ClientProfit, Period, Prisma, Stage } from '@prisma/client';
import { Expose } from 'src/providers/prisma/prisma.interface';
import { PeriodCreateDto, ProfitUpdateDto } from './periods.dto';
import { PeriodsService } from './periods.service';

@ApiSecurity('JWT')
@Controller('periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Get()
  async getAll(): Promise<Expose<Period>[]> {
    return this.periodsService.findAll();
  }

  @Get('/numbers')
  async getNumbers(): Promise<Expose<{}>> {
    return this.periodsService.numbers();
  }

  @Patch('stages/:stageId')
  async updateStageProfit(
    @Param('stageId', ParseIntPipe) id: number,
    @Body() data: ProfitUpdateDto,
  ): Promise<Expose<Stage>> {
    return this.periodsService.updateStageProfit(id, data);
  }

  @Get('/stages/:userId')
  async getStages(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Expose<Stage>[]> {
    return this.periodsService.getStages(userId);
  }

  @Get(':periodId')
  async get(
    @Param('periodId', ParseIntPipe) id: number,
  ): Promise<Expose<Period>> {
    return this.periodsService.findOne(id);
  }

  @Post()
  async create(@Body() data: PeriodCreateDto): Promise<Expose<Period>> {
    return this.periodsService.create(data);
  }

  @Patch(':periodId')
  async update(
    @Param('periodId', ParseIntPipe) id: number,
    @Body() data: Prisma.PeriodUpdateInput,
  ): Promise<Expose<Period>> {
    return this.periodsService.update(id, data);
  }

  @Delete(':periodId')
  async delete(
    @Param('periodId', ParseIntPipe) id: number,
  ): Promise<Expose<Period>> {
    return this.periodsService.delete(id);
  }

  @Get('/:periodId/clients')
  async getClients(
    @Param('periodId', ParseIntPipe) id: number,
  ): Promise<Expose<Client>[]> {
    return this.periodsService.getClients(id);
  }

  @Put('/profit/:id')
  async updateProfit(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Expose<ClientProfit>> {
    return this.periodsService.doneDividing(id);
  }
}

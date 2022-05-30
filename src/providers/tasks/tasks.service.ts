import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PeriodsService } from 'src/modules/periods/periods.service';
// import { UsersService } from '../../modules/users/users.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    // private configService: ConfigService,
    // private usersService: UsersService,
    private periodService: PeriodsService
  ) {}
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async createNewStage() {
    const periods = await this.prisma.period.findMany({
      include: { stocks: true, ceratedBy: true, stages: true },
    });
    periods.forEach(async period => {
      const { stages } = period;
      const lastStage = stages[stages.length - 1];

      if (lastStage.dividendEnd === new Date() && lastStage.status === 'DIVIDEND_ENDED') {
        const { end } = lastStage;
        const endDate = new Date(end);
        const newEndDate = await this.periodService.after60Days(endDate);
        const newDividendEndDate = await this.periodService.after7Days(newEndDate);
        const newStage = await this.prisma.stage.create({
          data: {
            period: { connect: { id: period.id } },
            start: endDate,
            end: newEndDate,
            dividendEnd: newDividendEndDate,
          },
        });
        if (newStage) this.logger.debug(`Created new stage for ${period.name} audit logs`);
      }
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async startStage() {
    const periods = await this.prisma.period.findMany({
      include: { stocks: true, ceratedBy: true, stages: true },
    });

    periods.map(async period => {
      const { stages } = period;
      const lastStage = stages[stages.length - 1];
      const { start } = lastStage;
      const startDate = new Date(start);
      if (startDate >= new Date() && lastStage.status === 'PENDING') {
        await this.prisma.stage.update({
          where: { id: lastStage.id },
          data: {
            status: 'STARTED',
          },
        });
        this.logger.debug(`Started stage ${lastStage.id} for ${period.name} audit logs`);
      }
    }
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async endStage() {
    const periods = await this.prisma.period.findMany({
      include: { stocks: true, ceratedBy: true, stages: true },
    });

    periods.forEach(async period => {
      const { stages } = period;
      const lastStage = stages[stages.length - 1];
      const { end } = lastStage;
      const endDate = new Date(end);
      if (endDate === new Date() && lastStage.status === 'STARTED') {
        await this.prisma.stage.update({
          where: { id: lastStage.id },
          data: {
            status: 'DIVIDEND_STARTED',
          },
        });
        this.logger.debug(`Ended stage ${lastStage.id} for ${period.name} audit logs`);
      }
    }
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async endDividend() {
    const periods = await this.prisma.period.findMany({
      include: { stocks: true, ceratedBy: true, stages: true },
    });

    periods.forEach(async period => {
      const { stages } = period;
      const lastStage = stages[stages.length - 1];
      const { dividendEnd } = lastStage;
      const dividendEndDate = new Date(dividendEnd);
      if (dividendEndDate === new Date() && lastStage.status === 'DIVIDEND_STARTED') {
        await this.prisma.stage.update({
          where: { id: lastStage.id },
          data: {
            status: 'DIVIDEND_ENDED',
          },
        });
        this.logger.debug(`Ended dividend ${lastStage.id} for ${period.name} audit logs`);
      }
    }
    );
  }
}

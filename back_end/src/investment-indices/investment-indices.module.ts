import { Module } from "@nestjs/common";
import { HttpModule } from '@nestjs/axios';
import { InvestmentIndicesController } from "./investment-indices.controller";
import { InvestmentIndicesService } from "./investment-indices.service";

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [InvestmentIndicesController],
  providers: [InvestmentIndicesService]
})
export class InvestmentIndicesModule {}

import { Module } from '@nestjs/common';
import { JarsController } from './jars.controller';
import { JarsService } from './jars.service';

@Module({
  controllers: [JarsController],
  providers: [JarsService]
})
export class JarsModule {}

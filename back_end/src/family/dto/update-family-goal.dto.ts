import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyGoalDto } from './create-family-goal.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { GoalStatus } from '../../common/enums/enum';

export class UpdateFamilyGoalDto extends PartialType(CreateFamilyGoalDto) {
  @IsEnum(GoalStatus)
  @IsOptional()
  status?: GoalStatus;
}

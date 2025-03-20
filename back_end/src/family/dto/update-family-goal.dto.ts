import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyGoalDto } from './create-family-goal.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { GoalStatus } from '../../common/enums/enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFamilyGoalDto extends PartialType(CreateFamilyGoalDto) {
  @IsEnum(GoalStatus)
  @IsOptional()
  status?: GoalStatus;

  @ApiProperty({
    description: 'Update timestamp, automatically set when the goal is updated',
    type: Date,
    required: false,
  })
  updatedAt?: Date;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyBudgetDto } from './create-family-budget.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFamilyBudgetDto extends PartialType(CreateFamilyBudgetDto) {
  @ApiProperty({
    description: 'Update timestamp, automatically set when the budget is updated',
    type: Date,
    required: false,
  })
  updatedAt?: Date;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyBudgetDto } from './create-family-budget.dto';

export class UpdateFamilyBudgetDto extends PartialType(CreateFamilyBudgetDto) {}

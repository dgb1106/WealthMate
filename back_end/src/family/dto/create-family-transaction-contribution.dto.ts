import { IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { ContributionType } from '../../common/enums/enum';

export class CreateFamilyTransactionContributionDto {
  @IsString()
  transactionId: string;

  @IsString()
  groupId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(ContributionType)
  contributionType: ContributionType;

  @IsString()
  targetId: string; // ID of either a budget or goal, depending on contributionType
}

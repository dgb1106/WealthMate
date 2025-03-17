import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyGroupDto } from './create-family-group.dto';

export class UpdateFamilyGroupDto extends PartialType(CreateFamilyGroupDto) {}

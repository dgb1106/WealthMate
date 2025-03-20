import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyGroupDto } from './create-family-group.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFamilyGroupDto extends PartialType(CreateFamilyGroupDto) {
  @ApiProperty({
    description: 'Update timestamp, automatically set when the group is updated',
    type: Date,
    required: false,
  })
  updatedAt?: Date;
}

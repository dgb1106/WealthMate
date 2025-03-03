import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsPhoneNumber, IsString, Min } from 'class-validator';
import { PreferredGoal, PreferredMood } from 'src/common/enums/enum';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsEmail({}, { message: 'Please provide a valid email' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsPhoneNumber('VN', { message: 'Please provide a valid phone number' })
    @IsNotEmpty({ message: 'Phone number is required' })
    phone: string;

    @IsString()
    @IsNotEmpty({ message: 'City is required' })
    city: string;

    @IsString()
    @IsNotEmpty({ message: 'District is required' })
    district: string;

    @IsString()
    @IsNotEmpty({ message: 'Job is required' })
    job: string;

    @IsEnum(PreferredMood, { message: 'Invalid preferred mood' })
    @IsNotEmpty({ message: 'Preferred mood is required' })
    preferredMood: string;

    @IsEnum(PreferredGoal, { message: 'Invalid preferred goal' })
    @IsNotEmpty({ message: 'Preferred goal is required' })
    preferredGoal: string;

    @IsNumber()
    @Min(0, { message: 'Current balance must be greater than or equal to 0' })
    currentBalance: number;
}
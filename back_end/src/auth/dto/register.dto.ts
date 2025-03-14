import { PreferredGoal, PreferredMood } from "src/common/enums/enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @ApiProperty({
        description: 'Email address',
        example: 'example@email.com'
    })
    @IsEmail({}, { message: 'Please provide a valid email' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({
        description: 'Password',
        example: 'StrongP@ssw0rd'
    })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @ApiProperty({
      description: 'Full name of the user',
      example: 'Nguyen Van A'
    })
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    @MaxLength(255)
    name: string;
    
    @ApiProperty({
        description: 'Phone number in Vietnam format',
        example: '+84912345678'
    })
    @IsPhoneNumber('VN', { message: 'Please provide a valid phone number' })
    @MinLength(9, { message: 'Phone number must have at least 10 characters long' })
    @IsNotEmpty({ message: 'Phone number is required' })
    phone: string;

    @ApiProperty({
        description: 'City of residence',
        example: 'Ho Chi Minh City'
    })
    @IsString()
    @IsNotEmpty({ message: 'City is required' })
    @MaxLength(255)
    city: string;

    @ApiProperty({
        description: 'District of residence',
        example: 'District 1'
    })
    @IsString()
    @IsNotEmpty({ message: 'District is required' })
    @MaxLength(255)
    district: string;

    @ApiProperty({
        description: 'User occupation',
        example: 'Software Engineer'
    })
    @IsString()
    @IsNotEmpty({ message: 'Job is required' })
    @MaxLength(255)
    job: string;

    @ApiProperty({
        description: 'User preferred financial mood',
        enum: PreferredMood,
        example: 'IRRITATION'
    })
    @IsEnum(PreferredMood, { message: 'Invalid preferred mood' })
    @IsNotEmpty({ message: 'Preferred mood is required' })
    preferred_mood: PreferredMood;

    @ApiProperty({
        description: 'User preferred financial goal',
        enum: PreferredGoal,
        example: 'SAVING'
    })
    @IsEnum(PreferredGoal, { message: 'Invalid preferred goal' })
    @IsNotEmpty({ message: 'Preferred goal is required' })
    preferred_goal: PreferredGoal;
}

  
import { IsString, IsNotEmpty, IsDate } from 'class-validator';

export class CreateCronJobDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  link: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  schedule: string;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;
}

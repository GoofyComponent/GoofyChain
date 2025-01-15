import { IsArray, IsString } from 'class-validator';

export class UpdateWalletsDto {
  @IsArray()
  @IsString({ each: true })
  addresses: string[];
}

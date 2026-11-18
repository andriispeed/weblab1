import { Transform } from "class-transformer";
import {
  Equals,
  IsEmail,
  IsIn,
  IsInt,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
const trim = () =>
  Transform(({ value }) => (typeof value === "string" ? value.trim() : value));

export class ApplicationDto {
  @ApiProperty() @IsUUID("4") requestId!: string;
  @ApiProperty({ example: "Олена" })
  @trim()
  @IsString()
  @Length(2, 80)
  name!: string;
  @ApiProperty({ example: "student@example.com" })
  @trim()
  @IsEmail()
  @MaxLength(160)
  email!: string;
  @ApiProperty({ enum: ["consultation", "frontend", "python", "qa"] })
  @IsIn(["consultation", "frontend", "python", "qa"])
  course!: string;
  @ApiProperty() @trim() @IsString() @MaxLength(1000) message!: string;
  @ApiProperty({ example: true }) @Equals(true) consent!: boolean;
}
export class LoginDto {
  @ApiProperty({ example: "admin" })
  @trim()
  @IsString()
  @Length(1, 80)
  username!: string;
  @ApiProperty() @IsString() @Length(8, 200) password!: string;
}
export class StatusDto {
  @ApiProperty({ enum: ["new", "contacted", "enrolled"] })
  @IsIn(["new", "contacted", "enrolled"])
  status!: string;
}
export class CourseDto {
  @ApiProperty({ example: 4500 }) @IsInt() @Min(0) @Max(1000000) price!: number;
  @ApiProperty() @trim() @IsString() @Length(10, 500) description!: string;
  @ApiProperty() @IsInt() @Min(1) version!: number;
}

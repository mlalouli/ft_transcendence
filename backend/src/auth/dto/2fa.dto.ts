import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator";


export class twoFactorDto {
    @IsNotEmpty()
    @IsString()
    pseudo: string;

    @IsNotEmpty()
    @IsString()
    twoFAsecret: string;
}

export class TwoFactorUserDto {
    @IsNotEmpty()
    @IsString()
    login: string;

    @IsNotEmpty()
    @IsString()
    twoFACode: string;

    @IsNotEmpty()
    @IsNumber()
    id: number;
}

export class TwoFaCode {
    @IsString()
    @IsNotEmpty()
    @Length(6)
    code : string;
}
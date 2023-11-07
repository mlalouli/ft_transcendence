import { IsNotEmpty, IsNumber, IsString } from "class-validator";



export class Auth42Dto {
    @IsString()
    @IsNotEmpty()
    login: string;

    @IsString()
    @IsNotEmpty()
    avatar: string;  
};

export class AuthTokenDto {
    @IsString()
    @IsNotEmpty()
    access_token: string;

    @IsString()
    @IsNotEmpty()
    refresh_token: string;
}
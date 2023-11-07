import { Exclude } from 'class-transformer';
import {IsNumber, IsNotEmpty, IsString, IsBoolean} from 'class-validator';


export class UserDto{
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsNumber()
    @IsNotEmpty()
    login: string;

    @IsString()
    @IsNotEmpty()
    pseudo: string;

    @IsString()
    @IsNotEmpty()
    avatar: string;

    @IsBoolean()
    @IsNotEmpty()
    twoFAState: boolean;

    @IsString()
    twoFACode: string;


    @IsNumber()
    @IsNotEmpty()
    xp: number;

    
    @IsNumber()
    @IsNotEmpty()
    rank: number;
    
    @IsNumber()
    @IsNotEmpty()
    winRate: number;

    @IsNumber()
    @IsNotEmpty()
    wins: number;

    @IsNumber()
    @IsNotEmpty()
    gamesNumber: number;

    @Exclude()
    refreshToken: string;
    
}
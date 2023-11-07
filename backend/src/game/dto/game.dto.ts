import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";
import { UserDto } from "src/user/dto/user.dto";



export class GameDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    otherId: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(65_000)
    otherAvatar: string;

    @IsString()
    @IsNotEmpty()
    otherPseudo: string;

    @IsString()
    @IsNotEmpty()
    otherUser: UserDto;

    @IsNumber()
    @IsNotEmpty()
    otherRank: number;

    @IsNumber()
    @IsNotEmpty()
    userScore: number;

    @IsNumber()
    @IsNotEmpty()
    otherScore: number;

    @IsNotEmpty()
    victory: boolean;
}
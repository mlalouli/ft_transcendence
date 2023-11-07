import { IsNotEmpty, IsNumber } from "class-validator";


export class avatarDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;
}
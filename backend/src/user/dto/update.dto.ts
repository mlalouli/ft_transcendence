import { IsNotEmpty, IsString, MaxLength } from "class-validator";


export class UpdatePseudoDto{
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    pseudo: string;
}
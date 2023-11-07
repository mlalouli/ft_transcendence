import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GameService } from "./game.service";


@ApiTags('Game')
@Controller('game')
export class GameController {
    constructor(private gameService: GameService) {}

    @Post('/saveGame')
    async saveGame(
        @Body('id') id: number,
        @Body('userId1') userId1: number,
        @Body('userId2') userId2: number,
        @Body('score1') score1: number,
        @Body('score2') score2: number,
        @Body('pvt') pvt: boolean
    ){

        const res = await this.gameService.saveGame(id, userId1, userId2, score1, score2, pvt);
        return res;
    }
}
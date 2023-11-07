import { Module, forwardRef } from "@nestjs/common";
import { AppModule } from "src/app.module";
import { UserModule } from "src/user/user.module";
import { GameService } from "./game.service";
import { GameController } from "./game.controller";
import { GameGateway } from "./game.gateway";

@Module({
    imports: [
        forwardRef(() => AppModule),
        forwardRef(() => UserModule)
    ],
    providers: [GameService, GameGateway],
    controllers: [GameController],
    exports: [GameService]
})
export class GameModule {}
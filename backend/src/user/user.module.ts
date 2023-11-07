import {Module, forwardRef} from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GameModule } from 'src/game/game.module';
import { UserController } from './user.controller';
import { UserService} from './user.service';


@Module({
    imports: [forwardRef(() => GameModule), forwardRef(() => PrismaModule)],
    providers :[UserService],
    controllers :[UserController],
    exports: [UserService]
})
export class UserModule{}
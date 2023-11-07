import { Module, forwardRef } from "@nestjs/common";
import {HttpModule} from "@nestjs/axios";
import { UserModule } from "src/user/user.module";
import { AvatarController } from "./avatar.controller";
import { AvatarService } from "./avatar.service";
import { ChatModule } from "src/chat/chat.module";

@Module({
    imports: [forwardRef(() => HttpModule), forwardRef(() => UserModule), forwardRef(()=> ChatModule)],
    providers: [AvatarService],
    controllers: [AvatarController],
    exports: [AvatarService]
})

export class AvatarModule {}
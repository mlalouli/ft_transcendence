import {Module, forwardRef } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModule } from 'src/user/user.module';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

@Module({
    imports: [forwardRef(() => UserModule), forwardRef(() => PrismaModule)],
    providers: [ChatService, ChatGateway],
    exports: [ChatService, ChatGateway]
})
export class ChatModule {}
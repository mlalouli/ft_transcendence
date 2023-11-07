import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { IntraStrategy } from './strategies/IntraStrategy';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { refreshStrategy } from 'src/auth/strategies/refreshStrategy';
import { jwtStrategy } from 'src/auth/strategies/jwtStrategy';
import { AppGateway } from 'src/app.gateway';
import { AvatarService } from 'src/avatar/avatar.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AppModule } from 'src/app.module';
import { UserModule } from 'src/user/user.module';
import { AvatarModule } from 'src/avatar/avatar.module';
import { TwoFactorService } from './2FA/2fa.service';
import { ChatModule } from 'src/chat/chat.module';
import { TwoFAController } from './2FA/2fa.controller';
@Module({
    imports: [
        JwtModule.register({}),
        forwardRef(()=> AppModule),
        forwardRef(()=> UserModule),
        forwardRef(()=> AvatarModule),
        forwardRef(()=> HttpModule),
        forwardRef(()=> ChatModule)
    ],
    controllers : [AuthController, TwoFAController],
    providers : [
        AuthService,
        IntraStrategy,
        refreshStrategy,
        jwtStrategy,
        TwoFactorService
    ],
    exports: [AuthService]
})
export class AuthModule {}

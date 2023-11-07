import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { JwtModule } from '@nestjs/jwt';
import { AppGateway } from './app.gateway';
import { AvatarModule } from './avatar/avatar.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
	imports: [
		MulterModule,
		AuthModule,
		GameModule,
		UserModule,
		PrismaModule,
		ChatModule,
		JwtModule.register({ secret: process.env.JWT_SECRET }),
		AvatarModule,
	],
	providers: [AppGateway],
	exports: [AppGateway],
})
export class AppModule {}

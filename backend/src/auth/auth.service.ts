import { ForbiddenException, Injectable, Res } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/user/user.service";
import { Auth42Dto, AuthTokenDto } from "./dto/auth.dto";
import { User } from '@prisma/client';
import { Response } from "express";
import { JwtService } from "@nestjs/jwt";
import * as argon from "argon2";
import { AppGateway } from "src/app.gateway";
import { AvatarService } from "src/avatar/avatar.service";
import { ChatGateway } from "src/chat/chat.gateway";
@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly appGateway: AppGateway,
        private readonly avatarService: AvatarService,
    ) {}

    async signIn(dto: Auth42Dto) : Promise<User>{
        const {login} = dto;

        const user = await this.prisma.user.findFirst({
            where : { login: login}
        });

        if (user)
            this.appGateway.onlineFromService(user.id);
        return user ?? this.createUser(dto);
    }

    async createUser(dto: Auth42Dto) : Promise<User> {
        const {login, avatar} = dto;
        
        const pseudo = login + this.generatePseudo();
        const user = await this.userService.createUser(
            login,
            pseudo
        );
        if (user)
            await this.avatarService.downloadAvatar(user.id, avatar);
        this.appGateway.onlineFromService(user.id)
        return user;
    }

    generatePseudo(): string {
        const pseudo =  Math.random().toString(10).slice(2, 8);
        return pseudo;
    }

    async signInToken(@Res() response: Response, id: number, login: string): Promise<Response>{
        const tokens = await this.signInJwt(id, login);
        await this.updateRefreshToken(id, tokens.refresh_token);
        const url = new URL(process.env.SITE_URL);
        url.port =process.env.FRONTEND_PORT;
        url.pathname = '/Login';
        url.searchParams.append('access_token', tokens['access_token']);
        response.status(302).redirect(url.href);
        return response;
    }

    async signInJwt(id: number, login: string,  is2FA = false): Promise<AuthTokenDto>{
        const data = {
            sub: id,
            login: login,
            is2FA
        };
        const secret = process.env.JWT_SECRET;
        const aExpiration = process.env.ACCESS_TOKEN;
        const rExpiration = process.env.REFRESH_TOKEN;

        const aToken = await this.jwtService.signAsync(data, {
            secret: secret,
            expiresIn: aExpiration
        });

        const rToken = await this.jwtService.signAsync(data, {
            secret: secret,
            expiresIn: rExpiration
        });
        return {
            access_token: aToken,
            refresh_token: rToken
        };
    }

    async updateRefreshToken(id: number, refreshToken: string): Promise<void>{
        const hash = await argon.hash(refreshToken);
        await this.prisma.user.update({
            where : {
                id: id
            },
            data: {
                refreshToken : hash
            }
        });
    }

    async refresh_token(id: number, refreshToken: string) : Promise<AuthTokenDto>{
        const user = await this.prisma.user.findUnique({
            where: {
                id : id
            }
        });

        if (!user || !user.refreshToken)
            throw new ForbiddenException('Invalid Infos');
        const verification = await argon.verify(user.refreshToken, refreshToken);
        if (!verification)
            throw new ForbiddenException('Invalid Infos');
        const tokens = await this.signInJwt(user.id, user.login);
        await this.updateRefreshToken(id, refreshToken);
        return tokens;
    }

    async signOut(id: number) : Promise<void>{
        await this.prisma.user.updateMany({
            where: {
                id: id,
                refreshToken:{
                    not: null
                }
            },
            data: {
                refreshToken: null
            }
            
        });
        this.appGateway.offlineFromService(id);
    }
};
import { Inject, Injectable, UnauthorizedException, forwardRef } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthService } from "../auth.service";
import { Response } from 'express';
import { TwoFactorUserDto, twoFactorDto } from "../dto/2fa.dto";
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { log } from "console";

@Injectable()
export class TwoFactorService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => AuthService))
        private authservice: AuthService,
    ){}
    
    signIn2FA(response: Response, pseudo: string) {
        const url = new URL(process.env.SITE_URL);
        url.port = (process.env.FRONTEND_PORT);
        url.pathname = 'TwoFA';
        url.searchParams.append('pseudo', pseudo);
        response.status(302).redirect(url.href);
    }

    async turnOn(twoFacode : string, user: TwoFactorUserDto){
        
        const {id, login, twoFACode} = user;
        const check = await this.verify2FA(twoFacode, twoFACode);    
        if (!check)  
            throw new UnauthorizedException('Invalid code !');

        await this.prisma.user.update({
            where: {login : login},
            data: {twoFAState: true}
        });
        const tokens = await this.authservice.signInJwt(id, login, true);        
        return tokens;
    }

    async verify2FA(code: string, twoFasecret: string){
        return authenticator.verify({
            token: code,
            secret: twoFasecret
        })
    }

    async turnOff(user: TwoFactorUserDto) {
        const {id, login} = user;
        await this.prisma.user.update({
            where: {id: id},
            data: {twoFAState: false, twoFACode: null}
        })
        const tokens = await this.authservice.signInJwt(id, login, false);
        return tokens;
    }

    async generate2FA(login: string ){
        const secret = authenticator.generateSecret();
        const QRUrl = authenticator.keyuri(
            login,
            process.env.APP_NAME,
            secret
        );
        await this.prisma.user.update({
            where: {login: login},
            data: {twoFACode: secret}
        });
        return {
            secret,
            QRUrl
        }
    }

    async authenticate(dto: twoFactorDto){
        const {pseudo, twoFAsecret} = dto;
        const [user]  = await this.prisma.user.findMany({
            where: {
                OR: [
                    {
                        login: pseudo
                    },
                    {
                        pseudo : pseudo
                    }
                ]
            }
        }); 
        if (!user)
            throw new UnauthorizedException('Invalid User');
        const {id, login, twoFACode} = user;
        const check = await this.verify2FA(twoFAsecret, twoFACode);   
        if (!check)
            throw new UnauthorizedException('Invalide Code ');
        const tokens = await this.authservice.signInJwt(id, login, true);        
        await this.authservice.updateRefreshToken(id, tokens.refresh_token);      
        return tokens;
    }

    async generateQRCode(QRUrl: string){
        return toDataURL(QRUrl);
    }
}
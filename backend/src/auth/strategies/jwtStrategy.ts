import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class jwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(private prisma: PrismaService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        });
    }
    async validate(data: {sub: number; twoFAState: boolean}){
        const user = await this.prisma.user.findUnique({
            where: {
                id: data.sub
            }
        });    
        if (!user.refreshToken)
            return;
        if (user)
            delete user.refreshToken;
        if (user.twoFACode)
            return user;
        if (!user.twoFACode)
            return user;

        if (data.twoFAState)
            return user;
    }
}


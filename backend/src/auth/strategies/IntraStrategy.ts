import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { access } from "fs";
import { Strategy } from  'passport-42';
import { ConfigService } from "@nestjs/config";
import { stringify } from "querystring"; 
import { Profile } from 'src/utils/user.interface';
import { profile } from "console";


@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, 'intra') {
    constructor(
    ){
        super({
            clientID : process.env.INTRA_ID,
            clientSecret : process.env.INTRA_SECRET,
            callbackURL : process.env.INTRA_CALLBACK,
            profileFields: {
                login : 'login',
                avatar: 'image.link'
            }
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile){
        return profile;
    }
}


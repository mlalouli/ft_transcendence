import { Body, Controller, HttpCode, Post, Res } from "@nestjs/common";
import { ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetCurrentUser } from "src/utils/getCurrentUserDecorator";
import { TwoFactorUserDto, twoFactorDto } from "../dto/2fa.dto";
import { TwoFactorService } from "./2fa.service";
import { Public } from "src/utils/public.decorator";
import { Response } from 'express'


@Controller('/2fa')
@ApiTags('Two Factor Authentication')
@ApiHeader({
    name: 'Two Factor Authentication',
    description: 'Two Factor Authentication'
})
export class TwoFAController{
    constructor(private twoFAservice : TwoFactorService) {}

    @Post('/turnOn')
    @ApiResponse({ status : 402, description: 'Invalide code'})
    @HttpCode(200)
    async turnOn(
        @Body() {twoFAcode} :{ twoFAcode : string},
        @GetCurrentUser() user: TwoFactorUserDto
    ){
        const tokens = await this.twoFAservice.turnOn(twoFAcode, user);
        return tokens;
    }

    @Post('/turnOff')
    @HttpCode(200)
    async turnOff(@GetCurrentUser() user: TwoFactorUserDto){     
        const tokens = await this.twoFAservice.turnOff(user);
        return tokens;
    }

    @Public()
    @ApiResponse({status: 402, description: 'Invalide Code !'})
    @Post('/authenticate')
    async authenticate(@Body() dto: twoFactorDto){      
        const response = await this.twoFAservice.authenticate(dto);
        return response;
        
    }

    @Post('/generate')
    async generate2FA(
        @Res() response: Response,
        @GetCurrentUser('login') login: string,
    ){ 
        const {QRUrl} = await this.twoFAservice.generate2FA(login);
        const qrcode = await this.twoFAservice.generateQRCode(QRUrl);
        return response.json(qrcode);
    }
}
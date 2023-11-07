import { Controller, Get, UseGuards , Req, Logger, Res, Post, HttpCode, UseFilters} from "@nestjs/common";


import { AuthService} from './auth.service';
import { Request, Response } from 'express';
import { Public } from "src/utils/public.decorator";
import { IntraAuthGuard } from "src/auth/guards/intra.guard";
import { Profile } from "src/utils/user.interface";
import { ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetCurrentId } from "src/utils/getCurrentUserIdDecorator";
import { GetCurrentUser } from "src/utils/getCurrentUserDecorator";
import { refreshGuard } from './guards/refresh.guard';
import { RedirectOnLogin } from "./filter/redirect.login";
import { TwoFactorService } from "./2FA/2fa.service";

@ApiTags('authentification')
@ApiHeader({
    name: 'Authorization',
    description: 'Jason Web Token as Bearer Token'
})
@Controller('auth')
export class AuthController {
    constructor(
                private readonly authService: AuthService,
                private readonly twoFAService: TwoFactorService
                ){}

    logger = new Logger('Authentication');

    @Public()
    @UseGuards(IntraAuthGuard)
    @Get('intra/signIn')
    signIn(){
        console.log('42 API signIn');
    }

    @Public()
    @Get('intra/redirect')
    @UseGuards(IntraAuthGuard)
    @UseFilters(RedirectOnLogin)
    async handleRedirect(@Req() request : Request, @Res() response: Response) {
        const user = await this.authService.signIn(request.user as Profile);
        const {pseudo, twoFAState, id, login} = user;
        this.logger.log(pseudo + " signed In");
        // return  this.authService.signInToken(response, id, login);
        return twoFAState ? this.twoFAService.signIn2FA(response, login)
                         : this.authService.signInToken(response, id, login);
    }

    @Post('logout')
    @HttpCode(200)
    @ApiResponse({status: 401, description: 'Unauthorized'})
    logout(@GetCurrentId() id: number, @GetCurrentUser('pseudo') pseudo: string ){
        this.logger.log(pseudo + " logged Out");
        return this.authService.signOut(id);
    }

  

    @Public()
    @UseGuards(refreshGuard)
    @HttpCode(200)
    @Post('refresh')
    refresh(@GetCurrentId() id: number, @GetCurrentUser('refreshToken') refreshToken: string){
        
         return this.authService.refresh_token(id, refreshToken);
    }

    @Get('/test')
    test(){
        return {msg: 'test'};
    }
}
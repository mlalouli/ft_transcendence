import { UserService } from "./user.service";
import {Controller ,Param,Body, Get, Post, Delete, Put, Logger, ForbiddenException, UnauthorizedException} from "@nestjs/common"
import { isNumber } from 'class-validator';
import { GetCurrentId } from "src/utils/getCurrentUserIdDecorator";
import { UpdatePseudoDto } from "./dto/update.dto";
import { ApiTags } from "@nestjs/swagger";


@ApiTags('Users')
@Controller('users')
export class UserController{
    constructor(private readonly userService: UserService){}

    logger = new Logger('UserController');

    
    
    @Get('current')
    getCurrent(@GetCurrentId() id : number){
        this.logger.log('get current Id');
        const userDto = this.userService.getUser(id);
        return userDto;
    }

    @Get('allUsers')
    async getAllUsers() {
        this.logger.log('get All Users');
        const userDto = await this.userService.getAllUser();  
        return userDto;
    }

    @Post('getUser')
    getUser(@Body('otherId') otherId : number | string){
        this.logger.log('getUser by Id ' + otherId);
        try {
            if (isNumber(otherId)){
                const userDto = this.userService.getUser(Number(otherId));
                return userDto;
            }else {
                const userDto = this.userService.getPseudo(String(otherId));
                return userDto;
            }
        }catch {
            throw new ForbiddenException('getUser error');
        }
    }


    @Post('addFriend')
    async addFriend(@GetCurrentId() id: number, @Body('otherId') otherId: number){
        this.logger.log('addFriend Id: ' + id + ' otherId: ' + otherId);
        const res = await this.userService.addFriend(id, otherId);
        return res;
    }


    @Post('deleteFriend')
    async deleteFriend(@GetCurrentId() id: number, @Body('otherId') otherId: number){
        this.logger.log('deleteFriend Id: ' + id + ' otherId: ' + otherId);
        const res = await this.userService.deleteFriend(id, otherId);
        return res;
    }

    @Post('cancelRequest')
    async cancelRequest(@GetCurrentId() id: number, @Body('otherId') otherId: number){
        this.logger.log('cancelRequest Id: ' + id +' otherId: ' + otherId);
        const res = await this.userService.cancelRequest(id, otherId);
        return res;
    }

    @Post('denyRequest')
    async denyRequest(@GetCurrentId() id: number, @Body('otherId') otherId: number){
        this.logger.log('denyRequest Id: ' + id +' otherId: ' + otherId);
        const res = await this.userService.denyRequest(id, otherId);
        return res;
    }


    @Post('getFriends')
    async getFriends(@Body('otherId') otherId: number){
        this.logger.log('getFriends otherId:' + otherId);
        const res = await this.userService.getFriends(otherId);
        return res;
    }
    
    @Get('getPending')
    async getPending(@GetCurrentId() id: number){
        this.logger.log('getPending Id: ' + id);
        const res = await this.userService.getPending(id);
        return res;
    }
    
    @Get('isFriend')
    async isFriend(@GetCurrentId() id: number, @Body('otherId') otherId: number){
        this.logger.log('isFriend Id: ' + id + ' otherId: ' + otherId);
        const res = await this.userService.isFriend(id, otherId);
        return res;
    }


    @Get('getLeaderboard')
    async getLeaderboard(){
        this.logger.log('getLeaderboard');
        const res = await this.userService.getLeaderboard();
        return res;
    }

    @Post('getHistory')
    getHistory(@Body('otherId') otherId : number){    
        this.logger.log('getHistory otherId: ' + otherId);
        return this.userService.getHistory(otherId);
    }

    @Post('blockUser')
    async blockUser(@GetCurrentId() id: number, @Body('otherId') otherId: number){
        this.logger.log('blockUser Id: ' + id + ' otherId: ' + otherId);
        const res = await this.userService.blockUser(id, otherId);
        return res;
    }

    @Post('unblockUser')
    async unblockUser(@GetCurrentId() id: number, @Body('otherId') otherId: number){
        this.logger.log('unblockUser Id: ' + id + ' otherId: ' + otherId);
        const res = await this.userService.unblockUser(id, otherId);
        return res;
    }

    @Get('getBlocked')
    async getBlocked(@GetCurrentId() id:number){
        this.logger.log('getBlocked Id: ' + id);
        const res = await this.userService.getBlocked(id);
        return res;
    }

    @Get('isBlocked')
    async isBlocked(@GetCurrentId() id: number, @Body('otherId') otherId: number){
        this.logger.log('isFriend ID: '+ id + ' otherId: ' + otherId);
        const res = await this.userService.isBlocked(id, otherId);
        return res;
    }

    @Get('search')
    async searchUser(@GetCurrentId() id: number, @Body('otherId') suggest: string){
        this.logger.log('Searching ' + suggest );
        const res = await this.userService.searchUser(id, suggest)
        return res;
    }

    @Post('updatePseudo')
    async updatePseudo(@GetCurrentId() id: number, @Body() newPseudo : UpdatePseudoDto){
        const { pseudo } = newPseudo;
        this.logger.log('UpdatePseudo Id ' + ' pseudo : ' + newPseudo);    
        try {
            const res = await this.userService.updatePseudo(id, pseudo);
            return res;
        }catch{
            throw new ForbiddenException('This pseudo already exists');
        }
    }


    @Post('updateAvatar')
    async updateAvatar(@GetCurrentId() id: number, @Body('avatar') newAvatar: string){
        this.logger.log('updateAvatar Id ' + id + ' Avatar: '+ newAvatar);
        const res = await this.userService.updateAvatar(id, newAvatar);
        return res;
    }

} 
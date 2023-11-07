import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, ParseFilePipeBuilder, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
import { getCurves } from "crypto";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/user/user.service";
import { GetCurrentId } from "src/utils/getCurrentUserIdDecorator";
import { ReadableStreamWithFileType } from 'file-type';
import { saveImageToStorage } from "./utils/upload.utils";
import {  Response } from 'express';
import { avatarDto } from "./dto/avatar.dto";
import { ChatService } from "src/chat/chat.service";

@ApiTags('Upload')
@ApiHeader({name: 'Avatars', description: 'Upload avatars'})
@Controller('avatar')
export class AvatarController {
    constructor(
        private readonly userService: UserService,
        private prisma: PrismaService,
        private readonly chatService: ChatService
    ){}

    @Post('avatar')
    @ApiResponse({status: 400, description: 'Invalide file'})
    @ApiResponse({status: 422, description: 'Invalide file'})
    @HttpCode(201)
    @UseInterceptors(FileInterceptor('avatar', saveImageToStorage))
    async uploadAvatar(
        @GetCurrentId() userId: number,
        @Body() body: ReadableStreamWithFileType,
        @UploadedFile(
            new ParseFilePipeBuilder()
            .addFileTypeValidator({fileType: 'jpeg|jpg|png'})
            .addMaxSizeValidator({maxSize: 1000000})
            .build({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})
        )
        file: Express.Multer.File,
    ){    
        await this.userService.updateAvatar(userId, file.filename);
        const response = {
            filename: file.filename,
            originalname: file.originalname,
            path: file.path
        };
        return response;
    }

    @Post('cAvatar')
    @ApiResponse({status: 400, description: 'Invalide file'})
    @ApiResponse({status: 422, description: 'Invalide file'})
    @HttpCode(201)
    @UseInterceptors(FileInterceptor('avatar', saveImageToStorage))
    async uploadCAvatar(
        @Body() body: ReadableStreamWithFileType,
        @UploadedFile(
            new ParseFilePipeBuilder()
            .addFileTypeValidator({fileType: 'jpeg|jpg|png'})
            .addMaxSizeValidator({maxSize: 1000000})
            .build({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})
        )
        file: Express.Multer.File,
        @Body('rId') rId: number
    ){     
        await this.chatService.updateAvatar(+rId, file.filename);
        const response = {
            filename: file.filename,
            originalname: file.originalname,
            path: file.path
        };
        return response;
    }

    @Post('/getavatar')
    @HttpCode(200)
    @ApiResponse({status:400, description: 'Provide Id'})
    @ApiResponse({status:400, description: 'User Not Found'})
    async getAvatarById(@Body() body: avatarDto, @Res() response: Response){
        if (!body.userId){
            throw new BadRequestException('Provide Id');
        }
        const {userId} = body;
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            }
        });
        if (!user)
            throw new BadRequestException('User Not Found');
        return response.sendFile(user.avatar, {root : process.env.UPLOAD_DIR})
    }

    @Post('/getCavatar')
    @HttpCode(200)
    @ApiResponse({status:400, description: 'Provide Id'})
    @ApiResponse({status:400, description: 'User Not Found'})
    async getCAvatarById(@Body() body: avatarDto, @Res() response: Response){
        if (!body.userId){
            throw new BadRequestException('Provide Id');
        }
        const {userId} = body;
        const channel = await this.prisma.channel.findUnique({
            where: {
                id: userId,
            }
        });
        if (!channel)
            throw new BadRequestException('User Not Found');
        // console.log(channel.image);
        if (channel.image === null)
            return response.status(220).json({ error: 'No Image Available' });
        return response.sendFile(channel.image, {root : process.env.UPLOAD_DIR}) 
    }



    @Get('avatar')
    @HttpCode(200)
    async getAvatar(@GetCurrentId() userId: number, @Res() response: Response){     
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        return response.sendFile(user.avatar, {root: process.env.UPLOAD_DIR});
    }
}   
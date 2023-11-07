import { channelType } from "@prisma/client";
import { IsArray, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, isNotEmpty } from "class-validator";
import { Tag } from "../type/chat.type";

export class ChannelDto{

    @IsOptional()
    id: number | null

    @IsString()
    @IsNotEmpty()
    login: string | null

    @IsString()
    @IsNotEmpty()
    name: string

    @IsEnum(channelType, {message:'Invalid type'})
    type:   channelType

    @IsBoolean()
    hasPassword: boolean

    @IsOptional()
    password: string

    @IsArray()
    @IsOptional()
    members: Array<Tag>
}

export class MessageDto{
    @IsString()
    @IsNotEmpty()
    login: string

    @IsNumber()
    @IsNotEmpty()
    channelId: number
    
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsNumber()
    @IsOptional()
    msgId: number
}

export class DmDto{
    @IsString()
    @IsNotEmpty()
    login: string;

    @IsNumber()
    @IsNotEmpty()
    targetId: number;
}
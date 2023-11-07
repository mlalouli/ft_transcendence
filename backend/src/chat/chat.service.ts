import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/user/user.service";
import { chatElement, updateChannel, msg, user, suggestion, mute } from "./type/chat.type";
import { ChannelDto, DmDto, MessageDto } from "./dto/chat.dto";
import * as argon from 'argon2';
import * as moment from 'moment';


@Injectable()
export class ChatService{
    constructor(private readonly prisma: PrismaService,
        @Inject(forwardRef(()=> UserService))
        private readonly userService: UserService){}

    async getUsers(){
        const users = await this.prisma.user.findMany();
        let c = 0;
        
        for (const[i, user] of users.entries()){
             console.log(`user ${i}: ${user.login}`);
             c = i + 1;
        }
        console.log(`${c} Users`);
        return;
    }

    async getChannels(){
        const channels = await this.prisma.user.findMany();
        let c = 0;
        
        for (const[i, user] of channels.entries()){
             console.log(`user ${i}: ${user.login}`);
             c = i + 1;
        }
        console.log(`${c} Channels`);
        return;
    }

    async getIdByLogin(login: string){
        try {
            const user = await this.prisma.user.findUnique({
                where: {login: login},
                select: {id: true}
            });
            return user.id;
        } catch (e){
            console.log('getIdByLogin error:', e);
        }
    }

    async getChannelById(channelId: number){
        try {
            const channel = await this.prisma.channel.findUnique({
                where: {id: channelId},
                select: {name: true}
            });
            return channel.name;
        } catch (e){
            console.log('getChannelById error:', e);
            throw new WsException(e);
        }
    }

    async getUserChannels(id: number){
        try {
            const src = await this.prisma.user.findUnique({
                where: {id: id},
                select: {
                    ownerIn: {
                        where: {
                            type: "DIRECT"
                        }
                    },
                    adminIn: true,
                    memberIn: true
                }
            });
            const channels = this.prepareUserChannels(src);
            return channels;
        }catch (e){
            console.log('getUserChannels Error :', e);
            
        }
    }

    prepareUserChannels(src: any){
        const channels = [];
        if (src){
            if (src.ownerIn)
                for (let i = 0; i < src.ownerIn.length; i++){
                    const channel = src.ownerIn[i].name;
                    channels.push(channel);
                }
            if (src.memberIn)
                for (let i = 0; i < src.memberIn.length; i++){
                    const channel = src.memberIn[i].name;
                    channels.push(channel);
                }
            if (src.adminIn)
                for (let i = 0; i < src.adminIn.length; i++){
                    const channel = src.adminIn[i].name;
                    channels.push(channel);
                }
        }
        return channels;
    }

    async getElements(login: string): Promise<chatElement[]>{
        try {
            const src = await this.getChatListByLogin(login);            
            const data = this.prepareElements(src, login);        
            return data;
        }catch (e){
            console.log('getElements Error:', e);
            
        }
    }

    prepareElements(src: any, login: string){
        const data = [];
        if (src){
            if (src.ownerIn){
                for (let i = 0; i < src.ownerIn.length; i++){
                    let name = ''
                    if (src.ownerIn[i].owners.length > 1){
                        if (src.ownerIn[i].owners[0].login === login)
                            name = src.ownerIn[i].owners[1].pseudo;
                        else
                            name = src.ownerIn[i].owners[0].pseudo;
                    }else 
                        name = 'Empty Chat';
                    let otherId = -1;
                    if (src.ownerIn[i].owners.length > 1){
                        otherId = src.ownerIn[i].owners[0].login === login ?
                                    src.ownerIn[i].owners[1].id :
                                    src.ownerIn[i].owners[0].id;
                    }
                    const messageCount =  src.ownerIn[i].messages.length;
                    const element: chatElement = {
                        id: src.ownerIn[i].id,
                        type: src.ownerIn[i].type,
                        name: name,
                        hasPassword: src.ownerIn[i].hasPassword,
                        lastMsg: messageCount > 0 ? src.ownerIn[i].messages[0].content : '',
                        ownerLogin: src.ownerIn[i].owners[0].login,
                        ownerId: otherId
                    };
                    data.push(element);
                }
            }
            if (src.adminIn)
                for(let i = 0; i < src.adminIn.length; i++){
                    const messageCount =  src.adminIn[i].messages.length;
                    const element: chatElement = {
                        id: src.adminIn[i].id,
                        type: src.adminIn[i].type,
                        name: src.adminIn[i].name,
                        hasPassword: src.adminIn[i].hasPassword,
                        lastMsg: messageCount > 0 ? src.adminIn[i].messages[0].content : '',
                        ownerLogin: src.adminIn[i].owners[0].login,
                        ownerId: src.adminIn[i].owners[0].id
                    };
                    data.push(element);
                }
            if (src.memberIn)
                for(let i = 0; i < src.memberIn.length; i++){
                    const messageCount =  src.memberIn[i].messages.length;
                    const element: chatElement = {
                        id: src.memberIn[i].id,
                        type: src.memberIn[i].type,
                        name: src.memberIn[i].name,
                        hasPassword: src.memberIn[i].hasPassword,
                        lastMsg: messageCount > 0 ? src.memberIn[i].messages[0].content : '',
                        ownerLogin: src.memberIn[i].owners[0].login,
                        ownerId: src.memberIn[i].owners[0].id
                    };
                    data.push(element);
                }
        }
        return data;
    }

    async getChatListByLogin(login: string)
    {
        try {
            const data = await this.prisma.user.findUnique({
                where: {login: login},
                select: {
                    ownerIn: {
                        where: {
                            type: "DIRECT"
                        },
                        select: {
                            id: true,
                            type: true,
                            name: true,
                            hasPassword: true,
                            owners: {
                                select: {
                                    id: true,
                                    login: true,
                                    pseudo: true
                                }
                            },
                            messages: {
                                orderBy: {
                                    createdAt: 'desc'
                                },
                                select:{
                                    content: true,
                                },
                                take: 1
                            }
                        }
                    },
                    adminIn: {
                        select: {
                            id: true,
                            type: true,
                            name: true,
                            hasPassword: true,
                            owners: {
                                select: {
                                    id: true,
                                    login: true,
                                    pseudo: true
                                }
                            },
                            messages: {
                                orderBy:{
                                    createdAt: 'desc'
                                },
                                select: {
                                    content: true,
                                },
                                take : 1
                            }
                        }
                    },
                    memberIn: {
                        select: {
                            id: true,
                            type: true,
                            name: true,
                            hasPassword: true,
                            owners: {
                                select: {
                                    id: true,
                                    login: true,
                                    pseudo: true
                                }
                            },
                            messages: {
                                orderBy:{
                                    createdAt: 'desc'
                                },
                                select: {
                                    content: true,
                                },
                                take : 1
                            }
                        }
                    }
                }
            });
            return data;
        }catch (e){
            console.log('getChatListByLogin:', e);
            throw new WsException(e);          
        }
    }

    async getOneElement(channelId: number, login: string): Promise<chatElement>{
        try {      
            const src = await this.getChatByChannelId(channelId);    
            const data = this.prepareOneElement(src, login);
            
            return data;
        } catch (e) {
            console.log('getOneElement Error:', e);
        }
    }

    prepareOneElement(src: any, login: string){
        let messageCount = 0;
        if (src.messages)
            messageCount = src.messages.length;
        let name = '';
        if (src.owners.length > 1) {
            if (src.owners[0].login === login)
                name = src.owners[1].pseudo;
            else
                name = src.owners[0].pseudo;
        }else
            name = 'EmptyChat';
        let otherId = -1;
        if (src.owners.length > 1) {
            if (src.owners[0].login === login)
                otherId = src.owners[1].id;
            else
                otherId = src.owners[0].id;
        }else
            otherId = src.owners[0].id;
        const data: chatElement = {
            id: src.id,
            type: src.type,
            name: src.type === 'DIRECT' ? name : src.name,
            hasPassword: src.hasPassword,
            lastMsg: src.hasPassword ? '' : (messageCount > 0 ? src.messages[0].content : ''),
            ownerLogin: src.owners.length > 0 ? src.owners[0].login : '',
            ownerId: otherId
        };
        return data;
    }

    async getChatByChannelId(channelId: number){
        try{
            const src = await this.prisma.channel.findUnique({
                where: {id: channelId},
                select: {
                    id: true,
                    type: true,
                    name: true,
                    hasPassword: true,
                    image: true,
                    owners: {
                        select: {
                            id: true,
                            login: true,
                            pseudo: true
                        }
                    },
                    messages: {
                        orderBy: {createdAt: 'asc'},
                        select: {content: true},
                        take: 1
                    }
                }
            });
            return src;
        } catch (e) {
            console.log('getChatByChannelId Error:', e);
            throw new WsException(e);
        }
    }

    async getChatByLogin(login: string)
    {
        try {
            const data = await this.prisma.user.findUnique({
                where: {
                    login: login
                },
                select: {
                    ownerIn: {
                        where: {
                            type: "DIRECT"
                        },
                        select: {
                            id: true,
                            type: true,
                            name: true,
                            hasPassword: true,
                            owners: {
                                select: {
                                    id: true,
                                    login: true,
                                    pseudo: true
                                }
                            },
                            messages: {
                                orderBy: {
                                    createdAt: 'desc'
                                },
                                select: {
                                    content: true
                                },
                                take: 1
                            }
                        }
                    },
                    adminIn: {
                        select: {
                            id: true,
                            type: true,
                            name: true,
                            hasPassword: true,
                            owners:{
                                select: {
                                    id: true,
                                    login: true,
                                    pseudo: true
                                }
                            },
                            messages: {
                                orderBy: {
                                    createdAt: 'desc'
                                },
                                select: {
                                    content: true
                                },
                                take: 1
                            }
                        }
                    },
                    memberIn: {
                        select: {
                            id: true,
                            type: true,
                            name: true,
                            hasPassword: true,
                            owners:{
                                select: {
                                    id: true,
                                    login: true,
                                    pseudo: true
                                }
                            },
                            messages: {
                                orderBy: {
                                    createdAt: 'desc'
                                },
                                select: {
                                    content: true
                                },
                                take: 1
                            }
                        }
                    }
                }
            });
            return data;
        }catch (e){
            console.log('getChatByLogin Error:', e);
            throw new WsException(e);
        }
    }

    async newDm(data: DmDto){
        try {
            const ids: number[] = [];
            const id = await this.getIdByLogin(data.login)
            ids.push(id, data.targetId);
            const check = await this.prisma.channel.findFirst({
                where: {
                    type: 'DIRECT',
                    owners: {
                      every: {
                        id: {
                          in: [ids[0], ids[1]]
                        }
                      }
                    }
                  }
                });
            if (!check){
                
                const dm = await this.prisma.channel.create({
                    data: {
                        type: "DIRECT",
                        owners: {
                            connect: ids.map((id)=> ({id: id}))
                        }
                    }
                });
                return dm.id;
            }
            return ;
        } catch (e) {
            console.log('newDm Error:', e);
            throw new WsException(e);
        }
    }
    
    async newChannel(data: ChannelDto){
        try {
            const pw = data.password;
            const channel = await this.prisma.channel.create({
                data: {
                    name: data.name,
                    type: data.type,
                    hasPassword: data.hasPassword,
                    password: pw,
                    owners: {
                        connect: {
                            login: data.login
                        }
                    },
                    admins: {
                        connect: {
                            login: data.login
                        }
                    },
                    members: {
                        connect: data.members.map((id) => ({id: id.id}))      
                    }
                }
            });
            return channel.id;
        } catch (e) {
            console.log('newChannel Error:', e);
            throw new WsException(e);
        }
    }

    async joinChannel(data: updateChannel): Promise<number>{
        try{
            const res = await this.prisma.channel.findUnique({
                where: {
                    id:  data.cId,
                },
                select: {
                    password: true
                }
            });
            const pwMatches = res.password === data.password;
            if (pwMatches) {     
                const channel = await this.prisma.channel.update({
                    where: {
                        id: data.cId
                    },
                    data: {
                        members: {
                            connect: {
                                login: data.login
                            }
                        }
                    }
                });
                return channel.id;
            }
        } catch(e){
            console.log('joinChannel Error:', e);
            throw new WsException(e);
        }
    }

    async leaveChannel(data: updateChannel){        
        try {
            let targetId: number | Promise<number> = 0;
            if (data.tId == -1)
                targetId = await this.getIdByLogin(data.login);
            else
                targetId = data.tId;
            await this.prisma.channel.update({
                where : {
                    id: data.cId
                },
                data: {
                    owners: {
                        disconnect: {
                            id: targetId
                        }
                    },
                    admins: {
                        disconnect: {
                            id: targetId
                        }
                    },
                    members: {
                        disconnect: {
                            id: targetId
                        }
                    }
                }
            });
            const channel = await this.getChatByChannelId(data.cId);
            if (channel.owners.length === 0){
                await this.prisma.message.deleteMany({
                    where: {
                        channelId:  data.cId
                    }
                });
                await this.prisma.channelMute.deleteMany({
                    where: {
                        ChannelId: data.cId
                    }
                })
                await this.prisma.user.update({
                    where: {
                        login : data.login
                    },
                    data: {
                        ownerIn: {
                            disconnect: {
                                id: data.cId
                            }
                        },
                        adminIn: {
                            disconnect: {
                                id: data.cId
                            }
                        },
                    }
                });
                const deleted = await this.prisma.channel.delete({
                    where: {
                        id: data.cId
                    }
                });
                return deleted;
            }
        }catch(e){
            console.log('leaveChannel Error:', e);
            throw new WsException(e);
        }
    }

    async blockChannel(data: updateChannel){
        try {   
                await this.prisma.channel.update({
                    where: {
                        id: data.cId
                    },
                    data: {
                        banned: {
                            connect: {
                                login: data.login
                            }
                        }
                    }
                })
            
        } catch (e) {
            console.log('blockChannel Error:', e);
            throw new WsException(e);
            
        }
    }

    async getDmTarget(data: updateChannel){
        try {
            const target = await this.prisma.channel.findUnique({
                where: {
                    id: data.cId
                },
                select: {
                    owners: {
                        where: {
                            NOT: {
                                login: data.login
                            }
                        },
                        select: {
                            id: true
                        }
                    }
                }
            });
            return target.owners[0].id;
        } catch (e) {
            console.log('getDmTarget Error:', e);
            throw new WsException(e);
        }
    }

    async fetchMsgs(cId: number) : Promise<msg[]>{
        try {
            const src = await this.getAllMsgs(cId);
            const data = await this.prepareMsgs(src);
            return data;
        } catch (e) {
            console.log('fetchMsgs Error:', e);
            
        }
    }

    async getAllMsgs(cId: number) {
        try {
            const src = this.prisma.channel.findUnique({
                where: {
                    id: cId
                },
                select : {
                    messages: {
                        orderBy: {
                            createdAt: 'asc'
                        },
                        select: {
                            id: true,
                            content: true,
                            createdAt: true,
                            owner: {
                                select: {
                                    id: true,
                                    login: true,
                                    pseudo: true
                                }
                            }
                        }
                    }
                }
            });
            return src;
        } catch (e) {
            console.log('getAllMsgs error:', e);
            throw new WsException(e);            
        }
    }

    async prepareMsgs(src: any): Promise<msg[]> {
        try {
            const data = [];
            if (src.messages)
                for (let i = 0; i < src.messages.length; i++){
                    const element : msg = {
                        msgId: src.messages[i].id,
                        oId: src.messages[i].owner.id,
                        cId: src.messages[i].channelId,
                        login: src.messages[i].owner.login,
                        pseudo: src.messages[i].owner.pseudo,
                        content: src.messages[i].content,
                        createdAt: src.messages[i].createdAt
                    };
                    data.push(element);
                }
            return data;
        } catch (e) {
            console.log('prepareMsgs Error:', e);
            throw new WsException(e);
        }
    }

    async newMsg(data: MessageDto){
        try {
            const id = await this.getIdByLogin(data.login);
            const isMuted = await this.checkIsMuted(data.login, data.channelId); 
            const allInsiders = await this.getAllInsiders(data.channelId);
            const isInsider = allInsiders.find((insider) => {
                return insider.id === id;
            });
            if (isMuted || !isInsider) return;
            const message = await this.prisma.message.create({
                data: {
                    content: data.content,
                    ownerId: id,
                    channelId: data.channelId
                }
            });
            const src =  await this.getOneNewMsg(message.id);
            const Msg = this.prepareMsg(src);
            return Msg;
        }catch (e){
            console.log('newMsg Error:', e);
            throw new WsException(e);
        }

    }

    async newMute(data: mute){
        try{
            const id = await this.getIdByLogin(data.login);
            await this.prisma.channelMute.create({
                data: {
                    finishAt: moment.utc(new Date()).add(data.duration, 'minute').toISOString(),
                    userId: id,
                    ChannelId: data.cId
                }
            });
        }catch(e){
            console.log('newMute Error:', e);
            throw new WsException(e);
        }
    }

    async checkIsMuted(login: string, channelId: number){
        try {
            const id = await this.getIdByLogin(login);
            await this.updateMuteAt(id, channelId);
            const mutedRecord = await this.getMutedRecord(id, channelId);
            if (mutedRecord.length > 0){
                const isMuted = mutedRecord.find(async (record) => {
                    if (record.muteAt > record.finishAt)
                        await this.updateMute(record.id);
                    return record.finishAt > record.muteAt;
                });  
                return isMuted;
            }
        }catch (e) {
            console.log('checkIsMuted Error:', e);
            throw new WsException(e);
        }
    }

    async updateMuteAt(id: number, channelId: number)
    {
        try {
            await this.prisma.channelMute.updateMany({
                where: {
                    AND: [
                        {userId: id},
                        {ChannelId: channelId},
                        {finished: false},
                    ]
                },
                data: {
                    muteAt: new Date()
                }
            });
        }catch (e){
            console.log('updateMuteAt Error:', e);
            throw new WsException(e);     
        }
    }

    async getMutedRecord(id: number, channelId: number) {
        try {
            const mutedRecord = await this.prisma.channelMute.findMany({
                where: {
                    AND: [
                        {userId: id},
                        {ChannelId: channelId},
                        {finished: false}
                    ]
                }
            });
            return mutedRecord;
        } catch (e) {
            console.log('getMutedRecord Error:', e);
            throw new WsException(e);      
        }
    }

    async updateMute(id: number){
        try {
            await this.prisma.channelMute.update({
                where: {
                    id: id
                },
                data : {
                    finished: true
                }
            });
        }
        catch (e) {
            console.log('updateMute Error: ', e);
            throw new WsException(e);
        }
    }

    async getAllInsiders(channelId: number){
        try {
            const src = await this.prisma.channel.findUnique({
                where : {
                    id: channelId
                },
                select: {
                    owners: {
                        select:{
                            id: true,
                            pseudo: true
                        }
                    },
                    admins: {
                        select:{
                            id: true,
                            pseudo: true
                        }
                    },
                    members: {
                        select:{
                            id: true,
                            pseudo: true
                        }
                    }
                }
            });
            const insiders = this.prepareAllInsiders(src);
            return insiders;
        }
        catch (e) {
            console.log('getAllInsiders Error:', e);
            throw new WsException(e);
        }
    }

    async prepareAllInsiders(src: any){
        const insiders = [];
        if (src.owners) {
            for (let i = 0; i < src.owners.length; i++){
                const insider = {
                    id: src.owners[i].id,
                    name: src.owners[i].name
                };
                insiders.push(insider);
            }
        }
        if (src.admins) {
            for (let i = 0; i < src.admins.length; i++){
                const insider = {
                    id: src.admins[i].id,
                    name: src.admins[i].name
                };
                insiders.push(insider);
            }
        }
        if (src.members) {
            for (let i = 0; i < src.members.length; i++){
                const insider = {
                    id: src.members[i].id,
                    name: src.members[i].name
                };
                insiders.push(insider);
            }
        }
        return insiders;
    }

    async getOneNewMsg(msgId: number){
        try {
            const message = await this.prisma.message.findUnique({
                where: {
                    id: msgId
                },
                select: {
                    id: true,
                    channelId: true,
                    content: true,
                    createdAt: true,
                    owner: {
                        select: {
                            id: true,
                            login: true,
                            pseudo: true
                        }
                    }
                }
            });
            return message;
        } catch (e) {
            console.log('getOneNewMsg error: ', e);
            throw new WsException(e);
        }
    }
    
    async prepareMsg(src: any): Promise<msg>{
        try {
            if (src){
                const element: msg = {
                    msgId: src.id,
                    oId: src.owner.id,
                    cId: src.channelId,
                    login: src.owner.login,
                    pseudo: src.owner.pseudo,
                    content: src.content,
                    createdAt: src.createdAt,
                };
                return element;
            }
        } catch (e) {
            console.log('prepareMsg Error:', e);
            throw new WsException(e);
        }
    }

    async fetchOwners(id: number, channelId: number){
        try {
            const src = await this.prisma.channel.findUnique({
                where: {
                    id : channelId
                },
                select: {
                    owners: true
                }
            });
            const owners = await this.prepareOwners(id, src);
            return owners;
        } catch (e) {
            console.log('fetchOwners Error:', e);
            throw new WsException(e);        
        }
    }

    async prepareOwners(id: number, src: any){
        const owners = [];
        if (src && src.owners)
            for (let i = 0; i < src.owners.length; i++){
                let friendship = false;
                if (id != src.owners[i].id)
                    friendship = await this.userService.isFriend(id, src.owners[i].id);
               
                const owner : user = {
                    id:         src.owners[i].id,
                    login:      src.owners[i].login,
                    pseudo:     src.owners[i].pseudo,
                    online:     false,
                    isBanned:   false,
                    isOwner:    true,
                    isAdmin:    false,
                    isMuted:    false,
                    isFriend:   friendship
                };
                owners.push(owner);   
            }
        return owners;    
    }

    async fetchAdmins(id: number, channelId: number){
        try {
            const src = await this.prisma.channel.findUnique({
                where: {
                    id : channelId
                },
                select: {
                    admins: true
                }
            });
            const admins = await this.prepareAdmins(id, src, channelId);
            
            return admins;
        } catch (e) {
            console.log('fetchAdmins Error:', e);
            throw new WsException(e);        
        }
    }

    async prepareAdmins(id: number, src: any, cId: number){
        const admins = [];     
        if (src && src.admins)
            for (let i = 0; i < src.admins.length; i++){
                let friendship = false;
                if (id != src.admins[i].id)
                    friendship = await this.userService.isFriend(id, src.admins[i].id);
                let isMuted = true;
                let muted = await this.checkIsMuted(src.admins[i].login ,cId)
                if (muted)
                    isMuted = muted.finished;
                const admin : user = {
                    id:         src.admins[i].id,
                    login:      src.admins[i].login,
                    pseudo:     src.admins[i].pseudo,
                    isBanned:   false,
                    online:     false,
                    isOwner:    false,
                    isAdmin:    true,
                    isMuted:    isMuted,
                    isFriend:   friendship
                };
                admins.push(admin);   
            }
        return admins;    
    }

    async fetchMembers(id: number, channelId: number){
        try {
            const src = await this.prisma.channel.findUnique({
                where: {
                    id : channelId
                },
                select: {
                    members: true
                }
            });
            const members = await this.prepareMembers(id, src, channelId);
            return members;
        } catch (e) {
            console.log('fetchMembers Error:', e);
            throw new WsException(e);        
        }
    }

    async prepareMembers(id: number, src: any, cId: number){
        const members = [];
        if (src && src.members)
            for (let i = 0; i < src.members.length; i++){
                let friendship = false;
                if (id != src.members[i].id)
                    friendship = await this.userService.isFriend(id, src.members[i].id);
                let isMuted = true;
                let muted = await this.checkIsMuted(src.members[i].login ,cId)
                if (muted)
                    isMuted = muted.finished
                const member : user = {
                    id:         src.members[i].id,
                    login:      src.members[i].login,
                    pseudo:     src.members[i].pseudo,
                    online:     false,
                    isBanned:   false,
                    isOwner:    false,
                    isAdmin:    false,
                    isMuted:    isMuted,
                    isFriend:   friendship
                };
                members.push(member);   
            }
        return members;    
    }
    async fetchBanned(id: number, channelId: number){
        try {
            const src = await this.prisma.channel.findUnique({
                where: {
                    id : channelId
                },
                select: {
                    banned: true
                }
            });
            const banned = await this.prepareBanned(id, src, channelId);
            return banned;
        } catch (e) {
            console.log('fetchMembers Error:', e);
            throw new WsException(e);        
        }
    }

    async prepareBanned(id: number, src: any, cId: number){
        const bans = [];
        if (src && src.banned)
            for (let i = 0; i < src.banned.length; i++){
                let friendship = false;
                if (id != src.banned[i].id)
                    friendship = await this.userService.isFriend(id, src.banned[i].id);
                const banned : user = {
                    id:         src.banned[i].id,
                    login:      src.banned[i].login,
                    pseudo:     src.banned[i].pseudo,
                    online:     false,
                    isBanned:   true,
                    isOwner:    false,
                    isAdmin:    false,
                    isMuted:    false,
                    isFriend:   friendship
                };
                bans.push(banned);   
            }
        return bans;    
    }

    async getAllUsers() {
        try {
            const users = await this.prisma.user.findMany({
                select : {
                    id: true,
                    pseudo: true,
                    avatar: true
                }
            });
            return users;
        } catch (e) {
            console.log('getAllUsers Error:', e);
            throw new WsException(e);      
        }
    }


    async getBannedUsers(cId: number)
    {
        try {
            const bannedUsers = await this.prisma.channel.findUnique({
                where: {
                    id: cId
                },
                select: {
                    banned: {
                        select: {
                            id: true,
                        } 
                    }
                }
            });
            return bannedUsers
        } catch (e){
            console.log('getAllBanned Error:', e);
            throw new WsException(e);         
        }
    }

    async isBanned(login: string , cId: number)
    {
        try {

            const userId = await this.getIdByLogin(login)
            const banned = await this.getBannedUsers(cId);
            let isBanned = null;
            if (banned.banned.length > 0)
            isBanned = banned.banned.map((value) => { value.id === userId})
        return isBanned;
        }catch(e) {
            console.log('isBanned Error:', e);
            throw new WsException(e);      
        }
    }
    async getUserTags(login: string)
    {
        try {

            // looks like too extended code
            // const id = await this.getIdByLogin(login);
            // const users = await this.getAllUsers();
            // const tags = this.prepareTags(users, id);
            const tags = await this.prisma.user.findMany({
                where: {
                    NOT: {
                        login: login
                    }
                },
                select: {
                    id: true,
                    pseudo: true
                }
            });
            return tags
        } catch (e) {
            console.log('getUserTags Error:', e);
            throw new WsException(e);       
        }
    }

    async getPublicChats() {
        try {
            const rooms = await this.prisma.channel.findMany({
                where: {
                    OR  : [
                        {type: "PUBLIC"},
                        {type: "PROTECTED"}
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                }
            });
            return rooms;
        } catch (e){
            console.log('getPublicChats Error:', e);
            throw new WsException(e);
        }
    }

    async searchSuggestion(login: string){
        try {
            const id = await this.getIdByLogin(login); 
                       
            const users = await this.getAllUsers();    
            const publicChats = await this.getPublicChats();       
            const chats = await this.getElements(login);        
            const suggestion = await this.prepareSearch(id, users, publicChats, chats)      
            return suggestion;
            
        } catch (e) {
            console.log('getPublicChats Error:', e);
            throw new WsException(e);
        }
    }


    async prepareSearch(id: number , users: any , publicChats: any, chats: any){
        try {
            const suggestion = [];
            let chatLength = 0;
            let usersLength = 0;   
            if (chats) {
                chatLength = chats.length;
                for (const [i, chat] of chats.entries()){
                    const one: suggestion = {
                        id:         i,
                        dataId:     chat.id,
                        name:       chat.name,
                        category:   'my chat',
                        image:      chat.avatar
                    };
                    suggestion.push(one);
                }
            }     
            if (users) {
                const fUsers = users.filter((user) => {
                    return (suggestion.filter((s: suggestion) => {       
                        return s.name == user.pseudo;
                    }).length === 0 && user.id != id);
                });
                usersLength = fUsers.length;
                for (const [i, element] of fUsers.entries()){
                    const one: suggestion = {
                        id:         chatLength + i,
                        dataId:     element.id,
                        name:       element.pseudo,
                        category:   'user',
                        image:      element.avatar
                    };
                    suggestion.push(one);
                }
            }
            if (publicChats) {
                const fPublicChat = publicChats.filter((chat)=> {
                    return (suggestion.filter((s: suggestion) => {
                        return s.dataId == chat.id;
                    }).length === 0);
                });
                for (const [i, element] of  fPublicChat.entries()) {
                    const one: suggestion = {
                        id:         usersLength + chatLength + i,
                        dataId:     element.id,
                        name:       element.name,
                        category:   'public chat',
                        image:      element.avatar
                    };
                    suggestion.push(one);
                }
            }
            return suggestion;
        } catch (e) {
            console.log('prepareSearch Error:', e);
            throw new WsException(e);
        }
    }

    async admin(data: updateChannel){
        try {
            await this.prisma.channel.update({
                where: {
                    id: data.cId
                },
                data: {
                    admins: {
                        connect: {
                            id: data.tId
                        }
                    },
                    members: {
                        disconnect: {
                            id: data.tId
                        }
                    }
                }
            });
        } catch (e) {
            console.log('admin Error:', e);
            throw new WsException(e);
        }
    }

    async notAdmin(data: updateChannel){
        try {
            await this.prisma.channel.update({
                where: {
                    id: data.cId
                },
                data: {
                    admins: {
                        disconnect: {
                            id: data.tId
                        }
                    },
                    members: {
                        connect: {
                            id: data.tId
                        }
                    }
                }
            });
        } catch (e) {
            console.log('notAdmin Error:', e);
            throw new WsException(e);
        }
    }

    async ban(data: updateChannel){
        try {
            await this.prisma.channel.update({
                where: {
                    id: data.cId
                },
                data: {
                    banned: {
                        connect: {
                            id: data.tId
                        }
                    },
                    members: {
                        disconnect: {
                            id: data.tId
                        }
                    },
                    admins: {
                        disconnect:{
                            id: data.tId
                        }
                    }
                }
            });
        } catch (e) {
            console.log('ban Error:', e);
            throw new WsException(e);
        }
    }

    async unBan(data: updateChannel){
        try {
            await this.prisma.channel.update({
                where: {
                    id: data.cId
                },
                data: {
                    banned: {
                        disconnect: {
                            id: data.tId
                        }
                    }
                }
            });
        } catch (e) {
            console.log('notAdmin Error:', e);
            throw new WsException(e);
        }
    }

    async getChannelSettings(cId: number){
        try {
            const data = await this.prisma.channel.findUnique({
                where: {
                    id: cId
                },
                select: {
                    type: true,
                    hasPassword: true
                }
            });
            return data;
        } catch (e) {
            console.log('getChannelSettings Error:', e);
            throw new WsException(e);
        }
    }

    async verifyHash(ownerHash: string, cId: number){
        const ownerPass = await this.prisma.channel.findUnique({
            where: {
                id: cId
            },
            select: {
                owners: {
                    select: {
                        refreshToken: true
                    }
                }
            }
        });
        return await argon.verify(ownerPass[0].refreshToken, ownerHash);
    }

   

    async updateChannelSettings(data: updateChannel){
        try {
            await this.prisma.channel.update({
                where: {
                    id: data.cId
                },
                data: {
                    type: data.type,
                    hasPassword: data.hasPassword
                }
            });
            await this.prisma.channel.update({
                where:{
                    id: data.cId
                },
                data:{
                    password:data.newPassword
                }
            })
        } catch(e) {
            console.log('updateChannelSettings Error:', e);
            throw new WsException(e);
        }
    }

    async updateAvatar(id: number, newAvatar: string){
        const update = await this.prisma.channel.update({
            where: {
                id: id
            },
            data: {
                image: newAvatar
            }
        })
        return update;
    }
}
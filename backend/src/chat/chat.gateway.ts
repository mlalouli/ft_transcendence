import { Inject, UseFilters, UsePipes, ValidationPipe, forwardRef } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UserService } from "src/user/user.service";
import { ChatService } from "./chat.service";
import { ProperWsFilter, httpToWsFilter } from "./filter/transform.filter";
import { ChannelDto, DmDto, MessageDto } from "./dto/chat.dto";
import { updateChannel, user, msg, mute, updateUser } from "./type/chat.type";



@UsePipes(new ValidationPipe())
@UseFilters(new httpToWsFilter())
@UseFilters(new ProperWsFilter())
@WebSocketGateway()
export class ChatGateway {

    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService,
                @Inject(forwardRef(() => UserService))
                private userService: UserService){}
    
    async handleJoinSocket(id: number, @ConnectedSocket() client: Socket){
        const channels = await this.chatService.getUserChannels(id);
        await client.join('default_all');
        if (channels)
            for (const channel of channels) {
                await client.join(channel);
            }
    }

    @SubscribeMessage('read preview')
    async handleReadPreview(@MessageBody() login: string){
        const data = await this.chatService.getElements(login);
        return data;
    }

    @SubscribeMessage('add preview')
    async handleChatSearch(@MessageBody() data: any, @ConnectedSocket() client: Socket){
        const preview = await this.chatService.getOneElement(data.cId, data.login);
        await client.join(preview.name);
        client.emit('add preview', preview);
    }
    
    @SubscribeMessage('read blocked')
    async handleReadBlocked(@MessageBody() login: string, @ConnectedSocket() client: Socket){
        const data = await this.userService.getBlocked(client.data.id);        
        client.emit('fetch blocked', data);
    }
    
    @SubscribeMessage('new dm')
    async newDm(@MessageBody() data: DmDto, @ConnectedSocket() client: Socket){
        const cId = await this.chatService.newDm(data);
        if(cId){

            const preview = await this.chatService.getOneElement(cId, data.login);
            const cName = await this.chatService.getChannelById(cId);
            await client.join(cName);
            client.emit('add preview', preview);
            return cId;
            
        }
    }

    @SubscribeMessage('new channel')
    async handleNewChannel(@MessageBody() data: ChannelDto, @ConnectedSocket() client: Socket){
        const channelId = await this.chatService.newChannel(data);
        
        if (channelId == undefined)
        client.emit('exception', 'failed to create the channel, try again later !');
    else {
        const preview = await this.chatService.getOneElement(channelId, data.login); 
            await client.join(preview.name);
            client.emit('add preview', preview);
            this.updateChannelRequest('update channel request', 'default_all' );
            data.id = channelId;    
            return data;
        }
    }

    @SubscribeMessage('join channel')
    async joinChannel(@MessageBody() data: updateChannel, @ConnectedSocket() client: Socket){    
        const isBanned = await this.chatService.isBanned(data.login, data.cId);
        if (isBanned){
            client.emit('exception', 'This User is Banned!');
            return;
        }
        const channelId = await this.chatService.joinChannel(data);
        if (channelId === undefined)
            client.emit('exception', 'Wrong Password !');
        else {
            const channelName = await this.chatService.getChannelById(data.cId);
            await client.join(channelName);
            const id = await this.chatService.getIdByLogin(data.login);
            const preview = await this.chatService.getElements(data.login);
            client.emit('update preview', preview);
            const members = await this.chatService.fetchMembers(id, data.cId);
            client.emit('fetch members', members);
            const role = await this.getRole(data.login, [], [], members);
            client.emit('fetch role', role);
            this.updateChannelRequest('update channel request', channelName);
        }
    }
    
    @SubscribeMessage('block channel')
    async blockChannel(@MessageBody() data: updateChannel, @ConnectedSocket() client: Socket){
        const cName = await this.chatService.getChannelById(data.cId);
        await this.chatService.blockChannel(data);
        const preview = await this.chatService.getElements(data.login);
        client.emit('update preview', preview);
        const users = await this.chatService.searchSuggestion(data.login);
        client.emit('search suggestion', users);
        client.emit('fetch owner', []);
        client.emit('fetch admins', []);
        client.emit('fetch members', []);
        this.updateChannelRequest('update channel request', cName);
    }

    @SubscribeMessage('leave channel')
    async handleDeleteChannel(@MessageBody() data:updateChannel, @ConnectedSocket() client: Socket){
        const cName = await this.chatService.getChannelById(data.cId);
        await this.chatService.leaveChannel(data);
        const preview = await this.chatService.getElements(data.login);
        client.emit('update preview', preview);
        const users = await this.chatService.searchSuggestion(data.login);
        client.emit('search suggestion', users);
        client.emit('fetch owner', []);
        client.emit('fetch admins', []);
        client.emit('fetch members', []);
        client.emit('fetch banned', []);
        this.updateChannelRequest('update channel request', cName);
    }

    @SubscribeMessage('kick')
    async handleKickChannel(@MessageBody() data:updateChannel, @ConnectedSocket() client: Socket){
        const cName = await this.chatService.getChannelById(data.cId);
        await this.chatService.leaveChannel(data);
        const id = await this.chatService.getIdByLogin(data.login);
        const admins = await this.chatService.fetchAdmins(id, data.cId);
        client.emit('fetch admins', admins);
        const members = await this.chatService.fetchMembers(id, data.cId);
        client.emit('fetch members', members);
        this.updateChannelRequest('update channel request', cName);
        const banned = await this.chatService.fetchBanned(id, data.cId);
        client.emit('fetch banned', banned);
    }


    @SubscribeMessage('read msgs')
    async handleFetchMsgs(@MessageBody() cId: number, @ConnectedSocket() client: Socket){
        const data = await this.chatService.fetchMsgs(cId);
        client.emit('fetch msgs', data);
    }

    @SubscribeMessage('msg')
    async handleNewMsg(@MessageBody() data: MessageDto, @ConnectedSocket() client: Socket){      
        const msg = await this.chatService.newMsg(data);
        if (msg){
            this.broadcast('broadcast', msg, data.channelId);
            const preview = await this.chatService.getElements(data.login);
            client.emit('update preview', preview);
            const cName = await this.chatService.getChannelById(data.channelId);
            this.updateChannelRequest('update channel request', cName);
        }
        else
            client.emit('exception', 'Inaccessbile Channel : Message not sent');
    }

    @SubscribeMessage('read room status')
    async handleFetchStatus(@MessageBody() data: any, @ConnectedSocket() client: Socket){
        const id = await this.chatService.getIdByLogin(data.login);
        const owners = await this.chatService.fetchOwners(id, data.cId);
        client.emit('fetch owner', owners);
        const admins = await this.chatService.fetchAdmins(id, data.cId);
        client.emit('fetch admins', admins);
        const members = await this.chatService.fetchMembers(id, data.cId);
        client.emit('fetch members', members);
        const banned = await this.chatService.fetchBanned(id, data.cId);
        client.emit('fetch banned', banned);

        const role = await this.getRole(data.login, owners, admins, members);        
        client.emit('fetch role', role);
    }

    @SubscribeMessage('get search suggest')
    async handleSuggestUsers(@MessageBody() login: string, @ConnectedSocket() client: Socket){    
        const users = await this.chatService.searchSuggestion(login);
        client.emit('search suggestion', users);
    }

    @SubscribeMessage('get user tags')
    async handleUserTags(@MessageBody() login: string, @ConnectedSocket() client: Socket){
        const userTags = await this.chatService.getUserTags(login);
        client.emit('user tags', userTags);
    }

    @SubscribeMessage('be admin')
    async handleBeAdmin(@MessageBody() data: updateChannel, @ConnectedSocket() client: Socket){
        const cName = await this.chatService.getChannelById(data.cId);
        await this.chatService.admin(data);
        const id = await this.chatService.getIdByLogin(data.login);
        const admins = await this.chatService.fetchAdmins(id, data.cId);
        client.emit('fetch admins', admins);
        const members = await this.chatService.fetchMembers(id, data.cId);
        client.emit('fetch members', members);
        this.updateChannelRequest('update channel request', cName);
        const banned = await this.chatService.fetchBanned(id, data.cId);
        client.emit('fetch banned', banned);
    }

    
    @SubscribeMessage('not admin')
    async handleNotAdmin(@MessageBody() data: updateChannel, @ConnectedSocket() client: Socket){   
        const cName = await this.chatService.getChannelById(data.cId);
        await this.chatService.notAdmin(data);
        const id = await this.chatService.getIdByLogin(data.login);
        const admins = await this.chatService.fetchAdmins(id, data.cId);
        client.emit('fetch admins', admins);
        const members = await this.chatService.fetchMembers(id, data.cId);
        client.emit('fetch members', members);
        this.updateChannelRequest('update channel request', cName);
        const banned = await this.chatService.fetchBanned(id, data.cId);
        client.emit('fetch banned', banned);
    }

    @SubscribeMessage('ban')
    async handleBan(@MessageBody() data: updateChannel, @ConnectedSocket() client: Socket){
        const cName = await this.chatService.getChannelById(data.cId);
        await this.chatService.ban(data);
        await this.chatService.leaveChannel(data);
        const id = await this.chatService.getIdByLogin(data.login);
        const admins = await this.chatService.fetchAdmins(id, data.cId);
        client.emit('fetch admins', admins);
        const members = await this.chatService.fetchMembers(id, data.cId);
        client.emit('fetch members', members);
        this.updateChannelRequest('update channel request', cName);
        const banned = await this.chatService.fetchBanned(id, data.cId);
        client.emit('fetch banned', banned);
    }

    @SubscribeMessage('unBan')
    async handleUnBan(@MessageBody() data: updateChannel, @ConnectedSocket() client: Socket){   
        const cName = await this.chatService.getChannelById(data.cId);
        await this.chatService.unBan(data);
        const id = await this.chatService.getIdByLogin(data.login);
        const admins = await this.chatService.fetchAdmins(id, data.cId);
        client.emit('fetch admins', admins);
        const members = await this.chatService.fetchMembers(id, data.cId);
        client.emit('fetch members', members);
        this.updateChannelRequest('update channel request', cName);
        const banned = await this.chatService.fetchBanned(id, data.cId);
        client.emit('fetch banned', banned);
    }

    @SubscribeMessage('get setting')
    async handleGetSetting(@MessageBody() cId: number, @ConnectedSocket() client: Socket){
        const info = await this.chatService.getChannelSettings(cId);
        client.emit('setting info', info);
    }

    @SubscribeMessage('update setting')
    async handleUpdateSetting(@MessageBody() data: updateChannel, @ConnectedSocket() client: Socket){
        const cName = await this.chatService.getChannelById(data.cId);
        await this.chatService.updateChannelSettings(data);
        this.updateChannelRequest('update channel request', cName);
    }

    async broadcast(event: string, msg: msg, cId : number){
        const cName = await this.chatService.getChannelById(cId);
        this.server.in(cName).emit(event, msg);
    }

    @SubscribeMessage('mute user')
    async handleMuteUser(@MessageBody() data: mute, @ConnectedSocket() client: Socket){ 
        await this.chatService.newMute(data);
        client.emit('update channel request');
    }

    @SubscribeMessage('add friend')
    async addFriend(@MessageBody() data: updateUser, @ConnectedSocket() client: Socket){
        const id = await this.chatService.getIdByLogin(data.login);
        await this.userService.addFriend(id, data.otherId);
        client.emit('update channel request');
    }

    @SubscribeMessage('block user')
    async blockUser(@MessageBody() data: updateUser, @ConnectedSocket() client: Socket){
        
        const id = await this.chatService.getIdByLogin(data.login);
        await this.userService.blockUser(id, data.otherId);
        client.emit('update channel request');
    }

    @SubscribeMessage('unblock user')
    async unblockUser(@MessageBody() data: updateUser, @ConnectedSocket() client: Socket){
        const id = await this.chatService.getIdByLogin(data.login);
        await this.userService.unblockUser(id, data.otherId);
        client.emit('update channel request');
    }

    async getRole(login: string, owners: user[], admins: user[], members: user[]){
        let role = 'noRole';
        if (members && members.length > 0){
            const isMember : number = members.filter((member) => {
                return member.login === login;
            }).length;
            if (isMember > 0)
                role = 'member';
        }

        if (admins && admins.length > 0){
            const isAdmin : number = admins.filter((admin) => {
                return admin.login === login;
            }).length;
            if (isAdmin > 0)
                role = 'admin';
        }

        if (owners && owners.length > 0){
            const isOwner : number = owners.filter((owner) => {
                return owner.login === login;
            }).length;
            if (isOwner > 0)
                role = 'owner';
        }
        return role;
    }
    
    async updateChannelRequest(event: string, cName: string){
        this.server.in(cName).emit(event)
    }
}
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, WsException, BaseWsExceptionFilter, SubscribeMessage, MessageBody} from '@nestjs/websockets';
import { UserService } from './user/user.service';
import { Server , Socket} from 'socket.io';
import { Status } from './user/dto/status';
import { ArgumentsHost, Catch, Inject, forwardRef } from '@nestjs/common';
import { GameService } from './game/game.service';
import { ChannelDto } from './chat/dto/chat.dto';
import { fetchDm, gameInvitation, updateChannel } from './chat/type/chat.type';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { GameGateway } from './game/game.gateway';


@WebSocketGateway({cors:{origin: process.env.FRONTEND_URL}})

export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect{
    constructor(
        private readonly jwtService: JwtService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly chatGateway: ChatGateway,
        private readonly chatService: ChatService,
    ){}
    @WebSocketServer()
    server: Server;

    UserStatus = new Map<number, Status>();
    clientSocket = new Map<number, Socket>();

    onlineFromService(id: number){
        this.UserStatus.set(id, Status.online);
        const serializedMap = [...this.UserStatus.entries()];
        this.server.emit('update-status', serializedMap);        
    }

    offlineFromService(id: number){
        this.UserStatus.set(id, Status.offline);
        const serializedMap = [...this.UserStatus.entries()];
        this.server.emit('update-status', serializedMap);
    }


    inGameFromService(id: number){
        this.UserStatus.set(id, Status.inGame);
        const serializedMap = [...this.UserStatus.entries()];
        this.server.emit('update-status', serializedMap);
    }

    async handleConnection(client: Socket, ...args: any[]) {
        try {
            
            client.setMaxListeners(20);            
            const userId: number = this.jwtService.verify(String(client.handshake.headers.token), {secret: process.env.JWT_SECRET}).sub;
            const user = this.userService.getUser(userId);
            client.data.id = userId;
            if (!user)
                throw new WsException('Invalid Token');
            this.UserStatus.set(client.data.id, Status.online);
            const serializedMap = [...this.UserStatus.entries()];
            this.server.emit('update-status', serializedMap);
            this.clientSocket.set(userId, client);
            await this.chatGateway.handleJoinSocket(userId, client);  
        }
        catch(e){
            return false;
        }
    }

    async handleDisconnect(client: Socket) {
        if (client.data.id !== undefined){
            this.UserStatus.set(client.data.id, Status.offline);
            const serializedMap = [...this.UserStatus.entries()];
            client.emit('update-status', serializedMap);
            this.clientSocket.delete(client.data.id);
        }

        if (GameService.rooms.some((room) => room.player1 === client)){
            if (!GameService.rooms.find((room) => room.player1 === client).player2)
                GameService.rooms.splice(GameService.rooms.findIndex((room) => room.player1 === client), 1);
            else
                GameService.rooms.find((room) => room.player1 === client).player1Dc = true;
        }
        if (GameService.rooms.some((room) => room.player2 === client))
            GameService.rooms.find((room) => room.player2 === client).player2Dc = true;
        client.removeAllListeners();
    }


    @SubscribeMessage('fetch new channel')
    async newChannelFetch(@MessageBody() data: ChannelDto) {
        data.members.map(async(member) => {
            const client = await this.getClientSocket(member.id);
            await client.join(data.name);
            client.emit('update channel request');
        })
    }

    @SubscribeMessage('fetch new Dm')
    async newDmFetch(@MessageBody() data: fetchDm){
        
        const cName = await this.chatService.getChannelById(data.cId);
        const client = await this.getClientSocket(data.tId);
        if (this.UserStatus.get(data.tId) === Status.online){
            await client.join(cName);
            client.emit('update channel request');
        }
    }

    @SubscribeMessage('fetch new invite')
    async newInviteFetch(@MessageBody() data: updateChannel){
        const client = await this.getClientSocket(data.tId);
        const cName = await this.chatService.getChannelById(data.cId);
        await client.join(cName);
        client.emit('update channel request');
    }

    @SubscribeMessage('send invitation')
    async gameInvitation(@MessageBody() data: gameInvitation){ 
        const client = await this.getClientSocket(data.tId);   
        if (client){
            this.inGameFromService(data.tId);
            client.emit('gameInvitation', data);
        }
    }

    @SubscribeMessage('decline game')
    async gameDecline(@MessageBody() game: gameInvitation){
        const client = await this.getClientSocket(game.senderId);
        if (client){
            const target = await this.userService.getUser(game.tId);
            client.emit('rejected', target.login);
            this.onlineFromService(game.tId);
        }
    }

    async getClientSocket(id: number){
        if (this.clientSocket.has(id)){
            const socket = this.clientSocket.get(id);
            return socket;
        }
    }
}

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
    catch(exception : unknown, host: ArgumentsHost){
        super.catch(exception, host);
    }
}
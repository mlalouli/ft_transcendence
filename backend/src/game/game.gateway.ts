import {
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { UserService } from 'src/user/user.service';
import { AppGateway } from 'src/app.gateway';
import { Server } from 'socket.io';
import { Client } from './interfaces/client.interface';
import { CanvasSize, Player } from './interfaces/player.interface';
import { Room } from './interfaces/room.interface';
import { User } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
  },
})
export class GameGateway {
  constructor(
    private gameService: GameService,
    private userService: UserService,
    private appGateway: AppGateway,
    ) 
  {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('start')
  async handleStart(client: Client): Promise<Player> { 

    const user = await this.userService.getUser(client.data.id);
    if (
      GameService.rooms.some(
        (room) => room.player1.data.id === client.data.id,
        ) ||
        GameService.rooms.some((room) => {
          room.player2 && room.player2.data.id === client.data.id;
        })
        ) {
          
          console.log('No sorry !');
          return {
            
            playerNb: 3,
            roomId: 0,
          };
        }         
        const player: Player = {
          playerNb: 0,
          roomId: 0,
        };
        
        if (
          GameService.rooms.length === 0 ||
          GameService.rooms[GameService.rooms.length - 1].player2 ||
          GameService.rooms[GameService.rooms.length - 1].private
          ) {
      const newId = await this.gameService.genNewId();
      
      const newRoom: Room = {
        id: newId,
        name: newId.toString(),
        player1: client,
        player1Name: await this.userService
          .getUser(client.data.id)
          .then((value: User) => value.pseudo),
        player1Avatar: await this.userService
          .getUser(client.data.id)
          .then((value: User) => value.avatar),
        leftPaddleY: 0.425,
        rightPaddleY: 0.425,
        paddleLeftDir: 0,
        paddleRightDir: 0,
        player1score: 0,
        player2score: 0,
        private: false,
        animationLoopStatus: false
      };
      GameService.rooms.push(newRoom);
      client.join(GameService.rooms[GameService.rooms.length - 1].name);
      player.playerNb = 1;      
      console.log(client.data.id);
    } else {
      console.log('**************************ELSE*******************************');     
      GameService.rooms[GameService.rooms.length - 1].player2 = client;
      GameService.rooms[GameService.rooms.length - 1].player2Name =
        await this.userService
          .getUser(client.data.id)
          .then((value: User) => value.pseudo);
      GameService.rooms[GameService.rooms.length - 1].player2Avatar =
        await this.userService
          .getUser(client.data.id)
          .then((value: User) => value.avatar);
      client.join(GameService.rooms[GameService.rooms.length - 1].name);
      this.server.to(GameService.rooms[GameService.rooms.length - 1].name).emit('gameStarted', )
      this.gameService.startGame(
        GameService.rooms[GameService.rooms.length - 1].id,
        this.server
        );
        player.playerNb = 2;
        const player1Id = GameService.rooms[GameService.rooms.length - 1].player1.data.id;
        this.appGateway.inGameFromService(user.id);
        this.appGateway.inGameFromService(player1Id)
      }
      player.roomId = GameService.rooms[GameService.rooms.length - 1].id;
     
    return player;
  }

  // receive paddle direction  from the clients

  @SubscribeMessage('move')
  handleMove(client,  @MessageBody('player')player: Player, @MessageBody('value') value: number): any {              
    this.gameService.updateRoom(player.playerNb, player.roomId, value);
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody('roomId') roomId: number,
    @ConnectedSocket() client: Client,
  ): boolean {
    if (this.server.sockets.adapter.rooms.has(String(roomId))) {
      client.join(String(roomId));
      return true;
    }
    return false;
  }

  @SubscribeMessage('unjoin')
  async handleUnjoin(@MessageBody('roomId') rId: number,
                     @ConnectedSocket() client: Client): Promise<boolean>{
      if (this.server.sockets.adapter.rooms.has(String(rId))){
        await client.leave(String(rId));
        //clinet.disconnect();
        return true;
      }else
        return false;
  }

  @SubscribeMessage('leave')
  async handleLeave(
    @MessageBody('roomId') roomId: number,
    @ConnectedSocket() client: Client,
  ): Promise<boolean> {
    if (this.server.sockets.adapter.rooms.has(String(roomId))) {
      await client.leave(String(roomId));
      return true;
    }
    return false;
  }

  @SubscribeMessage('startPrivate')
  async handleStartPrivate(@ConnectedSocket() client: Client) {
    const newId = await this.gameService.genNewId();
    console.log('start private id:', client.data.id);
    const newRoom: Room = {
      id: newId,
      name: newId.toString(),
      player1: client,
      player1Name: await this.userService
        .getUser(client.data.id)
        .then((value: User) => value.pseudo),
      player1Avatar: await this.userService
        .getUser(client.data.id)
        .then((value: User) => value.avatar),
      leftPaddleY: 0.425,
      rightPaddleY: 0.425,
      paddleLeftDir: 0,
      paddleRightDir: 0,
      player1score: 0,
      player2score: 0,
      private: true,
      animationLoopStatus: false
    };
    GameService.rooms.push(newRoom);
    await client.join(GameService.rooms[GameService.rooms.length - 1].name);
    const player: Player = {
      playerNb: 1,
      roomId: GameService.rooms[GameService.rooms.length - 1].id,
    };
    this.appGateway.inGameFromService(client.data.id);
    console.log('===>', {player});
    console.log('roomsNb ====>',GameService.rooms.length);
    
    return player;
  }

  @SubscribeMessage('joinPrivate')
  async handleJoinPrivate(
    @MessageBody('roomId') rId: number,
    @ConnectedSocket() client: Client,
  ): Promise<Player | boolean> { 
    console.log('join private id:', client.data.id);
    if (this.server.sockets.adapter.rooms.has(String(rId))) {
      const player: Player = {
        playerNb: 0,
        roomId: 0,
      };
      if (GameService.rooms.find((room) => room.id === rId).player2)
        return false;
      GameService.rooms.find((room) => room.id === rId).player2 = client;
      GameService.rooms.find((room) => room.id === rId).player2Name =
        await this.userService
          .getUser(client.data.id)
          .then((value: User) => value.pseudo);
      GameService.rooms.find((room) => room.id === rId).player2Avatar =
        await this.userService
          .getUser(client.data.id)
          .then((value: User) => value.avatar);
      client.join(GameService.rooms.find((room) => room.id === rId).name);
      this.server.to(GameService.rooms.find((room) => room.id === rId).name).emit('gameStarted');
      this.gameService.startGame(rId, this.server);   
      player.playerNb = 2;
      player.roomId = rId;
      console.log('===>', {player});
      return player;
    }else
      return false;
  }



}



import { ForbiddenException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/user/user.service";
import { Room } from "./interfaces/room.interface";
import { Server } from "socket.io";
import { GameData } from "./interfaces/gameData.interface";
import { AppGateway } from "src/app.gateway";


@Injectable()
export class GameService {
  ballSpeed = 0.25;
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => AppGateway))
    private readonly appGateway: AppGateway
  ) {}

  static rooms: Room[] = [];

  async saveGame(
    id: number,
    userId1: number,
    userId2: number,
    score1: number,
    score2: number,
    pvt: boolean,
  ) {
    const game = await this.prisma.game.create({
      data: {
        id,
        homeUserId: userId1,
        awayUserId: userId2,
        p1score: score1,
        p2score: score2,
      },
    });
    try {
      const winnerId = score1 > score2 ? userId1 : userId2;
      const loserId = score1 > score2 ? userId2 : userId1;

      this.userService.won(winnerId);
      this.userService.lost(loserId);

      const winner = await this.prisma.user.findUnique({
        where: {
          id: winnerId,
        },
      });
      const loser = await this.prisma.user.findUnique({
        where: {
          id: loserId,
        },
      });
      if (pvt === false){
        winner.xp += 0.33;
        loser.xp += 0.01 ;
      }
      await this.prisma.user.update({
        where: {
          id: winnerId,
        },
        data: {
          xp: winner.xp,
          gameHistory: {
            push: id,
          },
        },
      });
     
      await this.prisma.user.update({
        where: {
          id: loserId,
        },
        data: {
          xp: loser.xp,
          gameHistory: {
            push: id,
          },
        },
      });
      this.userService.UpdateRank();
      return game;
    } catch (e) {
      throw new ForbiddenException('saveGame Error :' + e);
    }
  }

  async genNewId(): Promise<number> {
    const id = Math.floor(Math.random() * 1_000_000 + 1);
    const userId = await this.testId(id);
    if (!GameService.rooms.some((room) => room.id === id) && !userId) return id;
    return this.genNewId();
  }

  async testId(id: number) {
    const game = await this.prisma.game.findUnique({
      where: {
        id: id,
      },
    });
    return game;
  }

  paddleBallCollision(rId: number) {
    let reflectionAngle = 0;

    let bX = GameService.rooms.find((room) => room.id === rId).ballX;
    let bY = GameService.rooms.find((room) => room.id === rId).ballY;

    let plY = GameService.rooms.find((room) => room.id === rId).leftPaddleY;
    let prY = GameService.rooms.find((room) => room.id === rId).rightPaddleY;

    const paddleHeight = 0.15;

    let maxAngle = Math.PI / 4;

    {
      if (bX < 0.5) {
        // Ball collided with the left paddle
        const paddleCenterY = plY + paddleHeight / 2;
        const relativeY = bY - paddleCenterY;
        const normalizedY = relativeY / (paddleHeight / 2);
        reflectionAngle = normalizedY * maxAngle;
      } else if (bX > 0.5) {
        // Ball collided with the right paddle
        const paddleCenterY = prY + paddleHeight / 2;
        const relativeY = bY - paddleCenterY;
        const normalizedY = relativeY / (paddleHeight / 2);
        reflectionAngle = normalizedY * maxAngle;
      }
    }

    // const ballVelocity = 0.005;
    const ballVelocity = 0.01;

    GameService.rooms.find((room) => room.id === rId).xVelocity =
      GameService.rooms.find((room) => room.id === rId).ballX < 0.5
        ? ballVelocity * Math.cos(reflectionAngle)
        : -ballVelocity * Math.cos(reflectionAngle);
    GameService.rooms.find((room) => room.id === rId).yVelocity =
      ballVelocity * Math.sin(reflectionAngle);

    GameService.rooms.find((room) => room.id === rId).color =
      this.randomColor();
  }

  ballPaddleFaceCollision(rId: number): boolean {
    return (
      this.isBallWithinPaddleRangeX(rId) && this.isBallWithinPaddleRangeY(rId)
    );
  }

  isBallWithinPaddleRangeX(rId: number) {
    const paddleLeftX = 0.015;
    const paddleRightX = 0.97;
    const paddleWidth = 0.012;
    const radius = 0.019;

    const left =
      GameService.rooms.find((room) => room.id === rId).ballX - radius <=
      paddleLeftX + paddleWidth;
    const right =
      GameService.rooms.find((room) => room.id === rId).ballX + radius >=
      paddleRightX;

    return left || right;
  }

  // check if ball is within paddle interval, not off the edges of the paddle
  isBallWithinPaddleRangeY(rId: number) {
    const paddleHeight = 0.15;
    const radius = 0.019;

    const left =
      GameService.rooms.find((room) => room.id === rId).ballY + radius >
        GameService.rooms.find((room) => room.id === rId).leftPaddleY &&
      GameService.rooms.find((room) => room.id === rId).ballY - radius <
        GameService.rooms.find((room) => room.id === rId).leftPaddleY +
          paddleHeight;
    const right =
      GameService.rooms.find((room) => room.id === rId).ballY + radius >
        GameService.rooms.find((room) => room.id === rId).rightPaddleY &&
      GameService.rooms.find((room) => room.id === rId).ballY - radius <
        GameService.rooms.find((room) => room.id === rId).rightPaddleY +
          paddleHeight;
    if (GameService.rooms.find((room) => room.id === rId).ballX < 0.5)
      return left;
    return right;
  }

  getRandomVelocity() {
    const angle = [0, 1, 2];
    const ang = angle[Math.floor(Math.random() * angle.length)];

    const velocities = {
      0: [-0.005, 0.005],
      1: [-0.005, 0.005],
      2: [-0.005, 0.005],
    };

    const direction = Math.random() < 0.5 ? 1 : -1;
    const [ball_vel_y, ball_vel_x] = velocities[ang].map(
      (vel: any) => vel * direction,
    );

    return { xV: ball_vel_x, yV: ball_vel_y };
  }

  randomColor() {
    const min = 0;
    const max = 255;
    const r = Math.floor(Math.random() * (max - min + 1)) + min;
    const g = Math.floor(Math.random() * (max - min + 1)) + min;
    const b = Math.floor(Math.random() * (max - min + 1)) + min;
    return `rgb(${r}, ${g}, ${b})`;
  }

  resetGame(rId: number) {
    const minY = 0.4;
    const maxY = 0.8;
    const randomY = Math.random() * (maxY - minY) + minY;

    GameService.rooms.find((room) => room.id === rId).ballX = 0.5;
    GameService.rooms.find((room) => room.id === rId).ballY = randomY;

    const { xV, yV } = this.getRandomVelocity();

    GameService.rooms.find((room) => room.id === rId).xVelocity = xV;
    GameService.rooms.find((room) => room.id === rId).yVelocity = yV;
    GameService.rooms.find((room) => room.id === rId).color =
      this.randomColor();
  }

  ballTopBottomCollision(rId: number) {
    const radius = 0.019;
    if (
      GameService.rooms.find((room) => room.id === rId).ballY +
        radius +
        GameService.rooms.find((room) => room.id === rId).yVelocity >
        1 ||
      GameService.rooms.find((room) => room.id === rId).ballY - radius < 0
    ) {
      GameService.rooms.find((room) => room.id === rId).yVelocity =
        -GameService.rooms.find((room) => room.id === rId).yVelocity;
    }
  }

  handleCollisions(rId: number) {
    const radius = 0.019;

    this.ballTopBottomCollision(rId);
    if (this.ballPaddleFaceCollision(rId)) this.paddleBallCollision(rId);
    else if (this.isBallWithinPaddleRangeX(rId)) {
      if (
        GameService.rooms.find((room) => room.id === rId).ballX + radius >= 0.97
      ) {
        GameService.rooms.find((room) => room.id === rId).player1score += 1;
      } else if (
        GameService.rooms.find((room) => room.id === rId).ballX - radius <= 0.15
      ) {
        GameService.rooms.find((room) => room.id === rId).player2score += 1;
      }    
      this.resetGame(rId);
    }

    GameService.rooms.find((room) => room.id === rId).ballX += GameService.rooms.find((room) => room.id === rId).xVelocity;
    GameService.rooms.find((room) => room.id === rId).ballY += GameService.rooms.find((room) => room.id === rId).yVelocity;
  }

  initBall(rId: number) {
    GameService.rooms.find((room) => room.id === rId).ballX = 0.5;
    GameService.rooms.find((room) => room.id === rId).ballY = 0.5;
    GameService.rooms.find((room) => room.id === rId).xVelocity =
      Math.random() < 0.5 ? -0.005 : 0.005;
    GameService.rooms.find((room) => room.id === rId).yVelocity = 0.005;
    GameService.rooms.find((room) => room.id === rId).color = 'tomato';
  }

  async startGame(roomId: number, server: Server): Promise<void> {
    const gameData: GameData = {
      leftPaddleY: 0.425,
      rightPaddleY: 0.425,
      player1Score: 0,
      player2Score: 0,
      player1Name: GameService.rooms.find((room) => room.id === roomId)
        .player1Name,
      player2Name: GameService.rooms.find((room) => room.id === roomId)
        .player2Name,
      player1Avatar: GameService.rooms.find((room) => room.id === roomId)
        .player1.data.id,
      player2Avatar: GameService.rooms.find((room) => room.id === roomId)
        .player2.data.id,
      roomId: roomId,
      ballX: 0.5,
      ballY: 0.5,
      xVelocity: Math.random() < 0.5 ? -0.003 : 0.003,
      yVelocity: 0.003,
      color: 'tomato',
    };
    this.initBall(roomId);
    
    // gameData.animationLoopStatus = true;
    console.log('number of rooms ===>', GameService.rooms.length);   
    setInterval(() => {
      this.gameLoop(roomId, server, gameData);
    }, 1000 / 60);
  }

  gameLoop(rId: number, server: Server, gameData: GameData) {    
    if (!GameService.rooms.some((room) => room.id === rId)) {
      return;
    }
    if (GameService.rooms.find((room) => room.id === rId).player1Dc == true) {
      server
        .to(GameService.rooms.find((room) => room.id === rId).name)
        .emit('disconnected', 1);
      gameData.player2Score = 5;
    } else if (
      GameService.rooms.find((room) => room.id === rId).player2Dc == true
    ) {
      server
        .to(GameService.rooms.find((room) => room.id === rId).name)
        .emit('disconnected', 2);
      gameData.player1Score = 5;
    } else {
      this.handleCollisions(rId);
      gameData.ballY = GameService.rooms.find((room) => room.id === rId).ballY;
      gameData.ballX = GameService.rooms.find((room) => room.id === rId).ballX;
      gameData.color = GameService.rooms.find((room) => room.id === rId).color;
      gameData.leftPaddleY = GameService.rooms.find(
        (room) => room.id === rId,
      ).leftPaddleY;
      gameData.rightPaddleY = GameService.rooms.find(
        (room) => room.id === rId,
      ).rightPaddleY;
      gameData.player1Score = GameService.rooms.find(
        (room) => room.id === rId,
      ).player1score;
      gameData.player2Score = GameService.rooms.find(
        (room) => room.id === rId,
      ).player2score;
    }

    server
      .to(GameService.rooms.find((room) => room.id === rId).name)
      .emit('update', gameData);

    if (gameData.player1Score == 5 || gameData.player2Score == 5){
        const winner = gameData.player1Score > gameData.player2Score ? 1 : 2;
        server.to(GameService.rooms.find((room) => room.id === rId).name).emit('gameOver', winner); 
        this.saveGame(rId, GameService.rooms.find((room) => room.id === rId).player1.data.id,
                        GameService.rooms.find((room) => room.id === rId).player2.data.id,
                        gameData.player1Score, gameData.player2Score,
                        GameService.rooms.find((room) => room.id === rId).private
                      )
        GameService.rooms.splice(GameService.rooms.findIndex((room) => room.id === rId), 1)
    }
    return;
  }

  updateRoom(player: number, roomId: number, value: number) {
    if ( GameService.rooms.find((room) => room.id === roomId))
    {
        if (player == 1)
          GameService.rooms.find((room) => room.id === roomId).leftPaddleY = value;
        else if (player == 2)
          GameService.rooms.find((room) => room.id === roomId).rightPaddleY = value;

    }
  }

  async getGame(id: number){
    try {
      const game = await this.prisma.game.findUnique({
        where: {
          id: id,
        }
      })
      return game;
    }catch(e){
      throw new ForbiddenException('getGame Error !' + e);
    }
  }
}
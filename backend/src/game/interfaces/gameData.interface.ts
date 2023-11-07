
import { Ball } from './ball.interface';

export interface GameData {
    roomId: number;
    leftPaddleY?: number;
    rightPaddleY?: number;
    player1Name: string;
    player2Name: string;
    player1Avatar: number;
    player2Avatar: number;
    player1Score: number;
    player2Score: number;
    gameId?: number;
    ballX?: number;
    ballY?: number;
    xVelocity?: number;
    yVelocity?: number;
    color?: string;
    animationLoopStatus?: boolean;
}
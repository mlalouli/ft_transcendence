import { Socket } from "socket.io-client";

export interface CanvasSize {
    width: number;
    height: number;
}

export interface Player {
    roomId: number;
    playerNb: number;
}

export interface Ball{
    ballX: number;
    ballY: number;
    radius: number;
    xVelocity: number;
    yVelocity: number;
    color: string;
}

export interface GameData {
    leftPaddleY: number;
    rightPaddleY: number;
    player1Name: string;
    player2Name: string;
    player1Avatar: number;
    player2Avatar: number;
    player1Score: number;
    player2Score: number;
    roomId: number;
    ballX: number;
    ballY: number;
    color: string;
    winner?: String;
}

export interface Coordinates {
    x? : number;
    y? : number;
    showBall: boolean;
}

export interface PropsPong {
    private ?: boolean;
    roomId?: number;
    playerNb: number;
    socket?: Socket;
}

export interface ExtendedData extends GameData{
    avatar1URL: string;
    avatar2URL: string;
}
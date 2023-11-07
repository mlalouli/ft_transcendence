import { Socket } from "socket.io-client";

export interface Player {
    roomId: number;
    playerNb: number;
}

export interface GameData {
    paddleLeft?: number;
    paddleRight?: number;
    xBall?: number;
    yBall?: number;
    player1Name: string;
    player2Name: string;
    player1Avatar: number;
    player2Avatar: number;
    player1Score: number;
    player2Score: number;
    gameId?: number;
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


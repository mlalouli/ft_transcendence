import { Client } from "./client.interface";
import {  CanvasSize } from "./player.interface";


export interface Room {
    id: number;
    name: string;
    player1: Client;
    player1Name: string;
    player1Avatar: string;
    player1Dc ?: boolean;
    player2?: Client;
    player2Name?: string;
    player2Avatar?: string;
    player2Dc ?: boolean;
    leftPaddleY: number;
    paddleLeftDir: number;
    rightPaddleY: number;
    paddleRightDir: number;
    player1score: number;
    player2score: number;
    // player1canvasSize: CanvasSize;
    // player2canvasSize?: CanvasSize;
    ballX?: number;
    ballY?: number;
    xVelocity?: number;
    yVelocity?: number;
    color?: string;
    // ball?: any;
    private: boolean;
    animationLoopStatus: boolean;
}
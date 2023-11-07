import { Dispatch } from "react";
import { Socket } from 'socket.io-client';

export interface AuthContextType {
    user: string | null;
    signIn: (user: string | null, callback: VoidFunction) => void;
    signOut: (callback: VoidFunction) => void;
}

export interface IUserInfo{
    username: string | null;
    clear: any
}

export interface socketContextType {
    socket : Socket | null;
}

export interface IUserInputsRef {
    username: React.RefObject<HTMLInputElement>;
}

export interface IUserStatus {
    key: number;
    userModel : {id: number, status: number};
}

export interface INotifCxt {
    setNotifShow: Dispatch<React.SetStateAction<boolean>>;
    setNotifText: Dispatch<React.SetStateAction<string>>;
}

export interface ItableRow {
    key: number;
    userModel : {username: string, avatar: string, id: number, status: number};
}



export interface userModel {
    id: number;
    username: string;
    avatar: String;
    friends: Array<userModel>;
    loses: number;
    wins: number;
    winrate: number;
    nGames: number;
    rank: number;
    xp: number;
}
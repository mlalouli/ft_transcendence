import { Player } from "src/game/interfaces/player.interface";
import { NumberLiteralType } from "typescript";

export type Tag = {
    id:         number;
    pseudo:     string;
}

export type chatElement = {
    id:             number;
    type:           "PUBLIC" | "PROTECTED" | "PRIVATE" | "DIRECT",
    name:           string;
    hasPassword:    boolean;
    lastMsg:        string;
    ownerLogin:     string;
    ownerId:        number;
}


export type updateChannel = {
    cId:            number;
    tId:            number;
    type:           "PUBLIC" | "PROTECTED" | "PRIVATE" | "DIRECT",
    login:          string | null;
    hasPassword:    boolean | undefined;
    password:       string;
    newPassword:    string;
}

export type msg = {
    msgId:      number;
    oId:        number;
    cId:        number;
    login:      string;
    pseudo:     string;
    content:    string;
    createdAt:  string;
}

export type user = {
    id:         number;
    login:      string;
    pseudo:     string;
    online:     boolean;
    isBanned:   boolean;
    isOwner:    boolean;
    isAdmin:    boolean;
    isMuted:    boolean;
    isFriend:   boolean;
}

export type updateUser = {
    login:      string | null;
    otherId:    number;
}

export type mute = {
    login:      string;
    cId:        number;
    duration:   number;
}

export type fetchDm = {
    cId:    number;
    tId:    number;
}

export type suggestion = {
    id:         number;
    dataId:     number;
    name:       string;
    category:   string;
    image:      string;
}

export type gameInvitation = {
    gameInfo:       Player;
    senderId:       number;
    senderName:    string;
    tId:            number;
}
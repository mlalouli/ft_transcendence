import { Player } from "@/pages/Game/interface/game.interface";


export type suggestion = {
    id:         number;
    dataId:     number;
    image:      string
    name:       string;
    category:   string;
}


export type chatElement = {
    id:             number;
    type:           "PUBLIC" | "PROTECTED" | "PRIVATE" | "DIRECT",
    name:           string;
    hasPassword:    boolean;
    lastMsg:        string;
    ownerLogin:     string;
    ownerId:        number;
    isBlocked:      boolean;
}

export type ChannelDto = {
    id:             number | null;
    login:          string | null;
    name:           string;
    type:           "PUBLIC" | "PROTECTED" | "PRIVATE" | "DIRECT",
    hasPassword:    boolean;
    password:       string | null;
    members:        Tag[];
}

export type Tag = {
    id: number | string;
    name: string;
}

export type updateChannel = {
    cId:            number | undefined;
    tId:            number;
    type:           "PUBLIC" | "PROTECTED" | "PRIVATE" | "DIRECT" | undefined,
    login:          string | null;
    hasPassword:    boolean | undefined;
    password:       string;
    newPassword:    string;
}

export type MessageDto = {
    login:      string | null;
    channelId:  number;
    content:    string;
    msgId:      number;
}

export type oneMsg = {
    msgId:      number;
    oId:        number;
    cId:        number;
    login:      string;
    pseudo:     string;
    content:    string;
    createdAt:  string;
}

export type DmDto = {
    login: string | null;
    targetId : number;
}

export type fetchDm = {
    cId: number;
    tId: number;
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
    isBlocked:  boolean;
}

export type updateUser = {
    login:      string | null;
    otherId:    number;
}

export type setting = {
    type:           "PUBLIC" | "PROTECTED" | "PRIVATE" | "DIRECT",
    hasPassword:    boolean;
}

export type mute = {
    login:      string;
    cId:        number;
    duration:   number;
}

export type gameInvitation = {
    gameInfo:   Player;
    senderId:   number;
    senderName: string | null;
    tId:        number;
}

export type userElement = {
    login: string;
    pseudo: string;
}
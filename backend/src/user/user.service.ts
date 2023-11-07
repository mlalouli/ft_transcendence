import { plainToClass } from "class-transformer";
import { PrismaService } from "../prisma/prisma.service";
import { BadRequestException, ForbiddenException, Inject, Injectable, forwardRef, } from "@nestjs/common";
import { UserDto } from "./dto/user.dto";
import { User, Game } from "@prisma/client";
import { GameDto } from "src/game/dto/game.dto";
import { GameService } from "src/game/game.service";


@Injectable()
export class UserService{

    constructor (
                 private readonly prisma: PrismaService,
                 @Inject(forwardRef(() => GameService))
                 private readonly gameService: GameService,
        ) {}


    async createUser(login: string, pseudo: string) : Promise<User>{
        const user = await this.prisma.user.create({
            data: {
                login,
                pseudo
            }
        });
        return user;
    }


    async getAllUser(): Promise<User[]>{ 
        return this.prisma.user.findMany();
    }

    async getUser(id:number) {
        if (id === undefined)
            throw new BadRequestException('Undefined ID');
        try {
            const user = await this.prisma.user.findUnique({
                where: {id: id}
            });
            const dtoUser = plainToClass(UserDto, user);
            return dtoUser;
        }catch(error){
            throw new ForbiddenException('getUser error: ' + error);
        }
    }

    async getPseudo(pseudo: string){
        try{
            const user = await this.prisma.user.findUnique({
                where : {pseudo: pseudo}
            });
            const dtoUser = plainToClass(UserDto, user);
            return dtoUser;
        }catch(error){
            throw new ForbiddenException('getUser error: '+ error);
        }
    }


    async getFriends(id: number){
        const friendIdList = await this.prisma.user.findMany({
            where: {
                id: id
            },
            select: {
                Friends : true
            },
        });
        const friendList : UserDto[] = [];
        for (const element of friendIdList){
            for (let i = 0; i < element.Friends.length; i++){
                const friend = await this.prisma.user.findUnique({
                    where: {id: element.Friends[i]}
                });
                const dtoUser = plainToClass(UserDto, friend);
                friendList.push(dtoUser);
            }
        }
        return friendList;
    }

    async getPending(id: number){
        const Pending = await this.prisma.user.findMany({
            where: {
                id: id,
            },
            select : {
                Followed: true,
            }
        });
        const userList: UserDto[] = [];
        for (const element  of Pending){
            for (let i = 0; i < element.Followed.length; i++){
                const user = await this.prisma.user.findUnique({
                    where: {id : element.Followed[i]}
                });
                const dtoUser = plainToClass(UserDto, user);
                userList.push(dtoUser);
            }
        }
        return userList;
    }

    async isFriend(id1: number, id2: number){
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: id1
                }
            });
            const i = user.Friends.indexOf(id2);
            if (i != -1)
                return true;
            return false;
        }catch (e) {
            throw new ForbiddenException('isFriend Error: '+ e);
        }
    }

    async isAdding(id1: number, id2: number){
        try {
            const user = await this.prisma.user.findUnique({
                where : {
                    id: id1
                }
            });
            const i = user.Following.indexOf(id2);
            if (i != -1)
                return true;
            return false;
        }catch(e){
            throw new ForbiddenException('isAdding Error: '+ e);
        }
    }

    async getBlocked(id: number){
        const blockedIdList = await this.prisma.user.findMany({
            where: {
                id: id
            },
            select: {
                Blocks: true
            }
        });
        const blockedList : UserDto[] = [];
        for (const element of blockedIdList) {
            for (let i = 0; i < element.Blocks.length; i++){
                const block = await this.prisma.user.findUnique({
                    where: {
                        id: element.Blocks[i]
                    }
                });
                const dtoUser = plainToClass(UserDto, block);
                blockedList.push(dtoUser);
            }
        }
        return blockedList;
    }

    async isBlocked(id1: number, id2: number){
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: id1
                }
            });
            const i = user.Blocks.indexOf(id2);
            if (i != -1)
                return true;
            // const user2 = await this.prisma.user.findUnique({
            //     where: {
            //         id : id2
            //     }
            // })
            // const j = user2.Blocks.indexOf(id1);
            // if (j != -1)
            //     return true;
            return false;
        }catch (e) {
            throw new ForbiddenException('IsBlocked: '+ e);
        }
    }

    async updatePseudo(id: number, newPseudo: string){
        const   update = await this.prisma.user.update({
            where: {id: id},
            data: { pseudo: newPseudo}
        });
        return update;
    }

    async updateAvatar(id: number, newAvatar: string){
        const update = await this.prisma.user.update({
            where: {
                id: id
            },
            data: {
                avatar: newAvatar
            }
        })
        return update;
    }

    async addFriend(id: number, otherId: number){     
        if (id == otherId ||
            (await this.isFriend(id, otherId)) ||
            (await this.isAdding(id, otherId))||
            (await this.isBlocked(id, otherId)) ||
            (await this.isBlocked(otherId, id)))
                return null;
        const user = await this.prisma.user.update({
            where: {
                id: id,
            },
            data: {
                Following: {
                    push: otherId
                }
            }
        });

        await this.prisma.user.update({
            where: {
                id: otherId
            },
            data: {
                Followed: {
                    push: id
                }
            }
        });

        await this.updateFriends(id);
        await this.updateFriends(otherId);
        return user;
    }

    async updateFriends(id: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        });
        const Following = user.Following;
        const Followed = user.Followed;

        const common = Followed.filter((value) => Following.includes(value));

        await this.prisma.user.update({
            where: {
                id: id
            },
            data: {
                Friends: {
                    push: common
                }
            }
        });

        const newFollowing = Following.filter((value) => !common.includes(value));
        const newFollowed = Followed.filter((value) => !common.includes(value));

        await this.prisma.user.update({
            where: {
                id: id
            },
            data: {
                Following: newFollowing
            }
        });

        await this.prisma.user.update({
            where : {
                id: id
            },
            data: {
                Followed: newFollowed
            }
        });
    }

    async deleteFriend(id: number, otherId: number){
        if (id == otherId || !(await this.isFriend(id, otherId)))
            throw new ForbiddenException('Cannot delete this user');

        const user = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        });

        const i = user.Friends.indexOf(otherId);
        if (i != -1)
            user.Friends.splice(i, 1);

        await this.prisma.user.update({
            where: {
                id: id
            },
            data: {
                Friends: user.Friends
            }
        });

        const user2 = await this.prisma.user.findUnique({
            where: {
                id: otherId
            }
        });

        const j = user2.Friends.indexOf(id);
        if (j != -1)
            user2.Friends.splice(j, 1);

        await this.prisma.user.update({
            where: {
                id: otherId
            },
            data : {
                Friends: user2.Friends
            }
        });
        return user;
    }

    async cancelRequest(id: number, otherId: number){
        if (id == otherId)
            throw new ForbiddenException('Impossible Action !');

        const user = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        });

        const i = user.Following.indexOf(otherId);
        if (i != -1)
            user.Following.splice(i, 1);

        await this.prisma.user.update({
            where: {
                id: id
            },
            data: {
                Following: user.Following
            }
        });

        const user2 = await this.prisma.user.findUnique({
            where: {
                id: otherId
            }
        });

        const j = user2.Followed.indexOf(id);
        if (j != -1)
            user2.Followed.splice(j, 1);

        await this.prisma.user.update({
            where: {
                id: otherId
            },
            data: {
                Followed: user2.Followed
            }
        });
        return user;
    }

    async denyRequest(id: number, otherId: number){
        return this.cancelRequest(otherId, id);
    }

    async blockUser(id: number, otherId: number){
        if (id == otherId || (await this.isBlocked(id, otherId))){
            console.log('was here from blockUser');
            
            throw new ForbiddenException('Cannot Block this user');
        }
        if (await this.isFriend(id, otherId))
            await this.deleteFriend(id, otherId);
        if (await this.isAdding(id, otherId))
            await this.cancelRequest(id, otherId);
        if (await this.isAdding(otherId, id))
            await this.cancelRequest(otherId, id);
        const user = await this.prisma.user.update({
            where: {
                id: id
            },
            data: {
                Blocks: {
                    push: otherId
                }
            }
        });
        return user;
    }

    async unblockUser(id: number, otherId: number){
        if (id == otherId || !(await this.isBlocked(id, otherId)))
            throw new ForbiddenException('cannot unblock this user');
        const user = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        });

        const i = user.Blocks.indexOf(otherId);
        if (i != -1)
            user.Blocks.splice(i, 1);
        
        await this.prisma.user.update({
            where: {
                id: id
            },
            data: {
                Blocks: user.Blocks
            }
        });
        return user;
    }

    async searchUser(id: number, suggest: string)
    {
        try {
            const id = await this.prisma.user.findMany({
                where: {
                    pseudo: {
                        startsWith: suggest
                    }
                },
                select:{
                    id: true,
                    pseudo: true,
                    avatar: true
                }
            })
        }catch (e){
            console.log("SearchUser error: ", e);
            throw new ForbiddenException(e);
        }
    }

    async UpdateRank() {
        const users = await this.prisma.user.findMany({
            orderBy: {xp: 'desc'},
            select: {id: true, xp: true}
        });

        const usersId: number[] = [];
        for (const user of users){
            if (user.xp)
                usersId.push(user.id);
        }
        let i = 1;
        for (const id of usersId){
            await this.prisma.user.update({
                where: {id: id},
                data: {rank: i},
            });
            i++;
        }
        return;
    }

    async updateWinRate(id: number){
        const user = await this.prisma.user.findUnique({
            where : {id: id}
        });
        const winRate = user.wins / user.gamesNumber;

        const update = await this.prisma.user.update({
            where: {id: id},
            data: {winRate : winRate}
        });
        return update;
    }

    async getLeaderboard(){
        const users = await this.prisma.user.findMany({
            where: {
                NOT: {
                    gamesNumber: {equals: 0}
                }
            },
            select: {
                id: true,
                pseudo: true,
                rank: true,
                xp : true,
            },
            orderBy: {rank: 'asc'}
        });
        return users;
    }

    async updateUser(id:number, data:User):Promise<User>{
        return this.prisma.user.update({
            where: {id:Number(id)},
            data: {pseudo: data.pseudo}
        })
     }

    async deleteUser(id:number) : Promise<User>{
        return this.prisma.user.delete({
            where: {id:Number(id)}
        })
    }

    async won(id: number){
        const updateUser = await this.prisma.user.updateMany({
            where: {
                id: id,
            },
            data: {
                wins : {
                    increment: 1,
                },
                gamesNumber: {
                    increment: 1
                }
            }
        });
        this.updateWinRate(id);
        return updateUser;
    }

    async lost(id: number){
        const updateUser = await this.prisma.user.updateMany({
            where: {
                id: id,
            },
            data: {
                loses : {
                    increment: 1,
                },
                gamesNumber: {
                    increment: 1
                }
            }
        });
        this.updateWinRate(id);
        return updateUser;
    }

    async getHistory(id: number){
        const user = await this.prisma.user.findUnique({
            where: {id: id}
        })
        const history: number [] = user.gameHistory;
        if (history.length === 0)
            return [];
        
        const gameHistory: Game[] = [];
        for (const gameId of history)
            gameHistory.push(await this.gameService.getGame(gameId));

        const gameDTOs: GameDto[] = [];
        
        for (const game of gameHistory){
            let otherId: number;
            let userScore: number;
            let otherScore: number;

            game.homeUserId === id ? (otherId = game.awayUserId) : (otherId = game.homeUserId);
            game.homeUserId === id ? (userScore = game.p1score) : (userScore = game.p2score);
            game.homeUserId === id ? (otherScore = game.p2score) : (otherScore = game.p1score);

            const other: UserDto = await this.getUser(otherId);

            const gameDTO : GameDto = {
                userId: id,
                otherId: other.id,
                otherAvatar: other.avatar,
                otherPseudo: other.pseudo,
                otherUser: other,
                otherRank: other.rank,
                userScore: userScore,
                otherScore: otherScore,
                victory: userScore > otherScore ? true : false,
            }
            gameDTOs.push(gameDTO);
        }
        const rGameDTOs = gameDTOs.reverse();
        return rGameDTOs;
    }

 }
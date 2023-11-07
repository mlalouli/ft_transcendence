import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { createWriteStream } from "fs";
import { UserService } from "src/user/user.service";
import { v4 as uuidv4 } from 'uuid'
@Injectable()
export class AvatarService {
    constructor(
        private readonly httpService: HttpService,
        private readonly userService: UserService
    ){}

    async downloadAvatar(id: number, avatarURL: string): Promise<any>{     
        const extention = "." + avatarURL.split('.').pop();
        const name = uuidv4() + extention;
        const path = process.env.UPLOAD_DIR + '/' + name;

        await this.userService.updateAvatar(id, name);

        const writer = createWriteStream(path);
        const response = await this.httpService.axiosRef({
            url: avatarURL,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }   
}
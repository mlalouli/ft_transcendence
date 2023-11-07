import { AuthGuard } from "@nestjs/passport";


export class refreshGuard extends AuthGuard('refresh-jwt'){
    constructor(){
        super();
    }
}
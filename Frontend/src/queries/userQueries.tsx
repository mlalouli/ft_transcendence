import { authContentHeader, authHeader } from "./headers";

export const getUserData = () => {
    return fetchGet("current", storeUserInfo);
}

export const getAllUsersQ = () => {
    return fetchGet('allUsers', null);
}
export const getPendingQ = () => {
    return fetchGet('getPending', storeFriendInfo);
}

export const getBlockedQ = () => {
    return fetchGet('getBlocked', storeFriendInfo);
}

export const getLeaderBoard = () => {
    return fetchGet('getLeaderboard', storeLeaderBoardInfo)
}
export const getOtherUser = (otherUsername: number) => {
    
    let body = JSON.stringify({
        otherId: otherUsername
    });
    
    return fetchGetOtherUser("getUser", body);
}


export const getSearchUser = (suggest: string) => {
    let body = JSON.stringify({
        suggest: suggest
    });

    return fetchGetOtherUser ('search', body);
}

const  fetchGetOtherUser = async (url: string, body: any) => {
    let fetchUrl = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/users/" + url;
    try{
        const response = await fetch(fetchUrl, {
            method: "POST",
            headers: authContentHeader(),
            body: body,
            redirect: "follow"
        });
        const res = await response.json();
        // if (response.status === 401){
        //     localStorage.clear();
        //     localStorage.setItem("userLogged", "false");
        // }
        if (!response.ok)
            return "error";
        return res;
    } catch (e){
        return "error";
    }
}
const fetchGet = async (url: string, callback: any) => {
    let fetchUrl = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/users/" + url;   
    try {
        const response = await fetch(fetchUrl, {
            method: "GET",
            headers: authHeader(),
            body: null,
            redirect: "follow"
        });
        // if (response.status === 401){
        //     localStorage.clear();
        //     localStorage.setItem("userLogged", "false");
        // }
        const result = await response.json();
        if (!response.ok){
            console.log('fetch Get Error');
            
            return "error";
        }
        if (url === 'allUsers')
            return result;
        return callback(result);
    } catch (e){
        console.log("fetchGet error:", e);
        return 'error';
    }
}

export const storeUserInfo = (res: any) => {
    localStorage.setItem("userID", res.id);
    localStorage.setItem("userName", res.pseudo);
    localStorage.setItem("userPicture", res.avatar);
    localStorage.setItem("userGamesWon", res.wins);
    localStorage.setItem("userGamesLost", res.loses);
    localStorage.setItem("userGamesPlayed", res.gamesNumber);
    localStorage.setItem("userAuth", res.twoFAState);
    localStorage.setItem("userLogin", res.login);
}

export const storeFriendInfo = (res: any) => {
    return res;
}

export const storeLeaderBoardInfo = (res: any) => {
    return res;
}
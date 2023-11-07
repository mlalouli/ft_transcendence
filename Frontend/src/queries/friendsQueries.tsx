import { authContentHeader } from "./headers";


export const getFriends = (otherId: number)=> {
    let body = JSON.stringify({
        otherId: otherId
    });
    return fetchGet("getFriends", authContentHeader, body);
}

export const addFriendQ = (otherId: number) => {
    let body = JSON.stringify({
        otherId: otherId
    });
    return fetchGet("addFriend", authContentHeader, body);
}

export const cancelRequest = (otherId: number) => {
    let body = JSON.stringify({
        otherId: otherId,
    });
    return fetchGet("cancelRequest", authContentHeader, body);
}

export const denyRequest = (otherId: number) => {
    let body = JSON.stringify({
        otherId: otherId
    });
    return fetchGet("denyRequest", authContentHeader, body);
}

export const blockUser = (otherId: number) => {
    let body = JSON.stringify({
        otherId: otherId
    });
    return fetchGet("blockUser", authContentHeader, body);
}

export const unblockUser = (otherId: number) => {
    let body = JSON.stringify({
        otherId: otherId
    });
    return fetchGet("unblockUser", authContentHeader, body);
}

export const rmFriend = (otherId: number) => {
    let body = JSON.stringify({
        otherId: otherId
    });
    return fetchGet("deleteFriend", authContentHeader, body);
}

const fetchGet = async(url: string, header: any, body: any) => {
    let fetchURL = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/users/" + url;
    try {
        const response = await fetch(fetchURL, {
            method: "POST",
            headers: header(),
            body: body,
            redirect: "follow"
        });
        // if (response.status === 401){
        //     localStorage.clear();
        //     localStorage.setItem("userLogged", "false");
        // }
        const res = await response.json();
        if (res === null)
            return "error";
        if (!response.ok){
            console.log("fetch Get Error", url, res.message);
            return "error";
        }
        return res;
    } catch(e) {
        console.log("fetch Get error", e);
        return 'error';
    }
}
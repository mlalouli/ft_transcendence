

export const getUserAvatar = (otherId: number)=> {
    let body = JSON.stringify({
        userId: otherId,
    });
    let header = authFileHeader();
    header.append("Content-Type", "application/json");
    return fetchAvatar("POST", body, header, "getavatar");
}

export const getChannelAvatar = (otherId: number)=> {
    let body = JSON.stringify({
        userId: otherId,
    });
    let header = authFileHeader();
    header.append("Content-Type", "application/json");
    return fetchAvatar("POST", body, header, "getCAvatar");
}

export const getAvatarQ = () => {
    return fetchAvatar("GET", null, authFileHeader(), "avatar")
}

export const uploadAvatarQ = (file: any) => {
    var formdata = new FormData();

    formdata.append('avatar', file, 'name.png');  
    return fetchAvatar('POST', formdata, authFileHeader(), 'avatar');
}

export const uploadCAvatarQ = (file: any, rId: number) => {
    var formdata = new FormData();
    
    formdata.append('avatar', file, 'name.png');
    formdata.append('rId', rId.toString()); 
    return fetchAvatar('POST', formdata, authFileHeader(), 'cAvatar');
}

const authFileHeader = () => {
    let token = "bearer " + localStorage.getItem("userToken");
    let myHeaders = new Headers();
    myHeaders.append("Authorization", token);
    return myHeaders;
}


const fetchAvatar = async (method: string, body: any, header: any, url: string) => {

    let fetchURL = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/avatar/" + url;
    let request: RequestInit | undefined;
    
    if (method === "POST")
        request = {
            method: method,
            headers: header,
            body: body,
            redirect: "follow"
        };
    else
        request = {
            method: method,
            headers: header,
            redirect: "follow"
        };
    try {
        const response = await fetch(fetchURL, request);
        // if (response.status === 401){
        //     localStorage.clear();
        //     localStorage.setItem("userLogged", "false");
        // }
        if (response.status === 220)
            return "error";
        const res = await response.blob();
        if (!response.ok || !res)
            return "error";
        return res;
    } catch (e){
        console.log("fetch Avatar error", e);
        return "error";
    }
};
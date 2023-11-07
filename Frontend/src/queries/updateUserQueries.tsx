import { authContentHeader, authHeader } from "./headers";



export const updateUserNameQ = (userName: string) => {  
    var raw = JSON.stringify({pseudo: userName});
    return fetchPost(raw, 'updatePseudo', authContentHeader, userName);
}

const fetchPost = async( body: any, url: string, header: any, data: string) => {
    let fetchURL = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/users/" + url;  
    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: header(),
            body: body,
            redirect: 'follow'
        });
        // if (response.status === 401){
        //     localStorage.clear();
        //     localStorage.setItem("userLogged", "false");
        // }
        await response.json();
        if (!response.ok){
            console.log('update FetchPost Error ! ', url);
            return 'error';
            
        }
        storeUserModif(url, data);
        return 'success';
    } catch(e){
        console.log('update FetchPost Error !', e);
        return "error"
        
    }
}

const storeUserModif = (url: string, data:string) => {
    if (url === 'updatePseudo') localStorage.setItem('userName', data);
    if (url === 'updateAvatar') localStorage.setItem('userPicture', data);
}
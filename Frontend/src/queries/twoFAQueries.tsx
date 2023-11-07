import { storeToken } from "./authQueries";
import { getUserData } from "./userQueries";

export const twoFAGenerate = () => {
    return (fetchPost(null, 'generate', null))
}

export const twoFAAuth = (twoFACode : string, login: string, userSignIn: any) => {    
    let raw = JSON.stringify({pseudo: login, twoFAsecret: twoFACode})
    return (fetchPost(raw, 'authenticate', userSignIn));
}

export const twoFAOn = (code : string) => {
    let raw = JSON.stringify({twoFAcode: code});
    console.log('TurnOn');
    return fetchPost(raw, 'turnOn', null);
    
}

export const twoFAOff = () => {
    return fetchPost(null, 'turnOff', null);
}

const authRawHeader = () => {
    let token = 'bearer ' + localStorage.getItem('userToken');
    let myHeaders = new Headers();
    myHeaders.append('Authorization', token);
    myHeaders.append('Content-Type', 'application/json');
    return myHeaders;
}
const fetchPost = async(body: any, url: string, userSignIn: any) => {
    let fetchURL = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/2fa/" + url;       
    try {
        const response = await fetch(fetchURL , {
            method: 'POST',
            headers: authRawHeader(),
            body: body,
            redirect: 'follow'
        });
        const res = await response.json();   
        // if (response.status === 401){
        //     localStorage.clear();
        //     localStorage.setItem("userLogged", "false");
        // }
        if (!response.ok) {
            console.log('Post fetchPost 2FA Error ', url);
            return null;
        }
        if (url !== 'generate'){
            storeToken(res);
            if (url === 'authenticate'){
                if (localStorage.getItem('userToken')){  
                    await getUserData();
                    if (localStorage.getItem('userName'))
                        userSignIn();
                    else
                        return null;
                }
            }
        }
        return res;
    }catch(e){
        console.log('FetchPost TwoFA Error', e)
        return 'error';
    }
}
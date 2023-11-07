import { authContentHeader } from "./headers";


export const getGameHistory = (other: number) => {
    
    let body = JSON.stringify({otherId: other});
    return fetchHistory('getHistory', body);
}

const fetchHistory = async(url : string, body: any) => {
    let fetchURL = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/users/" + url;
    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: authContentHeader(),
            body: body,
            redirect: 'follow'
        });
        // if (response.status === 401){
        //     localStorage.clear();
        //     localStorage.setItem("userLogged", "false");
        // }
        const res = await response.json();
        if(!response.ok){
            console.log('fetch History Error !');
            return 'error';
        }
        return Object.assign(res);
    }catch(e){
        console.log("fetch History error", e);
        return 'error';
        
    }
}
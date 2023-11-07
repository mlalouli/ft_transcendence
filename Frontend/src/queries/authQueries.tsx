import { useNavigate } from "react-router-dom";
import { authHeader } from "./headers";


let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");


export const storeToken = (token: any) => {

    
    localStorage.setItem("userToken", token.access_token);
    localStorage.setItem("userRefreshToken", token.refresh_token)
}

export const logOut= () => {
    return fetchPostLogout();
}

const fetchPostLogout = async() => {
    let fetchUrl = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth/logout";
    try {
        const response = await fetch(fetchUrl, {
            method: "POST",
            headers: authHeader(),
            redirect: "follow"
        });
        // if (response.status === 401){
        //     localStorage.clear();
        //     localStorage.setItem("userLogged", "false");
        //     return;
        // }
        const result = await response.text();
        if (!response.ok){
            console.log("logOut Post Error :");
            return "error";
        }
        return result;
    } catch (e){
        console.log("logOut Post Error :", e);
        return 'error';
    }
};
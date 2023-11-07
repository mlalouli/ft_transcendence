import { Navigate, matchPath, useLocation } from "react-router-dom";
import { AuthContext, useAuth } from "../global/context";
import { ReactNode, useState } from "react";
import { logOut } from "../queries/authQueries";

export const RedirectAtAuth = ({children} : {children: any}) => {
    const location = useLocation();
    if (matchPath(location.pathname, "/Login") && localStorage!.getItem("userLogged") === "true")
        return (<Navigate to="/Home" state={{from: location}} replace/>);
    return children;
}

export const RequireAuth = ({children} : {children: any}) => {
    const auth = useAuth();
    const location = useLocation();

    if (localStorage!.getItem("userLogged")! === "true")
        auth.signIn(localStorage.getItem("userName"), () => {});
    else
        return <Navigate to ="/Login" state={{from: location}} replace/>
    return children;
};

export const AuthProvider = ({children} : {children: ReactNode}) => {
    const [user, setUser] = useState<any>(null);
    const signIn = (newUser: string | null, callback: VoidFunction) => {
        return fakeAuthProvider.signIn(() => {
            setUser(newUser);
            localStorage.setItem("userLogged", "true");
            callback();
        });
    };

    const signOut = (callback: VoidFunction) => {
        return fakeAuthProvider.signOut(() => {
            const postLogout = async() => {
                const result = await logOut();
                if (result !== "error"){
                    setUser(null);
                    localStorage.clear();
                    localStorage.setItem("userLogged", "false");
                    callback();
                }
            };
            postLogout();
        });
    };
    const value = {user, signIn, signOut};
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};

const fakeAuthProvider = {
    isAuthenticated : false,
    signIn(callback: VoidFunction) {
        fakeAuthProvider.isAuthenticated = true;
        setTimeout(callback, 1);
    },
    signOut(callback: VoidFunction) {
        fakeAuthProvider.isAuthenticated = false;
        setTimeout(callback, 1);
    }
};
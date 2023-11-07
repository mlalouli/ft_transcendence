import { createContext, useContext } from "react";
import { AuthContextType } from "./interface";

export let AuthContext = createContext<AuthContextType>(null!);

export function useAuth(){
    return useContext(AuthContext);
}
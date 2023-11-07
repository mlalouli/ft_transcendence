import { ItableRow } from "@/global/interface";
import { getAllUsersQ } from "@/queries/userQueries";
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";


  export const SearchBar = ({ onSelect }: {onSelect : (chatPreview: ItableRow[]) => void;}) => {
    const [input, setInput] = useState<string>("");
    const [users, setUsers] = useState<ItableRow[] >([]);
    let list: ItableRow[] = [];

    useEffect(() => {
      
    
      const fetchAllUsers = async() => {
        const res = await getAllUsersQ();
        if (res !== "error")
            return res;
      };

      const fetchData = async () => {
        let fetchedUsers = await fetchAllUsers();

        if (fetchedUsers !== undefined && fetchedUsers.length !== 0)
        {            
            for (let i = 0; i < fetchedUsers.length; i++){
                let row: ItableRow = {
                    key: i,
                    userModel: {username: "", avatar: "", id: 0, status: -1}
                };
                row.userModel.id = fetchedUsers[i].id;
                row.userModel.username = fetchedUsers[i].pseudo;
              
                list.push(row);
            }
        }
        setUsers(list);       
      }
      fetchData();
    }, [])

    const findUser = (value: string) => {
      const res = users?.filter((user: ItableRow)  => {
        return (value && user && user.userModel.username.toLocaleLowerCase().includes(value.toLowerCase()))
      })
      onSelect(res);  
    }
      const handleChange =  (value: string) => {
        setInput(value);
        findUser(value);  
      };
      return (
        <div className="input-wrapper">
          <FaSearch id="search-icon" />
          <input
            style={{ color: "white" }}
            placeholder="Type to search..."
            value={input}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      );
}
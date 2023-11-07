
import { ItableRow } from '@/global/interface';
import React from 'react';
import { useNavigate } from 'react-router-dom';

  export const SearchResult = ({ result }: {result : ItableRow}) => {
    const navigate = useNavigate();
    return (
      <div
        className="search-result" style={{backgroundColor:"6F61C0",color:"white", width:"100%", height:"100%"}}
        onClick={() => navigate("/Public/" + result.userModel.id)}
      >
        {result.userModel.username}
      </div>
    );
  };
  
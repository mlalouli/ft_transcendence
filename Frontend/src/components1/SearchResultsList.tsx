import { ItableRow } from "@/global/interface";
import { SearchResult } from "./SearchResult";

interface SearchProps {
    results: { name: string }[]; // Replace "string" with the actual type of the name property
  }

  export const SearchResultsList= ({ results } : {results: ItableRow[]}) => {
  return (
    <div className="results-list" style={{backgroundColor:"white",overflow:"scroll", overflowX:"hidden", width:"60%", height:"60%", borderRadius:"0% 0 0 10%", marginTop:"35%",marginLeft:"-60%"}}>
      {results.map((result, id) => {
        return <SearchResult result={result} key={id} 
        />;
      })}
    </div>
  );
};
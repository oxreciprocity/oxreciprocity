import Row from "./row";
import { friendsData } from "./types";
import React from "react";


export default function Grid({friends, setFriends}: {friends: friendsData[], setFriends: React.Dispatch<React.SetStateAction<friendsData[]>>}){
    return (
     <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {friends.map((friend) => (
          <Row friend={friend} />
        ))}
      </div>
    );
}
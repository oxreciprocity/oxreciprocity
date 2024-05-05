import { friendsData } from "./types";
import React from "react";

export default function Row({friend}: {friend: friendsData}) {
  //Presumable any checkbox clicked should be validated (due to ratelimiting), and then update the database
  //how easy do we want to make the editing? do we need an edit button? some sort of confirmation if we are rate limiting?
    return (
        <div className="flex flex-col items-center bg-white shadow-md rounded-md p-4 m-2">
            <img src={friend.image} alt={friend.name} className="rounded-full h-32 w-32 object-cover mb-4" />
            <h2 className="text-lg font-bold mb-2 text-black">{friend.name}</h2>
            <div className="flex justify-between w-full text-black">
                <div>
                    <label>
                        Date: 
                        <input type="checkbox" checked={friend.date} className="ml-2" />
                    </label>
                </div>
                <div>
                    <label>
                        Hangout: 
                        <input type="checkbox" checked={friend.hangout} className="ml-2" />
                    </label>
                </div>
                <div>
                    <label>
                        Hookup: 
                        <input type="checkbox" checked={friend.hookup} className="ml-2" />
                    </label>
                </div>
            </div>
        </div>
    );
}

import { friendsData } from "./types";
import React from "react";

export default function Row({friend}: {friend: friendsData}) {
    return (
        <div className="flex flex-col items-center bg-white shadow-md rounded-md p-4 m-2">
            <img src={friend.image} alt={friend.name} className="rounded-full h-32 w-32 object-cover mb-4" />
            <h2 className="text-lg font-bold mb-2">{friend.name}</h2>
            <div className="flex justify-between w-full">
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

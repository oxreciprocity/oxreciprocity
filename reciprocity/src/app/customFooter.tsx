import React from "react";

export default function CustomFooter(){
    return (
        <div className="flex items-center justify-center bg-white py-5">
            <div className="flex flex-row items-center justify-center">
                <a href="/faq" className="text-sm text-blue-500 hover:underline mr-4">Frequently Asked Questions</a>
                <p className=" text-sm text-gray-500">©2024 Reciprocity. All rights reserved.</p>
            </div>
        </div>
    );
} 
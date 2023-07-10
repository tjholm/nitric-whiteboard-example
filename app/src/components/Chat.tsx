import React from "react";

interface Props {

}

export const Chat: React.FC<Props> = () => {
    return (
        <div className="w-full flex flex-col">
            <span>Chat</span>
            <ul className="grow">

            </ul>
            <input 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-end" 
                id="username" type="text" placeholder="Send Message...">
            </input>
        </div>
    );
};
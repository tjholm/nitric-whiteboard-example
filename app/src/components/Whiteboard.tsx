import React from "react";

interface Props {

}


export const Whiteboard: React.FC<Props> = () => {
    return (
        <div className="relative w-full">
            <input className='rounded absolute top-0 right-0' type='color' value="#e66465" />

            Whiteboard Component
        </div>
    );
};
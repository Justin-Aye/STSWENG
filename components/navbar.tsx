

import Link from "next/link";
import React from "react";

export default function Navbar() {
    return (
        <div className="w-full h-20 bg-nav_bg flex px-10 drop-shadow-lg shadow-sm text-white">
            <div className="my-auto">
                <Link href="/" className="hover:text-violet-800">Image Here</Link>
            </div>

            <input className="ml-auto my-auto h-14 w-[300px] p-5 rounded-[20px]" 
                onKeyDown={(e) => {
                    console.log(e.key)
                }} 
            type="text" placeholder="Search..."/>

            <div className="ml-auto flex gap-5">
                <div className="my-auto">
                    <Link href="/signup" className="hover:text-violet-400">Signup</Link>
                </div>

                <div className="my-auto">
                    <Link href="/login" className="hover:text-violet-400">Login</Link>
                </div>
            </div>
        </div>
    )
}

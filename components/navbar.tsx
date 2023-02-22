

import Link from "next/link";
import { auth } from "@/firebaseConfig";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Navbar() {

    const router = useRouter();
    const [currUser, setUser] = useState(false)

    function logout(){
        auth.signOut().then(() => {
            setUser(false)
            router.push("/login")
        }).catch((error) => {
            console.log(error)
        })
    }

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if(user)
                setUser(true)
        })
    }, [currUser])

    return (
        <div className="w-full h-20 bg-nav_bg flex px-10 drop-shadow-lg shadow-sm text-white">
            <div className="my-auto w-1/4">
                <Link href="/" className="hover:text-violet-800">Image Here</Link>
            </div>

            <div className="mx-auto my-auto w-1/2 flex justify-end">
                <input className="my-auto h-14 w-1/2 p-5 rounded-sm text-black focus:outline-blue-100" 
                    onKeyDown={(e) => {
                        console.log(e.key)
                    }} type="text" placeholder="Search..."/>
            </div>
            
            <div className="ml-auto flex gap-5 w-1/4 justify-end">
                <div className={`my-auto ${currUser ? "hidden" : ""}`}>
                    <Link href="/signup" className="hover:text-violet-400">Signup</Link>
                </div>

                <div className={`my-auto ${currUser ? "hidden" : ""}`}>
                    <Link href="/login" className="hover:text-violet-400">Login</Link>
                </div>

                <div className={`my-auto ${currUser ? "" : "hidden"}`}>
                    <p className="hover:text-violet-400 cursor-pointer" onClick={() => logout()}>Logout</p>
                </div>
            </div>
        </div>
    )
}

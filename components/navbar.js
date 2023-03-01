

import Link from "next/link";
import { auth } from "../firebaseConfig";

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
        <div className="w-full h-20 bg-nav_bg flex px-10 drop-shadow-lg shadow-sm text-white" data-testid="nav_container">
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
                { !currUser && 
                    <div className="my-auto" data-testid="signup_link">
                        <Link href="/signup" className="hover:text-violet-400">Signup</Link>
                    </div>
                }

                { !currUser && 
                    <div className="my-auto" data-testid="login_link">
                        <Link href="/login" className="hover:text-violet-400">Login</Link>
                    </div>
                }
                
                { currUser && 
                    <div className="my-auto">
                        <p className="hover:text-violet-400 cursor-pointer" onClick={() => logout()}>Logout</p>
                    </div>
                } 
            </div>
        </div>
    )
}

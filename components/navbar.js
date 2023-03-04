
import Link from "next/link";
import Image from "next/image";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Navbar() {

    const router = useRouter();
    const [currUser, setUser] = useState(false)
    const [currName, setName] = useState("")

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

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                const docRef = doc(db, "users", auth.currentUser.uid);
                onSnapshot(docRef, (doc) => {
                    setName(doc.data().displayName);
                })
                
            }
        })
    }, [currName])

    function handlePost(){
        auth.onAuthStateChanged((user) => {
            if(!user)
                router.push("/login")
        })
    }

    return (
        <div className="w-full h-20 bg-nav_bg flex px-10 drop-shadow-lg shadow-sm text-white sticky top-0 z-50"
                data-testid="nav_container">

            <div className="my-auto w-1/4">
                <Link href="/" className="hover:transition duration-300 hover:text-violet-800 w-fit flex items-center">
                    <Image src={"/images/logo.png"} width={50} height={50} />
                    <span className="w-fit px-2 text-[32px] font-logo">FaceGram</span>
                </Link>
            </div>
            

            <div className="mx-auto my-auto w-2/3 flex justify-end">
                <input className="my-auto h-12 w-1/2 px-5 rounded-full text-black focus:outline-blue-100" 
                    onKeyDown={(e) => {
                        console.log(e.key)
                    }} type="text" placeholder="Search..."/>
            </div>
            
            <div className="ml-auto flex gap-5 w-1/4 justify-end">
                <div className={`my-auto flex items-center ${currUser ? "" : "hidden"}`} >
                    <div className="hover:transition duration-300 hover:text-violet-800 cursor-pointer flex items-center"
                        onClick={() => handlePost()}>
                        <i className="fa fa-plus-circle text-[24px] pr-2" />
                        <span>New Post</span>
                    </div>
                    
                </div>

                <span className={`mx-3 text-[24px] m-auto ${currUser ? "" : "hidden"}`}>|</span>
                

                <div className={`my-auto ${currUser ? "hidden" : ""}`} data-testid="signup_link">
                    <Link href="/signup" className="hover:transition duration-300 hover:text-violet-800">Signup</Link>
                </div>

                <div className={`my-auto ${currUser ? "hidden" : ""}`} data-testid="login_link">
                    <Link href="/login" className="hover:transition duration-300 hover:text-violet-800">Login</Link>
                </div>

                <div className={`my-auto ${currUser ? "" : "hidden"}`}>
                <Link href={`/profile/${currName}`} className="hover:transition duration-300 hover:text-violet-800"> {currName} </Link>
                </div>

                <div className={`my-auto ${currUser ? "" : "hidden"}`}>
                    <p className="hover:transition duration-300 hover:text-violet-800 cursor-pointer" onClick={() => logout()}>Logout</p>
                </div>
            </div>
        </div>
    )
}

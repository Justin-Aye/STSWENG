import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

export default function Navbar() {
    const router = useRouter();
    const [currUser, setUser] = useState(null);
    const [currName, setName] = useState("");
    
    const [ isAdmin, setAdmin ] = useState(false)
    const [searchInput, setSearch] = useState("");

    function logout(){
        auth.signOut().then(() => {
            setUser(null);
            router.push("/login");
        }).catch((error) => {
            console.log(error);
        })
    }

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(auth.currentUser.uid);
                const docRef = doc(db, "users", auth.currentUser.uid);
                onSnapshot(docRef, (doc) => {
                    setName(doc.data().displayName);
                })

                getDoc(doc(db, "administrators", "Admin_List")).then((doc) => {
                    var data = doc.data()
                    setAdmin(data.admins.includes(user.uid))
                }).catch((error) => {
                    console.log(error)
                    setAdmin(false)
                })
            }
        })
    }, [])

    function handlePost(){
        auth.onAuthStateChanged((user) => {
            if(!user)
                router.push("/login")
        })
    }

    function handleSearch(e) {
        if (currUser) {
            if (searchInput.trim() != "" && !searchInput.startsWith(".") && !searchInput.includes("/")) {
                console.log(searchInput)
                e.preventDefault();
                router.push(`/search/${searchInput}`);
            }
        }
    }

    return (
        <div className="w-full h-20 bg-nav_bg px-10 drop-shadow-md shadow-sm text-white sticky top-0 z-50
                        grid grid-flow-col auto-col-max"
                data-testid="nav_container">

            <div className="my-auto w-fit">
                <Link href="/" className="hover:transition duration-300 hover:text-violet-800 w-fit flex items-center">
                    <Image src={"/images/logo.png"} width={50} height={50} alt="FaceGram logo" />
                    <span className="w-fit px-2 text-[32px] font-logo">FaceGram</span>
                </Link>
            </div>
            

            <div className="hidden md:flex mx-auto my-auto w-full justify-end col-span-3">
                <input className="my-auto h-12 w-1/2 px-5 rounded-full text-black focus:outline-blue-100" 
                    onChange={(e) => setSearch(e.target.value)} 
                    onKeyDown={(e) => {e.key == 'Enter' ? handleSearch(e) : ""}} 
                    type="text" size="75" placeholder="Search..."/>
            </div>

            <div className="ml-auto pl-3 flex gap-5 w-fit justify-end">
                <div className={`my-auto flex items-center ${currUser ? "" : "hidden"}`} >
                    <div className="hover:transition duration-300 hover:text-violet-800 cursor-pointer flex items-center"
                        onClick={() => handlePost()}>
                        <i className="fa fa-plus-circle text-[24px] pr-2" />
                        <Link href="/addpost">New Post</Link>
                    </div>
                    
                </div>

                <span className={`mx-3 text-[24px] m-auto ${currUser ? "" : "hidden"}`}>|</span>
                

                <div className={`my-auto ${currUser ? "hidden" : ""}`} data-testid="signup_link">
                    <Link href="/signup" className="hover:transition duration-300 hover:text-violet-800">Sign Up</Link>
                </div>

                <div className={`my-auto ${currUser ? "hidden" : ""}`} data-testid="login_link">
                    <Link href="/login" className="hover:transition duration-300 hover:text-violet-800">Login</Link>
                </div>

                <div className={`my-auto ${currUser ? "" : "hidden"}`}>
                    <a href={`/profile/${currUser}`}  className="hover:transition duration-300 hover:text-violet-800"> {currName} </a>
                </div>
                
                {
                    currUser && isAdmin &&
                    <>
                        <span className={`mx-3 text-[24px] m-auto`}>|</span>
                        <div className={`my-auto`}>
                            <Link href={`/profile/${currUser}/admin`} className="hover:transition duration-300 hover:text-violet-800"> Admin Dashboard </Link>
                        </div>
                        <span className={`mx-3 text-[24px] m-auto`}>|</span>    
                    </>
                }
                
                <div className={`my-auto ${currUser ? "" : "hidden"}`}>
                    <p className="hover:transition duration-300 hover:text-violet-800 cursor-pointer" onClick={() => logout()}>Logout</p>
                </div>
                
            </div>
        </div>
    )
}

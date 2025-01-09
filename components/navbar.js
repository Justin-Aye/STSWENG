import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { FiMenu } from "react-icons/fi";

export default function Navbar() {
    const router = useRouter();
    const [currUser, setUser] = useState(null);
    const [currName, setName] = useState("");
    
    const [ isAdmin, setAdmin ] = useState(false)
    const [searchInput, setSearch] = useState("");

    const [ mobileMenuOpen, setMobileMenuOpen ] = useState(false);

    function logout(){
        auth.signOut().then(() => {
            setUser(null);
            router.push("/login");
        }).catch((error) => {
            console.log(error);
        })
    }

    useEffect(() => {
        auth.onAuthStateChanged(async (user) => {
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
            if (searchInput.trim().length > 0 && !searchInput.startsWith(".") && !searchInput.includes("/")) {
                console.log(searchInput)
                e.preventDefault();
                router.push(`/search/${searchInput}`);
            }
        }
    }

    return (
        <nav className="w-full px-4 h-20 bg-nav-bg drop-shadow-md shadow-sm text-white sticky top-0 z-50" data-testid="nav_container">
          <div className="mx-auto max-w-screen-xl h-full flex flex-row items-center justify-between">

            <Link href="/" className="transition duration-100 hover:text-violet-800 h-full gap-2 flex items-center">
                <Image src={"/images/logo.png"} width={50} height={50} alt="FaceGram logo" />
                <span className="hidden lg:block text-4xl font-logo">FaceGram</span>
            </Link>
            
            {/* Search */}
            <div className="hidden md:block">
                <input className="my-auto max-w-sm px-5 h-12 rounded-full text-black focus:ring-blue-100 focus:outline-blue-200" 
                    onChange={(e) => setSearch(e.target.value)} 
                    onKeyDown={(e) => {e.key == 'Enter' ? handleSearch(e) : ""}} 
                    type="text" placeholder="Search..."/>
            </div>
            
            {/* Nav Links */}
            <div className="h-full hidden md:flex items-center gap-6">
                <div className={`my-auto flex items-center ${currUser ? "" : "hidden"}`} >
                    <div className="transition duration-100 hover:text-violet-800 cursor-pointer flex items-center" onClick={() => handlePost()}>
                        <i className="fa fa-plus-circle text-[24px] pr-2" />
                        <Link href="/addpost">New Post</Link>
                    </div>
                </div>

                {currUser ?
                    <>
                        <Link href={`/profile/${currUser}`}  className="transition duration-100 hover:text-violet-800"> {currName} </Link>
                    </>
                    :
                    <>
                        <Link data-testid="signup_link" href="/signup" className="transition duration-100 hover:text-violet-800">Sign Up</Link>
                        <Link data-testid="login_link" href="/login" className="transition duration-100 hover:text-violet-800">Login</Link>
                    </>
                }
                
                {currUser && isAdmin &&
                    <>
                        <Link href={`/profile/${currUser}/admin`} className="transition duration-100 hover:text-violet-800"> Admin Dashboard </Link>
                    </>
                }
                
                <div className={`my-auto ${currUser ? "" : "hidden"}`}>
                    <p className="transition duration-100 hover:text-violet-800 cursor-pointer" onClick={() => logout()}>Logout</p>
                </div>
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen((prev) => !prev)}>
              <FiMenu className={`my-auto w-6 h-6 transition duration-100 hover:text-violet-800 ${mobileMenuOpen ? 'text-violet-800' : 'text-white'}`} />
            </button>

            {/* Mobile Nav Links & Search */}
            <div id="mobile-menu" className={`bg-nav-bg z-10 left-0 top-20 absolute ${mobileMenuOpen ? 'flex' : 'hidden'} flex-col items-center w-full md:hidden`}>
                <div className="w-full px-4 py-2">
                    <input className="w-full px-5 h-12 rounded-full text-black focus:ring-blue-100 focus:outline-blue-200" 
                        onChange={(e) => setSearch(e.target.value)} 
                        onKeyDown={(e) => {e.key == 'Enter' ? handleSearch(e) : ""}} 
                        type="text" placeholder="Search..."/>
                </div>

                <div className={`transition duration-100 hover:text-violet-800 hover:bg-gray-50 w-full flex justify-center items-center text-lg p-4  ${currUser ? "" : "hidden"}`} onClick={() => handlePost()}>
                    <i className="fa fa-plus-circle text-[24px] pr-2" />
                    <Link href="/addpost">New Post</Link>
                </div>
                {currUser ?
                    <>
                        <Link href={`/profile/${currUser}`}  className="transition duration-100 hover:text-violet-800 hover:bg-gray-50 w-full flex justify-center text-lg p-4"> {currName} </Link>
                    </>
                    :
                    <>
                        <Link data-testid="signup_link" href="/signup" className="transition duration-100 hover:text-violet-800 hover:bg-gray-50 w-full flex justify-center text-lg p-4">Sign Up</Link>
                        <Link data-testid="login_link" href="/login" className="transition duration-100 hover:text-violet-800 hover:bg-gray-50 w-full flex justify-center text-lg p-4">Login</Link>
                    </> 
                }
                {currUser && isAdmin &&
                    <>
                        <Link href={`/profile/${currUser}/admin`} className="transition duration-100 hover:text-violet-800 hover:bg-gray-50 w-full flex justify-center text-lg p-4"> Admin Dashboard </Link>
                    </>
                }
            </div>

          </div>
        </nav>
    )
}

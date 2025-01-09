

import React, { useEffect, useState } from "react";

import { addDoc, collection, setDoc, doc, query, where, getDocs } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";


export default function Signup(){

    const [email, setEmail] = useState("")
    const [password, setPass] = useState("")
    const [repeatPassword, setRepPass] = useState("")

    const [errorExists, setErrorExists] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [samePass, setSamePass] = useState(true)

    const router = useRouter()
    const [ loading, setLoading ] = useState(true)

    function handleSubmit(e){
        e.preventDefault();
        if(password != repeatPassword)
            setSamePass(false);
        else {
            setSamePass(true)
            createUserWithEmailAndPassword(auth, email, password)
            .then( (userCredential) => {
                const user = userCredential.user;
                try {
                    setDoc( doc(db, "users", user.uid), {
                        email: email,
                        profPic: "https://firebasestorage.googleapis.com/v0/b/practice-a80a2.appspot.com/o/images%2Fuser_icon.png?alt=media&token=0958e30c-dd7c-4feb-81ed-9ea1f0c3a948",
                        commentIDs: [],
                        postsID: [],
                        liked: [],
                        disliked: [],
                        followers: [],
                        following: [],
                        displayName: email,
                        lowerCaseDisplayName: email.toLowerCase(),
                        bio: ""
                    }).then(() => {
                        console.log("User has been added")
                    }).catch((error) => {
                        console.log(error)
                    })
                } catch (error) {
                    console.log(error)
                }
            })
            .catch((error) => {
                const errorCode = error.code
                setErrorExists(true)
                setErrorMessage(error.message);
                
            });
        }
    }

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if(user)
                router.push("/")
            else
                setLoading(false)
        })
    })

    if(loading){
        return (
            <div className="w-[100px] h-[100px] mx-auto mb-5 relative justify-center">
                <Image src={"/images/loading.gif"} alt={""} fill sizes="(max-width: 500px)"/>
            </div>
        )
    }

    return (
        <section className='bg-signup-page bg-no-repeat bg-cover bg-fixed w-full h-screen'>
            <div className="mx-auto h-full flex flex-col py-16 justify-center items-center max-w-screen-xl px-4">
                <div className="mb-8">
                    <h1 className="text-center text-3xl md:text-5xl font-logo text-white" data-testid="page_title">SIGN UP</h1>
                </div>
                
                <div className="flex flex-col mx-auto sm:max-w-sm h-auto rounded-xl bg-white shadow-lg">
                    <form className="flex flex-col mx-auto w-full p-8 rounded-xl" data-testid="form" onSubmit={(e) => { handleSubmit(e) }}>
                        <div className="grid grid-cols-1 mb-8">
                            <label className="text-lg" htmlFor="email">Email</label>
                            <input className="border border-black rounded-md p-2" placeholder="sample@email.com" type="email" name="email" id="email" onChange={(e) => setEmail(e.target.value) } data-testid="email_input" required/>
                        </div>

                        <div className="grid grid-cols-1 mb-8">
                            <label className="text-lg" htmlFor="email">Password</label>
                            <input className="border border-black rounded-md p-2" placeholder="Password..." type="password" name="password" id="password" onChange={(e) => setPass(e.target.value) } data-testid="pass_input" required minLength={6} maxLength={16}/>
                        </div>
                        
                        <div className="grid grid-cols-1 mb-8">
                            <label className="text-lg" htmlFor="email">Confirm Password</label>
                            <input className="border border-black rounded-md p-2" placeholder="Re-enter Password..." type="password" name="rep_pass" id="rep_pass" onChange={(e) => setRepPass(e.target.value) } data-testid="rep_pass_input" required minLength={6} maxLength={16}/>
                        </div>
                        
                        <button className="mb-4 py-2 rounded-[20px] bg-nav-bg uppercase text-white transition duration-100 hover:bg-nav-bg-dark" type="submit" data-testid="submit_btn">
                            Sign Up
                        </button>
                        
                        <span className={`${errorExists ? "" : "hidden"} mb-4 text-center text-red-500`} id='email-error'>{errorMessage}</span>
                        <span className={`${samePass ? "hidden" : ""} mb-4 text-center text-red-500`} id='password-error'>Passwords do not match</span>

                        <div className="text-center">
                            <span className='pr-1'>Already have an account?</span>
                            <Link href="/login" className="text-violet-600 transition duration-100 hover:text-violet-800 hover:underline">Login</Link>
                        </div>   
                    </form>
                </div>
            </div>
        </section>
    )
}
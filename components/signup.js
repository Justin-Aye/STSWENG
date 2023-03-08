

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

    const [emailExists, setEmailExists] = useState(false)
    const [samePass, setSamePass] = useState(true)

    const router = useRouter()
    const [ loading, setLoading ] = useState(true)

    function handleSubmit(){
        if(password != repeatPassword)
            setSamePass(false)

        if(samePass)
            createUserWithEmailAndPassword(auth, email, password)
            .then( (userCredential) => {
                const user = userCredential.user;
                try {
                    setDoc( doc(db, "users", user.uid), {
                        email: email,
                        profPic: "https://firebasestorage.googleapis.com/v0/b/practice-a80a2.appspot.com/o/images%2Fuser_icon.png?alt=media&token=0958e30c-dd7c-4feb-81ed-9ea1f0c3a948",
                        commentIDs: [],
                        liked: [],
                        disliked: [],
                        displayName: email.substring(0, email.indexOf("@")),
                        bio: ""
                    }).then(() => {
                        console.log("User has been added")
                    })
                } catch (error) {
                    console.log(error)
                }
            })
            .catch((error) => {
                const errorCode = error.code
                const errorMessage = error.message

                setEmailExists(true)
                
                console.log(error)
            });
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
        <div className='bg-signup_page bg-no-repeat bg-cover bg-fixed w-full h-screen'>
            <div className="flex flex-col p-10">
                <h1 className="mx-auto mb-8 text-[32px] font-logo text-white" data-testid="page_title">SIGN UP</h1>
                
                <div className="flex flex-col mx-auto w-2/5 h-auto py-5 rounded-xl bg-white shadow-lg opacity-90">

                    <form className="flex flex-col mx-auto w-full py-5 rounded-xl" data-testid="form">
                        
                        <div className='grid grid-flow-col auto-col-max w-2/3 mx-auto mt-4'>
                            <label className="w-fit font-bold text-left ml-1" htmlFor="email">Email:</label>
                            <span className={`${emailExists ? "" : "hidden"} text-red-500 text-right mr-1`} id='email-error'>Error: Invalid Email / Email already taken</span>
                        </div>
                        <input className="w-2/3 h-10 mx-auto mb-8 border border-black rounded-md px-2" placeholder="Email..." type="text" name="email" id="email" 
                            onChange={(e) => setEmail(e.target.value) } data-testid="email_input" required
                        />

                        <label className="w-2/3 mx-auto font-bold" htmlFor="email">Password:</label>
                        <input className="w-2/3 h-10 mx-auto mb-8 border border-black rounded-md px-2" placeholder="Password..." type="password" name="password" id="password" 
                            onChange={(e) => setPass(e.target.value) } data-testid="pass_input" required
                        />
                        
                        <div className='grid grid-flow-col auto-col-max w-2/3 mx-auto'>
                            <label className="w-fit font-bold text-left ml-1" htmlFor="email">Re-enter Password:</label>
                            <span className={`${samePass ? "hidden" : ""} text-red-500 text-right mr-1`} id='password-error'>Error: Passwords do not match</span>
                        </div>
                        <input className="w-2/3 h-10 mx-auto mb-8 border border-black rounded-md px-2" placeholder="Re-enter Password..." type="password" name="rep_pass" id="rep_pass" 
                            onChange={(e) => setRepPass(e.target.value) } data-testid="rep_pass_input" required
                        />
                    </form>
                
                    <button className="w-1/3 mx-auto mb-8 py-2 rounded-[20px] bg-nav_bg font-bold text-white
                                        hover:transition duration-300 hover:bg-nav_bg_dark" type="submit" onClick={() => handleSubmit()} data-testid="submit_btn">
                        SIGN UP
                    </button>

                    <div className='flex justify-center py-2'>
                        <span className='pr-1'>Already have an account?</span>
                        <Link href="/login" className="hover:transition duration-300 hover:text-violet-800 hover:underline">Login</Link>
                    </div>   
                </div>
            </div>
        </div>
    )
}
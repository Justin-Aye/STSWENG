
import React from "react";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Login(){

    const router = useRouter();
    const [ loading, setLoading ] = useState(true)

    const [email, setEmail] = useState("");
    const [password, setPass] = useState("");

    const [wrongCred, setWrongCred] = useState(false);

    function handleSubmit(){
        signInWithEmailAndPassword(auth, email, password)
        .then((user) => {
            router.push("/")
        })
        .catch((error) => {
            setWrongCred(true)
            console.log(error)
        })
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
        <div className='bg-login_page bg-no-repeat bg-cover bg-fixed w-full h-screen'>
            <div className="flex flex-col p-10">
                <h1 className="mx-auto mb-8 text-[32px] font-logo text-white" data-testid="page_title">LOGIN</h1>
                
                
                <div className="flex flex-col mx-auto w-2/5 h-auto py-5 rounded-xl bg-white shadow-lg opacity-90">

                    <p className={`${wrongCred ? "" : "invisible"} text-red-500 mx-auto mt-5`}>Incorrect Email or Password</p>

                    <form className="flex flex-col mx-auto w-full rounded-xl" data-testid="form"
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSubmit()
                        }}
                    >
                        
                        <label className="w-2/3 mx-auto mt-5 font-bold" htmlFor="email">Email:</label>
                        <input className="w-2/3 h-10 mx-auto mb-10 border border-black rounded-md px-2" placeholder="Email..." type="text" name="email" id="email" 
                            onChange={(e) => setEmail(e.target.value) } required onKeyDown={(e) => {e.key == 'enter' ? handleSubmit() : ""}} data-testid="email_input" 
                        />

                        <label className="w-2/3 mx-auto font-bold" htmlFor="email">Password:</label>
                        <input className="w-2/3 h-10 mx-auto mb-10 border border-black rounded-md px-2" placeholder="Password..." type="password" name="password" id="password" 
                            onChange={(e) => setPass(e.target.value) } required onKeyDown={(e) => {e.key == 'enter' ? handleSubmit() : ""}} data-testid="pass_input" 
                        />
                        
                        <button className="w-1/3 mx-auto mb-8 py-2 rounded-[20px] bg-nav_bg font-bold text-white hover:transition duration-300 hover:bg-nav_bg_dark" 
                            data-testid="submit_btn">
                            LOGIN
                        </button>
                    </form>

                    <div className='flex justify-center py-2'>
                        <span className='pr-1'>Don't have an account yet?</span>
                        <Link href="/signup" className="hover:transition duration-300 hover:text-violet-800 hover:underline">Sign Up</Link>
                    </div>   
                </div>
            </div>
        </div>
    )
}
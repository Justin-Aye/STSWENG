
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
        e.preventDefault();
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
        <section className='bg-login-page bg-no-repeat bg-cover bg-fixed w-full h-screen'>
            <div className="mx-auto h-full flex flex-col py-16 justify-center items-center max-w-screen-xl px-4">
                <div className="mb-8">
                  <h1 className="text-center text-3xl md:text-5xl font-logo text-white" data-testid="page_title">LOGIN</h1>
                </div>
                
                <div className="flex flex-col mx-auto sm:max-w-sm h-auto rounded-xl bg-white shadow-lg">
                    <form className="flex flex-col mx-auto w-full p-8 rounded-xl" data-testid="form" onSubmit={(e) => { handleSubmit(e) }}>
                        <div className="grid grid-cols-1 mb-8">
                            <label className="text-lg" htmlFor="email">Email</label>
                            <input className="border border-black rounded-md p-2" placeholder="sample@email.com" type="text" name="email" id="email" onChange={(e) => setEmail(e.target.value) } required onKeyDown={(e) => {e.key == 'enter' ? handleSubmit() : ""}} data-testid="email_input" />
                        </div>
                        
                        <div className="grid grid-cols-1 mb-8">
                            <label className="text-lg" htmlFor="email">Password</label>
                            <input className="border border-black rounded-md p-2" placeholder="Password..." type="password" name="password" id="password" onChange={(e) => setPass(e.target.value) } required onKeyDown={(e) => {e.key == 'enter' ? handleSubmit() : ""}} data-testid="pass_input" />
                        </div>

                        <button className="mb-4 py-2 rounded-[20px] bg-nav-bg uppercase text-white transition duration-100 hover:bg-nav-bg-dark" data-testid="submit_btn">
                            LOGIN
                        </button>

                        <span className={`${wrongCred ? "" : "hidden"} mb-4 text-center text-red-500`}>Incorrect Email or Password</span>

                        <div className="text-center">
                            <span className="pr-1">Don&apos;t have an account yet?</span>
                            <Link href="/signup" className="text-violet-600 transition duration-100 hover:text-violet-800 hover:underline">Sign Up</Link>
                        </div>   
                    </form>
                </div>
            </div>
        </section>
    )
}
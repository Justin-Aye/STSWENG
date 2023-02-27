
import React from "react";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useRouter } from "next/router";

export default function Login(){

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPass] = useState("");

    const [wrongCred, setWrongCred] = useState(false);

    function handleSubmit(){
        console.log("Form Submitted")

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
        })
    })

    return (
        <div className="flex flex-col p-10">
            <h1 className="mx-auto mb-10" data-testid="page_title">Login page</h1>
            
            <div className="flex flex-col mx-auto w-2/5 h-auto py-5 rounded-xl bg-white shadow-lg">
                <p className={`${wrongCred ? "" : "hidden"} text-red-500 mx-auto`}>Incorrect Email or Password</p>

                <form className="flex flex-col mx-auto w-full h-[400px] py-5 rounded-xl">
                    
                    <label className="w-2/3 mx-auto mt-10" htmlFor="email">Email:</label>
                    <input className="w-2/3 h-10 mx-auto mb-10 border border-black rounded-md px-2" placeholder="Email..." type="text" name="email" id="email" 
                        onChange={(e) => setEmail(e.target.value) } required onKeyDown={(e) => {e.key == 'enter' ? handleSubmit() : ""}} data-testid="email_input" 
                    />

                    <label className="w-2/3 mx-auto" htmlFor="email">Password:</label>
                    <input className="w-2/3 h-10 mx-auto mb-10 border border-black rounded-md px-2" placeholder="Password..." type="password" name="password" id="password" 
                        onChange={(e) => setPass(e.target.value) } required onKeyDown={(e) => {e.key == 'enter' ? handleSubmit() : ""}} data-testid="pass_input" 
                    />
                    
                </form>
            
                <button className="w-1/3 mx-auto mb-10 py-2 rounded-[20px] bg-slate-200" type="submit" data-testid="submit_btn" 
                    onClick={() => handleSubmit()}>Submit</button>
            </div>
        </div>
    )
}
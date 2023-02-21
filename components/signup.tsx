

import React from "react";
import { useState } from "react";

import { addDoc, collection, setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "firebaseConfig";

export default function Signup(){

    function handleSubmit(){
        console.log("Form Submitted")

        if(password != repeatPassword)
            setSamePass(false)

        createUserWithEmailAndPassword(auth, email, password)
        .then( (userCredential) => {
            
            const user = userCredential.user;
            try {
                setDoc( doc(db, "users", user.uid), {
                    email: email,
                    profPic: "",
                    commentIDs: [],
                    liked: [],
                    disliked: []
                })
            } catch (error) {
                console.log(error)
            }
        })
        .catch((error) => {
            const errorCode = error.code
            const errorMessage = error.message
            console.log(error)
        });
    }

    const [email, setEmail] = useState("");
    const [password, setPass] = useState("");
    const [repeatPassword, setRepPass] = useState("");

    const [emailExists, setEmailExists] = useState(false);
    const [samePass, setSamePass] = useState(true);

    return (
        <div className="flex flex-col p-10">
            <h1 className="mx-auto mb-10">Signup page</h1>
            
            <div className="flex flex-col mx-auto w-2/5 h-auto py-5 rounded-xl bg-white shadow-lg">

                <form className="flex flex-col mx-auto w-full h-[400px] py-5 rounded-xl">
                    
                    <p className={`${emailExists ? "" : "hidden"} text-red-500 mx-auto`}>Error: Email already taken</p>
                    <label className="w-2/3 mx-auto mt-10" htmlFor="email">Email:</label>
                    <input className="w-2/3 h-10 mx-auto mb-10 border border-black rounded-md px-2" placeholder="Email..." type="text" name="email" id="email" 
                        onChange={(e) => setEmail(e.target.value) } required
                    />

                    <label className="w-2/3 mx-auto" htmlFor="email">Password:</label>
                    <input className="w-2/3 h-10 mx-auto mb-10 border border-black rounded-md px-2" placeholder="Password..." type="password" name="password" id="password" 
                        onChange={(e) => setPass(e.target.value) } required
                    />
                    
                    <p className={`${samePass ? "hidden" : ""} text-red-500 mx-auto`}>Error: Passwords do not match</p>
                    <label className="w-2/3 mx-auto" htmlFor="email">Re-enter Password:</label>
                    <input className="w-2/3 h-10 mx-auto border border-black rounded-md px-2" placeholder="Re-enter Password..." type="password" name="rep_pass" id="rep_pass" 
                        onChange={(e) => setRepPass(e.target.value) } required
                    />
                </form>
            
                <button className="w-1/3 mx-auto mb-10 py-2 rounded-[20px] bg-slate-200" type="submit" onClick={() => handleSubmit()}>Submit</button>
            </div>
        </div>
    )
}
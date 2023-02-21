
import React from "react";

export default function Login(){

    function handleSubmit(){
        console.log("Form Submitted")
    }

    return (
        <div className="flex flex-col p-10">
            <h1 className="mx-auto mb-10">Login page</h1>
            
            <form className="flex flex-col mx-auto w-2/5 h-[400px] py-5 rounded-xl bg-white shadow-lg" onSubmit={() => handleSubmit()}>
                
                <label className="w-2/3 mx-auto mt-10" htmlFor="email">Email:</label>
                <input className="w-2/3 h-10 mx-auto mb-10 border border-black rounded-md px-2" placeholder="Email..." type="text" name="email" id="email" />

                <label className="w-2/3 mx-auto" htmlFor="email">Password:</label>
                <input className="w-2/3 h-10 mx-auto mb-10 border border-black rounded-md px-2" placeholder="Password..." type="text" name="email" id="email" />

                <button className="w-1/3 mx-auto py-2 rounded-[20px] bg-slate-200" type="submit">Submit</button>
            </form>
        </div>
    )
}
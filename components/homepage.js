
import React from "react";
import Card from "./card";
import { useRouter } from "next/router";
import { auth } from "../firebaseConfig";

export default function Homepage() {

    // Data holders
    var Username="Username"
    var Caption="Best Image" 
    var ImageSrc="/images/mountain.jpg" 
    var Profpic="/images/user_icon.png"

    const router = useRouter()

    function handlePost(){
        auth.onAuthStateChanged((user) => {
            if(!user)
                router.push("/login")
        })
    }

    return (
        <div className="text-center mt-5">
            <div className="mb-5 w-1/4 mx-auto bg-[#4487d4] rounded-lg py-2 cursor-pointer hover:brightness-90"
                onClick={() => handlePost()}
            >
                <p className="text-[20px] text-white">POST AN IMAGE</p>
            </div>
            
            <Card username={Username} caption={Caption} imageSrc={ImageSrc} profpic={Profpic}/>
            <Card username={Username} caption={Caption} imageSrc={ImageSrc} profpic={Profpic}/>
            <Card username={Username} caption={Caption} imageSrc={ImageSrc} profpic={Profpic} />
        </div>
    )
}
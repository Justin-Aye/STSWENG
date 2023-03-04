
import React from "react";
import Card from "./card";
import { useRouter } from "next/router";
import Image from "next/image";
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
        <div className="text-center mt-0 flex">
            {/* <div className="bg-feed_bg w-4/5 self-center pt-8"> //use this if we add extra stuff on the right of feed */}
            <div className="bg-doc_bg w-full self-center pt-8"> 
                <div className="mb-5 w-2/5 mx-auto bg-nav_bg rounded-full py-2 px-5 cursor-pointer hover:transition duration-300
                                 hover:bg-nav_bg_dark flex justify-center items-center"
                    onClick={() => handlePost()}
                >
                    <img src="/images/add_image_icon_w.png" className="w-[60px] h-[51px]" />
                    <span className="text-[20px] text-white w-fit h-fit">Create New Post</span>
                </div>
                
                {/* TODO: Auto-load posts from DB */}
                <Card username={Username} caption={Caption} imageSrc={ImageSrc} profpic={Profpic}/>
                <Card username={Username} caption={Caption} imageSrc={ImageSrc} profpic={Profpic}/>
                <Card username={Username} caption={Caption} imageSrc={ImageSrc} profpic={Profpic} />
            </div>
        </div>
    )
}
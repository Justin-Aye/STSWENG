
import { HiThumbUp, HiThumbDown } from "react-icons/hi";
import React from "react";
import Image from "next/image";

export default function Card( { username, imageSrc, caption, profpic } ) {

    var hasVoted = false;



    return (
        <div className="mx-auto mb-28 w-2/5 h-1/2 min-h-[500px] bg-card_bg rounded-lg p-5 shadow-lg drop-shadow-md">

            <div className="flex mb-5 gap-5" data-testid="user_container">
                <img className="w-[50px] h-[50px] rounded-[50%]" src={profpic} alt="" />
                <p className="my-auto text-left font-bold text-[20px]">{username}</p>
            </div>
            
            <div className="w-full h-full min-h-[400px] mb-5 relative" data-testid="image">
                <Image className="rounded-lg object-cover" src={imageSrc} alt={""} fill/>    
            </div>
            
            {/* <img className="rounded-lg w-fit mb-5" src={imageSrc} alt="" data-testid="image" /> */}
            
            <div className="flex gap-5 mb-5" data-testid="buttons_container">
                <div className="flex gap-1">
                    <HiThumbUp className={`text-[30px] cursor-pointer rounded-lg align-middle ${hasVoted ? "text-green-500" : "text-gray-800"} hover:opacity-75`}/>
                    <p className="my-auto">100k</p>
                </div>
                
                <div className="flex gap-1">
                    <HiThumbDown className={`text-[30px] cursor-pointer rounded-lg align-middle ${hasVoted ? "text-red-500" : "text-gray-800"} hover:opacity-75`}/>
                    <p className="my-auto">100k</p>
                </div>
                
            </div>
            <p className="mb-5 text-left" data-testid="caption">{caption}</p>

            <div className="flex-col w-full">
                <p className="px-5 py-2 w-full text-left brightness-95 hover:brightness-90 cursor-pointer bg-card_bg rounded-lg select-none">
                    <i class="fa fa-comment pr-2" />Comments ...
                </p>

                <div className="flex flex-col mt-5">
                    <div className="flex w-full">
                        <div className="flex relative w-[30px] h-[30px]">
                            <Image className="rounded-[50%]" src={imageSrc} alt="" fill />
                        </div>
                        <p className="ml-5 font-semibold">{username}</p>
                    </div>
                    
                    <p className="text-left ml-12">Great image! Love your work</p>

                    
                </div>

            </div>
        </div>
    )
}
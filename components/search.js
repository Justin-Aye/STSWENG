import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

export default function SearchResult({ uid, data }) {

    return (
    <div className="mb-5 w-3/5 md:w-2/5 mx-auto bg-nav-bg rounded-full py-2 cursor-pointer transition duration-100
    hover:bg-nav-bg-dark">
        <Link className="flex flex-row justify-center items-center"href={`../profile/${uid}`}>
                <div className="flex relative w-[50px] h-[50px] cursor-pointer mr-3">
                    <Image className="rounded-[50%]" src={data.profPic} alt="" width={60} height={51} />
                </div>
                <span className="text-[20px] text-white w-fit h-fit"> {data.displayName} </span>
        </Link>
    </div>
    )

}
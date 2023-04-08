import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

export default function SearchResult({ uid, data }) {

    return (
    <div className="bg-doc_bg w-full self-center pt-8">
        <Link href={`../profile/${uid}`}>
            <div className="mb-5 w-3/5 md:w-2/5 mx-auto bg-nav_bg rounded-full py-2 px-5 cursor-pointer hover:transition duration-300
                hover:bg-nav_bg_dark flex justify-center items-center">
                <Image className="rounded-[50%] mr-3" src={data.profPic} alt="" width={60} height={51} />
                <span className="text-[20px] text-white w-fit h-fit"> {data.displayName} </span>
            </div>
        </Link>
    </div>
    )

}
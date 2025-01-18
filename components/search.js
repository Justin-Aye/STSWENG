import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

export default function SearchResult({ uid, data }) {

    return (
    <div className="mb-5 w-full max-w-2xl mx-auto bg-nav-bg rounded-full py-2 cursor-pointer transition duration-100
    hover:bg-nav-bg-dark">
        <Link className="flex flex-row justify-center items-center" href={`../profile/${uid}`}>
            <div className="flex shrink-0 relative rounded-full mr-3">
                <Image className="rounded-full w-10 h-10 sm:w-14 sm:h-14" src={data.profPic} alt="" width={60} height={60} />
            </div>
            <span className="text-md md:text-xl text-white w-fit h-fit break-all"> {data.displayName} </span>
        </Link>
    </div>
    )

}
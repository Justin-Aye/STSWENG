import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Profile({ props }) {
    const router = useRouter();
    const profileUID = router.query.uid;

    return (
        <div>
            {!props.data ? <h2> User does not exist!</h2>
            : (
                <div>
                    <h2>
                        Bio: {props.data.bio?.trim() ? props.data.bio : `User ${props.data.displayName} has no bio!`}
                    </h2>
                    <h2> Display Name: {props.data.displayName}</h2>
                    <h2> Email: {props.data.email}</h2>

                    <br></br>

                    <h2> profpic: </h2>               
                    <Image src={props.data.profPic} alt="" width={100} height={100}/>
                    
                    <br></br>
                    
                    { props.UID == profileUID ? <Link href={`/profile/${profileUID}/settings`}> settings </Link> : ""}

                    <br></br>
                    { props.UID == profileUID && isAdmin > 0 ? <Link href={`/profile/${profileUID}/admin`}> admin page </Link> : ""}
                </div>
            )}
        </div>
    )
    
}
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, onSnapshot, doc } from "firebase/firestore";


export default function Profile( ) {
    const router = useRouter();
    const { displayName } = router.query; 
    const [profileData, setData] = useState(null);
    const [currUser, setUser] = useState("")

    // check if the currently logged in user owns the profile
    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                const docRef = doc(db, "users", auth.currentUser.uid);
                onSnapshot(docRef, (doc) => {
                    setUser(doc.data().displayName);
                })
            }
        })
    }, [])
    
    useEffect(() => {
        try {
            const users = collection(db, "users")
            const q = query(users, where("displayName", "==", displayName))
            if (q) {
                const qSnapshot = getDocs(q)
                qSnapshot.then((snapshot) => {
                    snapshot.docs.forEach(doc => {
                        if (doc.data().displayName == displayName) {
                            setData(doc.data())
                        }
                    })
                })
            }
        } catch {
            console.log("user data check failed");

        }
    }, [displayName]);
    
    
    // #FIXME: should keep data even after refresh
    return (
        <div>
            {profileData ? (
                <div>
                    <h2>
                        Bio: {profileData["bio"].trim() ? profileData["bio"] : `User ${displayName} has no bio!`}
                    </h2>
                    <h2> Display Name: {profileData["displayName"]}</h2>
                    <h2> Email: {profileData["email"]}</h2>
                    <br></br>
                    { currUser == displayName ? <Link href="/settings"> settings </Link> : ""}
                </div>
            ) : <h2>
                    User {displayName} does not exist!
                </h2>}
        </div>
    )
    
}
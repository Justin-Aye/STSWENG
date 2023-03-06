import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { db } from "../firebaseConfig"
import { collection, query, where, getDocs } from "firebase/firestore"

// TODO: if user doesn't exist, display "user doesn't exist", if user exists, display the user's profile

export default function Profile( ) {
    const router = useRouter()
    const { displayName } = router.query 

    const [userExists, setUser] = useState(false)
    const [userData, setData] = useState({})

    // check if user exists
    useEffect(() => {
        try {
            const users = collection(db, "users")
            const q = query(users, where("displayName", "==", displayName))
            if (q) {
                const qSnapshot = getDocs(q)
                qSnapshot.then((snapshot) => {
                    snapshot.docs.forEach(doc => {
                        if (doc.data().displayName == displayName) {
                            setUser(true)
                            setData(doc.data())
                            console.log(userData)
                        }
                    })
                })
            }
        } catch {
            setUser(false)
            setData({})
        }
    }, [userExists]);

    if (userExists) {
        return (
            <div>
                {Object.entries(userData).map(([key, value]) => (
                    <p key={key}>
                        {key}: {value}
                    </p>
                ))}
            </div>
        )
    }
    else {
        return (
            <h2>
                User {displayName} does not exist!
            </h2>
        )
    }
    
}
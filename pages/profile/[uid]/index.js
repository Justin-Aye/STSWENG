import React from "react";
import { db, auth } from "../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";;
// @ts-ignore
import Profile from "@/components/profile";



export async function getServerSideProps(context) {
    const UID = context.query.uid;

    // get profile data
    const docRef = doc(db, "users", UID);
    const docSnap = await getDoc(docRef)
    const data = docSnap.data();

    return {
        props: { UID, data }
    }
}

export default function profile(props) {
    return (
        <Profile props={props}/>
    )
}
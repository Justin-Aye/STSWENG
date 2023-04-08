import React from "react";
import { db, auth } from "../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";;
// @ts-ignore
import Profile from "@/components/profile";

export async function getServerSideProps(context) {
    const profileUID = context.query.uid;

    // get profile data
    const docRef = doc(db, "users", profileUID);
    const docSnap = await getDoc(docRef)
    const data = docSnap.data();

    return {
        props: { profileUID, data }
    }
}

export default function profile(props) {
    return (
        <Profile props={props}/>
    )
}
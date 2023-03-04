import React, { useState, useEffect } from "react";
import Image from "next/image";
import { auth, db, storage } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";


export default function Settings( ) {
    const [user, setUser] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [profPic, setProfPic] = useState(null);
    
    // get logged in user's data
    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(true);
                const docRef = doc(db, "users", auth.currentUser.uid);
                onSnapshot(docRef, (doc) => {
                    setDisplayName(doc.data().displayName);
                    setBio(doc.data().bio);
                    setProfPic(doc.data().profPic);
                })
            }
        })
    }, []);

    const handleNameChange = function (e) {
        setDisplayName(e.target.value);
    };

    const handleBioChange = function (e) {
        setBio(e.target.value);
    }

    const handleProfPicChange = function (e) {
        const file = e.target.files[0];
        setProfPic(file);
    }

    const saveName = function () {
        const docRef = doc(db, "users", auth.currentUser.uid);
        try {
            updateDoc(docRef, {
                displayName: displayName
            });
        } catch {
            console.log("error saving displayname");
        }
    }

    const saveBio = function () {
        const docRef = doc(db, "users", auth.currentUser.uid);
        try {
            updateDoc(docRef, {
                bio: bio
            });
        } catch {
            console.log("error saving bio");
        }
    }

    const saveProfPic = function () {
        // TODO:
        return
    }

    // TODO: input form 
    return (
        <div>
            { user ? (
                <div>
                    <div>
                        <h2> change displayname </h2>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <input 
                            type="text" 
                            value={displayName}
                            onChange={handleNameChange}
                            />
                            <button onClick={saveName}> Save displayName </button>
                        </form>
                    </div>   

                    <div>
                        <h2> change bio </h2>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <input 
                            type="text" 
                            value={bio}
                            onChange={handleBioChange}
                            />
                            <button onClick={saveBio}> Save Bio </button>
                        </form>
                    </div>   

                </div>
            ) :
                <h2> not logged in </h2>}
        </div>
    )
    
}
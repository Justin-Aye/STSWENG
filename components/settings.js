import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from "../firebaseConfig";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";


export default function Settings() {
    const [user, setUser] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [profPic, setProfPic] = useState("");
    const [preview, setProfPicPreview] = useState("")
    
    // get logged in user's data
    // FIXME: doc.data(), reader.result, auth.currentUser error warnings
    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(true);
                const docRef = doc(db, "users", user.uid);
                getDoc(docRef).then((doc) => {
                    setDisplayName(doc?.data()?.displayName);
                    setBio(doc?.data()?.bio);
                    setProfPic(doc?.data()?.profPic)
                    setProfPicPreview(doc?.data()?.profPic);
                })
            }
        })
    }, []);

    // TODO: refactor
    const handleNameChange = function (e) {
        setDisplayName(e.target.value);
    };

    const handleBioChange = function (e) {
        setBio(e.target.value);
    }

    const handleProfPicChange = function (e) {
        const file = e.target.files[0];
        if (file) {
            setProfPic(file);
            const reader = new FileReader();
            reader.onload = function () {
                setProfPicPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
        
    }

    const saveName = async function () {
        try {
            const usersRef = collection(db, "users")
            const qDisplayName = query(usersRef, where("displayName", "==", displayName))
            const matchingUsers = await getDocs(qDisplayName);

            if (matchingUsers.size > 0) {
                // TODO: dont use alert
                console.log("entered displayname already exists");
                alert("name already exists");
                return
            }
            else {
                const docRef = doc(db, "users", auth.currentUser.uid);
                updateDoc(docRef, {
                    displayName: displayName,
                    lowerCaseDisplayName: displayName.toLowerCase()
                });
            }
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

    const saveProfPic = async function () {
        // TODO:
        const storageRef = ref(storage, `images/${profPic.name}`)
        await uploadBytes(storageRef, profPic);

        const profPicUrl = await getDownloadURL(storageRef);
        const docRef = doc(db, "users", auth.currentUser.uid);
        try {
            updateDoc(docRef, {
                profPic: profPicUrl
            });
        } catch {
            console.log("error uploading profPic");
        }
    }

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

                    <div>
                        <h2> change profpic </h2>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <input
                            type="file"
                            accept="/image/*"
                            onChange={handleProfPicChange}
                            required
                            />
                            <button onClick={saveProfPic}> Save profPic </button>
                            <Image src={preview} alt="" width={100} height={100}/>

                        </form>
                    </div>  

                </div>
            ) :
                <h2> not logged in </h2>}
        </div>
    )
    
}
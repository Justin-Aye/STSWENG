import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from "../firebaseConfig";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";


export default function Settings() {
    const [user, setUser] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [email, setEmail] = useState("");
    const [profPic, setProfPic] = useState("");
    const [preview, setProfPicPreview] = useState("")
    const router = useRouter()
    
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
                    setEmail(doc?.data()?.email);
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
                    displayName: displayName
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
        <div className="m-auto flex flex-col h-full">
            { user ? (
                <div className="m-5 w-full mx-auto">

                    <div className="my-4 mx-10 px-10 flex justify-between h-fit border-b border-black">
                            <span className="w-fit font-bold text-3xl"><i className="fa fa-pencil mr-2 mb-2" />EDIT PROFILE</span>
                            <Link href={`/profile/${auth.currentUser.uid}`} className="w-fit my-auto hover:underline">
                                Back to Profile Page</Link>
                    </div>

                    <div className="m-5 h-full w-3/4">

                        <div className="grid grid-cols-3">
                        <div className="justify-self-end pr-5 mr-5 border-r-2 border-gray-300">
                            <div className="w-[200px] h-[200px] rounded-full relative">
                                <Image className="rounded-full drop-shadow-md" src={preview} alt="" fill/>
                            </div>

                            <div className="mt-5 flex justify-center">
                                <form className="w-fit grid justify-items-center" onSubmit={(e) => e.preventDefault()}>
                                    <input
                                    type="file"
                                    accept="/image/*"
                                    className="w-56"
                                    onChange={handleProfPicChange}
                                    required
                                    />
                                    <button onClick={saveProfPic} className="py-1 px-3 my-4 rounded-full bg-nav_bg text-white hover:transition duration-300
                                    hover:bg-nav_bg_dark"> Save Profile Picture </button>
                                </form>
                            </div>
                        </div>
                        <div className="col-span-2 grid">
                            <span className="font-bold text-2xl my-4"> Username:</span>
                            <form className="mb-4" onSubmit={(e) => e.preventDefault()}>
                                <input 
                                type="text"
                                className="w-full border border-gray-400 p-2 rounded-md" 
                                value={displayName}
                                onChange={handleNameChange}
                                />
                                <button onClick={saveName} className="py-1 px-3 my-2 rounded-full bg-nav_bg text-white hover:transition duration-300
                                    hover:bg-nav_bg_dark"> Save Username </button>
                            </form>

                            <span className="text-xl font-bold">
                                Email:
                            </span>
                            <span className="mb-4">
                                {email}
                            </span>
                            
                            <span className="text-xl font-bold">
                                Bio:
                            </span>
                            <div className="mb-4">
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <textarea className="border border-gray-400 h-[100px] p-2 rounded-md w-full h-48"
                                                onChange={(e) => {handleBioChange(e)}}>
                                        {bio}
                                    </textarea>
                                    <button onClick={saveBio} className="py-1 px-3 my-2 rounded-full bg-nav_bg text-white hover:transition duration-300
                                    hover:bg-nav_bg_dark"> Save Bio </button>
                                </form>
                            </div>

                            
                        </div>
                        
                        
                    </div>
                </div>
                {/* Original Profile Settings Page */}
                    {/* <div>
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
                    </div>   */}

                </div>
            ) :
                    // TODO: Redirect to login page if /settings is called w/o a logged in user
                <span className="text-center text-2xl mt-20"> Please log in to edit your profile page. </span>}
        </div>
    )
    
}
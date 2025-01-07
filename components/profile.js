import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Card from "./card";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, getDoc, doc, orderBy, updateDoc, arrayUnion, arrayRemove, documentId } from "firebase/firestore";

export default function Profile({ props }) {
    const router = useRouter()
    const [ currUser, setCurrUser ] = useState({});
    const [ posts, setPosts ] = useState([]);
    const [ followingState, setFollowingState ] = useState(false);
    const [ profileOwner, setProfileOwner ] = useState(false);
    const [ followers, setFollowers ] = useState(props.data.followers);
    const [ followerDetails, setFollowerDetails ] = useState([]) 
    const [ following, setFollowing ] = useState(props.data.following);
    const [ followingDetails, setFollowingDetails ] = useState([]) 
    const [ showFollowers, setShowFollowers ] = useState(false);
    const [ showFollowing, setShowFollowing ] = useState(false);
    
    useEffect(() => {
        try {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    const userRef = doc(db, "users", user.uid);
                    getDoc(userRef).then((doc) => {
                        setCurrUser({uid: user.uid, data: doc.data()});
                    })
                }
                else {
                    router.push("/login")
                }
            })
        } catch (err) {
            console.log(err);
        }
    }, [followingState]);

    useEffect(() => {
        try {
            if (Object.keys(currUser).length !== 0) {
                if (currUser.data.following.includes(props.profileUID))
                    setFollowingState(true)
                else
                    setFollowingState(false)
            }
        } catch (e) {
            console.log(e)
        }
    }, [currUser, props.profileUID])

    useEffect(() => {
        try {
            if (Object.keys(currUser).length !== 0) {
                if (props.profileUID == currUser.uid)
                    setProfileOwner(true);
                else
                    setProfileOwner(false);
            }
        } catch (e) {
            console.log(e)
        }
    }, [currUser, props.profileUID])


    useEffect(() => {
        const fetchPosts = async () => {
            setPosts([])
            const postsRef = collection(db, "posts");
            const q = query(postsRef, where("creatorID", "==", props.profileUID), orderBy("likes"));
            const qSnapshot = await getDocs(q);
    
            if (qSnapshot.size > 0) {
                qSnapshot.forEach((doc) => {
                    setPosts((posts) => [...posts, {id: doc.id, data: doc.data()}])
                })
            }
        }
        updateFollowers();
        fetchPosts();
    }, [props.profileUID, setPosts]);

    // update profile follower/following count
    async function updateFollowers() {
        const userRef = doc(db, "users", props.profileUID);
        const uSnap = await getDoc(userRef);

        if (uSnap.exists()) {
            setFollowers(uSnap.data().followers);
            setFollowing(uSnap.data().following);
        }
    }

    async function getFollowerDetails() {
        try {
            updateFollowers()
            if (!showFollowers) {
                setFollowerDetails([])
                followers.forEach(async (follower) => {
                        const userRef = doc(db, "users", follower)
                        const uSnap = await getDoc(userRef)
                        if (uSnap.exists()) {
                            setFollowerDetails((followerDetails) => [...followerDetails, {uid: uSnap.id, data: uSnap.data()}])
                        }
                })
                setShowFollowers(true)                
            } else
                setShowFollowers(false)
        } catch (e) {
            console.log(e);
        }
    }

    async function getFollowingDetails() {
        try {
            updateFollowers()
            if (!showFollowing) {
                setFollowingDetails([])
                following.forEach(async (following) => {
                    const userRef = doc(db, "users", following)
                    const uSnap = await getDoc(userRef)
                    if (uSnap.exists()) {
                        setFollowingDetails((followingDetails) => [...followingDetails, {uid: uSnap.id, data: uSnap.data()}])
                    }
                })
                setShowFollowing(true)
            } else
                setShowFollowing(false)
        } catch (e) {
            console.log(e);
        }
    }
    

    async function followUser() {
        if (!followingState) {
            try {
                // update curr user's following list
                let userRef = doc(db, "users", currUser.uid);
                let uSnap = await getDoc(userRef);
                if (uSnap.exists()) {
                    await updateDoc(userRef, {
                        following: arrayUnion(props.profileUID)
                    });
                }

                // update followed user's followers list
                userRef = doc(db, "users", props.profileUID)
                uSnap = await getDoc(userRef);
                if (uSnap.exists()) {
                    await updateDoc(userRef, {
                        followers: arrayUnion(currUser.uid)
                    })
                }
                updateFollowers().then(() => {
                    setFollowingState(true);
                })           
            } catch (e) {
                console.log(e)
            }
        }
    }

    async function unfollowUser() {
        if (followingState) {
            try {
                // update curr user's following list
                let userRef = doc(db, "users", currUser.uid);
                let uSnap = await getDoc(userRef);
                if (uSnap.exists()) {
                    await updateDoc(userRef, {
                        following: arrayRemove(props.profileUID)
                    });
                }

                // update followed user's followers list
                userRef = doc(db, "users", props.profileUID)
                uSnap = await getDoc(userRef);
                if (uSnap.exists()) {
                    await updateDoc(userRef, {
                        followers: arrayRemove(currUser.uid)
                    })
                }

                updateFollowers().then(() => {
                    setFollowingState(false);
                })

            } catch (e) {
                console.log(e)
            }
        }
    }

    return (
        <div className="overflow-y-auto h-screen">
            <div className="m-auto flex flex-col h-fit">
                <div className="m-5 mt-10 h-min">
                {!props.data ? <h2> User does not exist!</h2>
                : (
                    <div className="grid grid-cols-3 w-3/4">
                        <div className="justify-self-end pr-5 mr-5 border-r-2 border-gray-300">
                            <div className="w-[200px] h-[200px] rounded-full relative">
                                <Image className="rounded-full drop-shadow-md" src={props.data.profPic} alt="" fill/>
                            </div>

                            <div className="mt-5 flex flex-col justify-center items-center">
                                { profileOwner ? 
                                    <Link href="/settings" className="self-center hover:underline">
                                        <i className="fa fa-pencil mr-2" />Edit Profile
                                    </Link> 
                                :                                    
                                <div>
                                    { !followingState ? 
                                        <span className="border-2 rounded-xl bg-nav-bg p-2 text-white font-bold hover:cursor-pointer transition duration-100 hover:bg-sky-600" onClick={followUser}> Follow </span>
                                        :
                                        <span className="border-2 rounded-xl bg-nav-bg p-2 text-white font-bold hover:cursor-pointer transition duration-100 hover:bg-red-500" onClick={unfollowUser}> Unfollow </span>
                                    }
                                </div>
                                }
                            </div>

                        </div>

                        <div className="col-span-2 grid">
                            <span className="font-bold text-3xl text-icon-color my-4"> {props.data.displayName}</span>

                            <div className="grid gap-y-4 grid-cols-2 mb-4 w-1/3">
                                <span className="text-xl font-bold hover:cursor-pointer transition duration-100 hover:text-sky-500" onClick={getFollowerDetails}>
                                    Followers: {followers.length}
                                </span>

                                <span className="text-xl font-bold hover:cursor-pointer transition duration-100 hover:text-sky-500" onClick={getFollowingDetails}>
                                    Following: {following.length}
                                </span>
                            </div>

                            <span className="text-xl font-bold">
                                Email:
                            </span>
                            <span className="mb-4">
                                {props.data.email}
                            </span>
                            
                            <span className="text-xl font-bold">
                                Bio:
                            </span>
                            <span className="mb-4 whitespace-pre-wrap">
                                {props.data.bio?.trim() ? props.data.bio : `User ${props.data.displayName} has no bio!`}
                            </span>

                        </div>
                        
                        
                    </div>
                )}
                </div>
            </div>

            {/* FOLLOWER/FOLLOWING LIST MODALS */}
            { showFollowers && (
                <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-20 backdrop-blur-sm" onClick={() => setShowFollowers(false)}>
                    <div className="w-1/3 max-h-2/3 flex flex-col fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-md shadow-lg p-6 overflow-auto">
                        <h2 className="text-2xl font-bold mb-5"> Followers </h2>
                        { followerDetails.length > 0 ? 
                            <>
                            {followerDetails.map((follower, index) => {
                                return (
                                    <div key={index} className="mb-3 flex justify-start">
                                        <Link href={`../profile/${follower.uid}`}>
                                            <div className="flex items-center">
                                                <div className="flex relative w-[50px] h-[50px] cursor-pointer mr-3">
                                                    <Image className="rounded-[50%]" src={follower.data.profPic} alt="" width={60} height={51} />
                                                </div>
                                                <span className="text-[20px] text-black w-fit h-fit transition duration-100 hover:text-sky-500"> {follower.data.displayName} </span>
                                            </div>
                                        </Link>
                                    </div>
                                )
                            })}
                            </>
                            :
                            <span className="text-[20px] text-black w-fit h-fit transition duration-100 hover:text-sky-500"> No users found! </span>
                        }
                    </div>
                </div>
            )
            }

            { showFollowing && (
                <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-20 backdrop-blur-sm" onClick={() => setShowFollowing(false)}>
                    <div className="w-1/3 max-h-2/3 flex flex-col fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-md shadow-lg p-6 overflow-auto">
                        <h2 className="text-2xl font-bold mb-5"> Following </h2>
                        { followingDetails.length > 0 ? 
                            <>
                            {followingDetails.map((following, index) => {
                                return (
                                    <div key={index} className="mb-3 flex justify-start">
                                        <Link href={`../profile/${following.uid}`}>
                                            <div className="flex items-center">
                                                <div className="flex relative w-[50px] h-[50px] cursor-pointer mr-3">
                                                    <Image className="rounded-[50%]" src={following.data.profPic} alt="" width={60} height={51} />
                                                </div>
                                                <span className="text-[20px] text-black w-fit h-fit transition duration-100 hover:text-sky-500"> {following.data.displayName} </span>
                                            </div>
                                        </Link>
                                    </div>
                                )
                            })} 
                            </>
                            :
                            <span className="text-[20px] text-black w-fit h-fit transition duration-100 hover:text-sky-500"> No users found! </span>
                        }
                    </div>
                </div>
            )
            }
            
            <div className="text-center mt-0 flex flex-col h-screen z-1">
                <div className="flex flex-col mt-10 mb-5">
                    <span className="text-2xl font-bold">POSTS by {props.data.displayName}</span>
                </div>
                {posts.length < 1 ? <h2> No posts found! </h2> : 
                    (
                        posts.map((post, index) => {
                            return (
                                <Card key={index}
                                post={post.data}
                                profpic={props.data.profPic}
                                postID={post.id}
                                currUser={currUser}
                                />
                            )
                        })
                    ) }
                    <br></br>
            </div>

        </div>

    )
    
}
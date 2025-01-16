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
        <section className="overflow-y-auto w-full h-screen">
            <div className="mx-auto max-w-screen-xl px-4 py-8 lg:py-16">
            {!props.data ? <h2> User does not exist!</h2>
            : (
                <div className="flex flex-row items-center justify-center md:justify-start flex-wrap gap-8 pb-2 border-b">
                    <div className="flex flex-col justify-center items-center">
                        <div className="mb-4 w-32 h-32 md:w-52 md:h-52 rounded-full relative">
                            <Image className="rounded-full" src={props.data.profPic} alt={`${props.data.displayName} profile picture`} fill/>
                        </div>

                        <>
                        {profileOwner ? 
                            <Link href="/settings" className="rounded-full bg-nav-bg hover:bg-nav-bg-dark px-4 py-2 text-white transition duration-100">
                                <i className="fa fa-pencil mr-2" />Edit Profile
                            </Link> 
                        :     
                            <>                               
                                {!followingState ? 
                                    <button className="rounded-full bg-nav-bg px-4 py-2 text-white cursor-pointer transition duration-100 hover:bg-nav-bg-dark" onClick={followUser}> Follow </button>
                                :
                                    <span className="rounded-full bg-nav-bg hover:bg-nav-bg-dark px-4 py-2 text-white cursor-pointer transition duration-100" onClick={unfollowUser}> Unfollow </span>
                                }
                            </>
                        }
                        </>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="font-bold text-lg md:text-2xl text-nav-bg"> {props.data.displayName}</span>
                        <div className="flex flex-wrap gap-4">
                            <span className="text-lg md:text-xl font-bold hover:cursor-pointer transition duration-100 hover:text-violet-800" onClick={getFollowerDetails}>
                                Followers: {followers.length}
                            </span>
                            <span className="text-lg md:text-xl font-bold hover:cursor-pointer transition duration-100 hover:text-violet-800" onClick={getFollowingDetails}>
                                Following: {following.length}
                            </span>
                        </div>
                        <div>
                            <span className="text-lg md:text-xl font-bold">Email: <span className="break-all">{props.data.email}</span></span>
                            
                        </div>

                        <span className="text-lg font-bold">Bio:</span>
                        <span className="mb-4 whitespace-pre-wrap overflow-y-auto max-w-screen-md max-h-32">{props.data.bio?.trim() ? props.data.bio : `User ${props.data.displayName} has no bio!`}</span>
                    </div>
                </div>
            )}
            

                {/* FOLLOWER/FOLLOWING LIST MODALS */}
                { showFollowers && (
                    <div className="px-4 flex items-center justify-center fixed inset-0 z-50 bg-gray-500 bg-opacity-20 backdrop-blur-sm" onClick={() => setShowFollowers(false)}>
                        <div className="w-full max-w-screen-sm flex flex-col transform bg-white rounded-md shadow-lg py-6">
                            <h2 className="pl-4 text-lg lg:text-2xl font-bold mb-5"> Followers </h2>
                            { followerDetails.length > 0 ? 
                                <>
                                {followerDetails.map((follower, index) => {
                                    return (
                                        <Link className="py-1 pl-4 w-full flex items-center transition duration-100 hover:bg-gray-100" key={index} href={`../profile/${follower.uid}`}>
                                            <Image className="flex relative w-10 h-10 lg:w-14 lg:h-14 cursor-pointer mr-3 rounded-full" src={follower.data.profPic} alt="" width={60} height={60} />
                                            <span className="text-lg lg:text-xl break-all"> {follower.data.displayName} </span>
                                        </Link>
                                    )
                                })}
                                </>
                                :
                                <span className="pl-4 text-lg lg:text-2xl font-bold "> No users found! </span>
                            }
                        </div>
                    </div>
                )
                }

                { showFollowing && (
                    <div className="px-4 flex items-center justify-center fixed inset-0 z-50 bg-gray-500 bg-opacity-20 backdrop-blur-sm" onClick={() => setShowFollowing(false)}>
                        <div className="w-full max-w-screen-sm flex flex-col transform bg-white rounded-md shadow-lg py-6">
                            <h2 className="pl-4 text-lg lg:text-2xl font-bold mb-5"> Following </h2>
                            { followingDetails.length > 0 ? 
                                <>
                                {followingDetails.map((following, index) => {
                                    return (
                                        <Link className="py-1 pl-4 w-full flex items-center transition duration-100 hover:bg-gray-100"  key={index} href={`../profile/${following.uid}`}>
                                            <Image className="flex relative w-10 h-10 lg:w-14 lg:h-14 cursor-pointer mr-3 rounded-full" src={following.data.profPic} alt="" width={60} height={51} />
                                            <span className="text-lg lg:text-xl break-all">{following.data.displayName}</span>
                                        </Link>
                                    )
                                })} 
                                </>
                                :
                                <span className="pl-4 text-lg lg:text-2xl font-bold "> No users found! </span>
                            }
                        </div>
                    </div>
                )
                }
                
                <div className="flex flex-col">
                    {posts.length < 1 ?
                        <span className="my-8 lg:my-16 text-center text-2xl font-bold">NO POSTS FOUND!</span>
                    :
                        <span className="my-8 lg:my-16 text-center text-2xl font-bold">POSTS by {props.data.displayName}</span>
                    }
                    {posts.length > 0 &&
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
                </div>
            </div>
        </section>

    )
    
}
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Card from "./card";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, getDoc, doc, orderBy, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export default function Profile({ props }) {
    const router = useRouter()
    const [ currUser, setCurrUser ] = useState({});
    const [ posts, setPosts ] = useState([]);
    const [ followingState, setFollowing ] = useState(false);
    const [ profileOwner, setProfileOwner ] = useState(false);
    const [ followerCount, setFollowerCount ] = useState(props.data.followers.length);
    const [ followingCount, setFollowingCount ] = useState(props.data.following.length);
    
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
    });

    useEffect(() => {
        try {
            if (Object.keys(currUser).length !== 0) {
                if (currUser.data.following.includes(props.profileUID))
                    setFollowing(true)
                else
                    setFollowing(false)
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

    // update profile follower/following count
    useEffect(() => {
        async function updateFollowers() {
            const userRef = doc(db, "users", props.profileUID);
            const uSnap = await getDoc(userRef);

            if (uSnap.exists()) {
                setFollowerCount(uSnap.data().followers.length);
                setFollowingCount(uSnap.data().following.length);
            }
        }
        updateFollowers()
    })
    

    async function followUser() {
        console.log("follow button clicked");
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
            } catch (e) {
                console.log(e)
            }
        }
    }

    async function unfollowUser() {
        console.log("unfollow button clicked");
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
            } catch (e) {
                console.log(e)
            }
        }
    }

    const fetchPosts = async () => {
        const postsRef = collection(db, "posts");
        const q = query(postsRef, where("creatorID", "==", props.profileUID), orderBy("likes"));
        const qSnapshot = await getDocs(q);

        if (qSnapshot.size > 0) {
            qSnapshot.forEach((doc) => {
                setPosts((posts) => [...posts, {id: doc.id, data: doc.data()}])
            })
        }
    }

    useEffect(() => {
        fetchPosts();
    }, []);

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
                                        <span onClick = {followUser}> Follow </span>
                                        :
                                        <span onClick = {unfollowUser}> Unfollow </span>
                                    }
                                </div>
                                }
                            </div>

                        </div>

                        <div className="col-span-2 grid">
                            <span className="font-bold text-3xl text-icon_color my-4"> {props.data.displayName}</span>

                            <div className="grid gap-y-4 grid-cols-2 mb-4 w-1/3">
                                <span className="text-xl font-bold">
                                    Followers: {followerCount}
                                </span>

                                <span className="text-xl font-bold">
                                    Following: {followingCount}
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
            
            <div className="text-center mt-0 flex flex-col h-screen">
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
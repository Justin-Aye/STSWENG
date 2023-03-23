
import { collection, documentId, getDocs, query, where, getDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { HiThumbUp, HiThumbDown } from "react-icons/hi";
import { db, auth, storage } from "../../firebaseConfig";


export default function Admin_homepage(){

    const [ current, setCurrent ] = useState(1)
    const [ currUserIndex, setCurrUserIndex] = useState()
    const [ allUsers, setAllUsers] = useState([])

    const [ viewUsers, setViewUsers ] = useState(false)
    const [ showPosts, setShowPosts ] = useState(false)

    const [ postBuffer, setPostBuffer ] = useState()

    const [ showOptions, setShowOptions ] = useState(false)
    const [ askDeletePost, setaskDeletePost ] = useState(false)
    const [ noPosts, setNoPosts ] = useState(false)

    async function fetchUserPosts(index){
        var postIDs = allUsers[index].data.postsID ? allUsers[index].data.postsID : []
        if(postIDs && postIDs.length > 0){
            const q = await getDocs(query(collection(db, "posts"), where(documentId(), "in", postIDs)))
            var temp = []

            const p = new Promise((resolve, reject) => {
                q.forEach((doc) => {
                    temp.push({postID: doc.id, data: doc.data()})
                })
                if(temp.length === q.size)
                    resolve()
            })

            p.then(() => {
                if(temp.length > 0){
                    setPostBuffer({
                        userIndex: index, 
                        posts: temp
                    })   
                }
                setShowPosts(true)
                setViewUsers(false)
            })
        }
        else{
            setNoPosts(true)
        }
    }

    async function deletePost(postID, userID){
        const post = await getDoc(doc(db, "posts", postID))
        if (post.exists()) {
            const data = post.data()
            var commentIDs = data.commentsID

            if(commentIDs.length > 0){
                // Delete Every Comment in the post
                const querySnapshot = await getDocs(query(collection(db, "comments"), where(documentId(), 'in', commentIDs)))
                querySnapshot.forEach((doc) => {
                    deleteDoc(doc.ref)
                })

                // Remove deleted comments from user's commentIDs
                const qUsers = await getDocs(query(collection(db, "users"), where("commentIDs", "array-contains-any", commentIDs)))
                qUsers.forEach(async (userDoc) => {
                    const userRef = doc(db, "users", userDoc.id)
                    const userSnap = await getDoc(userRef)
                    if (userSnap.exists()) {
                        const newComments = userSnap.data().commentIDs.filter((val) => !commentIDs.includes(val));
                        updateDoc(userRef, {
                            commentIDs: newComments
                        })
                    }
                })

                // Remove deleted comments from user's liked & disliked
                const qLikedComments = await getDocs(query(collection(db, "users"), where("liked", "array-contains-any", commentIDs)));
                const qDislikedComments = await getDocs(query(collection(db, "users"), where("disliked", "array-contains-any", commentIDs)));

                if (qLikedComments.size > 0) {
                    qLikedComments.forEach(async (userDoc) => {
                        const userRef = doc(db, "users", userDoc.id);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            updateDoc(userRef, {
                                liked: userSnap.data().liked.filter((val) => !commentIDs.includes(val))
                            })
                        }
                    })
                }

                if (qDislikedComments.size > 0) {
                    qDislikedComments.forEach(async (userDoc) => {
                        const userRef = doc(db, "users", userDoc.id);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            updateDoc(userRef, {
                                liked: userSnap.data().disliked.filter((val) => !commentIDs.includes(val))
                            })
                        }
                    })
                }
            }

            // Remove post from users liked & disliked fields
            const qLikedPosts = await getDocs(query(collection(db, "users"), where("liked", "array-contains", postID)));
            const qDislikedPosts = await getDocs(query(collection(db, "users"), where("disliked", "array-contains", postID)));

            if (qLikedPosts.size > 0) {
                qLikedPosts.forEach(async (userDoc) => {
                    const userSnap = await getDoc(doc(db, "users", userDoc.id));
                    if (userSnap.exists()) {
                        updateDoc(doc(db, "users", userDoc.id), {
                            liked: userSnap.data().liked.filter((val) => val != postID)
                        })
                    }
                })
            }

            if (qDislikedPosts.size > 0) {
                qDislikedPosts.forEach(async (userDoc) => {
                    const userSnap = await getDoc(doc(db, "users", userDoc.id));
                    if (userSnap.exists()) {
                        updateDoc(doc(db, "users", userDoc.id), {
                            disliked: userSnap.data().disliked.filter((val) => val != postID)
                        })
                    }
                })
            }

            // Delete Image
            if(data.imageSrc.length > 0){
                deleteObject(ref(storage, data.imageSrc))
            }

            // Delete Post
            deleteDoc(doc(db, "posts", postID)).then(async () => {
                // Update postsID array of user afterr deleting the post
                const userRef = doc(db, "users", userID);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    updateDoc(userRef, {
                        postsID: userSnap.data().postsID.filter((val) => {return val != postID})
                    })
                }
                console.log("Successfully deleted")

                setPostBuffer({
                    userIndex: postBuffer.userIndex, 
                    posts: postBuffer.posts.filter((val) => {
                        return val.postID !== postID
                    })
                })
            }).catch((error) => {
                console.log(error)
            })
        }
    }

    function fetchUserData(){
        const q = query(collection(db, "users"))
        getDocs(q).then((docs) => {
            if(docs.size > 0){
                docs.forEach((doc) => {
                    var data = doc.data()
                    setAllUsers((allUsers) => [...allUsers, { userID: doc.id, data: data }])
                })
            }
        }).catch((error) => {
            console.log(error);
        })
    }

    return(
        <div className="flex w-full h-screen px-20">
            <div className="flex flex-col w-1/5 h-full min-h-screen bg-[#F8FAFC]">

                <div className={`flex w-full h-10 bg-nav_bg_dark hover:brightness-110 border cursor-pointer shadow-lg`}                    >
                    <p className="w-full h-auto mx-auto my-auto px-5 text-white"
                        onClick={() => {
                            setViewUsers(!viewUsers)
                            setShowPosts(false)
                            setShowOptions(false)
                            setNoPosts(false)
                            if(allUsers.length == 0)
                                fetchUserData()
                        }}
                    >View Users</p>
                </div>
            </div>

            <div className="flex flex-col gap-5 w-full h-auto bg-white overflow-y-auto px-10 pt-10 pb-[200px]">
                {
                    viewUsers &&
                    allUsers.map((val, index) => {
                        return (
                            <div key={index} className="flex gap-5 w-full h-36 px-10 py-5 cursor-pointer hover:brightness-95 rounded-lg bg-nav_bg_dark"
                                onClick={() => {
                                    setNoPosts(false)
                                    setCurrUserIndex(index)
                                    fetchUserPosts(index)
                                }}
                            >
                                <div className="relative w-[50px] h-[50px] my-auto">
                                    <Image className="rounded-[50%]" src={val.data.profPic ? val.data.profPic : "/images/user_icon.png"} alt="" fill sizes="(max-width: 500px)" />
                                </div>
                                <p className="my-auto text-white text-[20px]">{val.data.email}</p>
                                
                                {   noPosts && currUserIndex === index &&
                                    <p className="my-auto text-yellow-200 text-[20px] ml-auto">USER HAS NO POSTS</p>
                                }
                            </div>
                        )
                    })
                }

                {
                    showPosts &&
                    postBuffer?.posts.map((val, index) => {
                        return(
                            <div key={index} className="relative mx-auto mb-28 w-4/5 sm:w-3/5 md:w-3/5 lg:w-3/5 xl:w-1/2 h-fit bg-card_bg rounded-lg p-5 shadow-lg drop-shadow-md">

                                {/* USER PROFILE PIC */}
                                <div className="flex mb-5 gap-5 relative" data-testid="user_container">
                                    <div className="flex relative w-[50px] h-[50px]">
                                        <Image className="rounded-[50%]" src={ allUsers[postBuffer.userIndex].data.profPic } alt="" fill sizes="(max-width: 50px)"/>
                                    </div>
                    
                                    <p className="my-auto text-left">{ allUsers[postBuffer.userIndex].data.displayName }</p>
                    
                                    {/* Triple Dot Button */}
                                    {
                                        <div className="w-[20px] h-[20px] ml-auto mb-5 relative justify-center cursor-pointer"
                                            onClick={() => {
                                                setShowOptions(true)
                                                setaskDeletePost(false)
                                                setCurrent(index)
                                            }}
                                        >
                                            <Image src={"/images/triple_dot.png"} alt={""} fill sizes="(max-width: 500px)"/>
                                        </div>
                                    }
                
                                    {/* EDIT / DELETE OPTION */}
                                    {   
                                        showOptions && current === index &&
                                        <div className="absolute top-0 right-0 w-1/4 h-fit shadow-[0px_5px_7px_2.5px_rgb(0,0,0,0.1)] flex flex-col z-10">
                                            <p className="hover:brightness-95 bg-white border-separate border-black cursor-pointer px-2"
                                                onClick={() => {
                                                    setShowOptions(false)
                                                    setaskDeletePost(true) 
                                                }}
                                            >
                                                Delete
                                            </p>
                    
                                            <p className="hover:brightness-95 bg-red-200 border-separate border-black cursor-pointer px-2"
                                                onClick={() => 
                                                    setShowOptions(false)}
                                            >
                                                Cancel
                                            </p>
                                        </div>
                                    }
                                </div>
                            
                                {/* Warns User before deleting the post */}
                                {
                                    askDeletePost && current === index &&
                                    <div className="absolute top-0 left-0 z-10 w-full h-full bg-black bg-opacity-40 p-2">
                                        <div className="w-full h-fit flex flex-col p-5 bg-white rounded-lg gap-5">
                                            <p className="text-center text-[20px] font-bold">ARE YOU SURE ?</p>
                                            <p className="text-center">You are about to delete a post.</p>
                                            <div className="flex justify-center gap-5">
                                                <button className="w-full bg-green-200 py-2 font-bold rounded-lg hover:brightness-90"
                                                    onClick={() => {
                                                        // console.log(allUsers[currUserIndex])
                                                        deletePost(val.postID, allUsers[currUserIndex].userID)
                                                    }}
                                                >
                                                    Delete Post
                                                </button>
                                                <button className="w-full bg-red-200 py-2 font-bold rounded-lg hover:brightness-90"
                                                    onClick={() => setaskDeletePost(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                }
                    
                                {/* IMAGE OF POST, IF AVAILABLE */}
                                {
                                    val.data.imageSrc.length > 0 &&
                                    <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[400px] mb-5 relative" data-testid="image">
                                        <Image className="rounded-lg object-contain" src={val.data.imageSrc} alt={""} fill sizes="(max-width: 900px)" priority/>    
                                    </div>
                                }   
                    
                                {/* CAPTION OF POST */}
                                <p className="mb-5 text-left" data-testid="caption">{val.data.caption}</p>
                    
                                {/* LIKE AND DISLIKE BUTTON CONTAINER */}
                                <div className="flex gap-5 mb-5" data-testid="buttons_container">
                                    <div className="flex gap-1">
                                        <button disabled={true} data-testid="postLikeBtn">
                                            <HiThumbUp className={`text-[30px] cursor-pointer rounded-lg align-middle text-gray-800 hover:opacity-75`}/>
                                        </button>
                                        <p className="my-auto" data-testid="postLikeCount">{val.data.likes}</p>
                                    </div>
                                    
                                    <div className="flex gap-1">
                                        <button disabled={true} data-testid="postDislikeBtn">
                                            <HiThumbDown className={`text-[30px] cursor-pointer rounded-lg align-middle text-gray-800 hover:opacity-75`}/>
                                        </button>
                                        <p className="my-auto" data-testid="postDislikeCount">{val.data.dislikes}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>


        </div>
    )
}
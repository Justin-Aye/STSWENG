
import { HiThumbUp, HiThumbDown } from "react-icons/hi";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { onSnapshot, increment, collection, documentId, getDocs, query, where, addDoc, updateDoc, doc, arrayUnion, getDoc, deleteDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import { useRouter } from "next/router";


export default function Card( { currUser, post, profpic, postID } ) {

    var hasVoted = false;
    
    const [ commentsid, setCommentsid ] = useState(post.commentsID || "")
    const [ loading, setLoading ] = useState(false)
    const [ showComments, setShowComments ] = useState(false)
    const [ addComment, setAddComment ] = useState('')
    const [ comments, setComments ] = useState([]);
    const [ postOwner, setPostOwner ] = useState("");
    const [ postLikeCount, setPostLikeCount ] = useState(post.likes || 0);
    const [ postDislikeCount, setPostDislikeCount ] = useState(post.dislikes || 0);
    const [ showOptions, setShowOptions ] = useState(false)
    const [ areYouSure, setAreYouSure ] = useState(false)
    
    const router = useRouter()
    // const [ lastComment, setLastComment ] = useState()

    const [disable, setDisabled] = useState(false);

    useEffect(() => {
        const postOwnerRef = doc(db, "users", post.creatorID);
        getDoc(postOwnerRef).then((doc) => {
            setPostOwner(doc.data().email); // TODO: change to displayName later
        });
    }, [post.creatorID]);

    useEffect(() => {
        const docRef = doc(db, "posts", postID);
        onSnapshot(docRef, (doc) => {
            setPostLikeCount(doc.data().likes);
            setPostDislikeCount(doc.data().dislikes);
        })
    }, [postID]);

    
    useEffect(() => {
        return () => {
            clearTimeout();
        }
    }, []);
    
    async function handleLikePost() {
        try {
            if (currUser) {
                const userRef = doc(db, "users", currUser.uid);
                const postRef = doc(db, "posts", postID);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    if ( (userSnap.data().liked.indexOf(postID) == -1) && (userSnap.data().disliked.indexOf(postID) == -1)) {
                        await updateDoc(postRef, {
                            likes: increment(1)
                        });
                        await updateDoc(userRef, {
                            liked: arrayUnion(postID)
                        });
                    }
                    else if ( (userSnap.data().liked.includes(postID)) && (userSnap.data().disliked.indexOf(postID) == -1)) {
                        await updateDoc(postRef, {
                            likes: increment(-1)
                        });
                        await updateDoc(userRef, {
                            liked: userSnap.data().liked.filter((val, i, arr) => {return val != postID})
                        })
                    }
                }
                setDisabled(true);
                setTimeout(() => setDisabled(false), 500);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function handleDislikePost() {
        try {
            if (currUser) {
                const userRef = doc(db, "users", currUser.uid);
                const postRef = doc(db, "posts", postID);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    if ( (userSnap.data().disliked.indexOf(postID) == -1) && (userSnap.data().liked.indexOf(postID) == -1)) {
                        await updateDoc(postRef, {
                            dislikes: increment(-1)
                        });
                        await updateDoc(userRef, {
                            disliked: arrayUnion(postID)
                        });
                    }
                    else if ((userSnap.data().disliked.includes(postID)) && (userSnap.data().liked.indexOf(postID) == -1)) {
                        await updateDoc(postRef, {
                            dislikes: increment(1)
                        });
                        await updateDoc(userRef, {
                            disliked: userSnap.data().disliked.filter((val, i, arr) => {return val != postID})
                        })
                    }
                }
                setDisabled(true);
                setTimeout(() => setDisabled(false), 500);
            }
        } catch (e) {
            console.log(e);
        }
    }

    // TODO: works but doesnt update frontend until refreshed
    async function handleLikeComment(item) {
        try {
            if (currUser) {
                const userRef = doc(db, "users", currUser.uid);
                const commentRef = doc(db, "comments", item.commentID);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    if ((userSnap.data().liked.indexOf(item.commentID) == -1) && (userSnap.data().disliked.indexOf(item.commentID) == -1)) {
                        await updateDoc(commentRef, {
                            likes: increment(1)
                        });
                        await updateDoc(userRef, {
                            liked: arrayUnion(item.commentID)
                        });
                    }
                    else if ((userSnap.data().liked.includes(item.commentID)) && (userSnap.data().disliked.indexOf(item.commentID) == -1)) {
                        await updateDoc(commentRef, {
                            likes: increment(-1)
                        });
                        await updateDoc(userRef, {
                            liked: userSnap.data().liked.filter((val, i, arr) => {return val != item.commentID})
                        })
                    }
                }
                //setDisabled(true);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function handleDislikeComment(item) {
        try {
            if (currUser) {
                const userRef = doc(db, "users", currUser.uid);
                const commentRef = doc(db, "comments", item.commentID);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    if ((userSnap.data().disliked.indexOf(item.commentID) == -1) && (userSnap.data().liked.indexOf(item.commentID) == -1)) {
                        await updateDoc(commentRef, {
                            dislikes: increment(1)
                        });
                        await updateDoc(userRef, {
                            disliked: arrayUnion(item.commentID)
                        });
                    }
                    else if ((userSnap.data().disliked.includes(item.commentID)) && (userSnap.data().liked.indexOf(item.commentID) == -1)) {
                        await updateDoc(commentRef, {
                            dislikes: increment(-1)
                        });
                        await updateDoc(userRef, {
                            disliked: userSnap.data().disliked.filter((val, i, arr) => {return val != item.commentID})
                        })
                    }
                }
                //setDisabled(true);
            }
        } catch (e) {
            console.log(e);
        }
    }

    function handleInsertComment(){
        if(addComment.length > 0)
            try {
                if (currUser) {
                    addDoc(collection(db, "comments"), {
                        comment: addComment,
                        likes: 0,
                        dislikes: 0,
                        creator: currUser.uid
                    }).then((com) => {
                        setCommentsid((commentsid) => [...commentsid, com.id])

                        setLoading(true)
                        setAddComment('')
                        getDoc(com).then((snap) => {
                            const userRef = doc(db, "users", snap.data().creator);
                            getDoc(userRef).then((userDoc) => {
                                setComments((comments) => [...comments, {commentData: snap.data(), commentID: snap.id, userData: userDoc.data()}]);
                            })
                            //setComments((comments) => [...comments, snap.data()])
                            setLoading(false)
                        })

                        // Insert comment into post via postid
                        updateDoc(doc(db, "posts", postID), {
                            commentsID: arrayUnion(com.id)
                        }).catch((error) => {
                            console.log(error)
                        })
                    })
                }
            } 
            catch (error) {
                console.log(error)
            }
    }

    function fetchComments(){
        if(commentsid.length > 0 && comments.length == 0){
            setLoading(true)
            const q = query(collection(db, "comments"), where(documentId(), "in", commentsid))
            getDocs(q).then((docs) => {
                docs.forEach((commentDoc) => {
                    //console.log(commentDoc.data().creator)
                    const userRef = doc(db, "users", commentDoc.data().creator);
                    getDoc(userRef).then((userDoc) => {
                        setComments((comments) => [...comments, {commentData: commentDoc.data(), commentID: commentDoc.id, userData: userDoc.data()}])
                    })
                    ;
                    // setLastComment(commentDoc)
                })
                setLoading(false)
            })
        }
    }

    async function deletePost(){
        const post = await getDoc(doc(db, "posts", postID))
        const data = post.data()

        var commentIDs = data.commentsID
        
        // Delete Every Comment in the post
        if(commentIDs.length > 0){
            const querySnapshot = await getDocs(query(collection(db, "comments"), where(documentId(), 'in', commentIDs)))
            querySnapshot.forEach((doc) => {
                deleteDoc(doc.ref)
            })
        }
        
        // Delete Image
        if(data.imageSrc.length > 0){
            deleteObject(ref(storage, imageSrc))
        }

        // Delete Post
        deleteDoc(doc(db, "posts", postID)).then(() => {
            console.log("Successfully deleted")
            window.location.reload()
        }).catch((error) => {
            console.log(error)
        })
    }

    return (
        <>
        <div className="relative mx-auto mb-28 w-2/5 h-fit bg-card_bg rounded-lg p-5 shadow-lg drop-shadow-md">

            {/* USER PROFILE PIC */}
            <div className="flex mb-5 gap-5 relative" data-testid="user_container">
                <div className="flex relative w-[50px] h-[50px]">
                    <Image className="rounded-[50%]" src={profpic} alt="" fill sizes="(max-width: 50px)"/>
                </div>

                <p className="my-auto text-left">{postOwner}</p>

                {/* Triple Dot Button */}
                {
                    (currUser && currUser.uid == owner) &&
                    <div className="w-[20px] h-[20px] ml-auto mb-5 relative justify-center cursor-pointer"
                        onClick={() => setShowOptions(true)}
                    >
                        <Image src={"/images/triple_dot.png"} alt={""} fill sizes="(max-width: 500px)"/>
                    </div>
                }

                {/* EDIT / DELETE OPTION */}
                {   
                    showOptions &&
                    <div className="absolute top-0 right-0 w-1/4 h-fit drop-shadow-xl shadow-xl flex flex-col z-10">
                        <p className="hover:brightness-95 bg-white border-separate border-black cursor-pointer"
                            onClick={() => {router.push({
                                pathname: '/editpost',
                                query: {
                                    caption: caption,
                                    postID: postID,
                                    profpic: profpic,
                                    imageSrc: imageSrc,
                                    username: postOwner
                                },
                            }, 'edit_post')}}
                        >
                            Edit
                        </p>
                        <p className="hover:brightness-95 bg-white border-separate border-black cursor-pointer"
                            onClick={() => {setAreYouSure(true); setShowOptions(false)}}
                        >
                            Delete
                        </p>

                        <p className="hover:brightness-95 bg-red-200 border-separate border-black cursor-pointer"
                            onClick={() => setShowOptions(false)}
                        >
                            Cancel
                        </p>
                    </div>
                }
            </div>
            
            {
                areYouSure &&
                <div className="absolute top-0 left-0 z-10 w-full h-full bg-black bg-opacity-40 p-5">
                    <div className="w-full h-fit flex flex-col p-5 bg-white rounded-lg gap-5">
                        <p className="text-center text-[20px] font-bold">ARE YOU SURE ?</p>
                        <p>You are about to delete a post.</p>
                        <div className="flex mt-10 justify-center gap-5">
                            <button className="w-full bg-green-200 py-5 font-bold rounded-lg hover:brightness-90"
                                onClick={() => deletePost()}
                            >
                                Delete Post
                            </button>
                            <button className="w-full bg-red-200 py-5 font-bold rounded-lg hover:brightness-90"
                                onClick={() => setAreYouSure(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            }

            {/* IMAGE OF POST, IF AVAILABLE */}
            {
                post.imageSrc.length != 0 &&
                <div className="w-full h-full min-h-[400px] mb-5 relative" data-testid="image">
                    <Image className="rounded-lg" src={post.imageSrc} alt={""} fill sizes="(max-width: 900px)"/>    
                </div>
            }   

            {/* CAPTION OF POST */}
            <p className="mb-5 text-left" data-testid="caption">{post.caption}</p>

            {/* LIKE AND DISLIKE BUTTON CONTAINER */}
            <div className="flex gap-5 mb-5" data-testid="buttons_container">
                <div className="flex gap-1">
                    <button onClick={handleLikePost} disabled={disable}>
                        <HiThumbUp className={`text-[30px] cursor-pointer rounded-lg align-middle ${hasVoted ? "text-red-500" : "text-gray-800"} hover:opacity-75`}/>
                    </button>
                    <p className="my-auto">{postLikeCount}</p>
                </div>
                
                <div className="flex gap-1">
                    <button onClick={handleDislikePost} disabled={disable}>
                        <HiThumbDown className={`text-[30px] cursor-pointer rounded-lg align-middle ${hasVoted ? "text-red-500" : "text-gray-800"} hover:opacity-75`}/>
                    </button>
                    <p className="my-auto">{postDislikeCount}</p>
                </div>
            </div>

            {/* COMMENTS CONTAINER */}
            <div className="flex flex-col w-full rounded-lg">
                {/* ADD COMMENT INPUT */}
                {
                    showComments &&
                    <div className="flex flex-col gap-5">
                        <textarea className="border border-black h-[100px] p-5 rounded-md" placeholder="Enter a comment..."
                            value={addComment} onChange={(e) => {setAddComment(e.target.value)}} 
                        />
                        <div className="flex">
                            <button className="w-1/3 ml-auto border border-black rounded-xl bg-nav_bg text-white hover:brightness-110"
                                onClick={() => {
                                    if(currUser)
                                        handleInsertComment()
                                    else
                                        router.push("/login")
                                }}
                            >
                                Add Comment
                            </button>
                        </div>
                        <p className="text-left">Number of Comments: {commentsid.length}</p>
                    </div>
                }

                
                {/* SHOW ALL COMMENTS */}
                {
                    showComments &&
                    comments.map((item, index) => {
                        return (
                            <div key={index} className="flex flex-col mt-5 bg-card_bg p-5 drop-shadow-lg rounded-lg border border-gray-300">
                                <div className="flex w-full mb-2">
                                    <div className="flex relative w-[30px] h-[30px]">
                                        <Image className="rounded-[50%]" src={item.userData.profPic} alt="" fill sizes="(max-width: 30px)"/>
                                    </div>
                                    <p className="ml-5 w-full text-left my-auto">{item.userData.email}</p>
                                </div>
                                
                                <p className="text-left w-full">{item.commentData.comment}</p>
                            
                                
                                {/* TEMPORARY COMMENT LIKE & DISLIKE BUTTONS TODO: change if needed */}
                                <div className="flex gap-5 mb-5" data-testid="buttons_container">
                                    <div className="flex gap-1">
                                        <button onClick={() => {handleLikeComment(item)}}>
                                            <HiThumbUp className={`text-[30px] cursor-pointer rounded-lg align-middle ${hasVoted ? "text-red-500" : "text-gray-800"} hover:opacity-75`}/>
                                        </button>
                                        <p className="my-auto">{item.commentData.likes}</p>
                                    </div>
                                    
                                    <div className="flex gap-1">
                                        <button onClick={() => {handleDislikeComment(item)}}>
                                            <HiThumbDown className={`text-[30px] cursor-pointer rounded-lg align-middle ${hasVoted ? "text-red-500" : "text-gray-800"} hover:opacity-75`}/>
                                        </button>
                                        <p className="my-auto">{item.commentData.dislikes}</p>
                                    </div>
                                </div>
                            
                            </div>
                        
                        
                        
                        
                        )
                    })
                }

                {/* LOADING SYMBOL */}
                {
                    loading && 
                    <div className="w-[50px] h-[50px] mx-auto mb-5 relative justify-center">
                        <Image src={"/images/loading.gif"} alt={""} fill sizes="(max-width: 500px)"/>
                    </div>
                }

                <p className="mt-5 px-5 py-2 w-full text-left brightness-95 hover:brightness-90 cursor-pointer bg-card_bg rounded-lg select-none"
                    onClick={() => {
                        setShowComments(!showComments)

                        if(commentsid.length > 0){
                            fetchComments()
                        }
                    }}
                >
                    <i className="fa fa-comment pr-2" />{showComments ? "Hide Comments" : "View Comments"}
                </p>
            </div>
        </div>
        </>
        
    )
}
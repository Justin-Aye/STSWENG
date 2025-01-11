
import { HiThumbUp, HiThumbDown } from "react-icons/hi";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { onSnapshot, increment, collection, documentId, getDocs, query, where, addDoc, updateDoc, doc, arrayUnion, arrayRemove, getDoc, deleteDoc, limit, startAfter } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import { useRouter } from "next/router";
import Comment from "./comment";


export default function Card( { currUser, post, profpic, postID } ) {

    const [ hasLiked, setLiked ] = useState(false)
    const [ hasDisliked, setDisliked ] = useState(false)
    
    const [ commentsid, setCommentsid ] = useState(post.commentsID || [])
    const [ loading, setLoading ] = useState(false)
    const [ showComments, setShowComments ] = useState(false)
    const [ commentsCount, setCommentsCount ] = useState(post.commentsID.length || 0)  
    const [ addComment, setAddComment ] = useState('')
    const [ comments, setComments ] = useState([]);
    const [ postOwner, setPostOwner ] = useState("");
    const [ postLikeCount, setPostLikeCount ] = useState(post.likes || 0);
    const [ postDislikeCount, setPostDislikeCount ] = useState(post.dislikes || 0);
    const [ showOptions, setShowOptions ] = useState(false)
    const [ askDeletePost, setaskDeletePost ] = useState(false)

    const [ likeDisabled, setLikeDisabled ] = useState(false)
    const [ dislikeDisabled, setDislikeDisabled ] = useState(false)


    const router = useRouter()
    const [ lastComment, setLastComment ] = useState()

    useEffect(() => {
        try {
            if (post.creatorID) {
                const postOwnerRef = doc(db, "users", post.creatorID);
                getDoc(postOwnerRef).then((doc) => {
                    setPostOwner(doc.data().displayName);
                });
            }
        } catch (e) {
            console.log(e);
        }
    }, [post.creatorID]);

    useEffect(() => {
        const docRef = doc(db, "posts", postID);
        onSnapshot(docRef, (doc) => {
            try {
                setPostLikeCount(doc.data().likes);
                setPostDislikeCount(doc.data().dislikes);
                setCommentsCount(doc.data().commentsID.length);
            } catch (e) {
                console.log("post no longer exists.");
            }
        })
    }, [postID]);
    
    useEffect(() => {

        if(currUser && currUser.data){
            setLiked(currUser.data.liked.includes(postID))
            setDisliked(currUser.data.disliked.includes(postID))
        } 
        
        //console.log(currUser.data.liked)
        return () => {
            clearTimeout();
        }
    }, []);
    
    async function handleLikePost() {
        try {
            if (currUser) {
                if (likeDisabled) return;
                setLikeDisabled(true);

                const userRef = doc(db, "users", currUser.uid);
                const postRef = doc(db, "posts", postID);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    if (userSnap.id != post.creatorID) {
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
                                //liked: userSnap.data().liked.filter((val) => {return val != postID})
                                liked: arrayRemove(postID)
                            })
                        }
                        setLiked(hasDisliked ? hasLiked : !hasLiked)
                    }
                    else {
                        alert("liking own post prohibited");
                    }
                }
                setLikeDisabled(false);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function handleDislikePost() {
        try {
            if (currUser) {
                if (dislikeDisabled) return;
                setDislikeDisabled(true);
                const userRef = doc(db, "users", currUser.uid);
                const postRef = doc(db, "posts", postID);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    if (userSnap.id != post.creatorID) {
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
                                //disliked: userSnap.data().disliked.filter((val) => {return val != postID})
                                disliked: arrayRemove(postID)
                            })
                        }

                        setDisliked(hasLiked ? hasDisliked : !hasDisliked)
                    }
                    else {
                        alert("disliking own post prohibited");    // TODO:
                    }
                }
                setDislikeDisabled(false);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function deletePost(){
        const post = await getDoc(doc(db, "posts", postID))
        if (post.exists()) {
            try {
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
                    const userRef = doc(db, "users", currUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        updateDoc(userRef, {
                            postsID: userSnap.data().postsID.filter((val) => {return val != postID})
                        })
                    }
                    console.log("Successfully deleted")
                    window.location.reload()
                })
            } catch (e) {
                console.log(e);
            }
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

                        getDoc(com).then((snap) => {
                            const userRef = doc(db, "users", snap.data().creator);
                            getDoc(userRef).then((userDoc) => {
                                console.log(snap.data())

                                setComments((comments) => [ { commentData: snap.data(), commentID: snap.id, userData: userDoc.data() }, ...comments ]);
                            })
                            setLoading(false)
                            setAddComment('')
                        })

                        // Insert comment into post via postid
                        updateDoc(doc(db, "posts", postID), {
                            commentsID: arrayUnion(com.id)
                        }).then(() => {
                            updateDoc(doc(db, "users", currUser.uid), {
                                commentIDs: arrayUnion(com.id)
                            });
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

            const q = query(collection(db, "comments"), where(documentId(), "in", commentsid), limit(3))
            getDocs(q).then((docs) => {
                docs.forEach((commentDoc) => {
                    const userRef = doc(db, "users", commentDoc.data().creator);
                    getDoc(userRef).then((userDoc) => {
                        setComments((comments) => [...comments, {commentData: commentDoc.data(), commentID: commentDoc.id, userData: userDoc.data()}])
                    });
                    setLastComment(commentDoc)
                })
                setLoading(false)
            })
        }
    }
    
    function fetchNextComments(){
        if(commentsid.length > 0 && comments.length < commentsid.length){
            setLoading(true)
            const q = query(collection(db, "comments"), where(documentId(), "in", commentsid), startAfter(lastComment), limit(3))
            getDocs(q).then((docs) => {
                docs.forEach((commentDoc) => {
                    const userRef = doc(db, "users", commentDoc.data().creator);
                    getDoc(userRef).then((userDoc) => {
                        setComments((comments) => [...comments, {commentData: commentDoc.data(), commentID: commentDoc.id, userData: userDoc.data()}])
                    });
                    setLastComment(commentDoc)
                })
                setLoading(false)
            })
        }
    }

    return (
        <>
        <div className="mx-auto mb-28 w-full h-fit bg-white rounded-lg p-5 shadow-lg drop-shadow-md">

            {/* USER PROFILE PIC */}
            <div className="relative flex justify-between items-center mb-4 gap-4" data-testid="user_container">
                <div className="flex items-center flex-wrap gap-4">
                    <div className="cursor-pointer relative w-8 h-8 sm:w-12 sm:h-12" onClick={() => {(currUser) ? router.push(`/profile/${post.creatorID}`) : router.push("/login")}}>
                      <Image className="rounded-full hover:brightness-90" src={profpic} alt="" fill sizes="(max-width: 50px)"/>
                    </div>
                    <p className="cursor-pointer hover:underline" onClick={() => {(currUser) ? router.push(`/profile/${post.creatorID}`) : router.push("/login")}}>
                        {postOwner}
                    </p>
                </div>

                {/* Triple Dot Button */}
                {(currUser && currUser.uid == post.creatorID) &&
                  <span className="w-6 h-6 relative cursor-pointer" onClick={() => setShowOptions(!showOptions)}>
                      <Image src={"/images/triple_dot.png"} alt={"Actions Button"} fill sizes="(max-width: 500px)"/>
                  </span>}

                {/* EDIT / DELETE OPTION */}
                {showOptions &&
                  <div className="z-20 w-32 absolute top-0 right-6 2xl:top-0 2xl:-right-40 border rounded-lg text-center drop-shadow-xl shadow-xl overflow-hidden">
                      <p className="py-2 bg-white text-gray-500 cursor-pointer hover:bg-gray-100" onClick={() => setShowOptions(false)}>
                          Cancel
                      </p>

                      <p className="py-2 bg-white text-gray-900 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            router.push({
                              pathname: '/editpost',
                              query: {
                                  caption: post.caption,
                                  postID: postID,
                                  profpic: profpic,
                                  imageSrc: post.imageSrc,
                                  username: postOwner
                              },
                            }, 'edit_post')}
                          }>
                          Edit
                      </p>

                      <p className="py-2 bg-white text-red-500 cursor-pointer hover:bg-gray-100" onClick={() => {setaskDeletePost(true); setShowOptions(!showOptions)}}>
                          Delete
                      </p>
                  </div>}
            </div>
            
            {/* Warns User before deleting the post */}
            {
                askDeletePost &&
                <div className="w-full h-full p-4 absolute top-0 left-0 z-10 bg-gray-900 bg-opacity-60 rounded-lg">
                    <div className="text-center w-full p-4 bg-white rounded-lg">
                        <p className="mb-6 text-2xl sm:text-4xl font-bold">ARE YOU SURE ?</p>
                        <p className="mb-16 text-lg sm:text-xl">This post will be deleted forever!</p>
                        <div className="flex justify-center gap-5">
                            <button className="w-full py-6 bg-red-300 font-bold rounded-lg hover:brightness-90" onClick={() => deletePost()}>
                                Delete Post
                            </button>
                            <button className="w-full py-6 bg-gray-200 font-bold rounded-lg hover:brightness-90" onClick={() => setaskDeletePost(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            }

            {/* IMAGE OF POST, IF AVAILABLE */}
            {
                post.imageSrc != 0 &&
                <div className="mb-4 w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[600px] relative" data-testid="image">
                    <Image className="rounded-lg object-contain w-full h-full" src={post.imageSrc} alt={""} fill sizes="(max-width: 900px)" priority/>    
                </div>
            }   

            {/* CAPTION OF POST */}
            <p className="mb-4 text-center whitespace-pre-wrap" data-testid="caption">{post.caption}</p>

            {/* LIKE AND DISLIKE BUTTON CONTAINER */}
            <div className="flex flex-wrap gap-4 mb-4" data-testid="buttons_container">
                <div className="flex gap-1">
                    <button onClick={handleLikePost} data-testid="postLikeBtn" {...(hasDisliked) && {disabled:true}}>
                        <HiThumbUp className={`text-3xl cursor-pointer rounded-lg align-middle ${hasLiked ? "text-green-300" : "text-gray-900"} hover:opacity-75`}/>
                    </button>
                    <p className="my-auto" data-testid="postLikeCount">{postLikeCount}</p>
                </div>
                
                <div className="flex gap-1">
                    <button onClick={handleDislikePost} data-testid="postDislikeBtn" {...(hasLiked) && {disabled:true}}>
                        <HiThumbDown className={`text-3xl cursor-pointer rounded-lg align-middle ${hasDisliked ? "text-red-400" : "text-gray-900"} hover:opacity-75`}/>
                    </button>
                    <p className="my-auto" data-testid="postDislikeCount">{postDislikeCount}</p>
                </div>
            </div>

            {/* COMMENTS CONTAINER */}
            <div className="flex flex-col w-full rounded-lg">
                {/* ADD COMMENT INPUT */}
                {showComments &&
                    <div className="flex flex-col gap-4 mb-4">
                        <textarea className="border border-gray-400 h-[100px] p-4 rounded-md" placeholder="Enter a comment..."
                            value={addComment} onChange={(e) => {setAddComment(e.target.value)}} 
                        />
                        <div className="flex">
                            <button className="ml-auto py-2 px-4 rounded-full bg-nav-bg text-white transition duration-100 hover:bg-nav-bg-dark" onClick={() => { (currUser) ? handleInsertComment() : router.push("/login")}}>
                                Add Comment
                            </button>
                        </div>
                    </div>
                }

                {/* SHOW COMMENTS BUTTON */}                
                <p className="mb-4 px-4 py-2 cursor-pointer bg-gray-100 rounded-lg hover:bg-gray-200"
                  onClick={() => {
                      setShowComments(!showComments)

                      if(commentsid.length > 0){
                          fetchComments()
                      }
                  }}
                >
                    <i className="fa fa-comment mr-2" />{showComments ? "Hide Comments" : "View Comments"}
                </p>
                
                
                {/* SHOW ALL COMMENTS */}
                { showComments && <p className="text-left mb-4">Total Comments: {commentsCount}</p>}

                {/* LOADING SYMBOL */}
                {loading && 
                    <div className="w-[50px] h-[50px] mx-auto mb-5 relative justify-center">
                        <Image src={"/images/loading.gif"} alt={""} fill sizes="(max-width: 500px)"/>
                    </div>
                }

                { showComments &&
                    comments.map((item, index) => {
                        return (
                            <Comment 
                                key={index}
                                currUser={currUser}
                                item={item}
                                postID={postID}
                                comments_arr={comments}
                                setComments={setComments}
                                commIDs = {commentsid}
                                setCommIDs = {setCommentsid}
                                showComments = {setShowComments}
                            />
                        )
                    })
                }

                {
                    comments.length < commentsid.length && showComments &&
                    <p className="text-purple-900 hover:text-purple-500 hover:underline cursor-pointer" onClick={() => fetchNextComments()}>
                        View More
                    </p>
                }
            </div>
        </div>
        </>
        
    )
}
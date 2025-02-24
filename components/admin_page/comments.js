
import { HiThumbUp, HiThumbDown } from "react-icons/hi";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { onSnapshot, updateDoc, doc, getDoc, getDocs, deleteDoc, arrayRemove, query, collection, where } from "firebase/firestore";
import { db  } from "../../firebaseConfig";


export default function Comments( { index, currUser, item, postID} ) {

    var hasVoted = false;
    const [ commentLikeCount, setCommentLikeCount ] = useState(item.commentData.likes || 0);
    const [ commentDislikeCount, setCommentDislikeCount ] = useState(item.commentData.dislikes || 0);
    const [ commentText, setCommentText ] = useState(item.commentData.comment || "")

    const [ showEditComment, setShowEditComment ] = useState(false)
    const [ selectedCommentVal, setSelectedCommentVal] = useState('')
    const [ showOptions, setShowOptions ] = useState(false)
    const [ askDeleteComment, setAskDeleteComment ] = useState(false)

    const [deleted, setDeleted] = useState(false);

    useEffect(() => {
        const docRef = doc(db, "comments", item.commentID);
        onSnapshot(docRef, (doc) => {
            try {
                setCommentText(doc.data().comment);
                setCommentLikeCount(doc.data().likes);
                setCommentDislikeCount(doc.data().dislikes);
            } catch (e) {
                console.log(`comment ${item.commentID} no longer exists. (has been deleted)`);
            }
        })
    }, []);

    async function deleteComment(){        
        try {
            const currUserRef = doc(db, "users", currUser.uid);
            const currUserSnap = await getDoc(currUserRef);

            if (currUserSnap.exists()) {
                // Remove comment from the post
                updateDoc(doc(db, "posts", postID), {
                    commentsID: arrayRemove(item.commentID)
                })

                // Remove deleted comment from user's commentIDs, liked, and disliked fields
                updateDoc(currUserRef, {
                    commentIDs: currUserSnap.data().commentIDs.filter((val) => val != item.commentID),
                }).then(async () => {
                    // remove comment from liked array
                    const qLiked = await getDocs(query(collection(db, "users"), where("liked", "array-contains", item.commentID)));
                    const qDisliked = await getDocs(query(collection(db, "users"), where("disliked", "array-contains", item.commentID)));

                    if (qLiked.size > 0) {
                        qLiked.forEach(async (userDoc) => {
                            const userSnap = await getDoc(doc(db, "users", userDoc.id));
                            if (userSnap.exists()) {
                                updateDoc(doc(db, "users", userDoc.id), {
                                    liked: userSnap.data().liked.filter((val) => val != item.commentID)
                                })
                            }
                        })
                    }
                    // remove comment from disliked array
                    if (qDisliked.size > 0) {
                        qDisliked.forEach(async (userDoc) => {
                            const userSnap = await getDoc(doc(db, "users", userDoc.id));
                            if (userSnap.exists()) {
                                updateDoc(doc(db, "users", userDoc.id), {
                                    disliked: userSnap.data().disliked.filter((val) => val != item.commentID)
                                })
                            }
                        })
                    }
                })

                // Delete the comment
                const commentRef = doc(db, "comments", item.commentID);
                deleteDoc(commentRef).then(() => {
                    setDeleted(true);
                    setAskDeleteComment(false);
                    console.log("Successfully deleted comment");

                    window.location.reload();
                })
            }
        } catch (e) {
            console.log(e);
        }
    }

    if (!deleted ) {
        return (
            <div data-testid="comment_container">
                <div>
                    {
                        showEditComment &&
                        <div className="absolute top-0 left-0 z-10 w-full h-full bg-black bg-opacity-40 p-5">
                            <div className="w-full h-fit flex flex-col p-5 bg-white rounded-lg gap-5 mt-40">
                                <p className="text-center text-[20px] font-bold">EDIT COMMENT</p>
                                
                                <textarea className="border border-black h-[100px] p-5 rounded-md" placeholder="Enter a comment..."
                                    value={selectedCommentVal} onChange={(e) => {setSelectedCommentVal(e.target.value)}} 
                                />
                                <div className="flex mt-10 justify-center gap-5">
                                    <button className="w-full bg-green-200 py-5 font-bold rounded-lg hover:brightness-90"
                                        onClick={() => saveCommentEdit()}
                                    >
                                        Save Edits
                                    </button>
                                    <button className="w-full bg-red-200 py-5 font-bold rounded-lg hover:brightness-90"
                                        onClick={() => setShowEditComment(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    }

                    {/* Warns User before deleting the comment */}
                    {
                        askDeleteComment &&
                        <div className="absolute top-0 left-0 z-10 w-full h-full bg-black bg-opacity-40 p-5">
                            <div className="w-full h-fit flex flex-col p-5 bg-white rounded-lg gap-5 mt-40">
                                <p className="text-center text-[20px] font-bold">ARE YOU SURE ?</p>
                                <p>You are about to delete a comment.</p>
                                <div className="flex mt-10 justify-center gap-5">
                                    <button className="w-full bg-green-200 py-5 font-bold rounded-lg hover:brightness-90"
                                        onClick={() => deleteComment()}
                                    >
                                        Delete Comment
                                    </button>
                                    <button className="w-full bg-red-200 py-5 font-bold rounded-lg hover:brightness-90"
                                        onClick={() => setAskDeleteComment(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    }
                </div>


                <div key={index} className="flex flex-col mt-5 bg-white p-5 drop-shadow-lg rounded-lg border border-gray-300">            
                    
                    <div className="flex w-full mb-2">
                        <div className="flex relative w-[30px] h-[30px]">
                            <Image className="rounded-[50%]" src={item.userData.profPic} alt="" fill sizes="(max-width: 30px)"/>
                        </div>

                        <p className="ml-5 w-full text-left my-auto">{item.userData.displayName}</p>
                    
                        {/* Triple Dot Button */}
                        <div className="w-[20px] h-[20px] ml-auto mb-5 relative justify-center cursor-pointer"
                            onClick={() => setShowOptions(true)}
                        >
                            <Image src={"/images/triple_dot.png"} alt={""} fill sizes="(max-width: 500px)"/>
                        </div>
                        

                        {/* EDIT / DELETE OPTION */}
                        {   
                            showOptions &&
                            <div className="absolute top-2 right-2 w-1/4 h-fit drop-shadow-xl shadow-xl flex flex-col z-10">
                                <p className="hover:brightness-95 bg-white border-separate border-black cursor-pointer px-2"
                                    onClick={() => {setAskDeleteComment(true); setShowOptions(false)}}
                                >
                                    Delete
                                </p>

                                <p className="hover:brightness-95 bg-red-200 border-separate border-black cursor-pointer px-2"
                                    onClick={() => setShowOptions(false)}
                                >
                                    Cancel
                                </p>
                            </div>
                        }

                    </div>

                    <p className="text-left w-full">{commentText}</p>
                    

                    {/* TEMPORARY COMMENT LIKE & DISLIKE BUTTONS TODO: change if needed */}
                    <div className="flex gap-5 mb-5" data-testid="buttons_container">
                        <div className="flex gap-1">
                            <button disabled>
                                <HiThumbUp className={`text-[30px] cursor-pointer rounded-lg align-middle ${hasVoted ? "text-red-500" : "text-gray-800"} hover:opacity-75`}/>
                            </button>
                            <p className="my-auto">{commentLikeCount}</p>
                        </div>
                        
                        <div className="flex gap-1">
                            <button disabled>
                                <HiThumbDown className={`text-[30px] cursor-pointer rounded-lg align-middle ${hasVoted ? "text-red-500" : "text-gray-800"} hover:opacity-75`}/>
                            </button>
                            <p className="my-auto">{commentDislikeCount}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
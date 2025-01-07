
import { HiThumbUp, HiThumbDown } from "react-icons/hi";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    onSnapshot,
    increment,
    updateDoc,
    doc,
    arrayUnion,
    getDoc,
    getDocs,
    deleteDoc,
    arrayRemove,
    query,
    collection,
    where,
    union,
} from "firebase/firestore";
import { db  } from "../firebaseConfig";


export default function Comment({
    index,
    currUser,
    item,
    postID,
    comments_arr,
    setComments,
    commIDs,
    setCommIDs,
    showComments
}) {
    const [ hasLiked, setLiked ] = useState(false)
    const [ hasDisliked, setDisliked ] = useState(false)

    const [commentLikeCount, setCommentLikeCount] = useState(
        item.commentData.likes || 0
    );
    const [commentDislikeCount, setCommentDislikeCount] = useState(
        item.commentData.dislikes || 0
    );
    const [commentText, setCommentText] = useState(
        item.commentData.comment || ""
    );
    // const [ lastComment, setLastComment ] = useState()

    const [showEditComment, setShowEditComment] = useState(false);
    const [selectedCommentVal, setSelectedCommentVal] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const [askDeleteComment, setAskDeleteComment] = useState(false);

    const [ likeDisabled, setLikeDisabled ] = useState(false)
    const [ dislikeDisabled, setDislikeDisabled ] = useState(false)
    const [deleted, setDeleted] = useState(false);

    useEffect(() => {
        const docRef = doc(db, "comments", item.commentID);
        onSnapshot(docRef, (doc) => {
            try {
                setCommentText(doc.data().comment);
                setCommentLikeCount(doc.data().likes);
                setCommentDislikeCount(doc.data().dislikes);
            } catch (e) {
                console.log(
                    `comment ${item.commentID} no longer exists. (has been deleted)`
                );
            }
        });
    }, [item.commentID]);

    async function handleLikeComment(item) {
        try {
            if (currUser) {
                if (likeDisabled) return;
                setLikeDisabled(true);
                
                const userRef = doc(db, "users", currUser.uid);
                const commentRef = doc(db, "comments", item.commentID);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    if (userSnap.id != item.commentData.creator) {
                        if (
                            userSnap.data().liked.indexOf(item.commentID) ==
                                -1 &&
                            userSnap.data().disliked.indexOf(item.commentID) ==
                                -1
                        ) {
                            await updateDoc(commentRef, {
                                likes: increment(1),
                            });
                            await updateDoc(userRef, {
                                liked: arrayUnion(item.commentID),
                            });
                        } else if (
                            userSnap.data().liked.includes(item.commentID) &&
                            userSnap.data().disliked.indexOf(item.commentID) ==
                                -1
                        ) {
                            await updateDoc(commentRef, {
                                likes: increment(-1),
                            });
                            await updateDoc(userRef, {
                                // liked: userSnap.data().liked.filter((val, i, arr) => {return val != item.commentID;})
                                liked: arrayRemove(item.commentID)
                            });
                        }
                        setLiked(hasDisliked ? hasLiked : !hasLiked);
                    } else {
                        alert("liking own comment prohibited"); // TODO:
                    }
                }
                setLikeDisabled(false);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function handleDislikeComment(item) {
        try {
            if (currUser) {
                if (dislikeDisabled) return;
                setDislikeDisabled(true);

                const userRef = doc(db, "users", currUser.uid);
                const commentRef = doc(db, "comments", item.commentID);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    if (userSnap.id != item.commentData.creator) {
                        if (
                            userSnap.data().disliked.indexOf(item.commentID) ==
                                -1 &&
                            userSnap.data().liked.indexOf(item.commentID) == -1
                        ) {
                            await updateDoc(commentRef, {
                                dislikes: increment(-1),
                            });
                            await updateDoc(userRef, {
                                disliked: arrayUnion(item.commentID),
                            });
                        } else if (
                            userSnap.data().disliked.includes(item.commentID) &&
                            userSnap.data().liked.indexOf(item.commentID) == -1
                        ) {
                            await updateDoc(commentRef, {
                                dislikes: increment(1),
                            });
                            await updateDoc(userRef, {
                                // disliked: userSnap.data().disliked.filter((val, i, arr) => {return val != item.commentID;})
                                disliked: arrayRemove(item.commentID)
                            });
                        }

                        setDisliked(hasLiked ? hasDisliked : !hasDisliked);
                    } else {
                        alert("disliking own comment prohibited"); // TODO:
                    }
                }
                setDislikeDisabled(false);
            }
        } catch (e) {
            console.log(e);
        }
    }

    function saveCommentEdit() {
        // If Changes have been made
        if (selectedCommentVal != item.commentData.comment) {
            updateDoc(doc(db, "comments", item.commentID), {
                comment: selectedCommentVal,
            })
                .then(() => {
                    setShowEditComment(false);
                    setSelectedCommentVal("");
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            setShowEditComment(false);
            setSelectedCommentVal("");
        }
    }

    async function deleteComment() {
        try {
            const currUserRef = doc(db, "users", currUser.uid);
            const currUserSnap = await getDoc(currUserRef);

            if (currUserSnap.exists()) {
                // Remove comment from the post
                updateDoc(doc(db, "posts", postID), {
                    commentsID: arrayRemove(item.commentID),
                });
                // Remove deleted comment from user's commentIDs, liked, and disliked fields
                updateDoc(currUserRef, {
                    commentIDs: currUserSnap
                        .data()
                        .commentIDs.filter((val) => val != item.commentID),
                }).then(async () => {
                    // remove comment from liked array
                    const qLiked = await getDocs(
                        query(
                            collection(db, "users"),
                            where("liked", "array-contains", item.commentID)
                        )
                    );
                    const qDisliked = await getDocs(
                        query(
                            collection(db, "users"),
                            where("disliked", "array-contains", item.commentID)
                        )
                    );

                    if (qLiked.size > 0) {
                        qLiked.forEach(async (userDoc) => {
                            const userSnap = await getDoc(
                                doc(db, "users", userDoc.id)
                            );
                            if (userSnap.exists()) {
                                updateDoc(doc(db, "users", userDoc.id), {
                                    liked: userSnap
                                        .data()
                                        .liked.filter(
                                            (val) => val != item.commentID
                                        ),
                                });
                            }
                        });
                    }
                    // remove comment from disliked array
                    if (qDisliked.size > 0) {
                        qDisliked.forEach(async (userDoc) => {
                            const userSnap = await getDoc(
                                doc(db, "users", userDoc.id)
                            );
                            if (userSnap.exists()) {
                                updateDoc(doc(db, "users", userDoc.id), {
                                    disliked: userSnap
                                        .data()
                                        .disliked.filter(
                                            (val) => val != item.commentID
                                        ),
                                });
                            }
                        });
                    }
                });

                // Delete the comment
                const commentRef = doc(db, "comments", item.commentID);
                deleteDoc(commentRef).then(() => {
                    setDeleted(true);
                    setAskDeleteComment(false);
                    setComments((comments_arr) =>
                        comments_arr.filter(
                            (comment) => comment.commentID !== item.commentID
                        )
                    )
                    setCommIDs((commIDs) =>
                        commIDs.filter((id) => id !== item.commentID)
                    )
                    showComments(false)
                    console.log("Successfully deleted comment");
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    if (!deleted) {
        return (
            <div data-testid="comment_container">
                <div>
                    {showEditComment && (
                        <div className="w-full h-full p-4 absolute top-0 left-0 z-10 bg-gray-900 bg-opacity-60 rounded-lg">
                            <div className="text-center w-full p-4 bg-white rounded-lg">
                                <p className="mb-6 text-2xl sm:text-4xl font-bold"> EDIT COMMENT </p>

                                <textarea className="w-full mb-16 p-4 border border-gray-400 h-[100px] rounded-md" placeholder="Enter a comment..." value={selectedCommentVal} onChange={(e) => {setSelectedCommentVal(e.target.value);}}/>
                                
                                <div className="flex justify-center gap-5">
                                    <button className="w-full py-6 bg-green-300 font-bold rounded-lg hover:brightness-90" onClick={() => saveCommentEdit()}>
                                        Save Edit
                                    </button>
                                    <button
                                        className="w-full py-6 bg-gray-200 font-bold rounded-lg hover:brightness-90"
                                        onClick={() =>
                                            setShowEditComment(false)
                                        }
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Warns User before deleting the comment */}
                    {askDeleteComment && (
                        <div className="w-full h-full p-4 absolute top-0 left-0 z-10 bg-gray-900 bg-opacity-60 rounded-lg">
                            <div className="text-center w-full p-4 bg-white rounded-lg">
                                <p className="mb-6 text-2xl sm:text-4xl font-bold">ARE YOU SURE ?</p>
                                <p className="mb-16 text-lg sm:text-xl">This comment will be deleted forever!</p>
                                <div className="flex justify-center gap-5">
                                    <button className="w-full py-6 bg-red-300 font-bold rounded-lg hover:brightness-90" onClick={() => deleteComment()}>
                                        Delete Comment
                                    </button>
                                    <button className="w-full py-6 bg-gray-200 font-bold rounded-lg hover:brightness-90" onClick={() => setAskDeleteComment(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div key={index} className="mb-4 p-4 flex flex-col bg-card-bg drop-shadow-lg rounded-lg border border-gray-300">
                    <div className="relative flex justify-between items-center mb-4 gap-4">
                        <div className="w-full flex items-center flex-wrap gap-4">
                            <div className="relative w-8 h-8 sm:w-12 sm:h-12">
                                <Image className="rounded-full" src={item.userData.profPic} alt={`${item.userData.displayName} profpic`} fill sizes="(max-width: 50px)"/>
                            </div>
                            <p className="">
                                {item.userData.displayName}
                            </p>
                        </div>

                        {/* Triple Dot Button */}
                        {currUser && currUser.uid == item.commentData.creator && (
                            <span className="w-6 h-6 relative cursor-pointer" onClick={() => setShowOptions(true)}>
                                <Image src={"/images/triple_dot.png"} alt="Comment Actions" fill sizes="(max-width: 500px)"/>
                            </span>
                        )}

                        {/* EDIT / DELETE OPTION */}
                        {showOptions && (
                            <div className="z-20 w-32 absolute top-0 right-6 2xl:top-0 2xl:-right-40 border rounded-lg text-center drop-shadow-xl shadow-xl overflow-hidden">
                                <p className="py-2 bg-white text-gray-500 cursor-pointer hover:bg-gray-100" onClick={() => setShowOptions(false)}>
                                    Cancel
                                </p>

                                <p className="py-2 bg-white text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => {setShowEditComment(true);}}>
                                    Edit
                                </p>
                                <p className="py-2 bg-white text-red-500 cursor-pointer hover:bg-gray-100" onClick={() => { setAskDeleteComment(true); setShowOptions(false);}}>
                                    Delete
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-left w-full mb-4">{commentText}</p>

                    {/* TEMPORARY COMMENT LIKE & DISLIKE BUTTONS TODO: change if needed */}
                    <div className="flex flex-wrap gap-4" data-testid="buttons_container">
                        <div className="flex gap-1">
                            <button onClick={() => {handleLikeComment(item);}} {...(hasDisliked) && {disabled:true}}>
                                <HiThumbUp className={`text-3xl cursor-pointer rounded-lg align-middle ${hasLiked ? "text-green-300" : "text-gray-900"} hover:opacity-75`}/>
                            </button>
                            <span className="my-auto">{commentLikeCount}</span>
                        </div>

                        <div className="flex gap-1">
                            <button onClick={() => {handleDislikeComment(item);}} {...(hasLiked) && {disabled:true}}>
                                <HiThumbDown className={`text-3xl cursor-pointer rounded-lg align-middle ${hasDisliked ? "text-red-400" : "text-gray-900"} hover:opacity-75`}/>
                            </button>
                            <span className="my-auto">
                                {commentDislikeCount}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
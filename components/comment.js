
import { HiThumbUp, HiThumbDown } from "react-icons/hi";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { onSnapshot, increment, updateDoc, doc, arrayUnion, getDoc } from "firebase/firestore";
import { db  } from "../firebaseConfig";


export default function Comment( { index, currUser, item } ) {

    var hasVoted = false;

    const [ commentLikeCount, setCommentLikeCount ] = useState(item.likes || 0);
    const [ commentDislikeCount, setCommentDislikeCount ] = useState(item.dislikes || 0);
    // const [ lastComment, setLastComment ] = useState()

    const [disable, setDisabled] = useState(false);

    useEffect(() => {
        const docRef = doc(db, "comments", item.commentID);
        onSnapshot(docRef, (doc) => {
            setCommentLikeCount(doc.data().likes);
            setCommentDislikeCount(doc.data().dislikes);
        })
    });

    async function handleLikeComment(item) {
        try {
            if (currUser) {
                const userRef = doc(db, "users", currUser.uid);
                const commentRef = doc(db, "comments", item.commentID);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    if (userSnap.id != item.commentData.creator) {
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
                    else {
                        alert("liking own comment prohibited");     // TODO:
                    }
                }
                setDisabled(true);
                setTimeout(() => setDisabled(false), 500);
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
                    if (userSnap.id != item.commentData.creator) {
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
                    else {
                        alert("disliking own comment prohibited"); // TODO:
                    }
                }
                setDisabled(true);
                setTimeout(() => setDisabled(false), 500);
            }
        } catch (e) {
            console.log(e);
        }
    }


    return (
        <div key={index} className="flex flex-col mt-5 bg-card_bg p-5 drop-shadow-lg rounded-lg border border-gray-300">
            {index}
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
                    <button onClick={() => {handleLikeComment(item)}} disabled={disable}>
                        <HiThumbUp className={`text-[30px] cursor-pointer rounded-lg align-middle ${hasVoted ? "text-red-500" : "text-gray-800"} hover:opacity-75`}/>
                    </button>
                    <p className="my-auto">{commentLikeCount}</p>
                </div>
                
                <div className="flex gap-1">
                    <button onClick={() => {handleDislikeComment(item)}} disabled={disable}>
                        <HiThumbDown className={`text-[30px] cursor-pointer rounded-lg align-middle ${hasVoted ? "text-red-500" : "text-gray-800"} hover:opacity-75`}/>
                    </button>
                    <p className="my-auto">{commentDislikeCount}</p>
                </div>
            </div>
        </div>
        
    )
}
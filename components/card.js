
import { HiThumbUp, HiThumbDown } from "react-icons/hi";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { collection, documentId, getDocs, query, where, addDoc, updateDoc, doc, arrayUnion, startAfter, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export default function Card( { currUser, username, imageSrc, caption, profpic, likes, dislikes, commentsID, postID } ) {

    var hasVoted = false;
    
    const [ commentsid, setCommentsid ] = useState(commentsID)
    const [ loading, setLoading ] = useState(false)
    const [ showComments, setShowComments ] = useState(false)

    const [ addComment, setAddComment ] = useState('')
    const [ comments, setComments ] = useState([])

    // const [ lastComment, setLastComment ] = useState()

    function handleInsertComment(){
        if(addComment.length > 0)
            try {
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
                        setComments((comments) => [...comments, snap.data()])
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
            catch (error) {
                console.log(error)
            }
    }

    function fetchComments(){
        if(commentsid.length > 0 && comments.length == 0){
            setLoading(true)
            const q = query(collection(db, "comments"), where(documentId(), "in", commentsid))
            getDocs(q).then((docs) => {
                docs.forEach((doc) => {
                    setComments((comments) => [...comments, doc.data()])
                    // setLastComment(doc)
                })
                setLoading(false)
            })
        }
    }

    useEffect(() => {

    }, [])

    return (
        <div className="mx-auto mb-28 w-2/5 h-fit bg-card_bg rounded-lg p-5 shadow-lg drop-shadow-md">

            {/* USER PROFILE PIC */}
            <div className="flex mb-5 gap-5" data-testid="user_container">
                <img className="w-[50px] h-[50px] rounded-[50%]" src={profpic} alt="" />
                <p className="my-auto text-left">{username}</p>
            </div>
            
            {/* IMAGE OF POST, IF AVAILABLE */}
            {
                imageSrc.length != 0 &&
                <div className="w-full h-full min-h-[400px] mb-5 relative" data-testid="image">
                    <Image className="rounded-lg" src={imageSrc} alt={""} fill sizes="(max-width: 900px)"/>    
                </div>
            }   

            {/* CAPTION OF POST */}
            <p className="mb-5 text-left" data-testid="caption">{caption}</p>

            {/* LIKE AND DISLIKE BUTTON CONTAINER */}
            <div className="flex gap-5 mb-5" data-testid="buttons_container">
                <div className="flex gap-1">
                    <HiThumbUp className={`text-[30px] cursor-pointer rounded-lg align-middle ${hasVoted ? "text-red-500" : "text-gray-800"} hover:opacity-75`}/>
                    <p className="my-auto">{likes.toLocaleString('en-US')}</p>
                </div>
                
                <div className="flex gap-1">
                    <HiThumbDown className={`text-[30px] cursor-pointer rounded-lg align-middle ${hasVoted ? "text-red-500" : "text-gray-800"} hover:opacity-75`}/>
                    <p className="my-auto">{dislikes.toLocaleString('en-US')}</p>
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
                                onClick={() => {handleInsertComment()}}
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
                            <div key={index} className="flex flex-col mt-5 bg-card_bg p-5 shadow-xl rounded-lg border border-gray-300">
                                <div className="flex w-full mb-2">
                                    <div className="flex relative w-[30px] h-[30px]">
                                        <Image className="rounded-[50%]" src={profpic} alt="" fill sizes="(max-width: 30px)"/>
                                    </div>
                                    <p className="ml-5 w-full text-left my-auto">{username}</p>
                                </div>
                                
                                <p className="text-left w-full">{item.comment}</p>
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

                {/* SHOW COMEMTNS BUTTON */}
                <p className="mt-5 px-5 py-2 text-white w-full text-left hover:brightness-110 cursor-pointer bg-nav_bg rounded-lg select-none"
                    onClick={() => {
                        setShowComments(!showComments)

                        if(commentsid.length > 0){
                            fetchComments()
                        }
                    }}
                >
                    {showComments ? "Hide Comments" : "View Comments"}
                </p>


            </div>
        </div>
    )
}
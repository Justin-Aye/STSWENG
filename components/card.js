
import { HiThumbUp, HiThumbDown } from "react-icons/hi";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { collection, documentId, getDocs, query, where, addDoc, updateDoc, doc, arrayUnion, getDoc, deleteDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import { useRouter } from "next/router";

export default function Card( { currUser, username, imageSrc, caption, profpic, likes, dislikes, commentsID, postID, creator } ) {

    var hasVoted = false;
    
    const [ loading, setLoading ] = useState(false)
    const [ showComments, setShowComments ] = useState(false)
    const [ showOptions, setShowOptions ] = useState(false)
    const [ areYouSure, setAreYouSure ] = useState(false)

    const [ commentsid, setCommentsid ] = useState(commentsID)
    const [ addComment, setAddComment ] = useState('')
    const [ comments, setComments ] = useState([])

    const router = useRouter()

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

    useEffect(() => {

    }, [])

    return (
        <>
        <div className="relative mx-auto mb-28 w-2/5 h-fit bg-card_bg rounded-lg p-5 shadow-lg drop-shadow-md">

            {/* USER PROFILE PIC */}
            <div className="flex mb-5 gap-5 relative" data-testid="user_container">
                <div className="flex relative w-[50px] h-[50px]">
                    <Image className="rounded-[50%]" src={profpic} alt="" fill sizes="(max-width: 50px)"/>
                </div>
                <p className="my-auto text-left">{username}</p>

                {/* Triple Dot Button */}
                {
                    (currUser && currUser.uid == creator) &&
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
                                    username: username
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
        </>
        
    )
}

import { db, auth, storage } from "../firebaseConfig";
import { getDocs, doc, collection, addDoc, query, arrayUnion, updateDoc, where, documentId, getDoc, deleteDoc} from "@firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable, deleteObject, } from 'firebase/storage';
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from "react";
import { uuidv4 } from "@firebase/util";

export default function Comment(){

    const router = useRouter()
    const [commentDocs, setCommentDocs] = useState()
    const [currUser, setUser] = useState()

    // Data for test Adds
    const [caption, setCaption] = useState('')
    const [image, setImage] = useState(null)
    const [imgUrl, setUrl] = useState('')
    const [comment, setComment] = useState('')


    // Data For test Edits
    const [testCaption, setEditCaption] = useState('')
    const [testImg, setEditImg] = useState()
    const [editImgUrl, setEditImgUrl] = useState()
    const [newEditImgUrl, setNewEditImgUrl] = useState()
    const [testComment, setTestComment] = useState()
    const [deletePostID, setDeletePostID] = useState('')
    const [deleteCommentID, setDeleteCommentID] = useState('')
    

    // Show divs
    const [testPost, setTestPost] = useState(false)
    const [testEditPost, setEditPost] = useState(false)
    const [testAddComment, setTestAddComment] = useState(false)
    const [testEditComment, setTestEditComment] = useState(false)
    const [testDeletePost, setTestDeletePost] = useState(false)
    const [testDeleteComment, setTestDeleteComment] = useState(false)

    // Test Document Ids
    var test_Post_ID = "dGD50NbeoT7W1ARstuxF"
    var test_comment_ID = "3IDTs27dFGdoLP4lURAV"

    function handleInsertComment(){
        try {
            addDoc(collection(db, "comments"), {
                comment: comment,
                likes: 0,
                dislikes: 0,
                creator: currUser.uid
            }).then((com) => {

                // Insert comment into post via postid
                updateDoc(doc(db, "posts", test_Post_ID), {
                    commentsID: arrayUnion(com.id)
                }).then(() => {
                    window.location.reload()
                }).catch((error) => {
                    console.log(error)
                })
            })
        } 
        catch (error) {
            console.log(error)
        }
    }

    function handleImageUpload(e, val){
        let file = e.target.files
        if(file[0] != null){
            const fileType = file[0]["type"]
            const validTypes = ["image/gif", "image/jpeg", "image/png"]

            if (validTypes.includes(fileType)) {
                if(val == 1){
                    setImage( file[0] )
                    setUrl( URL.createObjectURL(file[0]) )
                }
                else if (val == 2){
                    setEditImg( file[0] )
                    setNewEditImgUrl( URL.createObjectURL(file[0]) )
                }
            } else {
                console.log("Only Images of Type JPEG, PNG, and GIF are accepted")
            }
        }
    }

    // Uploads a post object to database
    async function uploadPost(){
        
        if(image == null){
            try {
                addDoc(collection(db, "posts"), {
                    caption: caption,
                    likes: 0,
                    dislikes: 0,
                    imageSrc: "",
                    creatorID: currUser.uid,
                    commentsID: []
                }).then(() => {
                    console.log("Post has been added")
                    window.location.reload()
                })
            } 
            catch (error) {
                console.log(error)
            }
        }

        else{
            // Sets up unique file name
            const uid = uuidv4()
            const filename = "images/" + image.name + "_" + uid

            // Reference to firebase storage, and intended filename
            const storageRef = ref( storage, filename)

            // Uploads an Image to Firebase
            uploadBytesResumable( storageRef,  image).then((uploadResult) => {

                // Get Firebase Image Url for post
                getDownloadURL(uploadResult.ref).then((res) => {
                    try {
                        addDoc(collection(db, "posts"), {
                            caption: caption,
                            likes: 0,
                            dislikes: 0,
                            imageSrc: res,
                            creatorID: currUser.uid,
                            commentsID: []
                        }).then(() => {
                            console.log("Post has been added")
                            window.location.reload()
                        })
                    } 
                    catch (error) {
                        console.log(error)
                    }
                }).catch((error) => {
                    console.log(error)
                })
            }).catch((error) => {
                console.log(error)
            })
        }
    }

    // Get all comments in a post
    async function getComments() {

        // Get Post's array of comments
        const post = await getDoc(doc(db, "posts", test_Post_ID))
        const comments = post.data().commentsID
        if(comments.length == 0)
            return []

        // For every comment in list 
        const arr = [];
        const querySnapshot = await getDocs(query(collection(db, "comments"), where(documentId(), 'in', comments)))
        querySnapshot.forEach((doc) => {
            var d = doc.data()
            arr.push({
                commentID: doc.id,
                data: d
            });
        });
        setCommentDocs(arr);
    }

    async function saveCommentEdits(){
        try {
            updateDoc(doc(db, "comments", test_comment_ID), {
                comment: testComment
            }).then(() => {
                window.location.reload()
            }).catch((error) => {
                console.log(error)
            })
        } catch (error) {
            console.log(error)
        }
    }

    // Saves All Post edits 
    async function savePostEdits(){
        // If post has no image and you did not upload any new Image
        if(editImgUrl == '' && testImg == null){
            console.log("Situation 1")
            try {
                updateDoc(doc(db, "posts", test_Post_ID), {
                    caption: testCaption,
                    imageSrc: ""
                }).then(() => {
                    window.location.reload()
                }).catch((error) => {
                    console.log(error)
                })
            } catch (error) {
                console.log(error)
            }
        }
        
        // If post has an image and no new uploads
        else if(editImgUrl != null && testImg == null){
            console.log("Situation 2")
            try {
                updateDoc(doc(db, "posts", test_Post_ID), {
                    caption: testCaption,
                    imageSrc: editImgUrl
                }).then(() => {
                    window.location.reload()
                }).catch((error) => {
                    console.log(error)
                })
            } catch (error) {
                console.log(error)
            }
        }

        else{
            console.log("Situation 3")
            // Sets up unique file name
            const uid = uuidv4()
            const filename = "images/" + testImg.name + "_" + uid

            // Reference to firebase storage, and intended filename
            const storageRef = ref( storage, filename)

            // Delete Current Post Image from database
            deleteObject(ref(storage, editImgUrl)).then(() => {
                
                // Uploads new Image to Firebase
                uploadBytesResumable( storageRef,  testImg).then((uploadResult) => {

                    // Get Firebase Image Url for post
                    getDownloadURL(uploadResult.ref).then((res) => {
                        try {
                            updateDoc(doc(db, "posts", test_Post_ID), {
                                caption: testCaption,
                                imageSrc: res
                            }).then(() => {
                                window.location.reload()
                            }).catch((error) => {
                                console.log(error)
                            })
                        } catch (error) {
                            console.log(error)
                        }
                    }).catch((error) => {
                        console.log(error)
                    })
                }).catch((error) => {
                    console.log(error)
                })
              }).catch((error) => {
                console.log(error)
            });
        }
    }

    async function deletePost(){
        const post = await getDoc(doc(db, "posts", deletePostID))
        const data = post.data()

        if(currUser.uid != data.creatorID)
            console.log("Error: You did not create this post")
        else{
            var commentIDs = data.commentsID
            
            // Delete Every Comment in the post
            const querySnapshot = await getDocs(query(collection(db, "comments"), where(documentId(), 'in', commentIDs)))
            querySnapshot.forEach((doc) => {
                deleteDoc(doc.ref)
            })

            // Delete Post
            deleteDoc(doc(db, "posts", deletePostID)).then(() => {
                console.log("Successfully deleted")
                window.location.reload()
            }).catch((error) => {
                console.log(error)
            })
        }
    }

    async function deleteComment(){
        deleteDoc(doc(db, "comments", deleteCommentID)).then(() => {
            console.log("Comment Deleted")
            window.location.reload()
        }).catch((error) => {
            console.log(error)
        })
    }

    async function getPost( postID ){
        const post = await getDoc(doc(db, "posts", postID))
        var data = post.data()
        setEditImgUrl(data.imageSrc)
        setEditCaption(data.caption)
    }

    async function getComment( commentID ){
        const comm = await getDoc(doc(db, "comments", commentID))
        var data = comm.data()
        setTestComment(data.comment)
    }

    const isFirstRender = useRef(true);
    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if(user)
                setUser(user)
            else
                router.push("/")
        })

        // Usually runs twice in strict mode, so this is set to run once
        if(isFirstRender.current){
            getComments()
            getPost(test_Post_ID)
            getComment(test_comment_ID)
            isFirstRender.current = false
        }
    }, [])

    return (
        <div className="flex flex-col justify-center mt-[50px]">

            {/* TEST ADD POST USING ACC */}
            {   testPost &&
                <div className="flex flex-col">
                    <textarea className="w-1/2 h-[200px] p-5 mx-auto border border-black" placeholder="Image Caption" 
                        onChange={(e) => {setCaption(e.target.value)}}
                    />

                    <img src={imgUrl} alt="" className="w-1/2 h-auto mx-auto my-5" />
                    <div className="mx-auto py-2 relative w-1/6 justify-center bg-gray-100 rounded-md border-2 border-black border-dotted cursor-pointer hover:brightness-90">
                        <input
                            id="image_files"
                            type="file"
                            onChange={(e) => {handleImageUpload(e, 1)}}
                            className="absolute h-full w-full bg-transparent opacity-0 z-10 cursor-pointer"
                        />

                        <img
                            src="/images/add_image_icon.png"
                            alt=""
                            className="max-h-[40px] m-auto cursor-pointer"
                        />

                        <p className="w-full text-center font-bold text-[12px] cursor-pointer">
                            Upload an Image
                        </p>
                    </div>

                    <button className="mx-auto border my-5 border-black w-1/8 bg-green-200 px-5" onClick={() => uploadPost()}>Upload Post</button>
                </div>
            }
            <button className={`mx-auto border border-black p-2 ${ testPost? "bg-red-300" : "bg-gray-300"} mb-5` }
                onClick={() => setTestPost(!testPost)}>Test Add Post
            </button>


            {/* TEST ADD COMMENT ON POST */}
            {  testAddComment &&
                <div className="flex flex-col">
                    <textarea className="w-1/2 h-[200px] p-5 mx-auto border border-black" placeholder="Enter a comment" 
                        onChange={(e) => { setComment(e.target.value) }}
                    />
                    <button className="border border-black w-[100px] mx-auto bg-green-200 mb-10" onClick={() => {handleInsertComment()}}>
                        Submit
                    </button>

                    <div className="flex flex-col text-center">
                        All Comments:
                        {
                            commentDocs && commentDocs.map((val, key) => {
                                return (

                                    <p key={key} className="bg-green-200 w-[200px] mx-auto">
                                        { val.data.comment }
                                    </p>
                                )
                            })
                        }
                    </div>
                </div>
            }
            <button className={`mx-auto border border-black p-2 ${ testAddComment ? "bg-red-300" : "bg-gray-300"} my-5`}
                onClick={() => setTestAddComment(!testAddComment)}>Test Add Comment
            </button>


            {/* TEST EDITING A POST*/}
            {   testEditPost &&
                <div className="flex flex-col">
                    <p className="text-center">Post ID: {test_Post_ID}</p>
                    <div className="flex flex-col">
                        <img src={newEditImgUrl ? newEditImgUrl : editImgUrl} alt="" className="w-1/2 h-auto mx-auto my-5 border border-black" />

                        <textarea className="w-1/2 h-[200px] p-5 mx-auto border border-black" placeholder="Image Caption" 
                            value={testCaption} onChange={(e) => {setEditCaption(e.target.value)}}
                        />

                        <div className="mx-auto py-2 relative w-1/6 justify-center bg-gray-100 rounded-md border-2 border-black border-dotted cursor-pointer hover:brightness-90">
                            <input
                                id="image_files"
                                type="file"
                                onChange={(e) => {handleImageUpload(e, 2)}}
                                className="absolute h-full w-full bg-transparent opacity-0 z-10 cursor-pointer"
                            />

                            <img
                                src="/images/add_image_icon.png"
                                alt=""
                                className="max-h-[40px] m-auto cursor-pointer"
                            />

                            <p className="w-full text-center font-bold text-[12px] cursor-pointer">
                                Upload an Image
                            </p>
                        </div>

                        <button className="mx-auto border my-5 border-black w-1/8 bg-green-200 px-5" onClick={() => savePostEdits()}>
                            Save Edits
                        </button>
                    </div>
                </div>
            }

            <button className={`mx-auto border border-black p-2 ${ testEditPost ? "bg-red-300" : "bg-gray-300"} my-5`}
                onClick={() => setEditPost(!testEditPost)}>Test Edit Post
            </button>


            {/* TEST EDIT COMMENT ON POST */}
            {  testEditComment &&
                <div className="flex flex-col">
                    <p className="text-center">Comment ID: {test_comment_ID}</p>
                    <textarea className="w-1/2 h-[200px] p-5 mx-auto border border-black" placeholder="Enter a comment" 
                        onChange={(e) => { setTestComment(e.target.value) }} value={testComment}
                    />
                    
                    <button className="border border-black w-[100px] mx-auto bg-green-200 mb-10" onClick={() => {saveCommentEdits()}}>
                        Save Changes
                    </button>

                    <div className="flex flex-col text-center">
                        All Comments:
                        {
                            commentDocs && commentDocs.map((val, key) => {
                                return (

                                    <p key={key} className="bg-green-200 w-[200px] mx-auto">
                                        { val.data.comment }
                                    </p>
                                )
                            })
                        }
                    </div>
                </div>
            }
            <button className={`mx-auto border border-black p-2 ${ testEditComment ? "bg-red-300" : "bg-gray-300"} my-5`}
                onClick={() => setTestEditComment(!testEditComment)}>Test Edit Comment
            </button>


            {/* TEST DELETING POST BY POST ID */}
            {   testDeletePost &&
                <div className="flex flex-col">
                    <p className="text-center text-red-500">*You can only delete posts you've made</p>
                    <div className="flex gap-2">                    
                        <p className="text-center w-fit ml-auto">Enter Post ID to Delete:</p>
                        <input className="w-1/6 mr-auto p-2 border border-black" type="text" id=""
                            onChange={(e) => {setDeletePostID(e.target.value)}}
                        />
                    </div>
                    <button className="border border-black w-[100px] mx-auto bg-green-200 mb-10" onClick={() => {deletePost()}}>
                        Delete Post
                    </button>
                </div>
            }
            <button className={`mx-auto border border-black p-2 ${ testDeletePost ? "bg-red-300" : "bg-gray-300"} my-5`}
                onClick={() => setTestDeletePost(!testDeletePost)}>Test Delete Post
            </button>


            {/* TEST DELETING COMMENT BY COMMENT ID */}
            {   testDeleteComment &&
                <div className="flex flex-col">
                    <p className="text-center text-red-500">*You can only delete comments you've made</p>
                    <div className="flex gap-2">                    
                        <p className="text-center w-fit ml-auto">Enter Comment ID to Delete:</p>
                        <input className="w-1/6 mr-auto p-2 border border-black" type="text" id=""
                            onChange={(e) => {setDeleteCommentID(e.target.value)}}
                        />     
                    </div>
                    <button className="border border-black w-[100px] mx-auto bg-green-200 mb-10" onClick={() => {deleteComment()}}>
                        Delete Comment
                    </button>
                </div>
            }
            <button className={`mx-auto border border-black p-2 ${ testDeleteComment ? "bg-red-300" : "bg-gray-300"} my-5`}
                onClick={() => setTestDeleteComment(!testDeleteComment)}>Test Delete Comment
            </button>
        </div>
    )
}

import React, { useEffect, useState } from "react";
import { db, auth, storage } from "../firebaseConfig";
import { getDocs, doc, collection, addDoc, query, arrayUnion, updateDoc, where, documentId, getDoc, deleteDoc} from "@firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable, deleteObject, } from 'firebase/storage';
import { useRouter } from "next/router";
import Image from "next/image";
import { uuidv4 } from "@firebase/util";


export default function EditPost(){

    const [ loading, setLoading ] = useState(true)
    const [ needEdit, setNeedEdit ] = useState(false)
    const [ emptyPost, setEmptyPost ] = useState(false)
 
    const [ caption, setCaption] = useState('')
    const [ postID, setPostID ] = useState()
    const [ image, setImage ] = useState()
    const [ imgUrl, setUrl ] = useState('')
    const [ oldImgUrl, setOldImgUrl ] = useState('')
    const [ profpic, setProfPic ] = useState('')
    const [ userID, setUserId ] = useState()
    const [ displayName, setDisplayName ] = useState("")

    const router = useRouter()

    async function fetchUserData(uid){
        const u = await getDoc(doc(db, "users", uid))
        setUserId(uid)
        setProfPic(u?.data()?.profPic)
        setDisplayName(u?.data()?.displayName);
        setLoading(false)
    }

    async function saveEdits(){

        // No new image uploaded, and caption remained the same
        if((image == null && caption == router.query.caption))
            setNeedEdit(true)

        else if(oldImgUrl.length == 0 && image == null && caption.length == 0)
            setEmptyPost(true)

        // No new image, and caption is new
        else if(image == null && caption.length > 0 && caption != router.query.caption){
            try {
                updateDoc(doc(db, "posts", postID), {
                    caption: caption,
                    imageSrc: imgUrl
                }).then(() => {
                    router.push("/")
                }).catch((error) => {
                    console.log(error)
                })
            } 
            catch (error) {
                console.log(error)
            }
        }

        /* NEW , if user deleted image, remove image from db */
        else if (image == '' && caption.length > 0 && oldImgUrl.length > 0){
            
            // Delete Previously stored image
           try {
                deleteObject(ref(storage, oldImgUrl))
           }
           catch (error) {
             console.log("Error in deleting image")
             console.log(error)
           }
            // Update Post data
            try {
                updateDoc(doc(db, "posts", postID), {
                    caption: caption,
                    imageSrc: ""
                }).then(() => {
                    router.push("/")
                }).catch((error) => {
                    console.log(error)
                })
            } 
            catch (error) {
                console.log(error)
            }
            
        }

        // New image, while post already has a previous image
        else if( image != null && oldImgUrl.length > 0){

            // Sets up unique file name
            const uid = uuidv4()
            const filename = "images/" + image.name + "_" + uid

            // Reference to firebase storage, and intended filename
            const storageRef = ref( storage, filename)
            
            // Delete Previously stored image
            deleteObject(ref(storage, oldImgUrl)).then(() => {

                // Uploads new Image to Firebase
                uploadBytesResumable( storageRef,  image).then((uploadResult) => {

                    // Get Firebase Image Url
                    getDownloadURL(uploadResult.ref).then((res) => {

                        // Update Post data
                        try {
                            updateDoc(doc(db, "posts", postID), {
                                caption: caption,
                                imageSrc: res
                            }).then(() => {
                                router.push("/")
                            }).catch((error) => {
                                console.log(error)
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
            })
        }

        // New image, while post has no previous image
        else if( image != null){

            // Sets up unique file name
            const uid = uuidv4()
            const filename = "images/" + image.name + "_" + uid

            // Reference to firebase storage, and intended filename
            const storageRef = ref(storage, filename)
            
            // Uploads new Image to Firebase
            uploadBytesResumable( storageRef,  image).then((uploadResult) => {

                // Get Firebase Image Url
                getDownloadURL(uploadResult.ref).then((res) => {

                    // Update Post data
                    try {
                        updateDoc(doc(db, "posts", postID), {
                            caption: caption,
                            imageSrc: res
                        }).then(() => {
                            router.push("/")
                        }).catch((error) => {
                            console.log(error)
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

    function handleImageUpload(e, val){
        let file = e.target.files
        if(file[0] != null){
            const fileType = file[0]["type"]
            const validTypes = ["image/gif", "image/jpeg", "image/png"]

            if (validTypes.includes(fileType)) {
                setImage( file[0] )
                setUrl( URL.createObjectURL(file[0]) )
            } else {
                console.log("Only Images of Type JPEG, PNG, and GIF are accepted")
            }
        }
    }

    function removeImage(){
        document.getElementById('image_files').value = ''
        setImage('')
        setUrl(null)
    }

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if(user){

                setCaption(router.query.caption)
                setPostID(router.query.postID)
                setProfPic(router.query.profpic) 
                setUrl(router.query.imageSrc)
                setOldImgUrl(router.query.imageSrc)
                
                // router.query.username

                fetchUserData(user.uid)
            }else{
                router.push("/")
            }
        })
    }, [])

    if(loading)
        return (
            <div className="w-[50px] h-[50px] mx-auto mb-5 relative justify-center">
                <Image src={"/images/loading.gif"} alt={""} fill sizes="(max-width: 500px)"/>
            </div>
        )

    return (
        <section className="h-screen w-full overflow-y-auto pb-24">
            <div className="mx-auto flex flex-col py-16 justify-center items-center max-w-screen-xl px-4">
                <p className="mb-8 font-logo text-center text-gray-900 text-3xl md:text-5xl"><i className="fa fa-pencil-square-o mr-2"/>EDIT POST</p>
                <div className="flex flex-col w-full md:max-w-screen-lg mx-auto h-auto bg-white rounded-lg p-5 shadow-lg">
                    <div className="mb-8 flex items-center flex-wrap gap-4" data-testid="user_container">
                        <div className="relative w-8 h-8 sm:w-12 sm:h-12">
                            <Image className="rounded-[50%]" src={profpic ? profpic : "/images/user_icon.png"} alt="" fill sizes="(max-width: 50px)"/>
                        </div>
                        <p>{displayName}</p>
                    </div>

                    <div className="mx-auto mb-8 p-4 relative w-full flex items-center justify-center gap-4 bg-nav-bg rounded-full cursor-pointer transition duration-100 hover:bg-nav-bg-dark">
                        <input id="image_files" type="file" onChange={(e) => {handleImageUpload(e)}} className="absolute h-full w-full bg-transparent opacity-0 z-10 cursor-pointer"/>
                        <Image className="w-8 h-8 sm:w-14 sm:h-14" src="/images/add_image_icon_w.png" alt="Upload an Image Icon" width={50} height={50} />
                        <span className="text-lg sm:text-2xl text-white">Upload an Image</span>
                    </div>


                    {imgUrl &&
                        <div className="relative mb-8 flex flex-col">
                            <button className="absolute top-0 right-0 z-10 text-gray-600 text-2xl md:text-4xl hover:text-gray-400" onClick={() => removeImage()}>
                                <i className="fa fa-times fa-lg mr-2"/>
                            </button>
                            <div className="mb-8 w-full h-[200px] sm:h-[300px] md:h-[400px] max-h-96 bg-gray-100 relative" data-testid="image">
                                <Image className="rounded-lg object-contain" src={imgUrl ? imgUrl : "/images/mountain.jpg"} alt={""} fill sizes="(max-width: 900px)" priority/>    
                            </div>
                        </div> 
                    }

                    <textarea className="mb-4 p-4 w-full h-[100px] border border-gray-400 rounded-lg" placeholder="Write your text here..." onChange={(e) => {setCaption(e.target.value)}} value={caption}/>

                    {needEdit &&
                        <span className="text-lg text-center text-red-500 mb-4">No new edits have been made</span>
                    }

                    {emptyPost &&
                        <span className="text-lg text-center text-red-500 mb-4">Empty posts are not allowed.</span>
                    }
                    

                    <div className="flex w-full gap-4">
                        <button className="ml-auto bg-gray-400 py-2 px-4 text-white rounded-full transition duration-100 hover:bg-gray-500" onClick={() => {router.push("/")}}>
                            Cancel
                        </button>

                        <button className="bg-nav-bg py-2 px-4 text-white rounded-full transition duration-100 hover:bg-nav-bg-dark" onClick={() => saveEdits()}>
                            Save Changes
                        </button>
                    </div>
                    
                </div>
            </div>
        </section>
    )
}
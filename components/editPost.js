
import React, { useEffect, useState } from "react";
import { db, auth, storage } from "../firebaseConfig";
import { getDocs, doc, collection, addDoc, query, arrayUnion, updateDoc, where, documentId, getDoc, deleteDoc} from "@firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable, deleteObject, } from 'firebase/storage';
import { useRouter } from "next/router";
import Image from "next/image";
import { uuidv4 } from "@firebase/util";


export default function EditPost(){

    const [ loading, setLoading ] = useState(true)
    const [ mustFill, setMustFill ] = useState(false)
 
    const [ caption, setCaption] = useState('')
    const [ postID, setPostID ] = useState()
    const [ image, setImage ] = useState()
    const [ imgUrl, setUrl ] = useState('')
    const [ profpic, setProfPic ] = useState('')
    const [ userID, setUserId ] = useState()

    const router = useRouter()

    async function fetchUserData(uid){
        const u = await getDoc(doc(db, "users", uid))
        setUserId(uid)
        setProfPic(u.data().profPic)
        setLoading(false)
    }

    async function uploadPost(){
        
        if(image == null && caption.length == 0)
            setMustFill(true)

        else if(image == null && caption.length > 0){
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

        else if(image != null && caption.length > 0){
            // Sets up unique file name
            const uid = uuidv4()
            const filename = "images/" + image.name + "_" + uid

            // Reference to firebase storage, and intended filename
            const storageRef = ref( storage, filename)
            
            deleteObject(ref(storage, editImgUrl)).then(() => {

            })
                
            // Uploads an Image to Firebase
            uploadBytesResumable( storageRef,  image).then((uploadResult) => {

                // Get Firebase Image Url for post
                getDownloadURL(uploadResult.ref).then((res) => {
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

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if(user){
                console.log(router.query)

                setCaption(router.query.caption)
                setPostID(router.query.postID)
                setProfPic(router.query.profpic) 
                setUrl(router.query.imageSrc)
                
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
        <>
            <p className="my-10 text-center text-[40px]">Edit a Post</p>
            <div className="flex flex-col mx-auto mb-28 w-2/5 h-fit bg-card_bg rounded-lg p-5 shadow-lg drop-shadow-md">

                <div className="flex mb-5 gap-5" data-testid="user_container">
                    <div className="flex relative w-[50px] h-[50px]">
                        <Image className="rounded-[50%]" src={profpic ? profpic : "/images/user_icon.png"} alt="" fill sizes="(max-width: 50px)"/>
                    </div>
                    <p className="my-auto text-left">{"Display Name"}</p>
                </div>

                {
                    !imgUrl &&
                    <p className="mb-2 text-red-500 text-center text-[14px]">Reminder: The image below is only a default image, and this will not be uploaded.</p>
                }

                <div className="w-full h-[500px] bg-gray-300 mx-auto mb-5 relative justify-center">
                    <Image src={imgUrl ? imgUrl : "/images/mountain.jpg"} alt={""} fill sizes="(max-width: 900px)"/>
                </div>

                <textarea className="w-full h-[100px] p-5 mx-auto border border-black mb-5" placeholder="Image Caption" 
                    onChange={(e) => {setCaption(e.target.value)}} value={caption}
                />

                <div className="mx-auto py-2 relative w-1/2 justify-center bg-gray-100 rounded-md border-2 border-black border-dotted cursor-pointer hover:brightness-90">
                    <input
                        id="image_files"
                        type="file"
                        onChange={(e) => {handleImageUpload(e)}}
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

                {   
                    mustFill &&
                    <p className=" text-center text-red-500 mt-5 underline">Post must have atleast an Image or Caption</p>
                }

                <div className="flex w-full gap-5">
                    <button className="ml-auto border mt-10 mb-5 border-black w-1/4 bg-red-300 px-5 py-1 text-white rounded-xl hover:brightness-95" 
                        onClick={() => {router.push("/")}}
                    >
                        Cancel
                    </button>

                    <button className="border mt-10 mb-5 border-black w-1/4 bg-nav_bg px-5 py-1 text-white rounded-xl hover:brightness-95" 
                        onClick={() => uploadPost()}
                    >
                        Save Edits
                    </button>
                </div>
                
            </div>
        </>
    )
}
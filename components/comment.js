
import { db, auth, storage } from "../firebaseConfig";
import { doc, setDoc, collection, addDoc } from "@firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { uuidv4 } from "@firebase/util";


export default function Comment(){

    const router = useRouter()
    const [image, setImage] = useState('')
    const [imgUrl, setUrl] = useState('')
    const [comment, setComment] = useState('');


    function handleInsertComment(){
        auth.onAuthStateChanged((user) => {
            if(user)
                try {
                    addDoc(collection(db, "comments"), {
                        comment: comment,
                        likes: 0,
                        dislikes: 0,
                        creator: user.uid
                    }).then(() => {
                        console.log("Comment has been added")
                    })
                } 
                catch (error) {
                    console.log(error)
                }
        })
    }

    function handleImageUpload(e){
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

    function uploadImage(){
        const uid = uuidv4()
        const filename = "images/" + image.name + "_" + uid
        const storageRef = ref( storage, filename)

        uploadBytesResumable( storageRef,  image)
        .then((uploadResult) => {
            getDownloadURL(uploadResult.ref).then((res) => {
                console.log(res)
            }).catch((error) => {
                console.log(error)
            })
        }).catch((error) => {
            console.log(error)
        })
    }

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if(!user)
                router.push("/")
        })
    })

    return (
        <div className="flex flex-col justify-center mt-[50px]">
            <textarea className="w-1/2 h-[200px] p-5 mx-auto border border-black" placeholder="Enter a comment" 
                onChange={(e) => {setComment(e.target.value)}}
            />
            <button className="border border-black w-[100px] mx-auto bg-green-200 mb-10" onClick={() => {handleInsertComment()}}>Submit</button>
            
            
            <img src={imgUrl} alt="" className="w-1/2 mx-auto border border-black mb-5" />
            <input
                id="image_files"
                type="file"
                onChange={handleImageUpload}
                className="mx-auto"
                // className="absolute h-full w-full bg-transparent opacity-0 z-10 cursor-pointer"
            />
            <button className="mx-auto border border-black w-1/8 bg-green-200 my-5" onClick={() => uploadImage()}>Upload Image</button>
        </div>
    )
}
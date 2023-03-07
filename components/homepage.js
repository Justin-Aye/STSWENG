
import React, {useEffect, useState, useRef} from "react";
import Card from "./card";
import { useRouter } from "next/router";
import { auth, db } from "../firebaseConfig";
import { collection, query, getDocs, orderBy, limit, startAfter, doc, getDoc } from "firebase/firestore";
import Image from "next/image";


export default function Homepage() {
    // Static Data holders
    var Username="Username"
    var Caption="Best Image" 
    var ImageSrc="/images/mountain.jpg" 
    var Profpic="/images/user_icon.png"

    // Fetched data
    const [ posts, setPosts ] = useState([])
    const [ postIDs, setPostIDs] = useState([])
    const [ nextPosts, setNextPosts ] = useState([])
    const [ lastDoc, setLastDoc ] = useState() 
    const [ loading, setLoading ] = useState()
    const [ showMore, setShowMore ] = useState(false)
    const [ lastPost, setLastPost ] = useState(false)
    const router = useRouter()

    const [ currUser, setCurrUser] = useState(null)

    function handlePost(){
        auth.onAuthStateChanged((user) => {
            if(!user)
                router.push("/login")
        })
    }

    function nextPostsQuery( ){
        setLoading(true)
        setShowMore(false)
        if (nextPosts.length > 0)
            setNextPosts([])

        const q = query(collection(db, "posts"),
            orderBy("likes"),
            startAfter(lastDoc),
            limit(3)
        )

        getDocs(q).then((docs) => {
            docs.forEach((doc) => {
                setPostIDs((postIDs) => [...postIDs, doc.id])
                setPosts((posts) => [...posts, doc.data()])
                setLastDoc(doc)
            })
            setLoading(false)

            if(docs.size > 0)
                setShowMore(true)
            else
                setLastPost(true)
        }).catch((error) => {
            console.log(error)
        })
    }

    function fetchPosts(){
        setPosts([])
        setLoading(true)

        const q = query(collection(db, "posts"), 
            orderBy("likes"), 
            limit(3))

        getDocs(q).then((snap) => {
            snap.forEach((postDoc) => {
                const userRef = doc(db, "users", postDoc.data().creatorID);
                getDoc(userRef).then((userDoc) => {
                    setPostIDs((postIDs) => [...postIDs, postDoc.id])
                    setPosts((posts) => [...posts, {data: postDoc.data(), userData: userDoc.data()}]);
                })
                //setPostIDs((postIDs) => [...postIDs, postDoc.id])
                //setPosts((posts) => [...posts, postDoc.data()])
                setLastDoc(postDoc)
            })
            setLoading(false)
            setShowMore(true)

        }).catch((error) => {
            console.log(error)
        })
    }

    useEffect(() => {
        fetchPosts()
        auth.onAuthStateChanged((user) => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                getDoc(userRef).then((doc) => {
                    setCurrUser({uid: user.uid, data: doc.data()});
                })
            }
        })
    }, [])

    return (
        <div className="text-center mt-0 flex flex-col">
            {/* <div className="bg-feed_bg w-4/5 self-center pt-8"> //use this if we add extra stuff on the right of feed */}
            <div className="bg-doc_bg w-full self-center pt-8"> 
                <div className="mb-5 w-2/5 mx-auto bg-nav_bg rounded-full py-2 px-5 cursor-pointer hover:transition duration-300
                                 hover:bg-nav_bg_dark flex justify-center items-center"
                    onClick={() => handlePost()}
                >
                    <Image src="/images/add_image_icon_w.png" alt="" width={60} height={51} />
                    <span className="text-[20px] text-white w-fit h-fit">Create New Post</span>
                </div>
            </div>
            {
                posts.map((post, index) => {
                    return (
                        <Card key={index} 
                        post={post.data} 
                        profpic={post.userData.profPic} 
                        postID={postIDs[index]}
                        currUser={currUser}   
                        />
                    )
                })
            }
            
            {
                loading && 
                <div className="w-[50px] h-[50px] mx-auto mb-5 relative justify-center">
                    <Image src={"/images/loading.gif"} alt={""} fill sizes="(max-width: 500px)"/>
                </div>
            }

            
            {
                showMore &&
                <p className="text-center text-[20px] text-blue-500 mb-20 cursor-pointer hover:underline"
                    onClick={() => nextPostsQuery()}>
                    View More...
                </p>
            }

            {
                lastPost &&
                <p className="text-center text-[20px] mb-20">
                    Sorry, there are no more posts.
                </p>
            }

        </div>
    )
}

import React, {useEffect, useState, useRef} from "react";
import Card from "./card";
import { useRouter } from "next/router";
import { auth, db } from "../firebaseConfig";
import { collection, query, getDocs, orderBy, limit, startAfter, doc, getDoc } from "firebase/firestore";
import Image from "next/image";


export default function Homepage() {
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
            else{
                router.push("/addpost")
            }
        })
    }

    function nextPostsQuery( ){
        if(!lastPost){
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
                docs.forEach((postDoc) => {
                    const userRef = doc(db, "users", postDoc.data().creatorID);
                    getDoc(userRef).then((userDoc) => {
                        setPostIDs((postIDs) => [...postIDs, postDoc.id])
                        setPosts((posts) => [...posts, {data: postDoc.data(), userData: userDoc.data()}]);
                    })
                    setLastDoc(postDoc)
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

    function handleScroll(event){
        const target = event.target

        if(target.scrollHeight - target.scrollTop < target.clientHeight){
            nextPostsQuery()
        }
        
    }

    return (
        <div id="homepage" className="text-center mt-0 flex flex-col h-screen overflow-y-auto" onScroll={handleScroll}>
            <div className="bg-doc_bg w-full self-center pt-8"> 
                <div className="mb-5 w-3/5 md:w-2/5 mx-auto bg-nav_bg rounded-full py-2 px-5 cursor-pointer hover:transition duration-300
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
            
            <div className="w-full h-[500px] pb-[100px]">
                {
                    loading && 
                    <div className="w-[75px] h-[75px] mx-auto mb-5 relative justify-center">
                        <Image src={"/images/loading.gif"} alt={""} fill sizes="(max-width: 500px)"/>
                    </div>
                }

                {
                    lastPost &&
                    <p className="text-center text-[20px]">
                        Sorry, there are no more posts.
                    </p>
                }
            </div>

        </div>
    )
}
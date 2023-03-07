
import React, {useEffect, useState, useRef} from "react";
import Card from "./card";
import { useRouter } from "next/router";
import { auth, db } from "../firebaseConfig";
import { collection, query, getDocs, orderBy, limit, startAfter } from "firebase/firestore";
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

            snap.forEach((doc) => {
                setPostIDs((postIDs) => [...postIDs, doc.id])
                setPosts((posts) => [...posts, doc.data()])
                setLastDoc(doc)
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
            if(user)
                setCurrUser(user)
        })
    }, [])

    return (
        <div className="text-center mt-5">
            <div className="mb-5 w-1/4 mx-auto bg-[#4487d4] rounded-lg py-2 cursor-pointer hover:brightness-90"
                onClick={() => handlePost()}
            >
                <p className="text-[20px] text-white">POST AN IMAGE</p>
            </div>

            {
                posts.map((post, index) => {
                    console.log(post.creatorID);
                    return (
                        <Card key={index} owner={post.creatorID}
                            caption={post.caption} imageSrc={post.imageSrc} profpic={Profpic} postID={postIDs[index]}
                            currUser={currUser} likes={post.likes} dislikes={post.dislikes} commentsID={post.commentsID}
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

            {/* <Card username={Username} caption={Caption} imageSrc={ImageSrc} profpic={Profpic}/>
            <Card username={Username} caption={Caption} imageSrc={ImageSrc} profpic={Profpic}/>
            <Card username={Username} caption={Caption} imageSrc={ImageSrc} profpic={Profpic} /> */}
        </div>
    )
}
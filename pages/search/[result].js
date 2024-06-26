import React from "react";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";;
// @ts-ignore
import SearchResult from "@/components/search";

export async function getServerSideProps(context) {
    const searchInput = context.query.result.toLowerCase();
    const usersRef = collection(db, "users");
    const qSnapshot = await getDocs(usersRef);
    
    let results = []
    qSnapshot.forEach(async (userDoc) => {
        if (userDoc.data().lowerCaseDisplayName.includes(searchInput))
            results.push({uid: userDoc.id, data: userDoc.data()});
    })
    return {
        props: {results}
    }
    
}

export default function search(props) {
    return (
        <div className="flex flex-col text-center overflow-y-auto h-screen pt-8">
            {props.results.length < 1 ? <h2 className="pt-8 font-bold text-2xl"> No results found! </h2> :
                (
                    props.results.map((user, index) => {
                        return (
                            <SearchResult
                            key={index}
                            uid={user.uid}
                            data={user.data}
                            />
                        );
                    })
                )
            }
        <div className="pt-20"></div>
        </div>
    )
}
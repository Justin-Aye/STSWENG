import React from "react";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";;
// @ts-ignore
import SearchResult from "@/components/search";

export async function getServerSideProps(context) {
    const searchInput = context.query.result.toLowerCase();
    const usersRef = collection(db, "users");
    const qSnapshot = await getDocs(usersRef);
    const results = []

    qSnapshot.forEach(async (userDoc) => {
        results.push({uid: userDoc.id, data: userDoc.data()});
    })
    console.log(results.length)

    return {
        props: {results, searchInput}
    }
    
}

export default function search(props) {
    return (
        <div>
            {props.results.length < 1 ? <h2> No results found! </h2> :
                (
                    props.results.map((user, index) => {
                        if (user.data.lowerCaseDisplayName.includes(props.searchInput))
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
        </div>
    )
}
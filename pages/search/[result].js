import React from "react";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";;
// @ts-ignore
import SearchResult from "@/components/search";

export async function getServerSideProps(context) {
    const searchInput = context.query.result.toLowerCase();
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("lowerCaseDisplayName", ">=", searchInput), where("lowerCaseDisplayName", "<=", searchInput+"\uf8ff"));
    const qSnapshot = await getDocs(q);

    const results = []

    qSnapshot.forEach(async (userDoc) => {
        results.push({uid: userDoc.id, data: userDoc.data()});
    })

    return {
        props: {results}
    }
    
}

export default function search(props) {
    return (
        <div>
            {props.results.length < 1 ? <h2> No results found! </h2> :
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
        </div>
    )
}
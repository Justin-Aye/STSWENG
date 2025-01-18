import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from "../firebaseConfig";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";


export default function Settings() {
	const [currUser, setCurrUser] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [bio, setBio] = useState("");
	const [email, setEmail] = useState("");
	const [profPic, setProfPic] = useState(null);
	const [preview, setProfPicPreview] = useState("")
	const router = useRouter()

	// get logged in user's data
	useEffect(() => {
		auth.onAuthStateChanged((user) => {
			try {
				if (user) {
					setCurrUser(user.uid);
					const docRef = doc(db, "users", user.uid);
					getDoc(docRef).then((doc) => {
						setDisplayName(doc?.data()?.displayName);
						setBio(doc?.data()?.bio);
						setProfPicPreview(doc?.data()?.profPic);
						setEmail(doc?.data()?.email);
					})
				}
				else
					router.push("/login");
			} catch (err) {
				console.log(err);
			}
		})
	}, []);

	const handleNameChange = function (e) {
		setDisplayName(e.target.value);
	};

	const handleBioChange = function (e) {
		setBio(e.target.value);
	}

	const handleProfPicChange = function (e) {
		const file = e.target.files[0];
		if (file) {
			setProfPic(file);
			const reader = new FileReader();
			reader.onload = function () {
				setProfPicPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}

	}

	const saveName = async function () {
		try {
			const usersRef = collection(db, "users")
			const qDisplayName = query(usersRef, where("displayName", "==", displayName))
			const matchingUsers = await getDocs(qDisplayName);


			if (matchingUsers.size > 0) {
				console.log("entered displayname already exists");
				alert("name already exists");
				return
			}
			else {
				if (!displayName.includes("/") && !displayName.startsWith(".") && displayName.match(/(.*[a-z]){3}/i)) {
					const docRef = doc(db, "users", currUser);
					updateDoc(docRef, {
						displayName: displayName,
						lowerCaseDisplayName: displayName.toLowerCase()
					});
				}
				else {
					alert("display name should have at least 3 letters and cannot have a / or start with a .")
				}
			}

		} catch {
			console.log("error saving displayname");
		}
	}

	const saveBio = function () {
		try {
			const docRef = doc(db, "users", currUser);
			updateDoc(docRef, {
				bio: bio
			});
		} catch {
			console.log("error saving bio");
		}
	}

	const saveProfPic = async function () {
		// TODO:
		if (profPic) {
			const storageRef = ref(storage, `images/${profPic.name}`)
			await uploadBytes(storageRef, profPic);


			const profPicUrl = await getDownloadURL(storageRef);
			const docRef = doc(db, "users", currUser);
			try {
				updateDoc(docRef, {
					profPic: profPicUrl
				});
			} catch {
				console.log("error uploading profPic");
			}
		}
	}

	return (
		<section className="overflow-y-auto w-full h-screen">
			<div className="mx-auto max-w-screen-xl px-4 py-8 lg:py-16">
				{currUser &&
					<>
						<div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-between gap-2 mb-8">
							<h1 className="font-logo text-gray-900 text-3xl md:text-5xl"><i className="fa fa-pencil-square-o mr-2 mb-2" />EDIT PROFILE</h1>
							<Link href={`/profile/${currUser}`} className="rounded-full bg-nav-bg hover:bg-nav-bg-dark px-4 py-2 text-white transition duration-100">Back to Profile</Link>
						</div>

						<div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-8 md:gap-16 pb-2">
              <div className="flex flex-col justify-center items-center">
                <div className="mb-4 w-32 h-32 md:w-52 md:h-52 rounded-full relative">
                  <Image className="rounded-full" src={preview} alt="" fill />
                </div>
                <form className="flex flex-col items-center justify-center gap-4" onSubmit={(e) => e.preventDefault()}>
                  <input type="file" accept="image/*" className="w-56" onChange={handleProfPicChange} required />
                  <button onClick={saveProfPic} className="w-fit rounded-full bg-nav-bg hover:bg-nav-bg-dark px-4 py-2 text-white transition duration-100"> Save Profile Picture </button>
                </form>
              </div>
              
              <div className="flex flex-col w-full">
                <span className="text-lg md:text-xl font-bold">Email: <span className="break-all">{email}</span></span>

                <form className="flex flex-col my-8" onSubmit={(e) => e.preventDefault()}>
                  <span className="text-lg md:text-xl font-bold"> Username</span>
                  <input type="text" className="w-full md:max-w-md border border-gray-400 p-2 mb-2 rounded-md" value={displayName} onChange={handleNameChange} />
                  <button onClick={saveName} className="w-fit rounded-full bg-nav-bg hover:bg-nav-bg-dark px-4 py-2 text-white transition duration-100"> Save Username </button>
                </form>

                <form className="flex flex-col my-8" onSubmit={(e) => e.preventDefault()}>
                  <span className="text-lg md:text-xl font-bold">Bio:</span>
                  <textarea className="w-full border border-gray-400 p-2 mb-2 rounded-md" onChange={(e) => { handleBioChange(e) }}>{bio}</textarea>
                  <button onClick={saveBio} className="w-fit rounded-full bg-nav-bg hover:bg-nav-bg-dark px-4 py-2 text-white transition duration-100"> Save Bio </button>
                </form>
              </div>
						</div>
					</>
				}

			</div>
		</section>
	)

}
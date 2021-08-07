import * as firebase from "firebase";

var firebaseConfig = {
	apiKey: "AIzaSyB7jBBXKVrTb676KHeXjgnxqf28WKY0Jv8",
	authDomain: "mum-n-bun.firebaseapp.com",
	databaseURL: "https://mum-n-bun.firebaseio.com",
	projectId: "mum-n-bun",
	storageBucket: "mum-n-bun.appspot.com",
	messagingSenderId: "812661076840",
	appId: "1:812661076840:web:5c3dffecb9964d2aeadcdd",
};

const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();

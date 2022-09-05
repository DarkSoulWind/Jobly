// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseOptions } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig: FirebaseOptions = {
	apiKey: "AIzaSyCaOkeDsGB8p0tBvwiW7sog-fkwi9L3JQk",
	authDomain: "jobly-7fc17.firebaseapp.com",
	projectId: "jobly-7fc17",
	storageBucket: "jobly-7fc17.appspot.com",
	messagingSenderId: "795282018265",
	appId: "1:795282018265:web:085daed3852af3c98513c8",
	measurementId: "G-5YFJE6YG3P",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAiUCMpCNYkOQZ7zLxFjkpHTh-Nk3QN3gw",
    authDomain: "cloexlogin-d466a.firebaseapp.com",
    projectId: "cloexlogin-d466a",
    storageBucket: "cloexlogin-d466a.firebasestorage.app",
    messagingSenderId: "87844737437",
    appId: "1:87844737437:web:11f79d9b262d042d915f74"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize the auth object

//submit button
const submit = document.getElementById("submit");
submit.addEventListener("click", function (event) {
    event.preventDefault();
    
    //inputs
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        window.location.href = "customer.html";
        // // ...
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        avert(errorMessage);
        // ..
        // 
    });
})
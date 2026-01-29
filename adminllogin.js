import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCPk6S4_eefL_2uPLF13IezpmB4jipijbA",
    authDomain: "cloexadminlogin.firebaseapp.com",
    projectId: "cloexadminlogin",
    storageBucket: "cloexadminlogin.firebasestorage.app",
    messagingSenderId: "909762210969",
    appId: "1:909762210969:web:2d4efbda5bbb0014a85c08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize the auth object

//submit button
const submit = document.getElementById("submit");
submit.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("admin login attempted")
    
    //inputs
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        window.location.href = "admin.html";
        // // ...
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage)
        // avert(errorMessage);
        // ..
        // 
    });
})
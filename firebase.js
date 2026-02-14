// firebase.js
// Initialize Firebase (replace with your own config)
const firebaseConfig = {
    apiKey: "AIzaSyDZq6qn8ybXUZ7oehqhwXLo6tvpRUVCs2w",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    appId: "YOUR_FIREBASE_APP_ID"
};

// Load Firebase SDK if not already loaded
if (typeof firebase === "undefined") {
    const script = document.createElement('script');
    script.src = "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js";
    script.onload = () => {
        const authScript = document.createElement('script');
        authScript.src = "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js";
        authScript.onload = () => {
            const firestoreScript = document.createElement('script');
            firestoreScript.src = "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js";
            firestoreScript.onload = () => {
                firebase.initializeApp(firebaseConfig);
            };
            document.head.appendChild(firestoreScript);
        };
        document.head.appendChild(authScript);
    };
    document.head.appendChild(script);
} else {
    firebase.initializeApp(firebaseConfig);
}

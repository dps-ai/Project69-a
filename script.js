// Firebase config & initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDL8FhpPFa0t1-KJOjuNTnofWx3RPa7o5w",
  authDomain: "project-69a-94256.firebaseapp.com",
  projectId: "project-69a-94256",
  storageBucket: "project-69a-94256.firebasestorage.app",
  messagingSenderId: "919510070169",
  appId: "1:919510070169:web:912ad13e2e79de90339908"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Elements
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const registrationDiv = document.getElementById('registration');
const loginDiv = document.getElementById('login');
const swipeDiv = document.getElementById('swipe');
const profileName = document.getElementById('profileName');
const profileBio = document.getElementById('profileBio');
const likeBtn = document.getElementById('like');
const dislikeBtn = document.getElementById('dislike');

let currentUser = null;
let potentialMatches = [];
let currentIndex = 0;

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('regName').value.trim();
  const age = parseInt(document.getElementById('regAge').value);
  const gender = document.getElementById('regGender').value;
  const bio = document.getElementById('regBio').value.trim();
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  if (age >= 18) {
    alert('You must be under 18 to register.');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, 'students', uid), {
      name,
      age,
      gender,
      bio,
      email
    });

    currentUser = { uid, name, age, gender, bio, email };
    registrationDiv.classList.add('hidden');
    loadMatches();
  } catch (error) {
    alert(error.message);
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const snapshot = await getDocs(collection(db, 'students'));
    snapshot.forEach(docSnap => {
      if (docSnap.id === uid) {
        currentUser = { uid, ...docSnap.data() };
      }
    });

    loginDiv.classList.add('hidden');
    loadMatches();
  } catch (error) {
    alert(error.message);
  }
});

function loadMatches() {
  getDocs(collection(db, 'students')).then(snapshot => {
    potentialMatches = [];
    snapshot.forEach(docSnap => {
      const user = docSnap.data();
      if (
        docSnap.id !== currentUser.uid &&
        user.gender !== currentUser.gender &&
        user.age < 18
      ) {
        potentialMatches.push(user);
      }
    });
    swipeDiv.classList.remove('hidden');
    showProfile();
  });
}

function showProfile() {
  if (currentIndex < potentialMatches.length) {
    const profile = potentialMatches[currentIndex];
    profileName.textContent = profile.name;
    profileBio.textContent = profile.bio;
  } else {
    profileName.textContent = 'No more matches!';
    profileBio.textContent = '';
    likeBtn.disabled = true;
    dislikeBtn.disabled = true;
  }
}

likeBtn.addEventListener('click', () => {
  currentIndex++;
  showProfile();
});

dislikeBtn.addEventListener('click', () => {
  currentIndex++;
  showProfile();
});

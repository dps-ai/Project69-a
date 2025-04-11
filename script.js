// Initialize Firebase (this should already be in your index.html)
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = null;
let currentIndex = 0;

function registerUser() {
  const name = document.getElementById("name").value.trim();
  const age = parseInt(document.getElementById("age").value);
  const school = document.getElementById("school").value.trim();
  const gender = document.getElementById("gender").value;
  const description = document.getElementById("description").value.trim();

  if (!name || !age || !school || !description) {
    alert("Please fill in all fields.");
    return;
  }

  if (age > 18) {
    alert("You must be 18 or younger.");
    return;
  }

  if (school.toLowerCase() !== "delhi public school") {
    alert("Only students of Delhi Public School can register.");
    return;
  }

  // Add user to Firestore
  db.collection("users").add({
    name,
    age,
    school,
    gender,
    description,
    likes: [],
    matches: []
  }).then((docRef) => {
    currentUser = {
      id: docRef.id,
      name,
      age,
      school,
      gender,
      description,
      likes: [],
      matches: []
    };

    document.getElementById("registration").classList.add("hidden");
    document.getElementById("swipe-container").classList.remove("hidden");
    document.getElementById("matches").classList.remove("hidden");

    loadSwipeCards();
  });
}

function loadSwipeCards() {
  const oppositeGender = currentUser.gender === "male" ? "female" : "male";

  db.collection("users")
    .where("gender", "==", oppositeGender)
    .get()
    .then((querySnapshot) => {
      const profiles = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          doc.id !== currentUser.id &&
          data.school.toLowerCase() === "delhi public school" &&
          data.age <= 18
        ) {
          profiles.push({ id: doc.id, ...data });
        }
      });

      currentUser.potentialMatches = profiles;
      currentIndex = 0;
      if (profiles.length > 0) {
        renderCard(profiles[currentIndex]);
      } else {
        document.getElementById("card-container").innerHTML = "<p>No profiles available right now.</p>";
      }
    });
}

function renderCard(user) {
  document.getElementById("card-container").innerHTML = `
    <h3>${user.name} (${user.age})</h3>
    <p>${user.description}</p>
  `;
}

function swipe(direction) {
  const profiles = currentUser.potentialMatches;
  const swipedUser = profiles[currentIndex];

  if (direction === "right") {
    // Add swiped user to currentUser.likes
    db.collection("users").doc(currentUser.id).update({
      likes: firebase.firestore.FieldValue.arrayUnion(swipedUser.id)
    });

    // Check if the other user liked currentUser
    db.collection("users").doc(swipedUser.id).get().then((doc) => {
      const swipedData = doc.data();
      if (swipedData.likes.includes(currentUser.id)) {
        // It's a match!
        db.collection("users").doc(currentUser.id).update({
          matches: firebase.firestore.FieldValue.arrayUnion(swipedUser.id)
        });
        db.collection("users").doc(swipedUser.id).update({
          matches: firebase.firestore.FieldValue.arrayUnion(currentUser.id)
        });

        const matchList = document.getElementById("match-list");
        matchList.innerHTML += `<li>🎉 You matched with ${swipedData.name}!</li>`;
      }
    });
  }

  currentIndex++;
  if (currentIndex < profiles.length) {
    renderCard(profiles[currentIndex]);
  } else {
    document.getElementById("card-container").innerHTML = "<p>No more profiles to swipe.</p>";
  }
}
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // for testing only!
    }
  }
}

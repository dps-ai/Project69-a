const registerForm = document.getElementById('registerForm');
const registrationDiv = document.getElementById('registration');
const swipeDiv = document.getElementById('swipe');
const profileName = document.getElementById('profileName');
const profileBio = document.getElementById('profileBio');
const likeBtn = document.getElementById('like');
const dislikeBtn = document.getElementById('dislike');

let students = JSON.parse(localStorage.getItem('students')) || [];
let currentUser = null;
let potentialMatches = [];
let currentIndex = 0;

registerForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const age = parseInt(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const bio = document.getElementById('bio').value.trim();

  if (age >= 18) {
    alert('You must be under 18 to register.');
    return;
  }

  currentUser = { name, age, gender, bio };
  students.push(currentUser);
  localStorage.setItem('students', JSON.stringify(students));

  registrationDiv.classList.add('hidden');
  swipeDiv.classList.remove('hidden');

  findMatches();
  showProfile();
});

function findMatches() {
  potentialMatches = students.filter(s => s.gender !== currentUser.gender && s.name !== currentUser.name);
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

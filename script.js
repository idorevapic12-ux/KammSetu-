// ==========================================
// FIREBASE IMPORTS
// ==========================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIG
// ==========================================

// अपनी Firebase Console वाली जानकारी यहाँ डालें

const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain: "YOUR_PROJECT.firebaseapp.com",

  projectId: "YOUR_PROJECT_ID",

  storageBucket: "YOUR_PROJECT.firebasestorage.app",

  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

  appId: "YOUR_APP_ID"

};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let isRegisterMode = false;


// ==========================================
// MOBILE MENU
// ==========================================

window.toggleMenu = function () {

  document
    .getElementById("navMenu")
    .classList.toggle("active");

};


// ==========================================
// SCROLL TO JOB
// ==========================================

window.scrollToJob = function () {

  document
    .getElementById("post-job")
    .scrollIntoView({
      behavior: "smooth"
    });

};


// ==========================================
// CATEGORY
// ==========================================

window.selectCategory = function (category) {

  document.getElementById("jobCategory").value =
    category;

  scrollToJob();

};


// ==========================================
// SEARCH
// ==========================================

window.searchWorkers = function () {

  const skill =
    document
      .getElementById("searchInput")
      .value
      .trim();

  const location =
    document.getElementById("location").value;

  const result =
    document.getElementById("searchResult");


  if (!skill && !location) {

    result.innerText =
      "कृपया काम या location चुनें।";

    return;

  }


  result.innerText =
    `🔍 "${skill || "सभी काम"}" के लिए ${
      location || "आपके क्षेत्र"
    } में workers खोजे जा रहे हैं...`;

};


// ==========================================
// AUTH MODAL
// ==========================================

window.openAuth = function () {

  document
    .getElementById("authModal")
    .style.display = "flex";

};


window.closeAuth = function () {

  document
    .getElementById("authModal")
    .style.display = "none";

};


// ==========================================
// LOGIN / REGISTER MODE
// ==========================================

window.toggleAuthMode = function () {

  isRegisterMode = !isRegisterMode;


  const title =
    document.getElementById("authTitle");

  const subtitle =
    document.getElementById("authSubtitle");

  const fields =
    document.getElementById("registerFields");

  const submit =
    document.getElementById("authSubmit");

  const switchText =
    document.getElementById("switchText");

  const switchButton =
    document.getElementById("switchButton");


  if (isRegisterMode) {

    title.innerText =
      "📝 Create Account";

    subtitle.innerText =
      "KaamSetu पर नया account बनाएं।";

    fields.style.display =
      "block";

    submit.innerText =
      "Register";

    switchText.innerText =
      "पहले से account है?";

    switchButton.innerText =
      "Login करें";

  } else {

    title.innerText =
      "🔐 Login";

    subtitle.innerText =
      "अपने account में login करें।";

    fields.style.display =
      "none";

    submit.innerText =
      "Login";

    switchText.innerText =
      "Account नहीं है?";

    switchButton.innerText =
      "Register करें";

  }

};


// ==========================================
// AUTH SUBMIT
// ==========================================

window.submitAuth = async function () {

  const email =
    document
      .getElementById("authEmail")
      .value
      .trim();

  const password =
    document
      .getElementById("authPassword")
      .value;

  const message =
    document
      .getElementById("authMessage");


  if (!email || !password) {

    message.innerText =
      "⚠️ Email और password भरें।";

    return;

  }


  try {

    if (isRegisterMode) {

      const name =
        document
          .getElementById("authName")
          .value
          .trim();

      const role =
        document
          .getElementById("authRole")
          .value;


      if (!name) {

        message.innerText =
          "⚠️ अपना नाम भरें।";

        return;

      }


      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      const user =
        userCredential.user;


      // Firestore में user profile

      await setDoc(
        doc(db, "users", user.uid),
        {

          uid: user.uid,

          name: name,

          email: email,

          role: role,

          createdAt:
            serverTimestamp()

        }
      );


      // अगर worker है तो workers collection

      if (role === "worker") {

        await setDoc(
          doc(db, "workers", user.uid),
          {

            uid: user.uid,

            name: name,

            email: email,

            skill: "",

            city: "",

            phone: "",

            experience: "",

            available: true,

            createdAt:
              serverTimestamp()

          }
        );

      }


      message.innerText =
        "✅ Account successfully बन गया!";


    } else {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


      message.innerText =
        "✅ Login successful!";

    }


    setTimeout(() => {

      closeAuth();

    }, 1000);


  } catch (error) {

    console.error(error);

    message.innerText =
      getFirebaseError(error.code);

  }

};


// ==========================================
// FIREBASE ERROR
// ==========================================

function getFirebaseError(code) {

  switch (code) {

    case "auth/email-already-in-use":
      return "❌ यह email पहले से registered है।";

    case "auth/invalid-email":
      return "❌ Email सही नहीं है।";

    case "auth/weak-password":
      return "❌ Password कम से कम 6 characters का रखें।";

    case "auth/invalid-credential":
      return "❌ Email या password गलत है।";

    default:
      return "❌ कुछ समस्या हुई। फिर कोशिश करें।";

  }

}


// ==========================================
// AUTH STATE
// ==========================================

onAuthStateChanged(auth, (user) => {

  const userPanel =
    document.getElementById("userPanel");

  const userInfo =
    document.getElementById("userInfo");


  if (user) {

    userPanel.style.display =
      "flex";

    userInfo.innerText =
      `👤 ${user.email}`;

  } else {

    userPanel.style.display =
      "none";

  }

});


// ==========================================
// LOGOUT
// ==========================================

window.logoutUser = async function () {

  try {

    await signOut(auth);

    alert("आप logout हो गए हैं।");

  } catch (error) {

    console.error(error);

  }

};


// ==========================================
// JOB POSTING
// ==========================================

document
  .getElementById("jobForm")
  .addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      // Login check

      const user = auth.currentUser;


      if (!user) {

        alert(
          "पहले Login/Register करें।"
        );

        openAuth();

        return;

      }


      const jobName =
        document
          .getElementById("jobName")
          .value
          .trim();

      const category =
        document
          .getElementById("jobCategory")
          .value;

      const location =
        document
          .getElementById("jobLocation")
          .value
          .trim();

      const budget =
        document
          .getElementById("budget")
          .value
          .trim();

      const description =
        document
          .getElementById("jobDescription")
          .value
          .trim();

      const message =
        document
          .getElementById("jobMessage");


      try {

        await addDoc(
          collection(db, "jobs"),
          {

            jobName: jobName,

            category: category,

            location: location,

            budget: budget,

            description: description,

            userId: user.uid,

            userEmail: user.email,

            status: "open",

            createdAt:
              serverTimestamp()

          }
        );


        message.innerHTML =
          "✅ आपका काम Firebase Database में save हो गया!";


        this.reset();


      } catch (error) {

        console.error(error);

        message.innerText =
          "❌ Job save नहीं हो सकी।";

      }

    }
  );


// ==========================================
// WORKER REGISTRATION
// ==========================================

window.registerWorker = async function () {

  const user =
    auth.currentUser;


  if (!user) {

    alert(
      "पहले Login/Register करें।"
    );

    openAuth();

    return;

  }


  const name =
    document
      .getElementById("workerName")
      .value
      .trim();

  const skill =
    document
      .getElementById("workerSkill")
      .value
      .trim();

  const city =
    document
      .getElementById("workerCity")
      .value
      .trim();

  const phone =
    document
      .getElementById("workerPhone")
      .value
      .trim();

  const message =
    document
      .getElementById("workerMessage");


  if (!name || !skill || !city || !phone) {

    message.innerText =
      "⚠️ सभी जानकारी भरें।";

    return;

  }


  try {

    await setDoc(
      doc(db, "workers", user.uid),
      {

        uid: user.uid,

        name: name,

        skill: skill,

        city: city,

        phone: phone,

        available: true,

        updatedAt:
          serverTimestamp()

      },
      {
        merge: true
      }
    );


    message.innerText =
      "✅ आपका Worker Profile save हो गया!";


    setTimeout(() => {

      closeWorkerForm();

    }, 1500);


  } catch (error) {

    console.error(error);

    message.innerText =
      "❌ Profile save नहीं हो सकी।";

  }

};


// ==========================================
// CLOSE MODAL ON OUTSIDE CLICK
// ==========================================

window.addEventListener(
  "click",
  (event) => {

    const modal =
      document.getElementById("authModal");

    const workerModal =
      document.getElementById("workerModal");


    if (event.target === modal) {

      closeAuth();

    }

    if (event.target === workerModal) {

      closeWorkerForm();

    }

  }
);
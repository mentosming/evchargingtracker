import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ------------------------------------------------------------------
// 設定步驟：
// 1. 前往 Firebase Console > Project Settings > General > Your apps
// 2. 複製 firebaseConfig 物件內容並取代下方的設定
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBHRqWobCUl8QhpgLI_xKHoPLkHNGgDj0U",
  authDomain: "ev-charging-tracker-967c1.firebaseapp.com",
  projectId: "ev-charging-tracker-967c1",
  storageBucket: "ev-charging-tracker-967c1.firebasestorage.app",
  messagingSenderId: "524683621541",
  appId: "1:524683621541:web:0f50de47c00f7929f6094c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Login failed", error);
    // 友善的錯誤提示
    if (error.code === 'auth/configuration-not-found' || error.code === 'auth/api-key-not-valid') {
        alert("Firebase 設定錯誤：請檢查 services/firebase.ts 中的 apiKey 與 projectId 是否正確。");
    } else {
        alert(`登入失敗 (${error.code})：請檢查網路連線或 Firebase Console 設定。`);
    }
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed", error);
  }
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};
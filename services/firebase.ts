
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
    
    // 忽略使用者主動關閉彈窗的操作，不需報錯
    if (error.code === 'auth/popup-closed-by-user') return;

    let msg = `登入失敗 (${error.code})：請稍後再試。`;

    if (error.code === 'auth/configuration-not-found' || error.code === 'auth/api-key-not-valid') {
        msg = "Firebase 設定錯誤：\n請檢查 services/firebase.ts 中的 apiKey 與 projectId 是否正確。";
    } else if (error.code === 'auth/network-request-failed') {
        // 這是最常見的錯誤，通常是因為網域未加入白名單導致 CORS 失敗，被瀏覽器視為網路錯誤
        msg = "無法連線至驗證伺服器 (Network Request Failed)\n\n" +
              "常見原因與解決方法：\n" +
              "1. 【網域未授權】：若您正在使用新網址 (如 *.run.app)，請務必至 Firebase Console > Authentication > Settings > Authorized Domains 新增此網域。\n" +
              "2. 【網路問題】：請檢查您的網路連線是否正常。\n" +
              "3. 【瀏覽器阻擋】：請嘗試關閉擋廣告插件或使用無痕模式測試。";
    } else if (error.code === 'auth/unauthorized-domain') {
        msg = "網域未授權 (Unauthorized Domain)\n\n" +
              "Firebase 拒絕了來自此網域的請求。\n" +
              "請至 Firebase Console > Authentication > Settings > Authorized Domains\n" +
              "將目前的網址新增至白名單中。";
    } else if (error.code === 'auth/operation-not-allowed') {
        msg = "登入方式未啟用 (Operation Not Allowed)\n\n" +
              "請至 Firebase Console > Authentication > Sign-in method\n" +
              "啟用 Google 登入提供者 (Google Sign-in provider)。";
    } else if (error.code === 'auth/popup-blocked') {
        msg = "彈出式視窗被封鎖\n\n請允許瀏覽器顯示彈出式視窗以進行登入驗證。";
    }

    alert(msg);
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

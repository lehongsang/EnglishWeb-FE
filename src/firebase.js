import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Cấu hình Firebase app của bạn
const firebaseConfig = {
  apiKey: "AIzaSyBXUcNsxkLZr2gSIDc_LXZ8gRkjPX_JKpU",
  authDomain: "english-learning-ldhs202.firebaseapp.com",
  projectId: "english-learning-ldhs202",
  storageBucket: "english-learning-ldhs202.firebasestorage.app",
  messagingSenderId: "588750791988",
  appId: "1:588750791988:web:be7fb5a21f04a6c8343161"
};

// Khởi tạo app Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo service Authentication
export const auth = getAuth(app);

// Export app để có thể dùng ở nơi khác
export default app;

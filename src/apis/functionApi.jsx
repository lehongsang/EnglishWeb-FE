import { axiosClient } from "./baseApi";
import apiEndpoints from "./endPoint";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from '../firebase';

const db = getFirestore(app);
const auth = getAuth(app);

const apiCommon = {
  getPronounce: () => {  
      const url = `pronounce`;
      return axiosClient.get(url);
    },
  getUseData: (id) => {
    const url = `user/${id}`;
    return axiosClient.get(url);
  },
  // Lesson APIs
  getAllLessons: () => {
    return axiosClient.get(apiEndpoints.getAllLessons);
  },
  getLessonContent: (lessonId) => {
    return axiosClient.get(apiEndpoints.getLessonContent(lessonId));
  },
  submitExerciseAnswer: (lessonId, exerciseId, answer) => {
    return axiosClient.post(apiEndpoints.submitExerciseAnswer(lessonId, exerciseId), { answer });
  },
  getLessonProgress: (lessonId) => {
    return axiosClient.get(apiEndpoints.getLessonProgress(lessonId));
  },
  getVocabularyAudio: (word) => {
    return axiosClient.get(apiEndpoints.getVocabularyAudio(word));
  },
  // User Profile APIs using Firebase
  getUserProfile: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const userDoc = await getDoc(doc(db, apiEndpoints.getUserProfile, user.uid));
      if (!userDoc.exists()) {
        // Create user profile if it doesn't exist
        const newUserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date(),
          lastLogin: new Date()
        };
        await setDoc(doc(db, apiEndpoints.getUserProfile, user.uid), newUserProfile);
        return { data: { success: true, data: newUserProfile } };
      }
      return { data: { success: true, data: userDoc.data() } };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  updateUserProfile: async (userData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const userRef = doc(db, apiEndpoints.getUserProfile, user.uid);
      await updateDoc(userRef, {
        ...userData,
        lastLogin: new Date()
      });
      return { data: { success: true } };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  getUserCompletedLessons: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const q = query(
        collection(db, apiEndpoints.getUserCompletedLessons),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const completedLessons = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { data: { success: true, data: completedLessons } };
    } catch (error) {
      console.error('Error getting completed lessons:', error);
      throw error;
    }
  },

  getUserStatistics: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Get completed lessons
      const q = query(
        collection(db, apiEndpoints.getUserCompletedLessons),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const completedLessons = querySnapshot.docs.map(doc => doc.data());

      // Calculate statistics
      const totalLessons = completedLessons.length;
      const totalScore = completedLessons.reduce((sum, lesson) => sum + lesson.score, 0);
      const totalTime = completedLessons.reduce((sum, lesson) => {
        const minutes = parseInt(lesson.completionTime);
        return sum + (isNaN(minutes) ? 0 : minutes);
      }, 0);

      const statistics = {
        totalLessons,
        completedLessons: totalLessons,
        totalScore,
        averageScore: totalLessons > 0 ? (totalScore / totalLessons).toFixed(1) : 0,
        totalTime
      };

      return { data: { success: true, data: statistics } };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }
};

export default apiCommon;
const BASE_URL = "https://english-learning-website-be-nhom32.onrender.com";

const apiEndpoints = {
    //
    syncProfile: `${BASE_URL}/auth/sync-profile`,
    getMe: `${BASE_URL}/auth/me`,

    // Lesson endpoints
    submitExerciseAnswer: (lessonId, exerciseId) => `${BASE_URL}/lessons/${lessonId}/exercises/${exerciseId}/submit`,
    getLessonProgress: (lessonId) => `${BASE_URL}/lessons/${lessonId}/progress`,
    getVocabularyAudio: (word) => `${BASE_URL}/audio/${word}`,
    // Firebase endpoints
    getUserProfile: 'users', // Firestore collection name
    updateUserProfile: 'users', // Firestore collection name
    getUserCompletedLessons: 'completedLessons', // Firestore collection name
    getUserStatistics: 'userStatistics', // Firestore collection name

    // Tasks
    getDailyTasksForUser: `${BASE_URL}/task/dailytask`,

    // Learning
    getCourseStructure: (courseId) => `${BASE_URL}/learning/lessons?courseId=${courseId}`,
    getNextLesson: (courseId) => `${BASE_URL}/learning/lessons/next?courseId=${courseId}`,
    getExercisesForLesson: (lessonId) => `${BASE_URL}/learning/lessons/${lessonId}/exercises`,
    submitLearningExercise: (exerciseId) => `${BASE_URL}/learning/exercises/${exerciseId}/submit`,
    completeLearningLesson: (lessonId) => `${BASE_URL}/learning/lessons/${lessonId}/complete`,
    getLessonContent: (lessonId) => `${BASE_URL}/learning/lessons/${lessonId}/content`,

    // Review
    getLearnedVocabGrouped: (courseId) => `${BASE_URL}/review/vocabularies?courseId=${courseId}`,
    startReviewSession: `${BASE_URL}/review/session/start`,

    //
    getUserStats: `${BASE_URL}/users/stats`,
}

export default apiEndpoints;
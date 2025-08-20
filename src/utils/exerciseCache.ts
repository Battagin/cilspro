interface CachedExercise {
  id: string;
  type: string;
  title: string;
  prompt_it: string;
  text_it?: string;
  audio_url?: string;
  audio_text?: string;
  timer_seconds: number;
  questions: Array<{
    id: string;
    text: string;
    options: string[];
  }>;
  min_words?: number;
  max_words?: number;
  cachedAt: number;
}

interface CachedFeedback {
  exerciseId: string;
  userInput: string;
  feedback: any;
  cachedAt: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const EXERCISES_CACHE_KEY = 'cils_exercises_cache';
const FEEDBACK_CACHE_KEY = 'cils_feedback_cache';

export class ExerciseCache {
  private static getCachedExercises(): CachedExercise[] {
    try {
      const cached = localStorage.getItem(EXERCISES_CACHE_KEY);
      if (!cached) return [];
      
      const exercises = JSON.parse(cached) as CachedExercise[];
      const now = Date.now();
      
      // Filter out expired exercises
      return exercises.filter(ex => (now - ex.cachedAt) < CACHE_DURATION);
    } catch (error) {
      console.error('Error reading cached exercises:', error);
      return [];
    }
  }

  private static setCachedExercises(exercises: CachedExercise[]): void {
    try {
      localStorage.setItem(EXERCISES_CACHE_KEY, JSON.stringify(exercises));
    } catch (error) {
      console.error('Error caching exercises:', error);
    }
  }

  private static getCachedFeedback(): CachedFeedback[] {
    try {
      const cached = localStorage.getItem(FEEDBACK_CACHE_KEY);
      if (!cached) return [];
      
      const feedback = JSON.parse(cached) as CachedFeedback[];
      const now = Date.now();
      
      // Filter out expired feedback
      return feedback.filter(fb => (now - fb.cachedAt) < CACHE_DURATION);
    } catch (error) {
      console.error('Error reading cached feedback:', error);
      return [];
    }
  }

  private static setCachedFeedback(feedback: CachedFeedback[]): void {
    try {
      localStorage.setItem(FEEDBACK_CACHE_KEY, JSON.stringify(feedback));
    } catch (error) {
      console.error('Error caching feedback:', error);
    }
  }

  static getExercisesByType(type: string, count: number = 3): CachedExercise[] {
    const cached = this.getCachedExercises();
    const typeExercises = cached.filter(ex => ex.type === type);
    
    // Shuffle and return requested count
    const shuffled = typeExercises.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  static addExercise(exercise: Omit<CachedExercise, 'cachedAt'>): void {
    const cached = this.getCachedExercises();
    const newExercise: CachedExercise = {
      ...exercise,
      cachedAt: Date.now()
    };
    
    // Check if exercise already exists
    const existingIndex = cached.findIndex(ex => ex.id === exercise.id);
    if (existingIndex >= 0) {
      cached[existingIndex] = newExercise;
    } else {
      cached.push(newExercise);
    }
    
    this.setCachedExercises(cached);
  }

  static getFeedback(exerciseId: string, userInput: string): any | null {
    const cached = this.getCachedFeedback();
    const feedback = cached.find(fb => 
      fb.exerciseId === exerciseId && 
      fb.userInput === userInput
    );
    
    return feedback?.feedback || null;
  }

  static addFeedback(exerciseId: string, userInput: string, feedback: any): void {
    const cached = this.getCachedFeedback();
    const newFeedback: CachedFeedback = {
      exerciseId,
      userInput,
      feedback,
      cachedAt: Date.now()
    };
    
    // Check if feedback already exists
    const existingIndex = cached.findIndex(fb => 
      fb.exerciseId === exerciseId && fb.userInput === userInput
    );
    
    if (existingIndex >= 0) {
      cached[existingIndex] = newFeedback;
    } else {
      cached.push(newFeedback);
    }
    
    this.setCachedFeedback(cached);
  }

  static getCacheStats(): { exerciseCount: number; feedbackCount: number } {
    const exercises = this.getCachedExercises();
    const feedback = this.getCachedFeedback();
    
    return {
      exerciseCount: exercises.length,
      feedbackCount: feedback.length
    };
  }

  static clearCache(): void {
    localStorage.removeItem(EXERCISES_CACHE_KEY);
    localStorage.removeItem(FEEDBACK_CACHE_KEY);
  }
}
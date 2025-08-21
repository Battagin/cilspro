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
const MAX_CACHE_SIZE = 100; // Maximum exercises per skill type
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
    
    // Prioritize newer exercises and shuffle
    const sorted = typeExercises.sort((a, b) => b.cachedAt - a.cachedAt);
    const shuffled = sorted.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  static needsMoreExercises(type: string, requiredCount: number = 3): boolean {
    const cached = this.getCachedExercises();
    const typeExercises = cached.filter(ex => ex.type === type);
    return typeExercises.length < requiredCount;
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
      // Add to cache and manage size per type
      cached.push(newExercise);
      this.manageCacheSize(cached, exercise.type);
    }
    
    this.setCachedExercises(cached);
  }

  private static manageCacheSize(cached: CachedExercise[], type: string): void {
    const typeExercises = cached.filter(ex => ex.type === type);
    if (typeExercises.length > MAX_CACHE_SIZE) {
      // Remove oldest exercises of this type
      const sortedByAge = typeExercises.sort((a, b) => a.cachedAt - b.cachedAt);
      const toRemove = sortedByAge.slice(0, typeExercises.length - MAX_CACHE_SIZE);
      
      toRemove.forEach(ex => {
        const index = cached.findIndex(c => c.id === ex.id);
        if (index >= 0) cached.splice(index, 1);
      });
    }
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
import { supabase } from '../lib/supabase';

export class TrainingRoundTracker {
  // Fetch user info once
  static async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('id, total_training_rounds, last_training_completed_at, plan_type')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  static isToday(dateString) {
    if (!dateString) return false;
    const d = new Date(dateString);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }

  static async getTodayTrainingCount(userId) {
    const user = await this.getUserProfile(userId);
    if (!user) return 0;

    // Optional: if you add a daily counter column, use that.
    // For now, we only track the last round, not full daily history.
    if (this.isToday(user.last_training_completed_at)) {
      // If you want to track daily totals later, extend schema.
      return user.total_training_rounds ?? 0;
    }

    return 0;
  }

  static async recordTrainingRound(userId, game) {
    if (!userId || !game) return false;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          total_training_rounds: supabase.rpc('increment', { x: 1 }), // optional if you define an increment function
          last_training_game: game,
          last_training_completed_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error recording training round:', error);
      return false;
    }
  }

  static async getRemainingTrainingRounds(userId, planType) {
    if (!userId) return 0;

    if (['ace', 'ace_pro', 'lifetime'].includes(planType)) {
      return 'Unlimited';
    }

    const todayCount = await this.getTodayTrainingCount(userId);
    return Math.max(0, 5 - todayCount);
  }

  static async canPlayTraining(userId, planType) {
    if (!userId) return false;

    if (['ace', 'ace_pro', 'lifetime'].includes(planType)) {
      return true;
    }

    const todayCount = await this.getTodayTrainingCount(userId);
    return todayCount < 5;
  }
}

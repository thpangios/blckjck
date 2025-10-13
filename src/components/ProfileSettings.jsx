import React, { useState, useEffect } from 'react';
import { X, Save, User, Target, DollarSign, Gamepad2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function ProfileSettings({ isOpen, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    starting_bankroll: 10000,
    favorite_game: 'blackjack',
    training_goals: ''
  });

  // Load profile on mount
  useEffect(() => {
    if (user && isOpen) {
      loadProfile();
    }
  }, [user, isOpen]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create default profile if none exists
        setProfile({
          username: user.email?.split('@')[0] || 'Player',
          starting_bankroll: 10000,
          favorite_game: 'blackjack',
          training_goals: ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: profile.username,
          starting_bankroll: profile.starting_bankroll,
          favorite_game: profile.favorite_game,
          training_goals: profile.training_goals,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      alert('Profile saved successfully! ✅');
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 glass-dark p-6 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400">⚙️ Profile Settings</h2>
          <button
            onClick={onClose}
            className="glass p-2 rounded-lg hover:bg-red-600 hover:bg-opacity-40 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-400">Loading profile...</p>
            </div>
          ) : (
            <>
              {/* Username */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <User size={18} className="text-yellow-400" />
                  Display Name
                </label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="w-full glass px-4 py-3 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                  placeholder="Enter your username"
                />
              </div>

              {/* Starting Bankroll */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <DollarSign size={18} className="text-green-400" />
                  Starting Bankroll
                </label>
                <input
                  type="number"
                  value={profile.starting_bankroll}
                  onChange={(e) => setProfile({ ...profile, starting_bankroll: Number(e.target.value) })}
                  className="w-full glass px-4 py-3 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                  placeholder="10000"
                  min="100"
                  step="100"
                />
                <p className="text-xs text-gray-500 mt-1">Default balance when starting games</p>
              </div>

              {/* Favorite Game */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <Gamepad2 size={18} className="text-blue-400" />
                  Favorite Game
                </label>
                <select
                  value={profile.favorite_game}
                  onChange={(e) => setProfile({ ...profile, favorite_game: e.target.value })}
                  className="w-full glass px-4 py-3 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                >
                  <option value="blackjack">♠️ Blackjack</option>
                  <option value="baccarat">🎰 Baccarat</option>
                  <option value="videopoker">🃏 Video Poker</option>
                  <option value="paigowpoker">🀄 Pai Gow Poker</option>
                </select>
              </div>

              {/* Training Goals */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <Target size={18} className="text-purple-400" />
                  Training Goals
                </label>
                <textarea
                  value={profile.training_goals}
                  onChange={(e) => setProfile({ ...profile, training_goals: e.target.value })}
                  className="w-full glass px-4 py-3 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all resize-none"
                  rows="4"
                  placeholder="What do you want to achieve? (e.g., Master card counting, improve win rate, learn new strategies...)"
                />
              </div>

              {/* User Email (Read-only) */}
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full glass px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass-dark p-6 border-t border-gray-700 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 glass px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={saveProfile}
            disabled={saving || loading}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="loading-spinner !w-5 !h-5 !border-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;

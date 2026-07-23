export const STUDY_PREFERENCES_KEY = "studyhub_preferences";

const defaultPreferences = {
  emailReminders: true,
  rememberProgressHistory: true,
  showStudyRecommendations: true,
  weeklyStudyGoal: 5,
};

export function getStudyPreferences() {
  const rawValue = localStorage.getItem(STUDY_PREFERENCES_KEY);

  if (!rawValue) {
    return defaultPreferences;
  }

  try {
    const parsed = JSON.parse(rawValue);
    return {
      ...defaultPreferences,
      ...parsed,
    };
  } catch {
    localStorage.removeItem(STUDY_PREFERENCES_KEY);
    return defaultPreferences;
  }
}

export function saveStudyPreferences(preferences) {
  const nextPreferences = {
    ...defaultPreferences,
    ...preferences,
  };

  localStorage.setItem(
    STUDY_PREFERENCES_KEY,
    JSON.stringify(nextPreferences)
  );

  return nextPreferences;
}

export function resetStudyPreferences() {
  localStorage.removeItem(STUDY_PREFERENCES_KEY);
  return defaultPreferences;
}

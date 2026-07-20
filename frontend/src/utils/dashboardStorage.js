export const DASHBOARD_SUBJECTS_CACHE_KEY = "studyhub_dashboard_subjects";
export const LAST_ACTIVE_SUBJECT_KEY = "studyhub_last_subject";
export const LAST_ACTIVE_LESSON_KEY = "studyhub_last_lesson";

export function readStoredItem(key, fallbackValue = null) {
  const rawValue = localStorage.getItem(key);

  if (!rawValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    localStorage.removeItem(key);
    return fallbackValue;
  }
}

export function writeStoredItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

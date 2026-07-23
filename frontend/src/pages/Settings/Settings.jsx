import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  DASHBOARD_SUBJECTS_CACHE_KEY,
  LAST_ACTIVE_LESSON_KEY,
  LAST_ACTIVE_SUBJECT_KEY,
} from "../../utils/dashboardStorage";
import { clearStudyProgress } from "../../utils/studyProgress";
import {
  getStudyPreferences,
  resetStudyPreferences,
  saveStudyPreferences,
} from "../../utils/studyPreferences";

function Settings() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });
  const [preferences, setPreferences] = useState(getStudyPreferences);
  const [profileSaving, setProfileSaving] = useState(false);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [preferencesMessage, setPreferencesMessage] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [dataMessage, setDataMessage] = useState("");

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
    });
  }, [user]);

  function handleProfileFieldChange(event) {
    const { name, value } = event.target;

    setProfileForm((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  }

  function handlePreferenceToggle(event) {
    const { name, checked } = event.target;

    setPreferences((currentValue) => ({
      ...currentValue,
      [name]: checked,
    }));
  }

  function handleWeeklyGoalChange(event) {
    const nextValue = Number(event.target.value);

    setPreferences((currentValue) => ({
      ...currentValue,
      weeklyStudyGoal: Number.isNaN(nextValue) ? 0 : nextValue,
    }));
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileMessage("");

    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim();

    if (!trimmedName || !trimmedEmail) {
      setProfileError("Please enter both your name and email address.");
      setProfileSaving(false);
      return;
    }

    try {
      const response = await updateProfile({
        name: trimmedName,
        email: trimmedEmail,
      });
      setProfileForm({
        name: response.user.name,
        email: response.user.email,
      });
      setProfileMessage("Your profile has been updated.");
    } catch (error) {
      console.error(error);
      setProfileError(
        error.response?.data?.detail ||
          "We could not save your profile right now. Please try again."
      );
    } finally {
      setProfileSaving(false);
    }
  }

  function handleSavePreferences(event) {
    event.preventDefault();
    setPreferencesSaving(true);
    setPreferencesMessage("");

    const savedPreferences = saveStudyPreferences({
      ...preferences,
      weeklyStudyGoal: Math.max(1, Number(preferences.weeklyStudyGoal) || 1),
    });

    setPreferences(savedPreferences);

    if (!savedPreferences.rememberProgressHistory) {
      clearStudyProgress();
    }

    setPreferencesMessage("Your study preferences have been saved.");
    setPreferencesSaving(false);
  }

  function handleResetPreferences() {
    const defaults = resetStudyPreferences();
    setPreferences(defaults);
    setPreferencesMessage("Your study preferences were reset to defaults.");
  }

  function handleClearLearningData() {
    clearStudyProgress();
    localStorage.removeItem(DASHBOARD_SUBJECTS_CACHE_KEY);
    localStorage.removeItem(LAST_ACTIVE_SUBJECT_KEY);
    localStorage.removeItem(LAST_ACTIVE_LESSON_KEY);
    setDataMessage("Saved learning history and cached dashboard data have been cleared.");
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <DashboardLayout>
      <div>
        <h1
          style={{
            color: "#1E40AF",
            marginBottom: "10px",
          }}
        >
          Settings
        </h1>

        <p
          style={{
            color: "#6B7280",
            marginBottom: "30px",
          }}
        >
          Manage your profile, tune your study preferences, and control saved app data.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: "24px",
          }}
        >
          <form
            onSubmit={handleSaveProfile}
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "18px",
              boxShadow: "0 5px 18px rgba(15, 23, 42, 0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1E3A8A",
              }}
            >
              Profile
            </h2>

            <p
              style={{
                color: "#6B7280",
                marginBottom: "18px",
              }}
            >
              Update the learner name and email shown across the dashboard.
            </p>

            {profileError && (
              <div
                style={{
                  background: "#FEE2E2",
                  color: "#B91C1C",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  marginBottom: "14px",
                }}
              >
                {profileError}
              </div>
            )}

            {profileMessage && (
              <div
                style={{
                  background: "#DCFCE7",
                  color: "#166534",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  marginBottom: "14px",
                }}
              >
                {profileMessage}
              </div>
            )}

            <label
              style={{
                display: "block",
                marginBottom: "14px",
              }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#0F172A",
                  fontWeight: 600,
                }}
              >
                Full Name
              </span>
              <input
                name="name"
                type="text"
                value={profileForm.name}
                onChange={handleProfileFieldChange}
                required
                style={{
                  width: "100%",
                  border: "1px solid #CBD5E1",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  boxSizing: "border-box",
                }}
              />
            </label>

            <label
              style={{
                display: "block",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#0F172A",
                  fontWeight: 600,
                }}
              >
                Email Address
              </span>
              <input
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileFieldChange}
                required
                style={{
                  width: "100%",
                  border: "1px solid #CBD5E1",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  boxSizing: "border-box",
                }}
              />
            </label>

            <button
              type="submit"
              disabled={profileSaving}
              style={{
                border: "none",
                background: profileSaving ? "#93C5FD" : "#2563EB",
                color: "#fff",
                padding: "12px 18px",
                borderRadius: "10px",
                cursor: profileSaving ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </form>

          <form
            onSubmit={handleSavePreferences}
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "18px",
              boxShadow: "0 5px 18px rgba(15, 23, 42, 0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1E3A8A",
              }}
            >
              Study Preferences
            </h2>

            <p
              style={{
                color: "#6B7280",
                marginBottom: "18px",
              }}
            >
              Choose how StudyHub saves activity and supports your revision routine.
            </p>

            {preferencesMessage && (
              <div
                style={{
                  background: "#DCFCE7",
                  color: "#166534",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  marginBottom: "14px",
                }}
              >
                {preferencesMessage}
              </div>
            )}

            <label
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "14px",
                marginBottom: "16px",
                padding: "14px 16px",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
              }}
            >
              <div>
                <strong>Email Reminders</strong>
                <p
                  style={{
                    color: "#6B7280",
                    margin: "6px 0 0",
                  }}
                >
                  Keep reminder preference saved for future notification features.
                </p>
              </div>
              <input
                type="checkbox"
                name="emailReminders"
                checked={preferences.emailReminders}
                onChange={handlePreferenceToggle}
              />
            </label>

            <label
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "14px",
                marginBottom: "16px",
                padding: "14px 16px",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
              }}
            >
              <div>
                <strong>Remember Progress History</strong>
                <p
                  style={{
                    color: "#6B7280",
                    margin: "6px 0 0",
                  }}
                >
                  Store lesson, quiz, and tutor activity for the Progress tab.
                </p>
              </div>
              <input
                type="checkbox"
                name="rememberProgressHistory"
                checked={preferences.rememberProgressHistory}
                onChange={handlePreferenceToggle}
              />
            </label>

            <label
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "14px",
                marginBottom: "20px",
                padding: "14px 16px",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
              }}
            >
              <div>
                <strong>Show Study Recommendations</strong>
                <p
                  style={{
                    color: "#6B7280",
                    margin: "6px 0 0",
                  }}
                >
                  Keep recommendation widgets enabled across your learning dashboard.
                </p>
              </div>
              <input
                type="checkbox"
                name="showStudyRecommendations"
                checked={preferences.showStudyRecommendations}
                onChange={handlePreferenceToggle}
              />
            </label>

            <label
              style={{
                display: "block",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#0F172A",
                  fontWeight: 600,
                }}
              >
                Weekly Activity Goal
              </span>
              <input
                type="number"
                min="1"
                value={preferences.weeklyStudyGoal}
                onChange={handleWeeklyGoalChange}
                style={{
                  width: "100%",
                  border: "1px solid #CBD5E1",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  boxSizing: "border-box",
                }}
              />
            </label>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                disabled={preferencesSaving}
                style={{
                  border: "none",
                  background: preferencesSaving ? "#93C5FD" : "#2563EB",
                  color: "#fff",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  cursor: preferencesSaving ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                {preferencesSaving ? "Saving..." : "Save Preferences"}
              </button>

              <button
                type="button"
                onClick={handleResetPreferences}
                style={{
                  border: "1px solid #CBD5E1",
                  background: "#fff",
                  color: "#0F172A",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Reset Defaults
              </button>
            </div>
          </form>
        </div>

        <div
          style={{
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: "24px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "18px",
              boxShadow: "0 5px 18px rgba(15, 23, 42, 0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1E3A8A",
              }}
            >
              Saved Data
            </h2>

            <p
              style={{
                color: "#6B7280",
                lineHeight: 1.7,
              }}
            >
              Clear saved dashboard cache, recent learning context, and locally stored progress if you want a fresh start.
            </p>

            {dataMessage && (
              <div
                style={{
                  background: "#DBEAFE",
                  color: "#1D4ED8",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  marginBottom: "14px",
                }}
              >
                {dataMessage}
              </div>
            )}

            <button
              onClick={handleClearLearningData}
              style={{
                border: "none",
                background: "#DC2626",
                color: "#fff",
                padding: "12px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Clear Learning Data
            </button>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "18px",
              boxShadow: "0 5px 18px rgba(15, 23, 42, 0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1E3A8A",
              }}
            >
              Session
            </h2>

            <p
              style={{
                color: "#6B7280",
                lineHeight: 1.7,
                marginBottom: "18px",
              }}
            >
              Signed in as {user?.email || "your StudyHub account"}.
            </p>

            <button
              onClick={handleLogout}
              style={{
                border: "none",
                background: "#0F172A",
                color: "#fff",
                padding: "12px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;

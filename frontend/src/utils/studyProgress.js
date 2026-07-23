import { getStudyPreferences } from "./studyPreferences";

const STUDY_PROGRESS_KEY = "studyhub_progress_data";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDateLabel(dateKey) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function readProgressData() {
  const rawValue = localStorage.getItem(STUDY_PROGRESS_KEY);

  if (!rawValue) {
    return {
      lessonVisits: [],
      quizResults: [],
      tutorSessions: [],
      dailyActivity: {},
    };
  }

  try {
    const parsed = JSON.parse(rawValue);
    return {
      lessonVisits: Array.isArray(parsed.lessonVisits) ? parsed.lessonVisits : [],
      quizResults: Array.isArray(parsed.quizResults) ? parsed.quizResults : [],
      tutorSessions: Array.isArray(parsed.tutorSessions) ? parsed.tutorSessions : [],
      dailyActivity:
        parsed.dailyActivity && typeof parsed.dailyActivity === "object"
          ? parsed.dailyActivity
          : {},
    };
  } catch {
    localStorage.removeItem(STUDY_PROGRESS_KEY);
    return {
      lessonVisits: [],
      quizResults: [],
      tutorSessions: [],
      dailyActivity: {},
    };
  }
}

function writeProgressData(data) {
  localStorage.setItem(STUDY_PROGRESS_KEY, JSON.stringify(data));
}

function recordDailyActivity(data, type) {
  const todayKey = getTodayKey();
  const currentDay = data.dailyActivity[todayKey] || {
    lessons: 0,
    quizzes: 0,
    tutor: 0,
  };

  if (type === "lesson") {
    currentDay.lessons += 1;
  }

  if (type === "quiz") {
    currentDay.quizzes += 1;
  }

  if (type === "tutor") {
    currentDay.tutor += 1;
  }

  data.dailyActivity[todayKey] = currentDay;
}

export function recordLessonVisit(lesson) {
  if (!getStudyPreferences().rememberProgressHistory) {
    return;
  }

  const data = readProgressData();
  const existingIndex = data.lessonVisits.findIndex(
    (item) => item.topicId === lesson.topicId
  );
  const nextItem = {
    ...lesson,
    visits:
      existingIndex >= 0
        ? (data.lessonVisits[existingIndex].visits || 0) + 1
        : 1,
    lastOpenedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    data.lessonVisits[existingIndex] = {
      ...data.lessonVisits[existingIndex],
      ...nextItem,
    };
  } else {
    data.lessonVisits.unshift(nextItem);
  }

  data.lessonVisits = data.lessonVisits
    .sort(
      (left, right) =>
        new Date(right.lastOpenedAt).getTime() -
        new Date(left.lastOpenedAt).getTime()
    )
    .slice(0, 30);

  recordDailyActivity(data, "lesson");
  writeProgressData(data);
}

export function recordQuizResult(result) {
  if (!getStudyPreferences().rememberProgressHistory) {
    return;
  }

  const data = readProgressData();

  data.quizResults.unshift({
    ...result,
    completedAt: new Date().toISOString(),
  });

  data.quizResults = data.quizResults.slice(0, 30);
  recordDailyActivity(data, "quiz");
  writeProgressData(data);
}

export function recordTutorSession(session) {
  if (!getStudyPreferences().rememberProgressHistory) {
    return;
  }

  const data = readProgressData();

  data.tutorSessions.unshift({
    ...session,
    createdAt: new Date().toISOString(),
  });

  data.tutorSessions = data.tutorSessions.slice(0, 50);
  recordDailyActivity(data, "tutor");
  writeProgressData(data);
}

function buildChartData(dailyActivity) {
  const labels = [];
  const values = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    currentDate.setDate(currentDate.getDate() - offset);

    const dateKey = currentDate.toISOString().slice(0, 10);
    const dayActivity = dailyActivity[dateKey] || {
      lessons: 0,
      quizzes: 0,
      tutor: 0,
    };

    labels.push(getDateLabel(dateKey));
    values.push(
      dayActivity.lessons +
        dayActivity.tutor +
        dayActivity.quizzes * 2
    );
  }

  return { labels, values };
}

function calculateStreak(dailyActivity) {
  let streak = 0;

  for (let offset = 0; offset < 365; offset += 1) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    currentDate.setDate(currentDate.getDate() - offset);

    const dateKey = currentDate.toISOString().slice(0, 10);
    const dayActivity = dailyActivity[dateKey];
    const total =
      (dayActivity?.lessons || 0) +
      (dayActivity?.quizzes || 0) +
      (dayActivity?.tutor || 0);

    if (total > 0) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

export function summarizeStudyProgress() {
  const data = readProgressData();
  const lessonsStarted = data.lessonVisits.length;
  const quizzesCompleted = data.quizResults.length;
  const averageScore = quizzesCompleted
    ? Math.round(
        data.quizResults.reduce(
          (total, item) => total + (item.percentage || 0),
          0
        ) / quizzesCompleted
      )
    : 0;
  const activeDays = Object.values(data.dailyActivity).filter((entry) => {
    return (
      (entry.lessons || 0) +
        (entry.quizzes || 0) +
        (entry.tutor || 0) >
      0
    );
  }).length;
  const chartData = buildChartData(data.dailyActivity);
  const subjectTotals = {};

  data.lessonVisits.forEach((lesson) => {
    if (!lesson.subjectName) {
      return;
    }

    subjectTotals[lesson.subjectName] =
      (subjectTotals[lesson.subjectName] || 0) + (lesson.visits || 1);
  });

  const topSubjects = Object.entries(subjectTotals)
    .map(([subjectName, visits]) => ({ subjectName, visits }))
    .sort((left, right) => right.visits - left.visits)
    .slice(0, 5);

  return {
    lessonsStarted,
    quizzesCompleted,
    averageScore,
    activeDays,
    streak: calculateStreak(data.dailyActivity),
    recentLessons: data.lessonVisits.slice(0, 5),
    recentQuizzes: data.quizResults.slice(0, 5),
    tutorSessions: data.tutorSessions.slice(0, 5),
    chartData,
    topSubjects,
  };
}

export function clearStudyProgress() {
  localStorage.removeItem(STUDY_PROGRESS_KEY);
}

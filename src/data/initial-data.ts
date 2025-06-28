
import type { WorkoutPlan } from '@/types/workout';

const fiveDaySplit = [
  {
    day: "StrengthSplit.fiveDaySplit.day1",
    icon: "IconChest",
    isCompleted: false,
    exercises: [
      { name: "Dumbbell Bench Press", reps: "3x8", weightMode: "standard", weight: "17.5", splitWeights: { set1: "17.5", set2: "17.5", set3: "17.5" }, progress: [false, false, false], isDone: false },
      { name: "Incline Dumbbell Bench Press", reps: "3x8", weightMode: "standard", weight: "17.5", splitWeights: { set1: "17.5", set2: "17.5", set3: "17.5" }, progress: [false, false, false], isDone: false },
      { name: "Machine Fly (Pec Deck)", reps: "3x8", weightMode: "standard", weight: "31", splitWeights: { set1: "31", set2: "31", set3: "31" }, progress: [false, false, false], isDone: false },
    ],
  },
  {
    day: "StrengthSplit.fiveDaySplit.day2",
    icon: "IconBack",
    isCompleted: false,
    exercises: [
      { name: "Cable Lat Pulldown", reps: "3x8", weightMode: "standard", weight: "36", splitWeights: { set1: "36", set2: "36", set3: "36" }, progress: [false, false, false], isDone: false },
      { name: "Cable Seated Row", reps: "3x8", weightMode: "standard", weight: "31.5", splitWeights: { set1: "31.5", set2: "31.5", set3: "31.5" }, progress: [false, false, false], isDone: false },
      { name: "Machine Vertical Row", reps: "3x8", weightMode: "standard", weight: "27", splitWeights: { set1: "27", set2: "27", set3: "27" }, progress: [false, false, false], isDone: false },
    ],
  },
  {
    day: "StrengthSplit.fiveDaySplit.day3",
    icon: "Footprints",
    isCompleted: false,
    exercises: [
      { name: "Machine Leg Press", reps: "3x8", weightMode: "standard", weight: "27", splitWeights: { set1: "27", set2: "27", set3: "27" }, progress: [false, false, false], isDone: false },
      { name: "Machine Seated Leg Curl", reps: "3x8", weightMode: "standard", weight: "25", splitWeights: { set1: "25", set2: "25", set3: "25" }, progress: [false, false, false], isDone: false },
      { name: "Machine Leg Extension", reps: "3x8", weightMode: "standard", weight: "30", splitWeights: { set1: "30", set2: "30", set3: "30" }, progress: [false, false, false], isDone: false },
    ],
  },
  {
    day: "StrengthSplit.fiveDaySplit.day4",
    icon: "IconShoulder",
    isCompleted: false,
    exercises: [
      { name: "Machine Shoulder Press", reps: "3x8", weightMode: "standard", weight: "5", splitWeights: { set1: "5", set2: "5", set3: "5" }, progress: [false, false, false], isDone: false },
      { name: "Machine Deltoid Raise", reps: "3x8", weightMode: "standard", weight: "18", splitWeights: { set1: "18", set2: "18", set3: "18" }, progress: [false, false, false], isDone: false },
      { name: "Face Pulls (with Rope)", reps: "3x8", weightMode: "standard", weight: "10", splitWeights: { set1: "10", set2: "10", set3: "10" }, progress: [false, false, false], isDone: false },
    ],
  },
  {
    day: "StrengthSplit.fiveDaySplit.day5",
    icon: "BicepsFlexed",
    isCompleted: false,
    exercises: [
      { name: "Biceps: Alt. Bicep Curl", reps: "3x8", weightMode: "standard", weight: "10", splitWeights: { set1: "10", set2: "10", set3: "10" }, progress: [false, false, false], isDone: false },
      { name: "Biceps: Hammer Curl", reps: "3x8", weightMode: "standard", weight: "7.5", splitWeights: { set1: "7.5", set2: "7.5", set3: "7.5" }, progress: [false, false, false], isDone: false },
      { name: "Triceps: Machine Dip", reps: "3x8", weightMode: "standard", weight: "54", splitWeights: { set1: "54", set2: "54", set3: "54" }, progress: [false, false, false], isDone: false },
      { name: "Triceps: Cable Pushdown", reps: "3x8", weightMode: "standard", weight: "15", splitWeights: { set1: "15", set2: "15", set3: "15" }, progress: [false, false, false], isDone: false },
      { name: "Triceps: Tricep Kickback", reps: "3x8", weightMode: "standard", weight: "7.5", splitWeights: { set1: "7.5", set2: "7.5", set3: "7.5" }, progress: [false, false, false], isDone: false },
    ],
  },
];

const threeDaySplit = [
    {
        day: "StrengthSplit.threeDaySplit.day1",
        icon: "IconChest",
        isCompleted: false,
        exercises: [
            ...fiveDaySplit[0].exercises,
            ...fiveDaySplit[4].exercises.filter(ex => ex.name.startsWith("Biceps"))
        ]
    },
    {
        day: "StrengthSplit.threeDaySplit.day2",
        icon: "IconBack",
        isCompleted: false,
        exercises: [
            ...fiveDaySplit[1].exercises,
            ...fiveDaySplit[3].exercises
        ]
    },
    {
        day: "StrengthSplit.threeDaySplit.day3",
        icon: "Footprints",
        isCompleted: false,
        exercises: [
            ...fiveDaySplit[2].exercises,
            ...fiveDaySplit[4].exercises.filter(ex => ex.name.startsWith("Triceps"))
        ]
    }
];


export const initialWorkoutData: WorkoutPlan = {
  userName: 'Dani',
  settings: {
    cardioVisible: true,
    sectionsOrder: ['cardio', 'strength'],
    activeSplit: '5-day',
  },
  cardio: {
    warmup: { duration: "5", level: "5", rpm: "60" },
    main: { cycles: "3", duration: "5", level: "6", rpm: "60" },
    high: { cycles: "3", duration: "2", level: "9", rpm: "70" },
    cooldown: { duration: "5", level: "3", rpm: "60" },
  },
  fiveDaySplit: fiveDaySplit,
  threeDaySplit: threeDaySplit,
};

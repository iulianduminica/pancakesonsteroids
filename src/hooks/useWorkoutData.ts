
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import type { WorkoutPlan, Exercise, WorkoutDay } from '@/types/workout';
import { initialWorkoutData } from '@/data/initial-data';
import { auth, db, hasFirebaseConfig } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import i18n from '@/lib/i18n';

type Status = 'connecting' | 'syncing' | 'synced' | 'error' | 'offline' | 'no-profile';

const WORKOUT_PROFILES: Record<string, string> = {
  'dxw': 'Dani',
  'spw': 'Stelu',
};
type WorkoutCode = keyof typeof WORKOUT_PROFILES;

export default function useWorkoutData() {
  const [workoutData, setWorkoutData] = useState<WorkoutPlan | null>(null);
  const [status, setStatus] = useState<Status>('connecting');
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const docRef = useRef<any | null>(null);
  const { toast } = useToast();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const isUpdatingFromSnapshot = useRef(false);
  const unsubscribeSnapshot = useRef<() => void>(() => {});

  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [skippedExercises, setSkippedExercises] = useState<number[]>([]);
  const [justCompletedDayIndex, setJustCompletedDayIndex] = useState<number | null>(null);

  // For rests within an exercise
  const [restStopwatchValue, setRestStopwatchValue] = useState(0);
  const [isRestStopwatchRunning, setIsRestStopwatchRunning] = useState(false);
  const restStopwatchStartTimeRef = useRef(0);
  const restStopwatchPausedValueRef = useRef(0);
  const restStopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // For breaks between exercises
  const [breakStopwatchValue, setBreakStopwatchValue] = useState(0);
  const [isBreakStopwatchRunning, setIsBreakStopwatchRunning] = useState(false);
  const breakStopwatchStartTimeRef = useRef(0);
  const breakStopwatchPausedValueRef = useRef(0);
  const breakStopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showBreakTimerAfter, setShowBreakTimerAfter] = useState<{ dayIndex: number; exIndex: number } | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (restStopwatchIntervalRef.current) clearInterval(restStopwatchIntervalRef.current);
      if (breakStopwatchIntervalRef.current) clearInterval(breakStopwatchIntervalRef.current);
      unsubscribeSnapshot.current();
    };
  }, []);

  // Effect for Rest Stopwatch
  useEffect(() => {
    if (isRestStopwatchRunning) {
      restStopwatchStartTimeRef.current = Date.now();
      restStopwatchIntervalRef.current = setInterval(() => {
        if (!isMounted.current) return;
        setRestStopwatchValue(restStopwatchPausedValueRef.current + Math.floor((Date.now() - restStopwatchStartTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (restStopwatchIntervalRef.current) clearInterval(restStopwatchIntervalRef.current);
    }
    return () => {
      if (restStopwatchIntervalRef.current) clearInterval(restStopwatchIntervalRef.current);
    };
  }, [isRestStopwatchRunning]);

  // Effect for Break Stopwatch
  useEffect(() => {
    if (isBreakStopwatchRunning) {
      breakStopwatchStartTimeRef.current = Date.now();
      breakStopwatchIntervalRef.current = setInterval(() => {
        if (!isMounted.current) return;
        setBreakStopwatchValue(breakStopwatchPausedValueRef.current + Math.floor((Date.now() - breakStopwatchStartTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (breakStopwatchIntervalRef.current) clearInterval(breakStopwatchIntervalRef.current);
    }
    return () => {
      if (breakStopwatchIntervalRef.current) clearInterval(breakStopwatchIntervalRef.current);
    };
  }, [isBreakStopwatchRunning]);
  
  const startRestStopwatch = useCallback(() => {
    restStopwatchPausedValueRef.current = 0;
    setRestStopwatchValue(0);
    setIsRestStopwatchRunning(true);
  }, []);

  const stopRestStopwatch = useCallback(() => {
    setIsRestStopwatchRunning(false);
    if(isMounted.current) restStopwatchPausedValueRef.current = restStopwatchValue;
  }, [restStopwatchValue]);

  const resetRestStopwatch = useCallback(() => {
    setIsRestStopwatchRunning(false);
    restStopwatchPausedValueRef.current = 0;
    if (isMounted.current) setRestStopwatchValue(0);
  }, []);
  
  const startBreakStopwatch = useCallback(() => {
    breakStopwatchPausedValueRef.current = 0;
    setBreakStopwatchValue(0);
    setIsBreakStopwatchRunning(true);
  }, []);

  const stopBreakStopwatch = useCallback(() => {
    setIsBreakStopwatchRunning(false);
    if(isMounted.current) breakStopwatchPausedValueRef.current = breakStopwatchValue;
  }, [breakStopwatchValue]);

  const resetBreakStopwatch = useCallback(() => {
    setIsBreakStopwatchRunning(false);
    breakStopwatchPausedValueRef.current = 0;
    if (isMounted.current) setBreakStopwatchValue(0);
  }, []);

  const findNextExercise = (day: WorkoutDay, localSkipped: number[]) => {
    // 1. Check for skipped exercises
    if (localSkipped.length > 0) {
      return localSkipped[0];
    }
    // 2. Find next uncompleted exercise
    return day.exercises.findIndex(ex => !ex.isDone);
  };

  const endBreak = useCallback(() => {
    if (!showBreakTimerAfter || !workoutData) return;

    const { dayIndex } = showBreakTimerAfter;
    const splitKey = workoutData.settings.activeSplit === '3-day' ? 'threeDaySplit' : 'fiveDaySplit';
    const day = workoutData[splitKey][dayIndex];
    const nextExerciseIndex = findNextExercise(day, skippedExercises);
    
    if (isMounted.current) {
        if (nextExerciseIndex !== -1) {
            setActiveExerciseIndex(nextExerciseIndex);
        }
        setShowBreakTimerAfter(null);
        resetBreakStopwatch();
    }
  }, [showBreakTimerAfter, workoutData, skippedExercises, resetBreakStopwatch]);

  const showFirestoreRulesError = () => {
    const rulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null;
    }
  }
}`;
    
    const handleCopy = () => {
      navigator.clipboard.writeText(rulesText);
      toast({
        title: i18n.t('Toasts.rulesCopiedTitle'),
        description: i18n.t('Toasts.rulesCopiedDescription'),
      });
    };

    toast({
      variant: "destructive",
      title: i18n.t('Toasts.permissionErrorTitle'),
      description: React.createElement(
          'div',
          { className: 'text-xs w-full' },
          React.createElement(
              'p',
              { className: 'mb-2' },
              i18n.t('Toasts.permissionErrorDescription')
          ),
          React.createElement(
              'pre',
              { className: 'p-2 my-2 rounded-md bg-black/80 text-white font-mono text-[10px] leading-snug select-all' },
              rulesText
          ),
          React.createElement(
            Button,
            {
              variant: 'secondary',
              size: 'sm',
              onClick: handleCopy,
              className: 'w-full mt-2'
            },
            React.createElement(Copy, { className: 'mr-2 h-4 w-4' }),
            i18n.t('Toasts.copyRules')
          )
      ),
      duration: Infinity,
    });
  }

  const saveData = useCallback((dataToSave: WorkoutPlan | null) => {
    if (!docRef.current || !dataToSave) return;
    
    if (isMounted.current) setStatus('syncing');

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        await setDoc(docRef.current, dataToSave, { merge: true });
        if (isMounted.current) setStatus('synced');
      } catch (error) {
        console.error("Failed to save data", error);
        if (isMounted.current) {
          setStatus('error');
          showFirestoreRulesError();
        }
      }
    }, 1500);
  }, [toast]);

  const loadWorkoutPlan = useCallback(async (id: string) => {
    if (!WORKOUT_PROFILES[id as WorkoutCode]) {
      setStatus('error');
      toast({ variant: "destructive", title: i18n.t('Toasts.invalidCodeTitle'), description: i18n.t('Toasts.invalidCodeDescription') });
      setTimeout(() => { if(isMounted.current) setStatus('no-profile'); }, 2000);
      return;
    }

    if (!hasFirebaseConfig || !auth.currentUser) {
      setStatus('error');
      toast({ variant: "destructive", title: i18n.t('Toasts.authErrorTitle'), description: i18n.t('Toasts.authErrorDescription') });
      return;
    }
    
    setStatus('syncing');
    const newDocRef = doc(db, 'workouts', id);
    docRef.current = newDocRef;

    unsubscribeSnapshot.current();

    const setupSubscription = (docRefToSub: any) => {
      unsubscribeSnapshot.current = onSnapshot(docRefToSub, (document) => {
        if (!isMounted.current) return;
        isUpdatingFromSnapshot.current = true;
        if (document.exists()) {
          setWorkoutData(document.data() as WorkoutPlan);
          setStatus('synced');
        } else {
          const profileName = WORKOUT_PROFILES[id as WorkoutCode];
          const initialData = { ...initialWorkoutData, userName: profileName };
          setDoc(newDocRef, initialData).catch(err => {
            console.error("Error creating initial workout data", err);
            setStatus('error');
            showFirestoreRulesError();
          });
        }
        setTimeout(() => { isUpdatingFromSnapshot.current = false; }, 100);
      }, (error) => {
        console.error("Firestore snapshot error", error);
        if (isMounted.current) {
          setStatus('error');
          showFirestoreRulesError();
        }
      });
    }

    try {
      const docSnap = await getDoc(newDocRef);
      const profileName = WORKOUT_PROFILES[id as WorkoutCode];

      localStorage.setItem('workoutId', id);
      if (!isMounted.current) return;
      setWorkoutId(id);
      setUserName(profileName);

      if (!docSnap.exists()) {
        const initialData = { ...initialWorkoutData, userName: profileName };
        await setDoc(newDocRef, initialData);
      } else {
        let data = docSnap.data() as WorkoutPlan;
        let needsMigration = false;
        
        const dayNameMap: { [key: string]: string } = {
            "Day 1: Chest": "StrengthSplit.fiveDaySplit.day1",
            "Day 2: Back": "StrengthSplit.fiveDaySplit.day2",
            "Day 3: Legs": "StrengthSplit.fiveDaySplit.day3",
            "Day 4: Shoulders": "StrengthSplit.fiveDaySplit.day4",
            "Day 5: Arms (Biceps & Triceps)": "StrengthSplit.fiveDaySplit.day5",
            "Day 1: Chest & Biceps": "StrengthSplit.threeDaySplit.day1",
            "Day 2: Back & Shoulders": "StrengthSplit.threeDaySplit.day2",
            "Day 3: Legs & Triceps": "StrengthSplit.threeDaySplit.day3",
        };

        const migrateDayNames = (userSplit: WorkoutDay[] | undefined) => {
            if (!userSplit) return;
            userSplit.forEach((day: WorkoutDay) => {
                if (dayNameMap[day.day]) {
                    day.day = dayNameMap[day.day];
                    needsMigration = true;
                }
            });
        };

        const migrateSplitIcons = (userSplit: WorkoutDay[] | undefined, initialSplit: WorkoutDay[]) => {
            if (!userSplit || !initialSplit || userSplit.length !== initialSplit.length) return;
            
            userSplit.forEach((day: WorkoutDay, index: number) => {
                const initialDay = initialSplit[index];
                if (initialDay && day.icon !== initialDay.icon) {
                    day.icon = initialDay.icon;
                    needsMigration = true;
                }
            });
        };

        if (!data.fiveDaySplit) {
            data.fiveDaySplit = (data as any).days;
            delete (data as any).days;
            needsMigration = true;
        }

        if (!data.threeDaySplit) {
            data.threeDaySplit = initialWorkoutData.threeDaySplit;
            needsMigration = true;
        }
        
        if (!data.settings) {
            data.settings = { cardioVisible: true, sectionsOrder: ['cardio', 'strength'], activeSplit: '5-day' };
            needsMigration = true;
        }
        
        if (data.settings && !data.settings.activeSplit) {
            data.settings.activeSplit = '5-day';
            needsMigration = true;
        }
        
        migrateSplitIcons(data.fiveDaySplit, initialWorkoutData.fiveDaySplit);
        migrateSplitIcons(data.threeDaySplit, initialWorkoutData.threeDaySplit);

        migrateDayNames(data.fiveDaySplit);
        migrateDayNames(data.threeDaySplit);

        if (needsMigration) {
            await setDoc(newDocRef, data, { merge: true });
        }
      }
      
      setupSubscription(newDocRef);

    } catch (error) {
        console.error("Firestore getDoc/setDoc error", error);
        if (isMounted.current) {
            setStatus('error');
            showFirestoreRulesError();
        }
    }
  }, [toast]);

  const switchProfile = useCallback(() => {
    if (!isMounted.current) return;

    unsubscribeSnapshot.current();
    unsubscribeSnapshot.current = () => {};
    docRef.current = null;
    localStorage.removeItem('workoutId');
    setWorkoutId(null);
    setUserName(null);
    setWorkoutData(null);
    setActiveDayIndex(null);
    setActiveExerciseIndex(null);
    setStatus('no-profile');
  }, []);
  
  useEffect(() => {
    if (!hasFirebaseConfig) {
      setStatus('offline');
      setWorkoutData(initialWorkoutData);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!isMounted.current) return;
        
        const storedWorkoutId = localStorage.getItem('workoutId');
        if (storedWorkoutId && WORKOUT_PROFILES[storedWorkoutId as WorkoutCode]) {
          loadWorkoutPlan(storedWorkoutId);
        } else {
          localStorage.removeItem('workoutId');
          setStatus('no-profile');
        }
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Anonymous sign-in failed. Check your Firebase config and auth rules.", error);
          if (isMounted.current) {
            setStatus('error');
            let title = i18n.t('Toasts.authFailedTitle');
            let description = i18n.t('Toasts.authFailedDescription');

            if (error instanceof Error && (Object.prototype.hasOwnProperty.call(error, 'code')) && (error as { code: string }).code === 'auth/configuration-not-found') {
              title = i18n.t('Toasts.anonSignInDisabledTitle');
              description = i18n.t('Toasts.anonSignInDisabledDescription');
            }

            toast({
              variant: "destructive",
              title: title,
              description: description,
              duration: Infinity,
            });
          }
        }
      }
    });

    return () => {
        unsubscribeAuth();
    };
  }, [loadWorkoutPlan, toast]);

  const handleDataChange = useCallback((getNewData: (d: WorkoutPlan) => WorkoutPlan) => {
    if(isUpdatingFromSnapshot.current) return;
      setWorkoutData(currentData => {
          if (!currentData) return null;
          const newData = getNewData(currentData);
          saveData(newData);
          return newData;
      });
  }, [saveData]);

  const updateCardio = useCallback((group: string, key: string, value: string) => {
    handleDataChange(currentData => {
        const newData = JSON.parse(JSON.stringify(currentData));
        (newData.cardio as any)[group][key] = value;
        return newData;
    });
  }, [handleDataChange]);

  const updateExercise = useCallback((dayIndex: number, exIndex: number, key: keyof Exercise | `splitWeights.set${1|2|3}`, value: any) => {
    handleDataChange(currentData => {
        const newData = JSON.parse(JSON.stringify(currentData));
        const splitKey = newData.settings.activeSplit === '3-day' ? 'threeDaySplit' : 'fiveDaySplit';
        const exercise = newData[splitKey][dayIndex].exercises[exIndex];
        if (typeof key === 'string' && key.startsWith('splitWeights.')) {
            const setKey = key.split('.')[1] as keyof Exercise['splitWeights'];
            exercise.splitWeights[setKey] = value;
        } else {
            (exercise as any)[key] = value;
        }
        return newData;
    });
  }, [handleDataChange]);

  const reorderSplitWeights = useCallback((dayIndex: number, exIndex: number) => {
    handleDataChange(currentData => {
      const newData = JSON.parse(JSON.stringify(currentData));
      const splitKey = newData.settings.activeSplit === '3-day' ? 'threeDaySplit' : 'fiveDaySplit';
      const exercise = newData[splitKey][dayIndex].exercises[exIndex];
      const { set1, set2, set3 } = exercise.splitWeights;

      const v1 = parseFloat(set1);
      const v2 = parseFloat(set2);
      const v3 = parseFloat(set3);
      
      if (isNaN(v1) || isNaN(v2) || isNaN(v3) || v1 <= 0 || v2 <= 0 || v3 <= 0) {
        return currentData; 
      }

      const weights = [v1, v2, v3];
      const sortedWeights = [...weights].sort((a, b) => a - b);
      
      const newSet1 = sortedWeights[0];
      const newSet2 = sortedWeights[2];
      const newSet3 = sortedWeights[1];

      if (v1 === newSet1 && v2 === newSet2 && v3 === newSet3) {
        return currentData;
      }
      
      exercise.splitWeights.set1 = String(newSet1);
      exercise.splitWeights.set2 = String(newSet2);
      exercise.splitWeights.set3 = String(newSet3);
      
      return newData;
    });
  }, [handleDataChange]);

  const toggleSplitMode = useCallback((dayIndex: number, exIndex: number) => {
    handleDataChange(currentData => {
        const newData = JSON.parse(JSON.stringify(currentData));
        const splitKey = newData.settings.activeSplit === '3-day' ? 'threeDaySplit' : 'fiveDaySplit';
        const currentMode = newData[splitKey][dayIndex].exercises[exIndex].weightMode;
        newData[splitKey][dayIndex].exercises[exIndex].weightMode = currentMode === 'standard' ? 'split' : 'standard';
        return newData;
    });
  }, [handleDataChange]);

  const updateProgress = useCallback((dayIndex: number, exIndex: number, pathIndex: number, isChecked: boolean) => {
    handleDataChange(currentData => {
        const newData = JSON.parse(JSON.stringify(currentData));
        const splitKey = newData.settings.activeSplit === '3-day' ? 'threeDaySplit' : 'fiveDaySplit';
        const progress = newData[splitKey][dayIndex].exercises[exIndex].progress;
        progress[pathIndex] = isChecked;

        if (!isChecked) {
          for (let i = pathIndex + 1; i < progress.length; i++) {
            progress[i] = false;
          }
        }
        return newData;
    });
  }, [handleDataChange]);

  const setCardioVisibility = useCallback((visible: boolean) => {
    handleDataChange(currentData => {
        const newData = JSON.parse(JSON.stringify(currentData));
        if (!newData.settings) {
            newData.settings = { cardioVisible: true, sectionsOrder: ['cardio', 'strength'], activeSplit: '5-day' };
        }
        newData.settings.cardioVisible = visible;
        return newData;
    });
  }, [handleDataChange]);

  const setSectionsOrder = useCallback((newOrder: ('cardio' | 'strength')[]) => {
    handleDataChange(currentData => {
        const newData = JSON.parse(JSON.stringify(currentData));
        if (!newData.settings) {
            newData.settings = { cardioVisible: true, sectionsOrder: ['cardio', 'strength'], activeSplit: '5-day' };
        }
        newData.settings.sectionsOrder = newOrder;
        return newData;
    });
  }, [handleDataChange]);

  const switchActiveSplit = useCallback((split: '5-day' | '3-day') => {
    setActiveDayIndex(null);
    setActiveExerciseIndex(null);
    setSkippedExercises([]);
    setShowBreakTimerAfter(null);
    resetBreakStopwatch();
    resetRestStopwatch();
    
    handleDataChange(currentData => {
        const newData = JSON.parse(JSON.stringify(currentData));
        newData.settings.activeSplit = split;
        return newData;
    });
  }, [handleDataChange, resetBreakStopwatch, resetRestStopwatch]);
  
  const startWorkout = useCallback((dayIndex: number) => {
    if (!workoutData) return;
    const splitKey = workoutData.settings.activeSplit === '3-day' ? 'threeDaySplit' : 'fiveDaySplit';
    setActiveDayIndex(dayIndex);
    const firstExerciseIndex = workoutData[splitKey][dayIndex].exercises.findIndex(ex => !ex.isDone);
    setActiveExerciseIndex(firstExerciseIndex);
    setSkippedExercises([]);
    setShowBreakTimerAfter(null);
    resetBreakStopwatch();
  }, [workoutData, resetBreakStopwatch]);
  
  const cancelWorkout = useCallback((dayIndex: number) => {
    if (!workoutData || activeDayIndex !== dayIndex) return;

    const splitKey = workoutData.settings.activeSplit === '3-day' ? 'threeDaySplit' : 'fiveDaySplit';
    const day = workoutData[splitKey][dayIndex];
    const hasProgress = day.exercises.some(ex => ex.isDone);

    if (!hasProgress) {
        if (isMounted.current) {
            setActiveDayIndex(null);
            setActiveExerciseIndex(null);
            setSkippedExercises([]);
            setShowBreakTimerAfter(null);
            resetBreakStopwatch();
            resetRestStopwatch();
        }
    } else {
        toast({
            variant: "destructive",
            title: i18n.t('Toasts.cannotCancelTitle'),
            description: i18n.t('Toasts.cannotCancelDescription'),
        });
    }
  }, [workoutData, activeDayIndex, resetBreakStopwatch, resetRestStopwatch, toast]);

  const markExerciseAsDone = useCallback((dayIndex: number, exIndex: number) => {
    resetRestStopwatch();
    
    handleDataChange(currentData => {
      const newData = JSON.parse(JSON.stringify(currentData));
      const splitKey = newData.settings.activeSplit === '3-day' ? 'threeDaySplit' : 'fiveDaySplit';
      const day = newData[splitKey][dayIndex];
      day.exercises[exIndex].isDone = true;

      let currentSkipped = skippedExercises;
      if (skippedExercises.includes(exIndex)) {
        currentSkipped = skippedExercises.filter(i => i !== exIndex);
        if (isMounted.current) setSkippedExercises(currentSkipped);
      }
      
      const nextExerciseIndex = findNextExercise(day, currentSkipped);

      if (isMounted.current) {
        if (nextExerciseIndex === -1) { 
          day.isCompleted = true;
          setActiveDayIndex(null);
          setActiveExerciseIndex(null);
          setSkippedExercises([]);
          setJustCompletedDayIndex(dayIndex);
          setShowBreakTimerAfter(null);
          resetBreakStopwatch();
        } else {
          setActiveExerciseIndex(null); // Deactivate current exercise to show break timer
          setShowBreakTimerAfter({ dayIndex, exIndex });
          startBreakStopwatch();
        }
      }
      
      return newData;
    });
  }, [handleDataChange, skippedExercises, resetRestStopwatch, startBreakStopwatch, resetBreakStopwatch]);

  const undoMarkAsDone = useCallback((dayIndex: number, exIndex: number) => {
    handleDataChange(currentData => {
      const newData = JSON.parse(JSON.stringify(currentData));
      const splitKey = newData.settings.activeSplit === '3-day' ? 'threeDaySplit' : 'fiveDaySplit';
      const day = newData[splitKey][dayIndex];
      day.exercises[exIndex].isDone = false;

      if (day.isCompleted) {
        day.isCompleted = false;
      }
      
      if (isMounted.current) {
        // If a break was active because of this exercise, cancel it.
        if (showBreakTimerAfter && showBreakTimerAfter.dayIndex === dayIndex && showBreakTimerAfter.exIndex === exIndex) {
            setShowBreakTimerAfter(null);
            resetBreakStopwatch();
        }
        
        // Reactivate the workout and this specific exercise
        setActiveDayIndex(dayIndex);
        setActiveExerciseIndex(exIndex);
      }

      return newData;
    });
  }, [handleDataChange, showBreakTimerAfter, resetBreakStopwatch]);

  const skipExercise = useCallback((dayIndex: number, exIndex: number) => {
    if (!workoutData) return;
    
    resetRestStopwatch();
    resetBreakStopwatch();
    setShowBreakTimerAfter(null);

    const newSkipped = [...skippedExercises, exIndex];
    if (isMounted.current) setSkippedExercises(newSkipped);
    
    const splitKey = workoutData.settings.activeSplit === '3-day' ? 'threeDaySplit' : 'fiveDaySplit';
    const day = workoutData[splitKey][dayIndex];
    const nextIndex = day.exercises.findIndex((ex, idx) => !ex.isDone && !newSkipped.includes(idx));
    
    if (isMounted.current) {
      if (nextIndex === -1) {
        setActiveExerciseIndex(newSkipped[0]);
      } else {
        setActiveExerciseIndex(nextIndex);
      }
    }
  }, [workoutData, skippedExercises, resetRestStopwatch, resetBreakStopwatch]);
  
  const resetDay = useCallback((dayIndex: number) => {
    handleDataChange(currentData => {
      const newData = JSON.parse(JSON.stringify(currentData));
      const splitKey = newData.settings.activeSplit === '3-day' ? 'threeDaySplit' : 'fiveDaySplit';
      newData[splitKey][dayIndex].isCompleted = false;
      newData[splitKey][dayIndex].exercises.forEach((ex: Exercise) => {
        ex.isDone = false;
      });
      return newData;
    });
  }, [handleDataChange]);

  const resetWeek = useCallback(() => {
    handleDataChange(currentData => {
      const newData = JSON.parse(JSON.stringify(currentData));
      const splitKey = newData.settings.activeSplit === '3-day' ? 'threeDaySplit' : 'fiveDaySplit';
      newData[splitKey].forEach((day: WorkoutDay) => {
        day.isCompleted = false;
        day.exercises.forEach((ex: Exercise) => {
          ex.isDone = false;
        });
      });
      return newData;
    });
    if (isMounted.current) {
      setActiveDayIndex(null);
      setActiveExerciseIndex(null);
      setSkippedExercises([]);
    }
  }, [handleDataChange]);

  const resetJustCompletedDay = useCallback(() => {
    setJustCompletedDayIndex(null);
  }, []);

  return { workoutData, status, workoutId, userName, updateCardio, updateExercise, toggleSplitMode, updateProgress, loadWorkoutPlan, switchProfile, setCardioVisibility, setSectionsOrder, activeDayIndex, activeExerciseIndex, startWorkout, cancelWorkout, markExerciseAsDone, undoMarkAsDone, skipExercise, resetDay, resetWeek, restStopwatchValue, isRestStopwatchRunning, startRestStopwatch, stopRestStopwatch, resetRestStopwatch, breakStopwatchValue, isBreakStopwatchRunning, startBreakStopwatch, stopBreakStopwatch, resetBreakStopwatch, showBreakTimerAfter, justCompletedDayIndex, resetJustCompletedDay, endBreak, reorderSplitWeights, switchActiveSplit };
}


"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import useWorkoutData from '@/hooks/useWorkoutData';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CardioProtocol from '@/components/workout/CardioProtocol';
import StrengthSplit from '@/components/workout/StrengthSplit';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { SettingsMenu } from '@/components/layout/SettingsMenu';
import { LoadingScreen } from '@/components/layout/LoadingScreen';

const WelcomeScreen = dynamic(() => import('@/components/layout/WelcomeScreen'), {
    ssr: false,
    loading: () => <LoadingScreen />,
});

const LayoutSettings = ({ settings, onVisibilityChange, onOrderChange, onSplitChange, activeDayIndex }: any) => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                <Tabs value={settings.activeSplit || '5-day'} onValueChange={onSplitChange} className="w-full sm:w-auto" disabled={activeDayIndex !== null}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="5-day">{t('LayoutSettings.fiveDaySplit')}</TabsTrigger>
                        <TabsTrigger value="3-day">{t('LayoutSettings.threeDaySplit')}</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="w-full sm:w-auto flex justify-end">
                  <SettingsMenu 
                      settings={settings}
                      onVisibilityChange={onVisibilityChange}
                      onOrderChange={onOrderChange}
                  />
                </div>
            </CardContent>
        </Card>
    );
};


export default function Home() {
  const {
    workoutData,
    status,
    workoutId,
    userName,
    updateCardio,
    updateExercise,
    toggleSplitMode,
    updateProgress,
    loadWorkoutPlan,
    switchProfile,
    setCardioVisibility,
    setSectionsOrder,
    activeDayIndex,
    activeExerciseIndex,
    startWorkout,
    cancelWorkout,
    markExerciseAsDone,
    undoMarkAsDone,
    skipExercise,
    resetDay,
    resetWeek,
    restStopwatchValue,
    isRestStopwatchRunning,
    startRestStopwatch,
    stopRestStopwatch,
    resetRestStopwatch,
    breakStopwatchValue,
    isBreakStopwatchRunning,
    startBreakStopwatch,
    stopBreakStopwatch,
    resetBreakStopwatch,
    showBreakTimerAfter,
    justCompletedDayIndex,
    resetJustCompletedDay,
    endBreak,
    reorderSplitWeights,
    switchActiveSplit,
  } = useWorkoutData();

  if (status === 'no-profile' || (status === 'error' && !workoutData)) {
    return <WelcomeScreen loadWorkoutPlan={loadWorkoutPlan} status={status} />;
  }
  
  const isLoading = status === 'connecting' || (status === 'syncing' && !workoutData);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const settings = workoutData.settings || {
    cardioVisible: true,
    sectionsOrder: ['cardio', 'strength'],
    activeSplit: '5-day',
  };

  const handleOrderChange = () => {
    const newOrder = [...settings.sectionsOrder].reverse() as ('cardio' | 'strength')[];
    if(setSectionsOrder) {
      setSectionsOrder(newOrder);
    }
  };
  
  const handleVisibilityChange = (visible: boolean) => {
    if(setCardioVisibility) {
      setCardioVisibility(visible);
    }
  };

  const handleSplitChange = (value: '5-day' | '3-day') => {
    if (switchActiveSplit) {
      switchActiveSplit(value);
    }
  };
  
  const days = settings.activeSplit === '3-day' && workoutData.threeDaySplit
    ? workoutData.threeDaySplit
    : workoutData.fiveDaySplit;

  const sections: { [key: string]: React.ReactNode } = {
    cardio: (
        <CardioProtocol 
          key="cardio"
          cardioData={workoutData.cardio} 
          onUpdate={updateCardio} 
        />
    ),
    strength: (
        <StrengthSplit 
          key="strength"
          days={days} 
          onUpdateExercise={updateExercise}
          onToggleSplitMode={toggleSplitMode}
          onUpdateProgress={updateProgress}
          activeDayIndex={activeDayIndex}
          activeExerciseIndex={activeExerciseIndex}
          startWorkout={startWorkout}
          cancelWorkout={cancelWorkout}
          markExerciseAsDone={markExerciseAsDone}
          undoMarkAsDone={undoMarkAsDone}
          skipExercise={skipExercise}
          resetDay={resetDay}
          resetWeek={resetWeek}
          restStopwatchValue={restStopwatchValue}
          isRestStopwatchRunning={isRestStopwatchRunning}
          startRestStopwatch={startRestStopwatch}
          stopRestStopwatch={stopRestStopwatch}
          resetRestStopwatch={resetRestStopwatch}
          breakStopwatchValue={breakStopwatchValue}
          isBreakStopwatchRunning={isBreakStopwatchRunning}
          startBreakStopwatch={startBreakStopwatch}
          stopBreakStopwatch={stopBreakStopwatch}
          resetBreakStopwatch={resetBreakStopwatch}
          showBreakTimerAfter={showBreakTimerAfter}
          justCompletedDayIndex={justCompletedDayIndex}
          resetJustCompletedDay={resetJustCompletedDay}
          endBreak={endBreak}
          reorderSplitWeights={reorderSplitWeights}
        />
    ),
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        <Header status={status} workoutId={workoutId} userName={userName} switchProfile={switchProfile} />
        <main className="space-y-6">
            <>
                <LayoutSettings 
                    settings={settings}
                    onVisibilityChange={handleVisibilityChange}
                    onOrderChange={handleOrderChange}
                    onSplitChange={handleSplitChange}
                    activeDayIndex={activeDayIndex}
                />
                {settings.sectionsOrder.map((sectionId) => {
                    if (sectionId === 'cardio' && !settings.cardioVisible) {
                        return null;
                    }
                    if (!days) return null; // Add a guard for days
                    return sections[sectionId];
                })}
            </>
        </main>
        <Footer workoutId={workoutId} />
      </div>
    </div>
  );
}

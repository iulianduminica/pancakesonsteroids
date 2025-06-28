
"use client";

import React, { useRef, useEffect, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Split, Check, SkipForward, CheckCircle2, Play, Pause, RotateCcw } from 'lucide-react';
import type { Exercise } from '@/types/workout';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ExerciseCardProps {
  exercise: Exercise;
  dayIndex: number;
  exIndex: number;
  onUpdateExercise: (dayIndex: number, exIndex: number, key: keyof Exercise | `splitWeights.set${1|2|3}`, value: any) => void;
  onToggleSplitMode: (dayIndex: number, exIndex:number) => void;
  onUpdateProgress: (dayIndex: number, exIndex: number, pathIndex: number, isChecked: boolean) => void;
  isActive: boolean;
  isDayActive: boolean;
  markExerciseAsDone: (dayIndex: number, exIndex: number) => void;
  undoMarkAsDone: (dayIndex: number, exIndex: number) => void;
  skipExercise: (dayIndex: number, exIndex: number) => void;
  restStopwatchValue: number;
  isRestStopwatchRunning: boolean;
  startRestStopwatch: () => void;
  stopRestStopwatch: () => void;
  resetRestStopwatch: () => void;
  reorderSplitWeights: (dayIndex: number, exIndex: number) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, dayIndex, exIndex, onUpdateExercise, onToggleSplitMode, onUpdateProgress,
  isActive, isDayActive, markExerciseAsDone, undoMarkAsDone, skipExercise, restStopwatchValue, isRestStopwatchRunning, startRestStopwatch, stopRestStopwatch, resetRestStopwatch,
  reorderSplitWeights
}) => {
  const { t } = useTranslation();
  if (!exercise) return null;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && cardRef.current) {
        setTimeout(() => {
            cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
  }, [isActive]);

  const isSplitMode = exercise.weightMode === 'split';
  const isLevelBased = exercise.name === 'Machine Seated Leg Curl' || exercise.name === 'Machine Leg Extension';
  const unitLabel = isLevelBased ? t('ExerciseCard.level') : t('ExerciseCard.weight');
  const unitPlaceholder = isLevelBased ? t('ExerciseCard.level') : t('ExerciseCard.kgPlaceholder');
  const valuePlaceholder = isLevelBased ? t('ExerciseCard.levelPlaceholder') : t('ExerciseCard.weightPlaceholder');
  const isWorkoutControlsVisible = isDayActive && !exercise.isDone;


  const weightInputs = isSplitMode ? (
    [1, 2, 3].map(i => (
      <div key={i} className="flex-1 space-y-1">
        <Label htmlFor={`set-${dayIndex}-${exIndex}-${i}`} className="text-sm font-medium text-muted-foreground">{t('ExerciseCard.set', { i })}</Label>
        <Input
          id={`set-${dayIndex}-${exIndex}-${i}`}
          type="text"
          value={exercise.splitWeights[`set${i}` as keyof typeof exercise.splitWeights] || ''}
          placeholder={unitPlaceholder}
          className="form-input mt-1 select-text"
          onChange={(e) => onUpdateExercise(dayIndex, exIndex, `splitWeights.set${i as 1|2|3}`, e.target.value)}
          onBlur={() => reorderSplitWeights(dayIndex, exIndex)}
          disabled={isDayActive && !isActive}
        />
      </div>
    ))
  ) : (
    <div className="flex-1 space-y-1">
      <Label htmlFor={`weight-${dayIndex}-${exIndex}`} className="text-sm font-medium text-muted-foreground">{unitLabel}</Label>
      <Input
        id={`weight-${dayIndex}-${exIndex}`}
        type="text"
        value={exercise.weight}
        placeholder={valuePlaceholder}
        className="form-input mt-1 select-text"
        onChange={(e) => onUpdateExercise(dayIndex, exIndex, 'weight', e.target.value)}
        disabled={isDayActive && !isActive}
      />
    </div>
  );

  return (
    <Card ref={cardRef} className={cn("bg-muted/50 transition-all select-none", isActive && "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background")}>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
            <div className="font-semibold text-card-foreground pr-4">{exercise.name}</div>
            <Button
                variant="outline"
                size="icon"
                title={t('ExerciseCard.toggleSplit')}
                className={cn("h-8 w-8 flex-shrink-0", isSplitMode && 'bg-primary/10 text-primary border-primary/50')}
                onClick={() => onToggleSplitMode(dayIndex, exIndex)}
            >
                <Split className="h-4 w-4" />
            </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
            {weightInputs}
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('ExerciseCard.reps')}</span>
                <span className="font-semibold text-card-foreground">{exercise.reps}</span>
            </div>

            <div className="flex items-center space-x-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center space-x-2">
                    <Checkbox
                        id={`path-${dayIndex}-${exIndex}-${i}`}
                        checked={exercise.progress[i - 1]}
                        onCheckedChange={(checked) => onUpdateProgress(dayIndex, exIndex, i - 1, !!checked)}
                        disabled={(i > 1 && !exercise.progress[i - 2]) || (isDayActive && !isActive)}
                    />
                    <Label
                        htmlFor={`path-${dayIndex}-${exIndex}-${i}`}
                        className="text-muted-foreground text-sm"
                    >
                        P{i}
                    </Label>
                    </div>
                ))}
            </div>
        </div>

        {isWorkoutControlsVisible && (
            <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    {/* Stopwatch */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">{t('ExerciseCard.restStopwatch')}</span>
                        <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" onClick={isRestStopwatchRunning ? stopRestStopwatch : startRestStopwatch} disabled={!isActive}>
                                {isRestStopwatchRunning ? <Pause className="h-5 w-5"/> : <Play className="h-5 w-5"/>}
                            </Button>
                            <span className="text-2xl font-mono font-semibold w-20 text-center">
                                {isActive ? `${Math.floor(restStopwatchValue / 60)}:${String(restStopwatchValue % 60).padStart(2, '0')}`: '0:00'}
                            </span>
                            <Button size="icon" variant="ghost" onClick={resetRestStopwatch} disabled={!isActive}>
                                <RotateCcw className="h-5 w-5"/>
                            </Button>
                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-2 justify-end">
                        <Button variant="outline" onClick={() => skipExercise(dayIndex, exIndex)} disabled={!isActive}>
                            <SkipForward className="mr-2 h-4 w-4" /> {t('ExerciseCard.machineBusy')}
                        </Button>
                        <Button variant="secondary" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => markExerciseAsDone(dayIndex, exIndex)} disabled={!isActive}>
                            <Check className="mr-2 h-4 w-4" /> {t('ExerciseCard.markAsDone')}
                        </Button>
                    </div>
                </div>
            </div>
        )}
        {exercise.isDone && (
            <div className="mt-2 flex items-center justify-center gap-2 text-green-500 font-medium">
                <CheckCircle2 className="h-5 w-5"/>
                <span className="select-none">{t('ExerciseCard.completed')}</span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground" 
                    onClick={() => undoMarkAsDone(dayIndex, exIndex)}
                    title={t('ExerciseCard.undo')}
                >
                    <RotateCcw className="h-4 w-4"/>
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(ExerciseCard);

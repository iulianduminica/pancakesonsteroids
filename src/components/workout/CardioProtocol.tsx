
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bike, Sunrise, HeartPulse, Flame, Moon, Repeat, Timer, TrendingUp, Zap } from 'lucide-react';
import type { CardioProtocolData, CardioMainValues } from '@/types/workout';
import { useTranslation } from 'react-i18next';

interface CardioProtocolProps {
  cardioData: CardioProtocolData;
  onUpdate: (group: string, key: string, value: string) => void;
}

const CardioProtocol: React.FC<CardioProtocolProps> = ({ cardioData, onUpdate }) => {
  const { t } = useTranslation();
  if (!cardioData) return null;

  const { warmup, main, high, cooldown } = cardioData;

  const phases = [
    { key: 'warmup', title: t('CardioProtocol.warmUp'), data: warmup, hasCycles: false, icon: Sunrise },
    { key: 'main', title: t('CardioProtocol.main'), data: main, hasCycles: true, icon: HeartPulse },
    { key: 'high', title: t('CardioProtocol.highIntensity'), data: high, hasCycles: true, icon: Flame },
    { key: 'cooldown', title: t('CardioProtocol.coolDown'), data: cooldown, hasCycles: false, icon: Moon },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 select-none">
          <Bike className="text-primary" />
          {t('CardioProtocol.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile Layout */}
        <div className="space-y-4 md:hidden">
            {phases.map((phase) => {
              const Icon = phase.icon;
              return (
                <div key={phase.key} className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 font-semibold text-card-foreground select-none">
                      <Icon className="h-5 w-5 text-primary"/>
                      <h3>{phase.title}</h3>
                    </div>
                    <div className="mt-4 space-y-3">
                        {phase.hasCycles && (
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                  <Repeat className="h-4 w-4 text-muted-foreground" />
                                  <Label htmlFor={`${phase.key}-cycles-mobile`}>{t('CardioProtocol.cycles')}</Label>
                                </div>
                                <Input
                                    id={`${phase.key}-cycles-mobile`}
                                    type="text"
                                    className="w-24 text-center"
                                    value={(phase.data as CardioMainValues).cycles}
                                    onChange={(e) => onUpdate(phase.key, 'cycles', e.target.value)}
                                />
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <Timer className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor={`${phase.key}-duration-mobile`}>{t('CardioProtocol.duration')}</Label>
                            </div>
                            <Input
                                id={`${phase.key}-duration-mobile`}
                                type="text"
                                className="w-24 text-center"
                                value={phase.data.duration}
                                onChange={(e) => onUpdate(phase.key, 'duration', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                           <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor={`${phase.key}-level-mobile`}>{t('CardioProtocol.level')}</Label>
                            </div>
                            <Input
                                id={`${phase.key}-level-mobile`}
                                type="text"
                                className="w-24 text-center"
                                value={phase.data.level}
                                onChange={(e) => onUpdate(phase.key, 'level', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor={`${phase.key}-rpm-mobile`}>{t('CardioProtocol.rpm')}</Label>
                            </div>
                            <Input
                                id={`${phase.key}-rpm-mobile`}
                                type="text"
                                className="w-24 text-center"
                                value={phase.data.rpm}
                                onChange={(e) => onUpdate(phase.key, 'rpm', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
              )
            })}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-x-4 gap-y-3 items-center">
          {/* Header */}
          <div />
          <div className="font-semibold text-muted-foreground text-center">{t('CardioProtocol.cycles')}</div>
          <div className="font-semibold text-muted-foreground text-center">{t('CardioProtocol.duration')}</div>
          <div className="font-semibold text-muted-foreground text-center">{t('CardioProtocol.level')}</div>
          <div className="font-semibold text-muted-foreground text-center">{t('CardioProtocol.rpm')}</div>

          {/* Rows */}
          {phases.map((phase) => (
            <React.Fragment key={phase.key}>
              <div className="font-medium text-card-foreground text-right">{phase.title}</div>
              
              <div className="flex justify-center">
                {phase.hasCycles ? (
                  <Input
                    id={`${phase.key}-cycles`}
                    type="text"
                    className="w-20 text-center"
                    value={(phase.data as CardioMainValues).cycles}
                    onChange={(e) => onUpdate(phase.key, 'cycles', e.target.value)}
                  />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>

              <div className="flex justify-center">
                <Input
                  id={`${phase.key}-duration`}
                  type="text"
                  className="w-20 text-center"
                  value={phase.data.duration}
                  onChange={(e) => onUpdate(phase.key, 'duration', e.target.value)}
                />
              </div>

              <div className="flex justify-center">
                <Input
                  id={`${phase.key}-level`}
                  type="text"
                  className="w-20 text-center"
                  value={phase.data.level}
                  onChange={(e) => onUpdate(phase.key, 'level', e.target.value)}
                />
              </div>

              <div className="flex justify-center">
                <Input
                  id={`${phase.key}-rpm`}
                  type="text"
                  className="w-20 text-center"
                  value={phase.data.rpm}
                  onChange={(e) => onUpdate(phase.key, 'rpm', e.target.value)}
                />
              </div>
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CardioProtocol;

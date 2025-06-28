
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WelcomeScreen = ({ loadWorkoutPlan, status }: { loadWorkoutPlan: (id: string) => void, status: string }) => {
  const [code, setCode] = React.useState('');
  const { t } = useTranslation();
  const isLoading = status === 'syncing';

  const handleJoin = () => {
    if (code.trim()) {
      loadWorkoutPlan(code.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">{t('WelcomeScreen.title')}</h1>
            <p className="text-muted-foreground">{t('WelcomeScreen.description')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workout-code">{t('WelcomeScreen.inputLabel')}</Label>
            <div className="flex gap-2">
              <Input
                id="workout-code"
                placeholder={t('WelcomeScreen.inputPlaceholder')}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
              />
              <Button onClick={handleJoin} disabled={isLoading || !code.trim()}>
                <KeyRound className="mr-2 h-4 w-4" />
                {t('WelcomeScreen.button')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;

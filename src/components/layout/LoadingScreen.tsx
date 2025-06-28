
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import IconPancake from '@/components/icons/IconPancake';

export const LoadingScreen = () => {
    const { t } = useTranslation();
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <div className="flex flex-col items-center gap-8">
                <IconPancake className="h-32 w-32 drop-shadow-lg animate-pulse" />
                <div className="text-center">
                    <h1 className="text-3xl font-bold font-headline select-none">{t('Global.appName')}</h1>
                    <p className="text-muted-foreground mt-2 font-medium select-none">
                        {t('LoadingScreen.loading')}{dots}
                    </p>
                </div>
            </div>
        </div>
    );
};


'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, Sun, Moon, Languages, ArrowUpDown } from "lucide-react";

type Settings = {
  cardioVisible: boolean;
}

interface SettingsMenuProps {
  settings: Settings;
  onVisibilityChange: (visible: boolean) => void;
  onOrderChange: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ settings, onVisibilityChange, onOrderChange }) => {
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const initialTheme = storedTheme || systemTheme;
        setTheme(initialTheme);
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    {t('LayoutSettings.displayOptions')}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{t('LayoutSettings.displayOptions')}</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between">
                    <Label htmlFor="cardio-visibility" className="pr-2 font-normal cursor-pointer">{t('LayoutSettings.showCardio')}</Label>
                    <Switch
                        id="cardio-visibility"
                        checked={settings.cardioVisible}
                        onCheckedChange={onVisibilityChange}
                    />
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onOrderChange} disabled={!settings.cardioVisible}>
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <span>{t('LayoutSettings.swap')}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span>{t('LayoutSettings.theme')}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark')}>
                            <DropdownMenuRadioItem value="light">{t('LayoutSettings.light')}</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="dark">{t('LayoutSettings.dark')}</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Languages className="mr-2 h-4 w-4" />
                        <span>{t('LayoutSettings.language')}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={i18n.language} onValueChange={(lang) => i18n.changeLanguage(lang)}>
                            <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="ro">Română</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

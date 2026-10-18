/**
 * Kòd Akademi — rasin aplikasyon an.
 * Navigasyon ak state lokal (pa bezwen react-navigation): yon pile wout senp
 * + ba onglet anba pou 4 ekran prensipal yo.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, styles } from './src/theme';
import { t, setLang } from './src/i18n';
import {
  EMPTY_PROGRESS,
  loadLang,
  loadProgress,
  type Progress,
} from './src/storage';
import { stopSpeaking } from './src/speech';
import type { Navigate, Route } from './src/types';

import HomeScreen from './src/screens/HomeScreen';
import LessonScreen from './src/screens/LessonScreen';
import ExercisesScreen from './src/screens/ExercisesScreen';
import LanguagesScreen from './src/screens/LanguagesScreen';
import ModuleScreen from './src/screens/ModuleScreen';
import GuideScreen from './src/screens/GuideScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import UpdatesScreen from './src/screens/UpdatesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import type { AppLang } from './src/data';

const TABS: { route: Route; labelKey: string; icon: string }[] = [
  { route: { name: 'program' }, labelKey: 'tabProgram', icon: '🗺️' },
  { route: { name: 'home' }, labelKey: 'tabRapid', icon: '⚡' },
  { route: { name: 'languages' }, labelKey: 'tabLanguages', icon: '💻' },
  { route: { name: 'resources' }, labelKey: 'tabResources', icon: '🔗' },
  { route: { name: 'updates' }, labelKey: 'tabNews', icon: '📰' },
  { route: { name: 'settings' }, labelKey: 'tabSettings', icon: '⚙️' },
];

export default function App() {
  const [stack, setStack] = useState<Route[]>([{ name: 'home' }]);
  const [lang, setLangState] = useState<AppLang>('ht');
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [l, p] = await Promise.all([loadLang(), loadProgress()]);
      setLang(l);
      setLangState(l);
      setProgress(p);
      setReady(true);
    })();
  }, []);

  const refresh = useCallback(async () => {
    const [l, p] = await Promise.all([loadLang(), loadProgress()]);
    setLangState(l);
    setProgress(p);
  }, []);

  const navigate: Navigate = useCallback((route) => {
    stopSpeaking();
    setStack((s) => [...s, route]);
  }, []);

  const goBack = useCallback(() => {
    stopSpeaking();
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const goTab = useCallback((route: Route) => {
    stopSpeaking();
    setStack([route]);
  }, []);

  if (!ready) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 40 }}>💻</Text>
        <Text style={styles.cardTitle}>Kòd Akademi…</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  const current = stack[stack.length - 1];
  const isTab = TABS.some((tb) => tb.route.name === current.name);
  const screenProps = { navigate, goBack, lang, progress, refresh };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        {current.name === 'home' && <HomeScreen {...screenProps} />}
        {current.name === 'lesson' && <LessonScreen {...screenProps} route={current} />}
        {current.name === 'exercises' && <ExercisesScreen {...screenProps} route={current} />}
        {current.name === 'languages' && <LanguagesScreen {...screenProps} />}
        {(current.name === 'module' ||
          current.name === 'moduleLevel' ||
          current.name === 'moduleLesson' ||
          current.name === 'moduleExercises') && <ModuleScreen {...screenProps} route={current} />}
        {(current.name === 'program' ||
          current.name === 'etape' ||
          current.name === 'guideModule' ||
          current.name === 'guideLesson' ||
          current.name === 'guideExercises' ||
          current.name === 'guideProject') && <GuideScreen {...screenProps} route={current} />}
        {current.name === 'resources' && <ResourcesScreen {...screenProps} />}
        {current.name === 'updates' && <UpdatesScreen {...screenProps} />}
        {current.name === 'settings' && <SettingsScreen {...screenProps} />}

        {isTab && (
          <View style={styles.tabBar}>
            {TABS.map((tb) => {
              const active = tb.route.name === current.name;
              return (
                <Pressable
                  key={tb.route.name}
                  onPress={() => goTab(tb.route)}
                  style={styles.tab}
                >
                  <Text style={{ fontSize: 22 }}>{tb.icon}</Text>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {t(tb.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

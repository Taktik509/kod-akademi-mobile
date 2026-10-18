/**
 * Kòd Akademi — Ekran Egzèsis: lis egzèsis leson an + detay.
 * Lojik koreksyon an (RÈG OBLIGATWA: chan tèks + bouton soumèt, 3 tantativ)
 * nan konpozan re-itilize a: src/components/ExerciseDetail.tsx
 * (itilize tou pou egzèsis modil langaj yo).
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { COLORS, styles } from '../theme';
import { exercisesForLesson, lessonById, lessonTitle } from '../data';
import { t } from '../i18n';
import { markExerciseDone } from '../storage';
import ExerciseDetail, { TYPE_LABEL } from '../components/ExerciseDetail';
import type { ScreenProps } from '../types';

export default function ExercisesScreen({
  navigate,
  goBack,
  lang,
  progress,
  refresh,
  route,
}: ScreenProps & { route: { name: 'exercises'; lessonId: string } }) {
  const lesson = lessonById(route.lessonId);
  const exercises = exercisesForLesson(route.lessonId);
  const [openId, setOpenId] = useState<string | null>(null);

  const handleComplete = async (exerciseId: string) => {
    await markExerciseDone(exerciseId, 10);
    await refresh();
  };

  const openExercise = openId ? exercises.find((e) => e.id === openId) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {!openExercise && (
        <>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backText}>‹ {t('back')}</Text>
          </Pressable>
          <Text style={styles.title}>
            {t('exercise')}s — {lesson ? lessonTitle(lesson, lang) : route.lessonId}
          </Text>
          <Text style={styles.subtitle}>
            {exercises.length} egzèsis • {t('yourAnswer')}: ekri pwòp repons ou
          </Text>
          {exercises.map((ex) => {
            const done = progress.doneExercises.includes(ex.id);
            return (
              <Pressable
                key={ex.id}
                onPress={() => setOpenId(ex.id)}
                style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {ex.id} — {TYPE_LABEL[ex.type]}
                    </Text>
                    <Text style={styles.mutedText} numberOfLines={2}>
                      {ex.prompt_ht}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20, color: done ? COLORS.accent : COLORS.muted }}>
                    {done ? '✅' : '›'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </>
      )}

      {openExercise && (
        <ExerciseDetail
          exercise={openExercise}
          isDone={progress.doneExercises.includes(openExercise.id)}
          onComplete={() => handleComplete(openExercise.id)}
          onBack={() => setOpenId(null)}
          lang={lang}
        />
      )}

      {!openExercise && (
        <Pressable
          onPress={() => navigate({ name: 'lesson', lessonId: route.lessonId })}
          style={styles.buttonSecondary}
        >
          <Text style={styles.buttonSecondaryText}>‹ {t('lesson')}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

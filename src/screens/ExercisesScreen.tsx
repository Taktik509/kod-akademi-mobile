/**
 * Kòd Akademi — Ekran Egzèsis: lis egzèsis leson an + detay ak RÈG OBLIGATWA:
 * chan tèks + bouton soumèt; normalize + konpare ak `accepted`;
 * bon → "Bon! ✅" + explanation + XP +10; pa bon → tantativ; <3 → reeseye;
 * ==3 → revele correct_ht (pa gen XP). QCM: lèt oswa tèks aksepte.
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { COLORS, styles } from '../theme';
import { exercisesForLesson, lessonById, lessonTitle, type Exercise } from '../data';
import { t } from '../i18n';
import { markExerciseDone } from '../storage';
import { gradeSubmission, stripChoicePrefix, type GradeState } from '../grading';
import type { ScreenProps } from '../types';

const TYPE_LABEL: Record<Exercise['type'], string> = {
  lib: '✍️ Lib',
  qcm: '🔘 Chwa miltip',
  konplete: '🧩 Konplete',
  'jwenn-erè': '🐞 Jwenn erè a',
};

function ExerciseDetail({
  exercise,
  isDone,
  onComplete,
  onBack,
}: {
  exercise: Exercise;
  isDone: boolean;
  onComplete: () => Promise<void>;
  onBack: () => void;
}) {
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GradeState>({ kind: 'idle' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { state, xpEarned } = gradeSubmission(exercise, answer, attempts);
      if (state.kind === 'correct') {
        if (!isDone) await onComplete();
      } else if (state.kind === 'retry') {
        setAttempts((a) => a + 1);
      } else if (state.kind === 'revealed') {
        setAttempts((a) => a + 1);
      }
      setResult(state);
      void xpEarned;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>‹ {t('back')}</Text>
      </Pressable>

      <View style={[styles.badge, { marginBottom: 8 }]}>
        <Text style={styles.badgeText}>
          {exercise.id} • {TYPE_LABEL[exercise.type]}
          {isDone ? ' • ✅' : ''}
        </Text>
      </View>

      <Text style={[styles.cardTitle, { fontSize: 19, marginBottom: 8 }]}>
        {exercise.prompt_ht}
      </Text>

      {exercise.type === 'qcm' && exercise.choices && (
        <View style={[styles.card, { marginTop: 8 }]}>
          {exercise.choices.map((choice, i) => (
            <Text key={i} style={[styles.cardText, { marginBottom: 6 }]}>
              <Text style={{ fontWeight: 'bold', color: COLORS.gold }}>
                {String.fromCharCode(65 + i)}{' '}
              </Text>
              {stripChoicePrefix(choice)}
            </Text>
          ))}
        </View>
      )}

      {exercise.code && (
        <View style={styles.codeBlock}>
          <Text style={styles.codeLang}>kòd</Text>
          <Text style={styles.codeText}>{exercise.code}</Text>
        </View>
      )}

      <Text style={[styles.mutedText, { marginTop: 8 }]}>{t('yourAnswer')}:</Text>
      <TextInput
        style={styles.input}
        value={answer}
        onChangeText={setAnswer}
        placeholder={exercise.type === 'qcm' ? 'Ekri lèt la (A, B, C, D) oswa tèks la…' : 'Ekri repons ou isit la…'}
        placeholderTextColor={COLORS.muted}
        multiline
        editable={result.kind !== 'correct' && result.kind !== 'revealed'}
      />

      {result.kind !== 'correct' && result.kind !== 'revealed' && (
        <Pressable onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>{t('submitAnswer')}</Text>
        </Pressable>
      )}

      {result.kind === 'correct' && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{t('correct')}</Text>
          <Text style={[styles.cardText, { marginTop: 8, color: '#dcfce7' }]}>
            {t('explanation')} {exercise.explanation_ht}
          </Text>
          <Text style={[styles.xpText, { marginTop: 8, color: COLORS.gold }]}>
            +10 {t('xp')} ⚡
          </Text>
        </View>
      )}

      {result.kind === 'retry' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{t('wrongRetry')}</Text>
          <Text style={[styles.cardText, { marginTop: 6, color: '#fecaca' }]}>
            {t('attemptsLeft', { n: result.attemptsLeft })}
          </Text>
        </View>
      )}

      {result.kind === 'revealed' && (
        <View style={styles.revealBox}>
          <Text style={styles.revealText}>{t('revealTitle')}</Text>
          <Text style={styles.correctAnswerText}>{exercise.correct_ht}</Text>
          <Text style={[styles.cardText, { marginTop: 8, color: '#fef3c7' }]}>
            {t('explanation')} {exercise.explanation_ht}
          </Text>
        </View>
      )}
    </View>
  );
}

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

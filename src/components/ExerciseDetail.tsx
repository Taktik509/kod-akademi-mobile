/**
 * Kòd Akademi — Detay egzèsis (re-itilize pou leson 12-mwa yo AK modil langaj yo).
 *
 * RÈG OBLIGATWA: chan tèks + bouton soumèt; normalize + konpare ak `accepted`;
 * bon → "Bon! ✅" + explanation + XP (onComplete); pa bon → tantativ;
 * < 3 → "Pa bon. Reeseye 🔄" + "{n} chans ankò"; == 3 → revele correct_ht (pa gen XP).
 * QCM: lèt (A/B/C/D) oswa tèks aksepte (lojik nan grading.ts).
 */

import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { COLORS, styles } from '../theme';
import { t } from '../i18n';
import { gradeSubmission, stripChoicePrefix, type GradeState } from '../grading';
import { speakText, stopSpeaking } from '../speech';
import type { AppLang, Exercise } from '../data';

export const TYPE_LABEL: Record<Exercise['type'], string> = {
  lib: '✍️ Lib',
  qcm: '🔘 Chwa miltip',
  konplete: '🧩 Konplete',
  'jwenn-erè': '🐞 Jwenn erè a',
};

export default function ExerciseDetail({
  exercise,
  isDone,
  onComplete,
  onBack,
  lang,
}: {
  exercise: Exercise;
  isDone: boolean;
  onComplete: () => Promise<void>;
  onBack: () => void;
  lang: AppLang;
}) {
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GradeState>({ kind: 'idle' });
  const [submitting, setSubmitting] = useState(false);
  const [speakingFb, setSpeakingFb] = useState(false);

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

  /** Règ 3: vwa a li fidbak koreksyon an awotvwa. */
  const feedbackSpeechText = (): string => {
    if (result.kind === 'correct') {
      return `${t('correct')} ${t('explanation')} ${exercise.explanation_ht}`;
    }
    if (result.kind === 'retry') {
      return `${t('wrongRetry')} ${t('attemptsLeft', { n: result.attemptsLeft })}`;
    }
    if (result.kind === 'revealed') {
      return `${t('revealTitle')} ${exercise.correct_ht}. ${t('explanation')} ${exercise.explanation_ht}`;
    }
    return '';
  };

  const toggleSpeakFeedback = () => {
    if (speakingFb) {
      stopSpeaking();
      setSpeakingFb(false);
    } else {
      const txt = feedbackSpeechText();
      if (txt) {
        speakText(txt, lang);
        setSpeakingFb(true);
      }
    }
  };

  const showFbVoice = result.kind !== 'idle';

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

      {showFbVoice && (
        <Pressable onPress={toggleSpeakFeedback} style={[styles.buttonSecondary, { marginTop: 10 }]}>
          <Text style={styles.buttonSecondaryText}>
            {speakingFb ? '⏹ 🔊' : '🔊 Koute fidbak la'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

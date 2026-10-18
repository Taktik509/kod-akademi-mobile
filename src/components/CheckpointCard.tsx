/**
 * Kòd Akademi — Checkpoint: ti egzèsis an tan reyèl apre chak konsèp kle.
 * Règ 3 itilizatè a: 1 kesyon rapid (qcm oswa vre/fo) → repons → koreksyon
 * ENSTANTANE ak sistèm 3-tantativ la ("Bon! ✅" / "Pa bon. Reeseye 🔄" /
 * apre 3 echèk: correct_ht + explanation_ht). Bouton 🔊 li fidbak la awotvwa.
 */

import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { COLORS, styles } from '../theme';
import { t } from '../i18n';
import { checkpointToExercise, type AppLang, type Checkpoint } from '../data';
import { gradeSubmission, type GradeState } from '../grading';
import { speakText, stopSpeaking } from '../speech';

export default function CheckpointCard({
  checkpoint,
  lang,
  isDone,
  onComplete,
}: {
  checkpoint: Checkpoint;
  lang: AppLang;
  isDone: boolean;
  onComplete: () => Promise<void>;
}) {
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GradeState>({ kind: 'idle' });
  const [submitting, setSubmitting] = useState(false);
  const [speakingFb, setSpeakingFb] = useState(false);

  const exercise = checkpointToExercise(checkpoint);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { state } = gradeSubmission(exercise, answer, attempts);
      if (state.kind === 'correct') {
        if (!isDone) await onComplete();
      } else {
        setAttempts((a) => a + 1);
      }
      setResult(state);
    } finally {
      setSubmitting(false);
    }
  };

  const feedbackText = (): string => {
    if (result.kind === 'correct') {
      return `${t('correct')} ${checkpoint.explanation_ht}`;
    }
    if (result.kind === 'retry') {
      return `${t('wrongRetry')} ${t('attemptsLeft', { n: result.attemptsLeft })}`;
    }
    if (result.kind === 'revealed') {
      return `${t('revealTitle')} ${checkpoint.correct_ht}. ${t('explanation')} ${checkpoint.explanation_ht}`;
    }
    return '';
  };

  const toggleSpeakFeedback = () => {
    if (speakingFb) {
      stopSpeaking();
      setSpeakingFb(false);
    } else {
      const txt = feedbackText();
      if (txt) {
        speakText(txt, lang);
        setSpeakingFb(true);
      }
    }
  };

  const showFeedback = result.kind !== 'idle';

  return (
    <View style={[styles.card, { borderColor: COLORS.gold, borderWidth: 1, marginTop: 10, marginBottom: 10 }]}>
      <Text style={[styles.cardTitle, { fontSize: 16 }]}>⚡ {checkpoint.prompt_ht}</Text>

      {checkpoint.choices && (
        <View style={{ marginTop: 8 }}>
          {checkpoint.choices.map((choice, i) => (
            <Text key={i} style={[styles.cardText, { marginBottom: 4 }]}>
              <Text style={{ fontWeight: 'bold', color: COLORS.gold }}>
                {choice.slice(0, 2)}
              </Text>
              {choice.slice(2)}
            </Text>
          ))}
        </View>
      )}

      {result.kind !== 'correct' && result.kind !== 'revealed' && (
        <View style={{ marginTop: 8 }}>
          <TextInput
            value={answer}
            onChangeText={setAnswer}
            placeholder={t('yourAnswer') + '…'}
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            autoCapitalize="none"
          />
          <Pressable onPress={handleSubmit} style={[styles.button, { marginTop: 8 }]}>
            <Text style={styles.buttonText}>{t('submitAnswer')}</Text>
          </Pressable>
        </View>
      )}

      {showFeedback && (
        <View
          style={[
            result.kind === 'correct'
              ? styles.successBox
              : result.kind === 'retry'
                ? styles.errorBox
                : styles.revealBox,
            { marginTop: 8 },
          ]}
        >
          {result.kind === 'correct' && (
            <Text style={styles.successText}>
              {t('correct')}{isDone ? '' : ' +2 ⚡'}
            </Text>
          )}
          {result.kind === 'retry' && (
            <Text style={styles.errorText}>
              {t('wrongRetry')}{'\n'}
              {t('attemptsLeft', { n: result.attemptsLeft })}
            </Text>
          )}
          {result.kind === 'revealed' && (
            <Text style={styles.revealText}>
              💡 {t('revealTitle')}{'\n\n'}
              {checkpoint.correct_ht}
            </Text>
          )}
          {(result.kind === 'correct' || result.kind === 'revealed') && (
            <Text style={[styles.cardText, { marginTop: 6 }]}>
              <Text style={{ fontWeight: 'bold' }}>{t('explanation')}</Text>{' '}
              {checkpoint.explanation_ht}
            </Text>
          )}
          <Pressable onPress={toggleSpeakFeedback} style={[styles.buttonSecondary, { marginTop: 8 }]}>
            <Text style={styles.buttonSecondaryText}>
              {speakingFb ? '⏹ 🔊' : '🔊 Koute fidbak la'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

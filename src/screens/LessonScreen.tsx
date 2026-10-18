/** Kòd Akademi — Ekran Leson: tit, kò, blòk kòd, nòt ekspè, Koute 🔊, Make fini. */

import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { COLORS, styles } from '../theme';
import {
  exercisesForLesson,
  lessonBody,
  lessonById,
  lessonExpertNote,
  lessonTitle,
  stripCheckMarkers,
} from '../data';
import { t } from '../i18n';
import { markCheckpointDone, markLessonDone } from '../storage';
import { speakLesson, stopSpeaking } from '../speech';
import LessonBody from '../components/LessonBody';
import type { ScreenProps } from '../types';

export default function LessonScreen({
  navigate,
  goBack,
  lang,
  progress,
  refresh,
  route,
}: ScreenProps & { route: { name: 'lesson'; lessonId: string } }) {
  const lesson = lessonById(route.lessonId);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  if (!lesson) {
    return (
      <View style={[styles.container, { padding: 16 }]}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ {t('back')}</Text>
        </Pressable>
        <Text style={styles.cardText}>Leson pa jwenn.</Text>
      </View>
    );
  }

  const done = progress.doneLessons.includes(lesson.id);
  const exerciseCount = exercisesForLesson(lesson.id).length;

  const toggleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      // Règ 1: vwa a li TOUT leson an, san makè [[CHECK]]
      speakLesson(
        lessonTitle(lesson, lang),
        stripCheckMarkers(lessonBody(lesson, lang)),
        lessonExpertNote(lesson, lang),
        lang,
      );
      setSpeaking(true);
    }
  };

  const handleMarkDone = async () => {
    await markLessonDone(lesson.id);
    await refresh();
  };

  const handleCheckpointDone = async (checkpointId: string) => {
    await markCheckpointDone(checkpointId);
    await refresh();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Pressable onPress={goBack} style={styles.backButton}>
        <Text style={styles.backText}>‹ {t('back')}</Text>
      </Pressable>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{lesson.id} • {lesson.domain}</Text>
      </View>
      <View style={{ height: 8 }} />
      <Text style={styles.title}>{lessonTitle(lesson, lang)}</Text>

      {/* Règ 3: kò a ak ti egzèsis an tan reyèl apre chak konsèp kle */}
      <LessonBody
        body={lessonBody(lesson, lang)}
        checkpoints={lesson.checkpoints}
        lang={lang}
        doneCheckpointIds={progress.doneCheckpoints}
        onCheckpointDone={handleCheckpointDone}
      />

      <Text style={[styles.cardTitle, { marginTop: 8 }]}>{t('codeExample')}</Text>
      <View style={styles.codeBlock}>
        <Text style={styles.codeLang}>{lesson.code.lang}</Text>
        <Text style={styles.codeText}>{lesson.code.code}</Text>
      </View>

      <View style={styles.expertBox}>
        <Text style={styles.expertTitle}>💡 {t('expertNote')}</Text>
        <Text style={styles.expertText}>{lessonExpertNote(lesson, lang)}</Text>
      </View>

      <Pressable onPress={toggleSpeak} style={styles.buttonSecondary}>
        <Text style={styles.buttonSecondaryText}>
          {speaking ? '⏹ ' + t('listen') : t('listen')}
        </Text>
      </Pressable>

      {done ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{t('lessonDone')}</Text>
        </View>
      ) : (
        <Pressable onPress={handleMarkDone} style={styles.button}>
          <Text style={styles.buttonText}>{t('markDone')}</Text>
        </Pressable>
      )}

      <Pressable
        onPress={() => navigate({ name: 'exercises', lessonId: lesson.id })}
        style={[styles.button, { backgroundColor: COLORS.gold }]}
      >
        <Text style={[styles.buttonText, { color: '#451a03' }]}>
          ✏️ {t('exercise')}s ({exerciseCount})
        </Text>
      </Pressable>
    </ScrollView>
  );
}

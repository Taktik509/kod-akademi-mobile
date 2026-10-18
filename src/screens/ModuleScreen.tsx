/**
 * Kòd Akademi — Ekran Modil Langaj: 4 nivo → leson pa nivo → leson
 * (body_ht + code + expert_note_ht + bouton 🔊 Koute) → egzèsis
 * (konpozan ExerciseDetail ak sistèm 3-tantativ grading.ts).
 * XP pwogrè via storage.ts jan l deja fè a (menm kle, menm XP).
 */

import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { COLORS, styles } from '../theme';
import { t } from '../i18n';
import { markCheckpointDone, markExerciseDone, markLessonDone } from '../storage';
import { speakLesson, stopSpeaking } from '../speech';
import { stripCheckMarkers } from '../data';
import LessonBody from '../components/LessonBody';
import {
  getLesson,
  getLevel,
  getModule,
  moduleExerciseToExercise,
} from '../modules';
import ExerciseDetail, { TYPE_LABEL } from '../components/ExerciseDetail';
import type { ScreenProps } from '../types';

export type ModuleRoute =
  | { name: 'module'; moduleId: string }
  | { name: 'moduleLevel'; moduleId: string; levelId: string }
  | { name: 'moduleLesson'; moduleId: string; levelId: string; lessonId: string }
  | { name: 'moduleExercises'; moduleId: string; levelId: string; lessonId: string };

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.backButton}>
      <Text style={styles.backText}>‹ {t('back')}</Text>
    </Pressable>
  );
}

function DoneBadge({ done }: { done: boolean }) {
  return (
    <Text style={{ fontSize: 20, color: done ? COLORS.accent : COLORS.muted }}>
      {done ? '✅' : '⭕'}
    </Text>
  );
}

export default function ModuleScreen({
  navigate,
  goBack,
  lang,
  progress,
  refresh,
  route,
}: ScreenProps & { route: ModuleRoute }) {
  const [speaking, setSpeaking] = useState(false);
  const [openExId, setOpenExId] = useState<string | null>(null);

  useEffect(() => {
    setOpenExId(null);
    return () => stopSpeaking();
  }, [route]);

  // ---------- NIVO: lis 4 nivo modil lan ----------
  if (route.name === 'module') {
    const module = getModule(route.moduleId);
    if (!module) {
      return (
        <View style={[styles.container, { padding: 16 }]}>
          <BackButton onPress={goBack} />
          <Text style={styles.cardText}>Modil pa jwenn.</Text>
        </View>
      );
    }
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <BackButton onPress={goBack} />
        <Text style={styles.title}>💻 {module.name}</Text>
        <Text style={styles.subtitle}>
          {module.category_ht} • {module.levels.length} nivo •{' '}
          {module.levels.reduce((n, l) => n + l.lessons.length, 0)} leson
        </Text>
        <Text style={[styles.cardText, { marginBottom: 12 }]}>{module.description_ht}</Text>
        {module.levels.map((level) => {
          const doneCount = level.lessons.filter((l) =>
            progress.doneLessons.includes(l.id),
          ).length;
          return (
            <Pressable
              key={level.id}
              onPress={() => navigate({ name: 'moduleLevel', moduleId: module.id, levelId: level.id })}
              style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>📶 {level.title_ht}</Text>
                  <Text style={styles.mutedText}>
                    {doneCount}/{level.lessons.length} {t('lesson')} fini
                  </Text>
                </View>
                <Text style={{ fontSize: 22 }}>›</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  // ---------- LESON PA NIVO ----------
  if (route.name === 'moduleLevel') {
    const found = getLevel(route.moduleId, route.levelId);
    if (!found) {
      return (
        <View style={[styles.container, { padding: 16 }]}>
          <BackButton onPress={goBack} />
          <Text style={styles.cardText}>Nivo pa jwenn.</Text>
        </View>
      );
    }
    const { module, level } = found;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <BackButton onPress={goBack} />
        <Text style={styles.title}>{level.title_ht}</Text>
        <Text style={styles.subtitle}>
          {module.name} • {level.lessons.length} leson
        </Text>
        {level.lessons.map((lesson) => {
          const done = progress.doneLessons.includes(lesson.id);
          const exCount = lesson.exercises.length;
          return (
            <Pressable
              key={lesson.id}
              onPress={() =>
                navigate({ name: 'moduleLesson', moduleId: module.id, levelId: level.id, lessonId: lesson.id })
              }
              style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>📖 {lesson.title_ht}</Text>
                  <Text style={styles.mutedText}>{exCount} egzèsis</Text>
                </View>
                <DoneBadge done={done} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  // ---------- DETAY LESON ----------
  if (route.name === 'moduleLesson') {
    const found = getLesson(route.moduleId, route.levelId, route.lessonId);
    if (!found) {
      return (
        <View style={[styles.container, { padding: 16 }]}>
          <BackButton onPress={goBack} />
          <Text style={styles.cardText}>Leson pa jwenn.</Text>
        </View>
      );
    }
    const { module, lesson } = found;
    const done = progress.doneLessons.includes(lesson.id);

    const toggleSpeak = () => {
      if (speaking) {
        stopSpeaking();
        setSpeaking(false);
      } else {
        // Règ 1: vwa a li TOUT leson an (tit + eksplikasyon + egzanp), san makè [[CHECK]]
        speakLesson(lesson.title_ht, stripCheckMarkers(lesson.body_ht), lesson.expert_note_ht, 'ht');
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
        <BackButton onPress={goBack} />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {module.name} • {lesson.id}
          </Text>
        </View>
        <View style={{ height: 8 }} />
        <Text style={styles.title}>{lesson.title_ht}</Text>

        {/* Règ 3: kò a ak ti egzèsis an tan reyèl apre chak konsèp kle */}
        <LessonBody
          body={lesson.body_ht}
          checkpoints={lesson.checkpoints}
          lang={lang}
          doneCheckpointIds={progress.doneCheckpoints}
          onCheckpointDone={handleCheckpointDone}
        />

        <Text style={[styles.cardTitle, { marginTop: 8 }]}>{t('codeExample')}</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeLang}>{lesson.code_lang}</Text>
          <Text style={styles.codeText}>{lesson.code}</Text>
        </View>

        <View style={styles.expertBox}>
          <Text style={styles.expertTitle}>💡 {t('expertNote')}</Text>
          <Text style={styles.expertText}>{lesson.expert_note_ht}</Text>
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
          onPress={() =>
            navigate({
              name: 'moduleExercises',
              moduleId: module.id,
              levelId: found.level.id,
              lessonId: lesson.id,
            })
          }
          style={[styles.button, { backgroundColor: COLORS.gold }]}
        >
          <Text style={[styles.buttonText, { color: '#451a03' }]}>
            ✏️ {t('exercise')}s ({lesson.exercises.length})
          </Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ---------- EGZÈSIS LESON AN ----------
  const found = getLesson(route.moduleId, route.levelId, route.lessonId);
  if (!found) {
    return (
      <View style={[styles.container, { padding: 16 }]}>
        <BackButton onPress={goBack} />
        <Text style={styles.cardText}>Leson pa jwenn.</Text>
      </View>
    );
  }
  const { lesson } = found;
  const exercises = lesson.exercises.map((ex) => moduleExerciseToExercise(lesson, ex));
  const openExercise = openExId ? exercises.find((e) => e.id === openExId) : null;

  const handleComplete = async (exerciseId: string) => {
    await markExerciseDone(exerciseId, 10);
    await refresh();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {!openExercise && (
        <>
          <BackButton onPress={goBack} />
          <Text style={styles.title}>
            {t('exercise')}s — {lesson.title_ht}
          </Text>
          <Text style={styles.subtitle}>
            {exercises.length} egzèsis • {t('yourAnswer')}: ekri pwòp repons ou
          </Text>
          {exercises.map((ex) => {
            const done = progress.doneExercises.includes(ex.id);
            return (
              <Pressable
                key={ex.id}
                onPress={() => setOpenExId(ex.id)}
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
          <Pressable
            onPress={() =>
              navigate({ name: 'moduleLesson', moduleId: found.module.id, levelId: found.level.id, lessonId: lesson.id })
            }
            style={styles.buttonSecondary}
          >
            <Text style={styles.buttonSecondaryText}>‹ {t('lesson')}</Text>
          </Pressable>
        </>
      )}

      {openExercise && (
        <ExerciseDetail
          exercise={openExercise}
          isDone={progress.doneExercises.includes(openExercise.id)}
          onComplete={() => handleComplete(openExercise.id)}
          onBack={() => setOpenExId(null)}
          lang={lang}
        />
      )}
    </ScrollView>
  );
}

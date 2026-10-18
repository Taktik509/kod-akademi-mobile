/** Kòd Akademi — Ekran Kay: lis 12 mwa → lis leson mwa a. */

import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { COLORS, styles } from '../theme';
import { lessonTitle, lessonsForMonth, type Lesson } from '../data';
import { t } from '../i18n';
import { MONTH_NAMES_HT, type ScreenProps } from '../types';

function LessonRow({
  lesson,
  lang,
  done,
  onPress,
}: {
  lesson: Lesson;
  lang: Parameters<typeof lessonTitle>[1];
  done: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { marginBottom: 8, opacity: pressed ? 0.7 : 1, flexDirection: 'row', alignItems: 'center' },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>
          {lesson.id} — {lessonTitle(lesson, lang)}
        </Text>
        <Text style={styles.mutedText}>{lesson.domain}</Text>
      </View>
      <Text style={{ fontSize: 20, color: done ? COLORS.accent : COLORS.muted }}>
        {done ? '✓' : '›'}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen({ navigate, lang, progress }: ScreenProps) {
  const [openMonth, setOpenMonth] = useState<number | null>(1);
  const doneCount = progress.doneLessons.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{t('appName')}</Text>
          <Text style={styles.subtitle}>{t('tagline')}</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>⚡ {progress.xp} {t('xp')}</Text>
        </View>
      </View>

      <Text style={styles.mutedText}>
        {t('progress')}: {doneCount}/24 {t('lesson').toLowerCase()}s {t('done').toLowerCase()} •
        {' '}{progress.doneExercises.length}/48 {t('exercise').toLowerCase()}s
      </Text>
      <View style={{ height: 12 }} />

      {MONTH_NAMES_HT.map((name, i) => {
        const month = i + 1;
        const lessons = lessonsForMonth(month);
        const open = openMonth === month;
        const monthDone = lessons.every((l) => progress.doneLessons.includes(l.id));
        return (
          <View key={month} style={{ marginBottom: 8 }}>
            <Pressable
              onPress={() => setOpenMonth(open ? null : month)}
              style={({ pressed }) => [
                styles.card,
                { opacity: pressed ? 0.7 : 1, borderColor: open ? COLORS.accent : 'transparent', borderWidth: 1 },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.cardTitle}>
                  {monthDone ? '✅ ' : '📅 '}{t('month')} {month} — {name}
                </Text>
                <Text style={[styles.mutedText, { fontSize: 16 }]}>{open ? '▾' : '▸'}</Text>
              </View>
              <Text style={styles.mutedText}>
                {lessons.length} {t('lesson').toLowerCase()}s
              </Text>
            </Pressable>
            {open &&
              lessons.map((l) => (
                <View key={l.id} style={{ marginLeft: 12 }}>
                  <LessonRow
                    lesson={l}
                    lang={lang}
                    done={progress.doneLessons.includes(l.id)}
                    onPress={() => navigate({ name: 'lesson', lessonId: l.id })}
                  />
                </View>
              ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

/**
 * Kòd Akademi — Ekran Pwogram (Gid Konplè kòm kolòn vetebral):
 * program (7 etap) → etape (modil) → guideModule (leson + kontni ki gen rapò + pwojè)
 * → guideLesson (body + kòd + nòt ekspè + 🔊 Koute) → guideExercises (3 tantativ)
 * → guideProject (objektif + kritè reysi).
 * Fizyon: leson rapid (12 mwa) ak modil langaj yo parèt kòm "kontni ki gen rapò".
 */

import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { COLORS, styles } from '../theme';
import { t } from '../i18n';
import { markCheckpointDone, markExerciseDone, markLessonDone } from '../storage';
import { speakLesson, stopSpeaking } from '../speech';
import { lessonById, lessonTitle, stripCheckMarkers } from '../data';
import { getModule } from '../modules';
import {
  GUIDE,
  getEtape,
  getGuideLesson,
  getGuideModule,
  getGuideProject,
  guideExerciseToExercise,
} from '../guide';
import ExerciseDetail, { TYPE_LABEL } from '../components/ExerciseDetail';
import LessonBody from '../components/LessonBody';
import type { ScreenProps } from '../types';

export type GuideRoute =
  | { name: 'program' }
  | { name: 'etape'; etapeId: string }
  | { name: 'guideModule'; etapeId: string; moduleId: string }
  | { name: 'guideLesson'; etapeId: string; moduleId: string; lessonId: string }
  | { name: 'guideExercises'; etapeId: string; moduleId: string; lessonId: string }
  | { name: 'guideProject'; etapeId: string; moduleId: string; projectId: string };

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

function Card({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

export default function GuideScreen({
  navigate,
  goBack,
  lang,
  progress,
  refresh,
  route,
}: ScreenProps & { route: GuideRoute }) {
  const [speaking, setSpeaking] = useState(false);
  const [openExId, setOpenExId] = useState<string | null>(null);

  useEffect(() => {
    setOpenExId(null);
    return () => stopSpeaking();
  }, [route]);

  // ---------- PWOGRAM: 7 etap ----------
  if (route.name === 'program') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🗺️ {t('tabProgram')}</Text>
        <Text style={styles.subtitle}>{t('programSubtitle')}</Text>
        <Text style={[styles.cardText, { marginBottom: 12 }]}>{GUIDE.description_ht}</Text>
        {GUIDE.etapes.map((etape) => {
          const lessonIds = etape.modules.flatMap((m) => m.lessons.map((l) => l.id));
          const doneCount = lessonIds.filter((id) => progress.doneLessons.includes(id)).length;
          return (
            <Card key={etape.id} onPress={() => navigate({ name: 'etape', etapeId: etape.id })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {etape.icon} {t('etape')} {etape.numero} — {etape.title_ht}
                  </Text>
                  <Text style={styles.mutedText} numberOfLines={2}>
                    {etape.description_ht}
                  </Text>
                  <Text style={styles.mutedText}>
                    {etape.modules.length} modil • {doneCount}/{lessonIds.length} leson fini
                  </Text>
                </View>
                <Text style={{ fontSize: 22 }}>›</Text>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    );
  }

  // ---------- ETAP: lis modil ----------
  if (route.name === 'etape') {
    const etape = getEtape(route.etapeId);
    if (!etape) {
      return (
        <View style={[styles.container, { padding: 16 }]}>
          <BackButton onPress={goBack} />
          <Text style={styles.cardText}>Etap pa jwenn.</Text>
        </View>
      );
    }
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <BackButton onPress={goBack} />
        <Text style={styles.title}>
          {etape.icon} {t('etape')} {etape.numero}
        </Text>
        <Text style={styles.subtitle}>{etape.title_ht}</Text>
        <Text style={[styles.cardText, { marginBottom: 12 }]}>{etape.description_ht}</Text>
        {etape.modules.map((mod) => {
          const lessonIds = mod.lessons.map((l) => l.id);
          const doneCount = lessonIds.filter((id) => progress.doneLessons.includes(id)).length;
          return (
            <Card
              key={mod.id}
              onPress={() => navigate({ name: 'guideModule', etapeId: etape.id, moduleId: mod.id })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>📦 {mod.title_ht}</Text>
                  <Text style={styles.mutedText} numberOfLines={2}>
                    {mod.description_ht}
                  </Text>
                  <Text style={styles.mutedText}>
                    {doneCount}/{lessonIds.length} leson fini
                    {mod.projects.length > 0 ? ` • ${mod.projects.length} pwojè` : ''}
                  </Text>
                </View>
                <Text style={{ fontSize: 22 }}>›</Text>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    );
  }

  // ---------- MODIL GID: leson + kontni ki gen rapò + pwojè ----------
  if (route.name === 'guideModule') {
    const found = getGuideModule(route.etapeId, route.moduleId);
    if (!found) {
      return (
        <View style={[styles.container, { padding: 16 }]}>
          <BackButton onPress={goBack} />
          <Text style={styles.cardText}>Modil pa jwenn.</Text>
        </View>
      );
    }
    const { etape, module } = found;
    const relatedLessons = module.related_lessons
      .map((id) => lessonById(id))
      .filter((l): l is NonNullable<typeof l> => Boolean(l));
    const relatedModules = module.related_modules
      .map((id) => getModule(id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m));

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <BackButton onPress={goBack} />
        <Text style={styles.title}>📦 {module.title_ht}</Text>
        <Text style={styles.subtitle}>
          {t('etape')} {etape.numero} — {etape.title_ht}
        </Text>
        <Text style={[styles.cardText, { marginBottom: 12 }]}>{module.description_ht}</Text>
        {module.pass_criteria_ht ? (
          <View style={styles.expertBox}>
            <Text style={styles.expertTitle}>🎯 {t('passCriteria')}</Text>
            <Text style={styles.expertText}>{module.pass_criteria_ht}</Text>
          </View>
        ) : null}

        <Text style={[styles.cardTitle, { marginTop: 8, marginBottom: 8 }]}>
          📖 {t('guideLessons')} ({module.lessons.length})
        </Text>
        {module.lessons.map((lesson) => {
          const done = progress.doneLessons.includes(lesson.id);
          return (
            <Card
              key={lesson.id}
              onPress={() =>
                navigate({
                  name: 'guideLesson',
                  etapeId: etape.id,
                  moduleId: module.id,
                  lessonId: lesson.id,
                })
              }
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>📖 {lesson.title_ht}</Text>
                  <Text style={styles.mutedText}>{lesson.exercises.length} egzèsis</Text>
                </View>
                <DoneBadge done={done} />
              </View>
            </Card>
          );
        })}

        {relatedLessons.length > 0 && (
          <>
            <Text style={[styles.cardTitle, { marginTop: 12, marginBottom: 8 }]}>
              ⚡ {t('relatedLessons')}
            </Text>
            {relatedLessons.map((l) => (
              <Card key={l.id} onPress={() => navigate({ name: 'lesson', lessonId: l.id })}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {l.id} — {lessonTitle(l, lang)}
                    </Text>
                    <Text style={styles.mutedText}>{l.domain}</Text>
                  </View>
                  <Text style={{ fontSize: 22 }}>›</Text>
                </View>
              </Card>
            ))}
          </>
        )}

        {relatedModules.length > 0 && (
          <>
            <Text style={[styles.cardTitle, { marginTop: 12, marginBottom: 8 }]}>
              💻 {t('relatedModules')}
            </Text>
            {relatedModules.map((m) => (
              <Card key={m.id} onPress={() => navigate({ name: 'module', moduleId: m.id })}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>💻 {m.name}</Text>
                    <Text style={styles.mutedText} numberOfLines={2}>
                      {m.description_ht}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 22 }}>›</Text>
                </View>
              </Card>
            ))}
          </>
        )}

        {module.projects.length > 0 && (
          <>
            <Text style={[styles.cardTitle, { marginTop: 12, marginBottom: 8 }]}>
              🛠️ {t('projects')} ({module.projects.length})
            </Text>
            {module.projects.map((p) => (
              <Card
                key={p.id}
                onPress={() =>
                  navigate({
                    name: 'guideProject',
                    etapeId: etape.id,
                    moduleId: module.id,
                    projectId: p.id,
                  })
                }
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>🛠️ {p.title_ht}</Text>
                    <Text style={styles.mutedText} numberOfLines={2}>
                      {p.description_ht}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 22 }}>›</Text>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    );
  }

  // ---------- DETAY LESON GID ----------
  if (route.name === 'guideLesson') {
    const found = getGuideLesson(route.etapeId, route.moduleId, route.lessonId);
    if (!found) {
      return (
        <View style={[styles.container, { padding: 16 }]}>
          <BackButton onPress={goBack} />
          <Text style={styles.cardText}>Leson pa jwenn.</Text>
        </View>
      );
    }
    const { etape, module, lesson } = found;
    const done = progress.doneLessons.includes(lesson.id);

    const toggleSpeak = () => {
      if (speaking) {
        stopSpeaking();
        setSpeaking(false);
      } else {
        // Règ 1: vwa a li TOUT leson an, san makè [[CHECK]]
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
            {t('etape')} {etape.numero} • {module.id.toUpperCase()} • {lesson.id}
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

        {lesson.code ? (
          <>
            <Text style={[styles.cardTitle, { marginTop: 8 }]}>{t('codeExample')}</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeLang}>{lesson.code_lang}</Text>
              <Text style={styles.codeText}>{lesson.code}</Text>
            </View>
          </>
        ) : null}

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
              name: 'guideExercises',
              etapeId: etape.id,
              moduleId: module.id,
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

  // ---------- EGZÈSIS LESON GID ----------
  if (route.name === 'guideExercises') {
    const found = getGuideLesson(route.etapeId, route.moduleId, route.lessonId);
    if (!found) {
      return (
        <View style={[styles.container, { padding: 16 }]}>
          <BackButton onPress={goBack} />
          <Text style={styles.cardText}>Leson pa jwenn.</Text>
        </View>
      );
    }
    const { lesson } = found;
    const exercises = lesson.exercises.map((ex) => guideExerciseToExercise(lesson.id, ex));
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
                navigate({
                  name: 'guideLesson',
                  etapeId: found.etape.id,
                  moduleId: found.module.id,
                  lessonId: lesson.id,
                })
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

  // ---------- DETAY PWOJÈ ----------
  const found = getGuideProject(route.etapeId, route.moduleId, route.projectId);
  if (!found) {
    return (
      <View style={[styles.container, { padding: 16 }]}>
        <BackButton onPress={goBack} />
        <Text style={styles.cardText}>Pwojè pa jwenn.</Text>
      </View>
    );
  }
  const { project } = found;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <BackButton onPress={goBack} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>🛠️ {t('projects')}</Text>
      </View>
      <View style={{ height: 8 }} />
      <Text style={styles.title}>{project.title_ht}</Text>
      <Text style={[styles.cardText, { marginBottom: 12 }]}>{project.description_ht}</Text>

      <Text style={[styles.cardTitle, { marginBottom: 8 }]}>🎯 {t('objectives')}</Text>
      {project.objectives_ht.map((o, i) => (
        <View key={i} style={[styles.card, { marginBottom: 6 }]}>
          <Text style={styles.cardText}>
            <Text style={{ fontWeight: 'bold', color: COLORS.gold }}>{i + 1}. </Text>
            {o}
          </Text>
        </View>
      ))}

      <Text style={[styles.cardTitle, { marginTop: 12, marginBottom: 8 }]}>
        ✅ {t('criteria')}
      </Text>
      {project.criteria_ht.map((c, i) => (
        <View key={i} style={[styles.card, { marginBottom: 6 }]}>
          <Text style={styles.cardText}>☑️ {c}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

/**
 * Kòd Akademi — Kò leson ak checkpoint yo antremele.
 * Li makè [[CHECK:id]] yo nan tèks la epi li rann chak ti egzèsis
 * an tan reyèl IMEDYATMAN apre konsèp kle a (règ 3 itilizatè a).
 */

import React from 'react';
import { Text } from 'react-native';
import { styles } from '../theme';
import { splitBodyWithChecks, type AppLang, type Checkpoint } from '../data';
import CheckpointCard from './CheckpointCard';

export default function LessonBody({
  body,
  checkpoints,
  lang,
  doneCheckpointIds,
  onCheckpointDone,
}: {
  body: string;
  checkpoints?: Checkpoint[];
  lang: AppLang;
  doneCheckpointIds: string[];
  onCheckpointDone: (checkpointId: string) => Promise<void>;
}) {
  const blocks = splitBodyWithChecks(body);
  const byId = new Map((checkpoints ?? []).map((c) => [c.id, c]));

  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === 'text') {
          // Chak paragraf: fraz kout, 1 lide pa fraz (règ 2)
          return (
            <Text key={`t-${i}`} style={[styles.cardText, { marginBottom: 10 }]}>
              {block.text}
            </Text>
          );
        }
        const cp = byId.get(block.id);
        if (!cp) return null;
        return (
          <CheckpointCard
            key={`c-${block.id}`}
            checkpoint={cp}
            lang={lang}
            isDone={doneCheckpointIds.includes(cp.id)}
            onComplete={() => onCheckpointDone(cp.id)}
          />
        );
      })}
    </>
  );
}

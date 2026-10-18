/**
 * Kòd Akademi — Ekran Langaj: katalòg languages.json pa kategori ak altènativ.
 * Si yon langaj gen yon modil konplè (16 modil yo), tape sou li louvri
 * modil lan: 4 nivo → leson pa nivo → leson + egzèsis.
 */

import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../theme';
import { LANGUAGE_CATEGORIES } from '../data';
import { moduleForLanguageName } from '../modules';
import { t } from '../i18n';
import type { ScreenProps } from '../types';

export default function LanguagesScreen({ navigate }: ScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>{t('tabLanguages')}</Text>
      <Text style={styles.subtitle}>{t('tagline')}</Text>

      {LANGUAGE_CATEGORIES.map((cat, ci) => (
        <View key={ci} style={{ marginBottom: 16 }}>
          <Text style={[styles.cardTitle, { fontSize: 20, marginBottom: 8 }]}>
            🗂️ {cat.category_ht}
          </Text>
          {cat.items.map((item, ii) => {
            const module = moduleForLanguageName(item.name);
            const inner = (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  💻 {item.name}
                  {module ? '  ›' : ''}
                </Text>
                <Text style={[styles.cardText, { marginTop: 4 }]}>
                  {module ? module.description_ht : item.description_ht}
                </Text>
                {item.alternatives.length > 0 && (
                  <Text style={[styles.mutedText, { marginTop: 6 }]}>
                    {t('alternatives')}: {item.alternatives.join(' • ')}
                  </Text>
                )}
                {module && (
                  <Text style={[styles.mutedText, { marginTop: 6 }]}>
                    📚 Tape pou wouvri modil konplè a: 4 nivo • 12 leson • 24 egzèsis
                  </Text>
                )}
              </View>
            );
            return module ? (
              <Pressable
                key={ii}
                onPress={() => navigate({ name: 'module', moduleId: module.id })}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                {inner}
              </Pressable>
            ) : (
              <View key={ii}>{inner}</View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

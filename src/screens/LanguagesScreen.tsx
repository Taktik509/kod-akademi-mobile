/** Kòd Akademi — Ekran Langaj: katalòg languages.json pa kategori ak altènativ. */

import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { styles } from '../theme';
import { LANGUAGE_CATEGORIES } from '../data';
import { t } from '../i18n';
import type { ScreenProps } from '../types';

export default function LanguagesScreen(_props: ScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>{t('tabLanguages')}</Text>
      <Text style={styles.subtitle}>{t('tagline')}</Text>

      {LANGUAGE_CATEGORIES.map((cat, ci) => (
        <View key={ci} style={{ marginBottom: 16 }}>
          <Text style={[styles.cardTitle, { fontSize: 20, marginBottom: 8 }]}>
            🗂️ {cat.category_ht}
          </Text>
          {cat.items.map((item, ii) => (
            <View key={ii} style={styles.card}>
              <Text style={styles.cardTitle}>💻 {item.name}</Text>
              <Text style={[styles.cardText, { marginTop: 4 }]}>
                {item.description_ht}
              </Text>
              {item.alternatives.length > 0 && (
                <Text style={[styles.mutedText, { marginTop: 6 }]}>
                  {t('alternatives')}: {item.alternatives.join(' • ')}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

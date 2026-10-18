/** Kòd Akademi — Ekran Paramèt: chanje lang HT/FR/EN/ES. */

import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { COLORS, styles } from '../theme';
import { t, setLang, LANGS } from '../i18n';
import { saveLang } from '../storage';
import type { ScreenProps } from '../types';
import type { AppLang } from '../data';

export default function SettingsScreen({ lang, refresh }: ScreenProps) {
  const choose = async (code: AppLang) => {
    setLang(code);
    await saveLang(code);
    await refresh(); // re-rann pou tout t() yo mete ajou
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>⚙️ {t('tabSettings')}</Text>
      <Text style={styles.subtitle}>{t('chooseLanguage')}</Text>

      {LANGS.map((l) => {
        const active = l.code === lang;
        return (
          <Pressable
            key={l.code}
            onPress={() => choose(l.code)}
            style={({ pressed }) => [
              styles.card,
              {
                opacity: pressed ? 0.7 : 1,
                borderWidth: 2,
                borderColor: active ? COLORS.accent : 'transparent',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.cardTitle, { fontSize: 18 }]}>{l.label}</Text>
              {active && <Text style={{ fontSize: 20, color: COLORS.accent }}>✓</Text>}
            </View>
          </Pressable>
        );
      })}

      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.cardTitle}>{t('appName')}</Text>
        <Text style={styles.mutedText}>v1.0.0 • {t('tagline')}</Text>
        <Text style={[styles.mutedText, { marginTop: 8, fontWeight: '600' }]}>🏢 TAKTIK MARKETING AGENCY LLC (KODE)</Text>
        <Text style={styles.mutedText}>📞 +509 34312727</Text>
      </View>
    </ScrollView>
  );
}

/** Kòd Akademi — Ekran Mizajou: lis nouvèl lokal + bouton rafrechi (stub dokimante). */

import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { COLORS, styles } from '../theme';
import { t } from '../i18n';
import { checkForUpdates, LOCAL_NEWS, type AppNews } from '../news';
import type { ScreenProps } from '../types';

export default function UpdatesScreen(_props: ScreenProps) {
  const [news, setNews] = useState<AppNews[]>(LOCAL_NEWS);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const result = await checkForUpdates();
      setNews(result.news);
      setMessage(result.updated ? '✅ Nouvo mizajou!' : '✅ Tout bagay ajou.');
    } catch {
      setMessage('⚠️ Pa ka verifye kounye a. Tcheke koneksyon ou.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>📰 {t('newsTitle')}</Text>
      <Text style={styles.subtitle}>{t('tagline')}</Text>

      <Pressable
        onPress={handleRefresh}
        disabled={checking}
        style={[styles.button, { opacity: checking ? 0.6 : 1 }]}
      >
        {checking ? (
          <ActivityIndicator color="#052e16" />
        ) : (
          <Text style={styles.buttonText}>🔄 {t('newsRefresh')}</Text>
        )}
      </Pressable>

      {message && (
        <Text style={[styles.cardText, { marginTop: 10, color: COLORS.accent }]}>
          {message}
        </Text>
      )}

      <View style={{ height: 12 }} />

      {news.length === 0 && (
        <Text style={styles.mutedText}>{t('newsEmpty')}</Text>
      )}

      {news.map((n) => (
        <View key={n.id} style={styles.card}>
          <Text style={styles.mutedText}>{n.date}</Text>
          <Text style={[styles.cardTitle, { marginTop: 4 }]}>{n.title_ht}</Text>
          <Text style={[styles.cardText, { marginTop: 6 }]}>{n.body_ht}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

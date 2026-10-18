/**
 * Kòd Akademi — Ekran Resous: lyen ofisyèl gid la (Python docs, MDN, Git Book...)
 * òganize pa kategori, ak deskripsyon kreyòl. Louvri nan navigatè a.
 */

import React from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../theme';
import { t } from '../i18n';
import { RESOURCE_GROUPS } from '../guide';
import type { ScreenProps } from '../types';

export default function ResourcesScreen(_props: ScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>🔗 {t('tabResources')}</Text>
      <Text style={styles.subtitle}>
        Sous ofisyèl pou aprann pi fon — dokimantasyon ak kou gratis.
      </Text>
      {RESOURCE_GROUPS.map((group) => (
        <View key={group.id} style={{ marginBottom: 8 }}>
          <Text style={[styles.cardTitle, { marginBottom: 8, marginTop: 8 }]}>
            {group.title_ht}
          </Text>
          {group.items.map((item) => (
            <Pressable
              key={item.url}
              onPress={() => Linking.openURL(item.url)}
              style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>🌐 {item.name}</Text>
                  <Text style={styles.mutedText} numberOfLines={2}>
                    {item.description_ht}
                  </Text>
                  <Text style={[styles.mutedText, { fontSize: 12 }]} numberOfLines={1}>
                    {item.url}
                  </Text>
                </View>
                <Text style={{ fontSize: 22 }}>↗</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

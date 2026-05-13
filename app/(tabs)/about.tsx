import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusMessage } from '@/components/ui/status-message';
import {
  deleteOfflineNote,
  insertOfflineNote,
  listOfflineNotes,
  type OfflineNoteRow,
} from '@/services/offline-notes-db';
import { typography } from '@/theme';

const contactItems = [
  {
    id: 'email',
    label: 'البريد الإلكتروني',
    value: 'lumixy03@gmail.com',
    icon: 'mail-outline',
  },
  {
    id: 'phone',
    label: 'رقم الهاتف',
    value: 'غير متوفر حاليًا',
    icon: 'call-outline',
  },
  {
    id: 'instagram',
    label: 'إنستغرام',
    value: '@lumixy.app',
    icon: 'logo-instagram',
  },
] as const;

function ContactCard({
  label,
  value,
  icon,
}: (typeof contactItems)[number]) {
  return (
    <Pressable style={({ pressed }) => [styles.contactCard, pressed && styles.cardPressed]}>
      <View style={styles.contactMain}>
        <View style={styles.contactIconWrap}>
          <Ionicons
            name={icon as React.ComponentProps<typeof Ionicons>['name']}
            size={18}
            color="#9D4DFF"
          />
        </View>

        <View style={styles.contactTextWrap}>
          <Text style={styles.contactLabel}>{label}</Text>
          <Text style={styles.contactValue}>{value}</Text>
        </View>
      </View>

      <Ionicons name="chevron-back" size={18} color="#61577A" />
    </Pressable>
  );
}

export default function AboutScreen() {
  const [notes, setNotes] = useState<OfflineNoteRow[]>([]);
  const [draft, setDraft] = useState('');
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesSaving, setNotesSaving] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    setNotesLoading(true);
    setDbError(null);

    try {
      const rows = await listOfflineNotes();
      setNotes(rows);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'تعذر فتح التخزين المحلي.';
      setDbError(message);
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const offlineInfoMessage = useMemo(
    () =>
      'ملاحظاتك تُحفظ محلياً وتعمل بدون إنترنت. على الهاتف يُستخدم SQLite؛ على الويب يُستخدم تخزين المتصفح.',
    []
  );

  const formatDate = useCallback((createdAt: number) => {
    try {
      return new Intl.DateTimeFormat('ar', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(createdAt));
    } catch {
      return new Date(createdAt).toLocaleString();
    }
  }, []);

  const handleAddNote = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || dbError) {
      return;
    }

    setNotesSaving(true);
    try {
      await insertOfflineNote(trimmed);
      setDraft('');
      await loadNotes();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'تعذر حفظ الملاحظة.';
      Alert.alert('تنبيه', message);
    } finally {
      setNotesSaving(false);
    }
  }, [dbError, draft, loadNotes]);

  const handleDeleteNote = useCallback(
    async (id: number) => {
      if (dbError) {
        return;
      }
      try {
        await deleteOfflineNote(id);
        await loadNotes();
      } catch {
        Alert.alert('تنبيه', 'تعذر حذف الملاحظة.');
      }
    },
    [dbError, loadNotes]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.page}>
        <View style={styles.topGlow} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTitle}>حول التطبيق</Text>

          <View style={styles.brandBlock}>
            <View style={styles.logoFrame}>
              <Text style={styles.logoText}>LUMIXY</Text>
            </View>

            <Text style={styles.brandName}>Lumixy</Text>
            <Text style={styles.brandDescription}>
              منصة تربط بين مقدمي الخدمات والعملاء في فلسطين،{'\n'}
              بطريقة أسهل وأوضح وأكثر احترافية.
            </Text>
          </View>

          <Pressable
            onPress={() => router.push('/auth/signup')}
            style={({ pressed }) => [styles.ctaPressable, pressed && styles.cardPressed]}>
            <LinearGradient
              colors={['#6A2CE0', '#8E45FF']}
              start={{ x: 0, y: 0.15 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaCard}>
              <View style={styles.ctaTextWrap}>
                <Text style={styles.ctaTitle}>هل أنت مقدم خدمة؟</Text>
                <Text style={styles.ctaText}>انضم إلى المنصة وابدأ بعرض خدماتك للعملاء.</Text>
              </View>

              <View style={styles.ctaIconWrap}>
                <Ionicons name="briefcase-outline" size={21} color="#FFFFFF" />
              </View>

              <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.24)" />
            </LinearGradient>
          </Pressable>

          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles-outline" size={15} color="#9D4DFF" />
            <Text style={styles.sectionTitle}>تواصل معنا</Text>
          </View>

          <View style={styles.contactsList}>
            {contactItems.map((item) => (
              <ContactCard key={item.id} {...item} />
            ))}
          </View>

          <View style={styles.offlineSection}>
            <View style={styles.offlineTitleRow}>
              <TouchableOpacity
                onPress={() => void loadNotes()}
                style={styles.refreshBtn}
                accessibilityLabel="تحديث الملاحظات">
                <Ionicons name="refresh" size={18} color="#9D4DFF" />
              </TouchableOpacity>
              <View style={styles.offlineTitleTextWrap}>
                <Ionicons name="cloud-offline-outline" size={16} color="#9D4DFF" />
                <Text style={styles.offlineSectionTitle}>ملاحظات محلية</Text>
              </View>
            </View>
            <Text style={styles.offlineSubtitle}>
              لا تحتاج إنترنت للعرض أو التعديل — SQLite على التطبيق، تخزين محلي على الويب.
            </Text>

            {dbError ? (
              <StatusMessage variant="warning" title="تنبيه" message={dbError} style={styles.offlineBanner} />
            ) : (
              <StatusMessage variant="info" title="أوفلاين" message={offlineInfoMessage} style={styles.offlineBanner} />
            )}

            <View style={styles.offlineComposer}>
              <Text style={styles.offlineComposerLabel}>ملاحظة جديدة</Text>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="اكتب هنا..."
                placeholderTextColor="#61577A"
                multiline
                editable={!dbError}
                style={styles.offlineInput}
              />
              <TouchableOpacity
                onPress={() => void handleAddNote()}
                disabled={notesSaving || !draft.trim() || Boolean(dbError)}
                style={[
                  styles.offlineSaveBtn,
                  (notesSaving || !draft.trim() || dbError) && styles.offlineSaveBtnDisabled,
                ]}>
                <Text style={styles.offlineSaveBtnText}>
                  {notesSaving ? 'جارٍ الحفظ...' : 'حفظ محلياً'}
                </Text>
              </TouchableOpacity>
            </View>

            {notesLoading ? (
              <View style={styles.notesLoadingWrap}>
                <ActivityIndicator color="#9D4DFF" />
              </View>
            ) : notes.length === 0 ? (
              <Text style={styles.notesEmpty}>لا توجد ملاحظات بعد. أضف واحدة لتجربة التخزين المحلي.</Text>
            ) : (
              notes.map((item) => (
                <View key={item.id} style={styles.noteRow}>
                  <TouchableOpacity
                    onPress={() => void handleDeleteNote(item.id)}
                    style={styles.noteDeleteBtn}
                    accessibilityLabel="حذف الملاحظة">
                    <Ionicons name="trash-outline" size={18} color="#FDA4AF" />
                  </TouchableOpacity>
                  <View style={styles.noteBody}>
                    <Text style={styles.noteContent}>{item.content}</Text>
                    <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09030C',
  },
  page: {
    flex: 1,
    backgroundColor: '#09030C',
  },
  topGlow: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: 'rgba(121, 58, 214, 0.10)',
    borderRadius: 120,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 120,
  },
  screenTitle: {
    color: '#817A92',
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logoFrame: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#6D28D9',
    backgroundColor: '#0D0912',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6D28D9',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logoText: {
    color: '#F1F5F9',
    fontFamily: typography.fontFamily.bold,
    fontSize: 23,
    letterSpacing: 0.8,
  },
  brandName: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    marginTop: 14,
    marginBottom: 6,
  },
  brandDescription: {
    color: '#9B94AB',
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  ctaCard: {
    minHeight: 104,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 34,
    shadowColor: '#6D28D9',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  ctaPressable: {
    marginBottom: 34,
  },
  ctaIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    textAlign: 'right',
    marginBottom: 2,
  },
  ctaText: {
    color: 'rgba(255,255,255,0.76)',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
  },
  contactsList: {
    gap: 12,
    marginBottom: 28,
  },
  contactCard: {
    width: '100%',
    borderRadius: 21,
    backgroundColor: '#17131B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactMain: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  contactTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  contactLabel: {
    color: '#8A819B',
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    marginBottom: 2,
    textAlign: 'right',
  },
  contactValue: {
    color: '#E8E5F1',
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    textAlign: 'right',
  },
  contactIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(157, 77, 255, 0.25)',
    backgroundColor: 'rgba(157, 77, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  offlineSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  offlineTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  offlineTitleTextWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  offlineSectionTitle: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 17,
    textAlign: 'right',
  },
  offlineSubtitle: {
    color: '#8A819B',
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
    marginBottom: 12,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(157, 77, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(157, 77, 255, 0.2)',
  },
  offlineBanner: {
    marginBottom: 12,
  },
  offlineComposer: {
    borderRadius: 18,
    backgroundColor: '#17131B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    marginBottom: 16,
  },
  offlineComposerLabel: {
    color: '#9B94AB',
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 8,
  },
  offlineInput: {
    minHeight: 80,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0D0912',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#E8E5F1',
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    textAlign: 'right',
    textAlignVertical: 'top',
  },
  offlineSaveBtn: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: '#6D28D9',
    paddingVertical: 12,
    alignItems: 'center',
  },
  offlineSaveBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  offlineSaveBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
  },
  notesLoadingWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  notesEmpty: {
    color: '#61577A',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  noteRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 18,
    backgroundColor: '#17131B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    marginBottom: 10,
  },
  noteDeleteBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  noteBody: {
    flex: 1,
    alignItems: 'flex-end',
  },
  noteContent: {
    color: '#E8E5F1',
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right',
  },
  noteDate: {
    color: '#61577A',
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'right',
  },
});

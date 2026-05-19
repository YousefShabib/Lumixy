import * as SQLite from 'expo-sqlite';

export type AboutContactItem = {
  id: string;
  label: string;
  value: string;
  icon: string;
};

export type AboutContent = {
  screenTitle: string;
  brandName: string;
  brandDescription: string;
  ctaTitle: string;
  ctaText: string;
  sectionTitle: string;
  contacts: AboutContactItem[];
};

const defaultAboutContent: AboutContent = {
  screenTitle: 'حول التطبيق',
  brandName: 'Lumixy',
  brandDescription:
    'منصة تربط بين مقدمي الخدمات والعملاء في فلسطين،\nبطريقة أسهل وأوضح وأكثر احترافية.',
  ctaTitle: 'هل أنت مقدم خدمة؟',
  ctaText: 'انضم إلى المنصة وابدأ بعرض خدماتك للعملاء.',
  sectionTitle: 'تواصل معنا',
  contacts: [
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
      id: 'whatsapp',
      label: 'واتساب',
      value: 'غير متوفر حاليًا',
      icon: 'logo-whatsapp',
    },
    {
      id: 'instagram',
      label: 'إنستغرام',
      value: '@lumixy.app',
      icon: 'logo-instagram',
    },
  ],
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  dbPromise ??= SQLite.openDatabaseAsync('lumixy-offlight.db');
  return dbPromise;
}

async function initOfflineDb() {
  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS about_content (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS about_contacts (
      id TEXT PRIMARY KEY NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      icon TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );
  `);

  await Promise.all([
    db.runAsync('INSERT OR IGNORE INTO about_content (key, value) VALUES (?, ?)', [
      'screenTitle',
      defaultAboutContent.screenTitle,
    ]),
    db.runAsync('INSERT OR IGNORE INTO about_content (key, value) VALUES (?, ?)', [
      'brandName',
      defaultAboutContent.brandName,
    ]),
    db.runAsync('INSERT OR IGNORE INTO about_content (key, value) VALUES (?, ?)', [
      'brandDescription',
      defaultAboutContent.brandDescription,
    ]),
    db.runAsync('INSERT OR IGNORE INTO about_content (key, value) VALUES (?, ?)', [
      'ctaTitle',
      defaultAboutContent.ctaTitle,
    ]),
    db.runAsync('INSERT OR IGNORE INTO about_content (key, value) VALUES (?, ?)', [
      'ctaText',
      defaultAboutContent.ctaText,
    ]),
    db.runAsync('INSERT OR IGNORE INTO about_content (key, value) VALUES (?, ?)', [
      'sectionTitle',
      defaultAboutContent.sectionTitle,
    ]),
    ...defaultAboutContent.contacts.map((contact, index) =>
      db.runAsync(
        'INSERT OR IGNORE INTO about_contacts (id, label, value, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
        [contact.id, contact.label, contact.value, contact.icon, index]
      )
    ),
  ]);
}

export async function getAboutContent(): Promise<AboutContent> {
  await initOfflineDb();

  const db = await getDb();
  const rows = await db.getAllAsync<{ key: keyof Omit<AboutContent, 'contacts'>; value: string }>(
    'SELECT key, value FROM about_content'
  );
  const contacts = await db.getAllAsync<AboutContactItem>(
    'SELECT id, label, value, icon FROM about_contacts ORDER BY sort_order ASC'
  );

  const content = rows.reduce(
    (result, row) => ({
      ...result,
      [row.key]: row.value,
    }),
    { ...defaultAboutContent, contacts }
  );

  return {
    ...content,
    contacts: contacts.length > 0 ? contacts : defaultAboutContent.contacts,
  };
}

export default {
  getAboutContent,
};

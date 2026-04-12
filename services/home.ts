import {
  fetchPublicDirectoryWithFallback,
  formatArabicCount,
  type PublicDirectoryData,
  type PublicProvider,
  type PublicDirectoryStats,
} from '@/services/public-directory';

export type ServiceItem = {
  id: string;
  title: string;
  count: string;
  icon: string;
  colors: readonly [string, string];
  borderColor: string;
  glowColor: string;
  iconTint: string;
  textTint: string;
  pillBackground: string;
};

export type ProviderItem = {
  id: string;
  name: string;
  category: string;
  servicesLabel: string;
  location: string;
  accent: string;
};

export type HomeData = {
  rotatingMessages: string[];
  services: ServiceItem[];
  providers: ProviderItem[];
  stats: PublicDirectoryStats;
};

const servicePalettes = [
  {
    colors: ['#0F1F46', '#17356E'] as const,
    borderColor: 'rgba(67, 131, 255, 0.42)',
    glowColor: 'rgba(31, 110, 255, 0.18)',
    iconTint: '#3B82F6',
    textTint: '#9BC1FF',
    pillBackground: 'rgba(40, 84, 182, 0.18)',
  },
  {
    colors: ['#08362E', '#08473B'] as const,
    borderColor: 'rgba(26, 196, 138, 0.32)',
    glowColor: 'rgba(18, 185, 129, 0.18)',
    iconTint: '#10B981',
    textTint: '#8EF0CF',
    pillBackground: 'rgba(18, 185, 129, 0.15)',
  },
  {
    colors: ['#3C1C0D', '#5B2B12'] as const,
    borderColor: 'rgba(255, 149, 76, 0.30)',
    glowColor: 'rgba(249, 115, 22, 0.16)',
    iconTint: '#FB923C',
    textTint: '#FFD0A6',
    pillBackground: 'rgba(251, 146, 60, 0.16)',
  },
  {
    colors: ['#181B24', '#212634'] as const,
    borderColor: 'rgba(134, 143, 165, 0.28)',
    glowColor: 'rgba(148, 163, 184, 0.08)',
    iconTint: '#A1AABD',
    textTint: '#E4E7EC',
    pillBackground: 'rgba(102, 111, 133, 0.16)',
  },
  {
    colors: ['#2C1338', '#4A1E5C'] as const,
    borderColor: 'rgba(199, 125, 255, 0.28)',
    glowColor: 'rgba(168, 85, 247, 0.16)',
    iconTint: '#C084FC',
    textTint: '#F0D9FF',
    pillBackground: 'rgba(168, 85, 247, 0.16)',
  },
] as const;

const providerAccents = ['#4F8BFF', '#10B981', '#F97316', '#C084FC', '#FACC15'] as const;

function buildProviderServicesLabel(provider: PublicProvider) {
  const servicesCount = provider.customServices.length;

  if (servicesCount > 0) {
    return formatArabicCount(servicesCount, 'خدمة', 'خدمات');
  }

  if (provider.categoryName !== 'غير مصنف') {
    return provider.categoryName;
  }

  return 'ملف معتمد';
}

function buildRotatingMessages(stats: PublicDirectoryStats) {
  const messages = [
    stats.approvedProviders > 0
      ? `${formatArabicCount(stats.approvedProviders, 'مزود خدمة', 'مزود خدمة')} معتمد`
      : 'اكتشف مزودي الخدمات المعتمدين',
    stats.activeCategories > 0
      ? `${formatArabicCount(stats.activeCategories, 'تصنيف', 'تصنيف')} متاح`
      : 'سيتم عرض التصنيفات بعد تفعيلها',
    stats.citiesCount > 0
      ? `الخدمات متاحة في ${formatArabicCount(stats.citiesCount, 'مدينة', 'مدن')}`
      : 'ستظهر المدن بعد اعتماد أول مزود',
  ];

  return Array.from(new Set(messages));
}

function buildHomeData(directory: PublicDirectoryData): HomeData {
  const providersForHome =
    directory.featuredProviders.length > 0 ? directory.featuredProviders : directory.providers.slice(0, 10);

  return {
    rotatingMessages: buildRotatingMessages(directory.stats),
    services: directory.categories.map((category, index) => {
      const palette = servicePalettes[index % servicePalettes.length] ?? servicePalettes[0];

      return {
        id: category.id,
        title: category.name,
        count: formatArabicCount(category.providersCount, 'مزود', 'مزود'),
        icon: category.icon,
        colors: palette.colors,
        borderColor: palette.borderColor,
        glowColor: palette.glowColor,
        iconTint: palette.iconTint,
        textTint: palette.textTint,
        pillBackground: palette.pillBackground,
      };
    }),
    providers: providersForHome.map((provider, index) => ({
      id: provider.id,
      name: provider.name,
      category: provider.categoryName,
      servicesLabel: buildProviderServicesLabel(provider),
      location: provider.city,
      accent: providerAccents[index % providerAccents.length] ?? providerAccents[0],
    })),
    stats: directory.stats,
  };
}

export async function fetchHomeData(signal?: AbortSignal): Promise<HomeData> {
  const directory = await fetchPublicDirectoryWithFallback(signal);
  return buildHomeData(directory);
}

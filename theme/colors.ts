export const colors = {
  background: '#0B010E', // أسود داكن جداً يميل للبنفسجي زي الصورة
  surface: '#150A1D',    // خلفية البطاقات والعناصر
  surfaceSecondary: '#241433', // تدرج افتح قليلاً
  primary: '#6D28D9',    // البنفسجي الأساسي
  primaryLight: '#8B5CF6', // البنفسجي الفاتح (للتدرجات)
  accent: '#A78BFA',     // اللون المساعد
  text: '#FFFFFF',       // أبيض ناصع
  textSecondary: '#9CA3AF', // نصوص فرعية رمادية
  textMuted: '#6B7280',  
  border: '#2D1B44',     // حدود بنفسجية غامقة
  error: '#EF4444',      
  success: '#10B981',    
  warning: '#F59E0B',    
};

export const Colors = {
  light: {
    text: '#1F1235',
    background: '#F8F5FF',
    tint: '#6D28D9',
    icon: '#6E5B99',
    tabIconDefault: '#8A7AAE',
    tabIconSelected: '#6D28D9',
  },
  dark: {
    text: colors.text,
    background: colors.background,
    tint: colors.primaryLight,
    icon: '#B59ADF',
    tabIconDefault: '#8A6EC4',
    tabIconSelected: colors.accent,
  },
};
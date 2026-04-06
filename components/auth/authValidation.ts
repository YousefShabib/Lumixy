export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+\d\s()-]{7,20}$/;
export const OTP_LENGTH = 6;
export const PASSWORD_MIN_LENGTH = 8;

export const authValidationMessages = {
  confirmPasswordMismatch: 'تأكيد كلمة المرور غير مطابق.',
  incompleteOtp: 'يرجى إدخال رمز التحقق كاملًا.',
  invalidEmail: 'يرجى إدخال بريد إلكتروني صالح.',
  invalidOtp: 'رمز التحقق يجب أن يحتوي على 6 أرقام.',
  invalidPhone: 'يرجى إدخال رقم هاتف صالح.',
  nameMinLength: 'الاسم يجب أن يكون من حرفين على الأقل.',
  passwordMinLength: `كلمة المرور يجب أن تكون ${PASSWORD_MIN_LENGTH} أحرف على الأقل.`,
  requiredConfirmPassword: 'يرجى تأكيد كلمة المرور.',
  requiredEmail: 'يرجى إدخال البريد الإلكتروني.',
  requiredFullName: 'يرجى إدخال الاسم الكامل.',
  requiredOtp: 'يرجى إدخال رمز التحقق.',
  requiredPassword: 'يرجى إدخال كلمة المرور.',
  requiredResetPassword: 'يرجى إدخال كلمة المرور الجديدة.',
} as const;

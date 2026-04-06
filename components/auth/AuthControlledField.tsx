import React from 'react';
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  RegisterOptions,
} from 'react-hook-form';

import AuthField, { AuthFieldProps } from '@/components/auth/AuthField';

type Props<TFieldValues extends FieldValues> = Omit<
  AuthFieldProps,
  'errorMessage' | 'onBlur' | 'onChangeText' | 'value'
> & {
  authError?: string;
  clearAuthError?: () => void;
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
};

export default function AuthControlledField<TFieldValues extends FieldValues>({
  authError,
  clearAuthError,
  control,
  name,
  rules,
  ...fieldProps
}: Props<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <AuthField
          {...fieldProps}
          value={typeof field.value === 'string' ? field.value : ''}
          onBlur={field.onBlur}
          onChangeText={(value) => {
            field.onChange(value);
            if (authError) {
              clearAuthError?.();
            }
          }}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}

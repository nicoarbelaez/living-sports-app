import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '@/providers/theme';
import { cn } from '@/lib/utils';

export interface DatePickerFieldProps {
  label: string;
  value: string;
  minDateStr: string;
  error?: string;
  onChange: (dateStr: string) => void;
  maxDateStr?: string;
}

function safeParseDateStr(dateStr?: string | null): Date {
  if (!dateStr) return new Date();
  const parsed = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toDateStr(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplay(dateStr?: string): string {
  if (!dateStr) return 'Seleccionar fecha';
  const d = safeParseDateStr(dateStr);
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function isBefore(a: Date, b: Date) {
  return a.getTime() < b.getTime();
}

export default function DatePickerField({
  label,
  value,
  minDateStr,
  maxDateStr,
  error,
  onChange,
}: DatePickerFieldProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(safeParseDateStr(value));

  const minDate = useMemo(() => safeParseDateStr(minDateStr), [minDateStr]);
  const maxDate = useMemo(
    () => (maxDateStr ? safeParseDateStr(maxDateStr) : undefined),
    [maxDateStr]
  );

  useEffect(() => {
    if (isOpen) {
      setDraftDate(safeParseDateStr(value));
    }
  }, [isOpen, value]);

  const commitDate = (date: Date) => {
    let normalized = date;
    if (isBefore(normalized, minDate)) normalized = minDate;
    if (maxDate && !isBefore(normalized, maxDate) && normalized.getTime() > maxDate.getTime()) {
      normalized = maxDate;
    }
    onChange(toDateStr(normalized));
  };

  const handleAndroidChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setIsOpen(false);
    if (selectedDate) {
      commitDate(selectedDate);
    }
  };

  return (
    <View>
      <Text className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</Text>

      <TouchableOpacity onPress={() => setIsOpen((prev) => !prev)} activeOpacity={0.7}>
        <View
          className={cn(
            'h-12 items-center justify-center rounded-[12px] border border-gray-200 bg-white px-4',
            'dark:border-gray-700 dark:bg-gray-800',
            error && 'border-red-500 dark:border-red-500'
          )}
        >
          <Text className="text-base text-gray-900 dark:text-gray-100">{formatDisplay(value)}</Text>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="spinner"
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={handleAndroidChange}
          themeVariant={isDark ? 'dark' : 'light'}
          positiveButton={{ label: 'Confirmar' }}
          negativeButton={{ label: 'Cancelar' }}
        />
      )}

      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller } from 'react-hook-form';
import { ArrowLeft, CalendarDays, ChevronUp, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/providers/theme';
import { Input } from '@/components/ui/input';
import { useCreateCompetition } from '@/hooks/useCreateCompetition';

type DateField = 'start_date' | 'end_date';

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function parseDateStr(s: string) {
  const [year, month, day] = s.split('-').map(Number);
  return { year, month, day };
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function buildDateStr(year: number, month: number, day: number) {
  const maxDay = daysInMonth(year, month);
  const clampedDay = Math.min(day, maxDay);
  return `${year}-${String(month).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
}

interface DatePickerModalProps {
  visible: boolean;
  value: string;
  minDateStr: string;
  onConfirm: (dateStr: string) => void;
  onCancel: () => void;
  isDark: boolean;
}

function DatePickerModal({
  visible,
  value,
  minDateStr,
  onConfirm,
  onCancel,
  isDark,
}: DatePickerModalProps) {
  const parsed = parseDateStr(value);
  const [year, setYear] = useState(parsed.year);
  const [month, setMonth] = useState(parsed.month);
  const [day, setDay] = useState(parsed.day);

  const MONTHS = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const clampToMin = (y: number, m: number, d: number) => {
    const current = buildDateStr(y, m, d);
    if (current < minDateStr) {
      const min = parseDateStr(minDateStr);
      return { y: min.year, m: min.month, d: min.day };
    }
    return { y, m, d };
  };

  const adjustYear = (delta: number) => {
    const newYear = year + delta;
    const clamped = clampToMin(newYear, month, day);
    setYear(clamped.y);
    setMonth(clamped.m);
    setDay(clamped.d);
  };

  const adjustMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    const clamped = clampToMin(newYear, newMonth, day);
    setYear(clamped.y);
    setMonth(clamped.m);
    setDay(clamped.d);
  };

  const adjustDay = (delta: number) => {
    const max = daysInMonth(year, month);
    let newDay = day + delta;
    if (newDay > max) newDay = 1;
    if (newDay < 1) newDay = max;
    const clamped = clampToMin(year, month, newDay);
    setYear(clamped.y);
    setMonth(clamped.m);
    setDay(clamped.d);
  };

  const handleConfirm = () => onConfirm(buildDateStr(year, month, day));

  const bg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#111827';
  const subText = isDark ? '#9ca3af' : '#6b7280';
  const btnBg = isDark ? '#374151' : '#f3f4f6';

  const Spinner = ({
    label,
    value: val,
    onUp,
    onDown,
  }: {
    label: string;
    value: string;
    onUp: () => void;
    onDown: () => void;
  }) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 11, color: subText, marginBottom: 4 }}>{label}</Text>
      <TouchableOpacity onPress={onUp} style={{ padding: 8 }}>
        <ChevronUp size={20} color={textColor} />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: textColor,
          minWidth: 50,
          textAlign: 'center',
        }}
      >
        {val}
      </Text>
      <TouchableOpacity onPress={onDown} style={{ padding: 8 }}>
        <ChevronDown size={20} color={textColor} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
        onPress={onCancel}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ backgroundColor: bg, borderRadius: 20, padding: 24, width: 320 }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: textColor,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            Seleccionar fecha
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            <Spinner
              label="Día"
              value={String(day)}
              onUp={() => adjustDay(1)}
              onDown={() => adjustDay(-1)}
            />
            <Spinner
              label="Mes"
              value={MONTHS[month - 1]}
              onUp={() => adjustMonth(1)}
              onDown={() => adjustMonth(-1)}
            />
            <Spinner
              label="Año"
              value={String(year)}
              onUp={() => adjustYear(1)}
              onDown={() => adjustYear(-1)}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: btnBg,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: textColor, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: '#3b82f6',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function CreateCompetitionScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activePicker, setActivePicker] = useState<DateField | null>(null);
  const { form, exercises, loading, today, handleDateChange, onSubmit } =
    useCreateCompetition(groupId);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const selectedExerciseId = watch('exercise_id');
  const startDateStr = watch('start_date');
  const endDateStr = watch('end_date');

  const todayStr = today.toISOString().split('T')[0];

  const daysCount = (() => {
    if (!startDateStr || !endDateStr || endDateStr < startDateStr) return 0;
    return (
      Math.round(
        (new Date(endDateStr).getTime() - new Date(startDateStr).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
    );
  })();

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <View className="flex-row items-center gap-4 bg-white px-4 pt-14 pb-4 dark:bg-gray-900">
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-full bg-gray-100 p-2 dark:bg-gray-800"
        >
          <ArrowLeft size={22} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black dark:text-white">Nueva competición</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
          Título *
        </Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChangeText={onChange}
              placeholder="Ej: Reto de press banca abril"
              error={!!errors.title}
            />
          )}
        />
        {errors.title && <Text className="mt-1 text-xs text-red-500">{errors.title.message}</Text>}

        <Text className="mt-5 mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
          Descripción
        </Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChangeText={onChange}
              placeholder="Reglas, objetivo, etc."
              multiline
              numberOfLines={3}
              className="h-24"
              error={!!errors.description}
            />
          )}
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
          Ejercicio *
        </Text>
        {exercises.length === 0 ? (
          <ActivityIndicator color="#3b82f6" />
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {exercises.map((ex) => {
              const isSelected = ex.id === selectedExerciseId;
              return (
                <Pressable
                  key={ex.id}
                  onPress={() => setValue('exercise_id', ex.id, { shouldValidate: true })}
                  className={`rounded-full border px-4 py-2 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-white' : 'text-black dark:text-white'
                    }`}
                  >
                    {ex.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {errors.exercise_id && (
          <Text className="mt-1 text-xs text-red-500">{errors.exercise_id.message}</Text>
        )}

        <View className="mt-5 flex-row gap-4">
          <View className="flex-1">
            <Text className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
              Inicio *
            </Text>
            <TouchableOpacity
              onPress={() => setActivePicker('start_date')}
              className="h-12 flex-row items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <CalendarDays size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDisplay(startDateStr)}
              </Text>
            </TouchableOpacity>
            {errors.start_date && (
              <Text className="mt-1 text-xs text-red-500">{errors.start_date.message}</Text>
            )}
          </View>

          <View className="flex-1">
            <Text className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
              Fin *
            </Text>
            <TouchableOpacity
              onPress={() => setActivePicker('end_date')}
              className="h-12 flex-row items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <CalendarDays size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDisplay(endDateStr)}
              </Text>
            </TouchableOpacity>
            {errors.end_date && (
              <Text className="mt-1 text-xs text-red-500">{errors.end_date.message}</Text>
            )}
          </View>
        </View>

        {daysCount > 0 && (
          <Text className="mt-2 text-xs text-gray-400">
            Duración: {daysCount} día{daysCount !== 1 ? 's' : ''} · 1 evidencia por día por
            participante
          </Text>
        )}

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className={`mt-8 rounded-2xl py-4 ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
        >
          <Text className="text-center text-base font-bold text-white">
            {loading ? 'Creando...' : 'Crear competición'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <DatePickerModal
        visible={activePicker === 'start_date'}
        value={startDateStr}
        minDateStr={todayStr}
        isDark={isDark}
        onConfirm={(dateStr) => {
          setActivePicker(null);
          handleDateChange('start_date', new Date(dateStr + 'T00:00:00'));
        }}
        onCancel={() => setActivePicker(null)}
      />

      <DatePickerModal
        visible={activePicker === 'end_date'}
        value={endDateStr}
        minDateStr={startDateStr}
        isDark={isDark}
        onConfirm={(dateStr) => {
          setActivePicker(null);
          handleDateChange('end_date', new Date(dateStr + 'T00:00:00'));
        }}
        onCancel={() => setActivePicker(null)}
      />
    </View>
  );
}

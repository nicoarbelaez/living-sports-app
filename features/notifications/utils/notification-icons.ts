import {
  Heart,
  MessageCircle,
  CornerDownRight,
  Users,
  UserPlus,
} from 'lucide-react-native';
import type React from 'react';
import type { NotificationType } from '@/types/notification';

// ─── Types ────────────────────────────────────────────────────────────────────

export type IconConfig = {
  icon: React.ComponentType<{ size: number; color: string }>;
  bg: string;
  color: string;
  /** Human-readable label for the notification type (used in detail screen) */
  label: string;
};

// ─── Icon + color config per type ─────────────────────────────────────────────

export function getIconConfig(type: NotificationType, isDark: boolean): IconConfig {
  switch (type) {
    case 'like':
      return {
        icon: Heart,
        bg: isDark ? '#3f1e1e' : '#fee2e2',
        color: '#ef4444',
        label: 'Me gusta',
      };
    case 'comment':
      return {
        icon: MessageCircle,
        bg: isDark ? '#1e2f3f' : '#dbeafe',
        color: '#3b82f6',
        label: 'Comentario',
      };
    case 'response':
      return {
        icon: CornerDownRight,
        bg: isDark ? '#1e3a2f' : '#d1fae5',
        color: '#10b981',
        label: 'Respuesta',
      };
    case 'community':
      return {
        icon: Users,
        bg: isDark ? '#2f2a1e' : '#fef9c3',
        color: '#eab308',
        label: 'Comunidad',
      };
    case 'profile':
      return {
        icon: UserPlus,
        bg: isDark ? '#2e1e3f' : '#ede9fe',
        color: '#8b5cf6',
        label: 'Perfil',
      };
  }
}

// ─── Extended description per type (used in detail screen) ────────────────────

export function getTypeDescription(type: NotificationType): string {
  switch (type) {
    case 'like':
      return 'Le dio me gusta a uno de tus contenidos. Tu publicación está ganando tracción en la comunidad.';
    case 'comment':
      return 'Dejó un comentario en tu publicación. Los comentarios ayudan a construir conversaciones activas.';
    case 'response':
      return 'Respondió a uno de tus comentarios. Mantén el hilo de conversación activo.';
    case 'community':
      return 'Hay actividad nueva en una de tus comunidades. Explora lo que está pasando.';
    case 'profile':
      return 'Interactuó con tu perfil. Revisa tu red de conexiones y crece tu comunidad.';
  }
}

// ─── CTA label per type (used in detail screen) ───────────────────────────────

export function getCtaLabel(type: NotificationType): string {
  switch (type) {
    case 'community':
      return 'Ver comunidad';
    case 'profile':
      return 'Ver perfil';
    default:
      return 'Ver publicación';
  }
}

import { z } from 'zod';

export const MAX_VIDEO_DURATION_MS = 3 * 60 * 1000; // 3 minutes

export const evidenceSchema = z.object({
  prValue: z
    .string()
    .min(1, 'El valor es requerido')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Debe ser un número mayor a 0'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  videoUri: z.string().min(1, 'Selecciona un video de evidencia'),
  videoDurationMs: z
    .number()
    .max(MAX_VIDEO_DURATION_MS, 'El video no puede superar los 3 minutos')
    .optional(),
});

export type EvidenceFormValues = z.infer<typeof evidenceSchema>;

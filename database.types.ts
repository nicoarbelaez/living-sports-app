export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_roles: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: never
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: never
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      body_snapshots: {
        Row: {
          abdomen_cm: number | null
          bicep_left_cm: number | null
          bicep_right_cm: number | null
          body_fat_pct: number | null
          calf_left_cm: number | null
          calf_right_cm: number | null
          chest_cm: number | null
          created_at: string
          forearm_left_cm: number | null
          forearm_right_cm: number | null
          hips_cm: number | null
          id: string
          muscle_mass_kg: number | null
          neck_cm: number | null
          notes: string | null
          recorded_on: string
          shoulders_cm: number | null
          thigh_left_cm: number | null
          thigh_right_cm: number | null
          updated_at: string
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          abdomen_cm?: number | null
          bicep_left_cm?: number | null
          bicep_right_cm?: number | null
          body_fat_pct?: number | null
          calf_left_cm?: number | null
          calf_right_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          forearm_left_cm?: number | null
          forearm_right_cm?: number | null
          hips_cm?: number | null
          id?: string
          muscle_mass_kg?: number | null
          neck_cm?: number | null
          notes?: string | null
          recorded_on: string
          shoulders_cm?: number | null
          thigh_left_cm?: number | null
          thigh_right_cm?: number | null
          updated_at?: string
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          abdomen_cm?: number | null
          bicep_left_cm?: number | null
          bicep_right_cm?: number | null
          body_fat_pct?: number | null
          calf_left_cm?: number | null
          calf_right_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          forearm_left_cm?: number | null
          forearm_right_cm?: number | null
          hips_cm?: number | null
          id?: string
          muscle_mass_kg?: number | null
          neck_cm?: number | null
          notes?: string | null
          recorded_on?: string
          shoulders_cm?: number | null
          thigh_left_cm?: number | null
          thigh_right_cm?: number | null
          updated_at?: string
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "body_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: never
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: never
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_replies: {
        Row: {
          body: string
          comment_id: string
          created_at: string
          id: string
          is_deleted: boolean
          likes_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          comment_id: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          likes_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          comment_id?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          likes_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_replies_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reply_likes: {
        Row: {
          created_at: string
          id: number
          reply_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          reply_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          reply_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reply_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "comment_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_reply_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_reply_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          is_deleted: boolean
          likes_count: number
          post_id: string
          replies_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          likes_count?: number
          post_id: string
          replies_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          likes_count?: number
          post_id?: string
          replies_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_days: {
        Row: {
          competition_id: string
          created_at: string
          day_date: string
          day_notes: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          day_date: string
          day_notes?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          day_date?: string
          day_notes?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_days_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_entries: {
        Row: {
          approvals_count: number
          competition_day_id: string
          competition_id: string
          created_at: string
          description: string | null
          exercise_id: string
          id: string
          pr_value: number
          rejections_count: number
          resulting_pr_id: string | null
          updated_at: string
          user_id: string
          validation_status: string
          video_url: string
        }
        Insert: {
          approvals_count?: number
          competition_day_id: string
          competition_id: string
          created_at?: string
          description?: string | null
          exercise_id: string
          id?: string
          pr_value: number
          rejections_count?: number
          resulting_pr_id?: string | null
          updated_at?: string
          user_id: string
          validation_status?: string
          video_url: string
        }
        Update: {
          approvals_count?: number
          competition_day_id?: string
          competition_id?: string
          created_at?: string
          description?: string | null
          exercise_id?: string
          id?: string
          pr_value?: number
          rejections_count?: number
          resulting_pr_id?: string | null
          updated_at?: string
          user_id?: string
          validation_status?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_entries_competition_day_id_fkey"
            columns: ["competition_day_id"]
            isOneToOne: false
            referencedRelation: "competition_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_entries_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_entries_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_entries_resulting_pr_id_fkey"
            columns: ["resulting_pr_id"]
            isOneToOne: false
            referencedRelation: "personal_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_entries_resulting_pr_id_fkey"
            columns: ["resulting_pr_id"]
            isOneToOne: false
            referencedRelation: "v_personal_records_best"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_participants: {
        Row: {
          competition_id: string
          created_at: string
          id: number
          invited_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          id?: never
          invited_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          id?: never
          invited_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_participants_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_participants_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_participants_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_validations: {
        Row: {
          created_at: string
          entry_id: string
          id: number
          reason: string | null
          updated_at: string
          validator_id: string
          vote: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          id?: never
          reason?: string | null
          updated_at?: string
          validator_id: string
          vote: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: never
          reason?: string | null
          updated_at?: string
          validator_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_validations_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "competition_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_validations_validator_id_fkey"
            columns: ["validator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_validations_validator_id_fkey"
            columns: ["validator_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          exercise_id: string | null
          group_id: string
          id: string
          participant_scope: string
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          exercise_id?: string | null
          group_id: string
          id?: string
          participant_scope?: string
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          exercise_id?: string | null
          group_id?: string
          id?: string
          participant_scope?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          muscle_category_id: number
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          muscle_category_id: number
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          muscle_category_id?: number
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_muscle_category_id_fkey"
            columns: ["muscle_category_id"]
            isOneToOne: false
            referencedRelation: "muscle_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: never
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: never
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: number
          joined_at: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: never
          joined_at?: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: never
          joined_at?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      group_tag_assignments: {
        Row: {
          group_id: string
          tag_id: number
        }
        Insert: {
          group_id: string
          tag_id: number
        }
        Update: {
          group_id?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_tag_assignments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "group_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      group_tags: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string
          description: string | null
          emoji: string | null
          id: string
          image_url: string | null
          is_public: boolean
          members_count: number
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          members_count?: number
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          members_count?: number
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_categories: {
        Row: {
          created_at: string
          icon_url: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon_url?: string | null
          id?: never
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon_url?: string | null
          id?: never
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          achieved_on: string
          created_at: string
          exercise_id: string
          id: string
          media_type: string | null
          media_url: string | null
          notes: string | null
          source: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          achieved_on?: string
          created_at?: string
          exercise_id: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          notes?: string | null
          source?: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          achieved_on?: string
          created_at?: string
          exercise_id?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          notes?: string | null
          source?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: number
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          created_at: string
          duration_s: number | null
          height_px: number | null
          id: number
          media_type: string
          post_id: string
          sort_order: number
          url: string
          width_px: number | null
        }
        Insert: {
          created_at?: string
          duration_s?: number | null
          height_px?: number | null
          id?: never
          media_type: string
          post_id: string
          sort_order?: number
          url: string
          width_px?: number | null
        }
        Update: {
          created_at?: string
          duration_s?: number | null
          height_px?: number | null
          id?: never
          media_type?: string
          post_id?: string
          sort_order?: number
          url?: string
          width_px?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string | null
          comments_count: number
          created_at: string
          id: string
          is_deleted: boolean
          likes_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          comments_count?: number
          created_at?: string
          id?: string
          is_deleted?: boolean
          likes_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          comments_count?: number
          created_at?: string
          id?: string
          is_deleted?: boolean
          likes_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          dark_mode: boolean
          date_of_birth: string
          first_name: string
          followers_count: number
          following_count: number
          height_cm: number | null
          id: string
          is_complete: boolean
          is_public: boolean
          last_name: string
          phone: string | null
          sex: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          dark_mode?: boolean
          date_of_birth: string
          first_name: string
          followers_count?: number
          following_count?: number
          height_cm?: number | null
          id: string
          is_complete?: boolean
          is_public?: boolean
          last_name: string
          phone?: string | null
          sex: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          dark_mode?: boolean
          date_of_birth?: string
          first_name?: string
          followers_count?: number
          following_count?: number
          height_cm?: number | null
          id?: string
          is_complete?: boolean
          is_public?: boolean
          last_name?: string
          phone?: string | null
          sex?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          reps: number | null
          rest_seconds: number | null
          routine_id: string
          sets: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          reps?: number | null
          rest_seconds?: number | null
          routine_id: string
          sets: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          reps?: number | null
          rest_seconds?: number | null
          routine_id?: string
          sets?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_exercises_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          day_of_week: number
          description: string | null
          duration_sec: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          description?: string | null
          duration_sec?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          description?: string | null
          duration_sec?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: number
          role_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: never
          role_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: never
          role_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "app_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_social_links: {
        Row: {
          created_at: string
          id: number
          platform: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          platform: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          platform?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_social_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_social_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_public_view: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          dark_mode: boolean | null
          date_of_birth: string | null
          first_name: string | null
          followers_count: number | null
          following_count: number | null
          height_cm: number | null
          id: string | null
          is_complete: boolean | null
          is_public: boolean | null
          last_name: string | null
          phone: string | null
          sex: string | null
          updated_at: string | null
          username: string | null
        }
        Relationships: []
      }
      v_personal_records_best: {
        Row: {
          achieved_on: string | null
          exercise_id: string | null
          id: string | null
          media_type: string | null
          media_url: string | null
          source: string | null
          user_id: string | null
          value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_view_full_profile: {
        Args: { p_profile_id: string }
        Returns: boolean
      }
      can_view_user_content: { Args: { p_user_id: string }; Returns: boolean }
      has_role: { Args: { p_role: string }; Returns: boolean }
      is_group_member: { Args: { p_group_id: string }; Returns: boolean }
      resubmit_entry: {
        Args: {
          p_description: string
          p_entry_id: string
          p_pr_value: number
          p_video_url: string
        }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'admin' | 'voter'
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role: 'admin' | 'voter'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'admin' | 'voter'
          created_at?: string
        }
      }
      elections: {
        Row: {
          id: string
          admin_id: string | null
          name: string
          description: string | null
          status: 'upcoming' | 'ongoing' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          name: string
          description?: string | null
          status: 'upcoming' | 'ongoing' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          name?: string
          description?: string | null
          status?: 'upcoming' | 'ongoing' | 'completed'
          created_at?: string
        }
      }
      election_phases: {
        Row: {
          id: string
          election_id: string | null
          phase: 'registration' | 'commit' | 'reveal' | 'results'
          start_time: string
          end_time: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          election_id?: string | null
          phase: 'registration' | 'commit' | 'reveal' | 'results'
          start_time: string
          end_time: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          election_id?: string | null
          phase?: 'registration' | 'commit' | 'reveal' | 'results'
          start_time?: string
          end_time?: string
          is_active?: boolean
          created_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          election_id: string | null
          name: string
          party_name: string | null
          symbol: string | null
          logo_url: string | null
          photo_url: string | null
          biography: string | null
          created_at: string
        }
        Insert: {
          id?: string
          election_id?: string | null
          name: string
          party_name?: string | null
          symbol?: string | null
          logo_url?: string | null
          photo_url?: string | null
          biography?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          election_id?: string | null
          name?: string
          party_name?: string | null
          symbol?: string | null
          logo_url?: string | null
          photo_url?: string | null
          biography?: string | null
          created_at?: string
        }
      }
      candidate_manifestos: {
        Row: {
          id: string
          candidate_id: string | null
          vision_statement: string | null
          policy_points: string | null
          campaign_promises: string | null
          created_at: string
        }
        Insert: {
          id?: string
          candidate_id?: string | null
          vision_statement?: string | null
          policy_points?: string | null
          campaign_promises?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string | null
          vision_statement?: string | null
          policy_points?: string | null
          campaign_promises?: string | null
          created_at?: string
        }
      }
      election_voters: {
        Row: {
          id: string
          election_id: string | null
          voter_id: string | null
          is_eligible: boolean
          has_committed: boolean
          has_revealed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          election_id?: string | null
          voter_id?: string | null
          is_eligible?: boolean
          has_committed?: boolean
          has_revealed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          election_id?: string | null
          voter_id?: string | null
          is_eligible?: boolean
          has_committed?: boolean
          has_revealed?: boolean
          created_at?: string
        }
      }
      election_blockchain_map: {
        Row: {
          election_id: string
          contract_address: string
          chain_name: string | null
          created_at: string
        }
        Insert: {
          election_id: string
          contract_address: string
          chain_name?: string | null
          created_at?: string
        }
        Update: {
          election_id?: string
          contract_address?: string
          chain_name?: string | null
          created_at?: string
        }
      }
      admin_election_stats: {
        Row: {
          admin_id: string
          upcoming_count: number
          ongoing_count: number
          completed_count: number
          updated_at: string
        }
        Insert: {
          admin_id: string
          upcoming_count?: number
          ongoing_count?: number
          completed_count?: number
          updated_at?: string
        }
        Update: {
          admin_id?: string
          upcoming_count?: number
          ongoing_count?: number
          completed_count?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

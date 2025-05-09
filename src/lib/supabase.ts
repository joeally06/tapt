import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function isAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (error || !data) return false;
  return data.role === 'admin';
}

export async function getBoardMembers() {
  const { data, error } = await supabase
    .from('board_members')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data;
}

export async function updateBoardMember(id: string, updates: any) {
  const { data, error } = await supabase
    .from('board_members')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function createBoardMember(member: any) {
  const { data, error } = await supabase
    .from('board_members')
    .insert(member)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteBoardMember(id: string) {
  const { error } = await supabase
    .from('board_members')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Authentication functions
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) throw error;
  return data;
};

export const signInWithGithub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
  });
  if (error) throw error;
  return data;
};

export const logOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const onAuthChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
  // Return unsubscribe function
  return () => subscription.unsubscribe();
};

// Database functions
export const saveCalculation = async (userId, calculation) => {
  try {
    const { data, error } = await supabase
      .from('calculations')
      .insert([{
        user_id: userId,
        expression: calculation.expression,
        result_inches: calculation.resultInches,
        result_decimal: calculation.resultDecimal,
        result_fraction: calculation.resultFraction,
        timestamp: calculation.timestamp || Date.now(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error saving calculation:', error);
    throw error;
  }
};

export const getCalculations = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('calculations')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    // Transform to match Firebase format
    return data.map(calc => ({
      id: calc.id,
      expression: calc.expression,
      resultInches: calc.result_inches,
      resultDecimal: calc.result_decimal,
      resultFraction: calc.result_fraction,
      timestamp: calc.timestamp,
    }));
  } catch (error) {
    console.error('Error fetching calculations:', error);
    return [];
  }
};

export const deleteCalculation = async (userId, calcId) => {
  try {
    const { error } = await supabase
      .from('calculations')
      .delete()
      .eq('id', calcId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting calculation:', error);
    throw error;
  }
};

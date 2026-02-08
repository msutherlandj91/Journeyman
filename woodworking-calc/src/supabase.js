import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: { persistSession: true }
});

// Authentication functions
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });
  if (error) throw error;
  return data;
};

export const signInWithGithub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
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

// Database functions with error handling
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

    return {
      success: true,
      data: data.id,
      error: null,
      isNetworkError: false
    };
  } catch (error) {
    console.error('Error saving calculation:', error);
    const isNetworkError =
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch') ||
      !navigator.onLine;

    return {
      success: false,
      data: null,
      error,
      isNetworkError
    };
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
    const transformedData = data.map(calc => ({
      id: calc.id,
      expression: calc.expression,
      resultInches: calc.result_inches,
      resultDecimal: calc.result_decimal,
      resultFraction: calc.result_fraction,
      timestamp: calc.timestamp,
    }));

    return {
      success: true,
      data: transformedData,
      error: null,
      isNetworkError: false
    };
  } catch (error) {
    console.error('Error fetching calculations:', error);
    const isNetworkError =
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch') ||
      !navigator.onLine;

    return {
      success: false,
      data: [],
      error,
      isNetworkError
    };
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

    return {
      success: true,
      data: null,
      error: null,
      isNetworkError: false
    };
  } catch (error) {
    console.error('Error deleting calculation:', error);
    const isNetworkError =
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch') ||
      !navigator.onLine;

    return {
      success: false,
      data: null,
      error,
      isNetworkError
    };
  }
};

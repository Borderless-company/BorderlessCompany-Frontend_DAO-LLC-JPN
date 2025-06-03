// Supabaseクライアントのモック
export const mockSupabaseResponse = {
  data: null,
  error: null,
};

export const mockSupabaseFrom = {
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      single: jest.fn(() => Promise.resolve(mockSupabaseResponse)),
      maybeSingle: jest.fn(() => Promise.resolve(mockSupabaseResponse)),
    })),
    single: jest.fn(() => Promise.resolve(mockSupabaseResponse)),
    limit: jest.fn(() => Promise.resolve(mockSupabaseResponse)),
  })),
  insert: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve(mockSupabaseResponse)),
    single: jest.fn(() => Promise.resolve(mockSupabaseResponse)),
  })),
  upsert: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve(mockSupabaseResponse)),
    single: jest.fn(() => Promise.resolve(mockSupabaseResponse)),
  })),
  update: jest.fn(() => ({
    eq: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve(mockSupabaseResponse)),
      single: jest.fn(() => Promise.resolve(mockSupabaseResponse)),
    })),
  })),
  delete: jest.fn(() => ({
    eq: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve(mockSupabaseResponse)),
    })),
  })),
};

export const mockSupabaseClient = {
  from: jest.fn(() => mockSupabaseFrom),
  auth: {
    getUser: jest.fn(() =>
      Promise.resolve({ data: { user: null }, error: null })
    ),
    signInWithPassword: jest.fn(() =>
      Promise.resolve({ data: null, error: null })
    ),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
  },
};

// createClient関数のモック
export const createClient = jest.fn(() => mockSupabaseClient);

// デフォルトエクスポート
const supabase = {
  createClient,
  mockSupabaseClient,
  mockSupabaseFrom,
  mockSupabaseResponse,
};

export default supabase;

// Cấu hình Supabase
const SUPABASE_URL = 'https://mpsfrizrnsvphmropabs.supabase.co'; // Thay thế bằng URL thực tế
const SUPABASE_KEY = 'sb_secret_R5oEidUvdPF-bDwqCeFtiQ_1lm19Elv'; // Thay thế bằng API key thực tế

// Khởi tạo client Supabase
 window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// SQL để tạo hàm tìm kiếm với pg_trgm trong Supabase
/*
-- Đảm bảo extension pg_trgm đã được cài đặt
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tạo hàm tìm kiếm sử dụng pg_trgm
CREATE OR REPLACE FUNCTION search_huonglinh(search_term TEXT, limit_results INT DEFAULT 20)
RETURNS SETOF huonglinh AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM huonglinh
  WHERE 
    hoten_die ILIKE '%' || search_term || '%' OR
    hoten_owner ILIKE '%' || search_term || '%' OR
    sdt ILIKE '%' || search_term || '%'
  ORDER BY 
    GREATEST(
      similarity(hoten_die, search_term),
      similarity(hoten_owner, search_term),
      similarity(sdt, search_term)
    ) DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/
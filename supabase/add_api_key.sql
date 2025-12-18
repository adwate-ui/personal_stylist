-- Add gemini_api_key to profiles table
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'gemini_api_key') then
    alter table profiles add column gemini_api_key text;
  end if;
end $$;

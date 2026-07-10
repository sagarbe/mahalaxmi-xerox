// Supabase Configuration

const SUPABASE_URL = "https://xtwffnvrykavuorvzpjj.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0d2ZmbnZyeWthdnVvcnZ6cGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2ODI3MzUsImV4cCI6MjA5OTI1ODczNX0.kioSLl0LdUUvC02gdCHDstn4J2eBUVW_Nuo7JJeDXjo";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase Connected");

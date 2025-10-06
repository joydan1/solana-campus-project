import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://llsemobzuoxpoxyccgao.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsc2Vtb2J6dW94cG94eWNjZ2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0OTg3NDUsImV4cCI6MjA3NTA3NDc0NX0.UpLcRSQZ3t--H-u9qiFJpUS4NuLwtAQfM-g7DVNSssY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

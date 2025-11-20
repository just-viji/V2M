
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://puhdpivnergywwsavtwt.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aGRwaXZuZXJneXd3c2F2dHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDg2MzEsImV4cCI6MjA3ODE4NDYzMX0.cA58qGmornKofq3OMiFPUX7rWEZqA9fKvRo2YEhMEF0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

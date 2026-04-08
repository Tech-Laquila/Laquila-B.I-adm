
import { createClient } from "./lib/supabase/server";

async function checkSchema() {
    const supabase = await createClient();

    console.log("--- Checking facebook_ads ---");
    const { data: ads, error: adsError } = await supabase.from("facebook_ads").select("*").limit(1);
    if (adsError) console.error("Error ads:", adsError);
    else console.log("Sample Ad:", ads[0]);

    console.log("\n--- Checking leads ---");
    const { data: leads, error: leadsError } = await supabase.from("leads").select("*").limit(1);
    if (leadsError) console.error("Error leads:", leadsError);
    else console.log("Sample Lead:", leads[0]);

    console.log("\n--- Checking empresas ---");
    const { data: emp, error: empError } = await supabase.from("empresas").select("*").limit(5);
    if (empError) console.error("Error empresas:", empError);
    else console.log("Empresas:", emp);
}

checkSchema();

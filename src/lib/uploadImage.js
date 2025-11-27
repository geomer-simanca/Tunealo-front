import { supabase } from "./supabaseClient";

export async function uploadImage(file) {
    const fileName = `${Date.now()}-${file.name}`;

    // Subir imagen al bucket "productos"
    const { data, error } = await supabase.storage
        .from("Productos")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
        });

    if (error) throw error;

    // Obtener URL pública
    const { data: urlData } = supabase.storage
        .from("Productos")
        .getPublicUrl(fileName);

    return urlData.publicUrl;
}


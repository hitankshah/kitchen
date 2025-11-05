import { supabase } from "../config/supabase.js";
import fs from 'fs'

// all food list
const listFood = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data: data || [] })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching food items" })
    }
}

// add food
const addFood = async (req, res) => {
    try {
        let image_filename = `${req.file.filename}`;
        const bucketName = process.env.SUPABASE_BUCKET_NAME || 'restaurant-images';

        // Upload image to Supabase Storage
        const filePath = `menu-items/${Date.now()}-${req.file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, req.file.buffer || fs.readFileSync(req.file.path), {
                contentType: req.file.mimetype,
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        // Insert menu item into database
        const { data, error } = await supabase
            .from('menu_items')
            .insert({
                name: req.body.name,
                description: req.body.description,
                price: Number(req.body.price),
                category: req.body.category,
                image_url: publicUrl,
                is_available: true,
                is_vegetarian: false
            })
            .select();

        if (error) throw error;

        // Clean up local file if exists
        if (req.file.path) {
            fs.unlink(req.file.path, () => { });
        }

        res.json({ success: true, message: "Food Added", data: data[0] })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding food" })
    }
}

// delete food
const removeFood = async (req, res) => {
    try {
        const { data: food, error: fetchError } = await supabase
            .from('menu_items')
            .select('*')
            .eq('id', req.body.id)
            .single();

        if (fetchError) throw fetchError;

        // Delete from database
        const { error: deleteError } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', req.body.id);

        if (deleteError) throw deleteError;

        // Optionally delete image from storage
        if (food.image_url) {
            const bucketName = process.env.SUPABASE_BUCKET_NAME || 'restaurant-images';
            const imagePath = food.image_url.split('/').slice(-2).join('/');
            await supabase.storage.from(bucketName).remove([imagePath]);
        }

        res.json({ success: true, message: "Food Removed" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing food" })
    }
}

export { listFood, addFood, removeFood }
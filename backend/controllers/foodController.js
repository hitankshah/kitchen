import { supabase } from "../config/supabase.js";
import fs from 'fs'

// all food list
const listFood = async (req, res) => {
    try {
        console.log('Fetching food items from items table...');
        
        const { data, error } = await supabase
            .from('items')
            .select(`
                *,
                menu_item_images(image_url, image_order),
                categories(name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('Fetched items:', data?.length || 0);

        // Format response to match frontend expectations
        const formattedData = data?.map(item => ({
            ...item,
            image_url: item.menu_item_images?.[0]?.image_url || '',
            category: item.categories?.name || ''
        })) || [];

        console.log('Formatted data:', formattedData.length, 'items');

        res.json({ success: true, data: formattedData })
    } catch (error) {
        console.error('Error fetching food items:', error.message);
        console.error('Full error:', error);
        
        // Return detailed error in development
        res.status(500).json({ 
            success: false, 
            message: "Error fetching food items", 
            error: error.message,
            details: error.details || '',
            hint: error.hint || 'Check if tables exist in Supabase',
            code: error.code || ''
        })
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

        // Get category_id from category name
        const { data: categoryData } = await supabase
            .from('categories')
            .select('id')
            .eq('name', req.body.category)
            .single();

        // Insert menu item into database
        const { data, error } = await supabase
            .from('items')
            .insert({
                name: req.body.name,
                description: req.body.description,
                price: Number(req.body.price),
                category_id: categoryData?.id,
                is_vegetarian: req.body.is_vegetarian || false,
                is_anytime_available: req.body.is_anytime_available || false
            })
            .select()
            .single();

        if (error) throw error;

        // Insert image into menu_item_images table
        await supabase
            .from('menu_item_images')
            .insert({
                menu_item_id: data.id,
                image_url: publicUrl,
                image_order: 0
            });

        // Clean up local file if exists
        if (req.file.path) {
            fs.unlink(req.file.path, () => { });
        }

        res.json({ success: true, message: "Food Added", data: { ...data, image_url: publicUrl } })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding food" })
    }
}

// delete food
const removeFood = async (req, res) => {
    try {
        // Get images before deleting
        const { data: images } = await supabase
            .from('menu_item_images')
            .select('image_url')
            .eq('menu_item_id', req.body.id);

        // Delete from database (cascade will delete images)
        const { error: deleteError } = await supabase
            .from('items')
            .delete()
            .eq('id', req.body.id);

        if (deleteError) throw deleteError;

        // Delete images from storage
        if (images && images.length > 0) {
            const bucketName = process.env.SUPABASE_BUCKET_NAME || 'restaurant-images';
            const imagePaths = images.map(img => img.image_url.split('/').slice(-2).join('/'));
            await supabase.storage.from(bucketName).remove(imagePaths);
        }

        res.json({ success: true, message: "Food Removed" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing food" })
    }
}

export { listFood, addFood, removeFood }
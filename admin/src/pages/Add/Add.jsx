import React, { useState, useEffect } from 'react'
import './Add.css'
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import { menuItemApi, categoryApi } from '../../lib/api';
import { uploadFile, supabase } from '../../lib/supabase';

const Add = () => {
    const [image, setImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: ""
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await categoryApi.getCategories();
            setCategories(data);
            // Set first category as default if available
            if (data.length > 0 && !data.category) {
                setData(prev => ({ ...prev, category: data[0].name }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!image) {
            toast.error('Image not selected');
            return null;
        }

        setLoading(true);

        try {
            // Upload image to Supabase Storage
            const timestamp = Date.now();
            const imagePath = `menu-items/${timestamp}-${image.name}`;
            const imageUrl = await uploadFile(image, imagePath);

            // Get category_id from category name
            const category = categories.find(c => c.name === data.category);
            if (!category) {
                throw new Error('Invalid category selected');
            }

            // Create menu item in Supabase
            const menuItem = {
                name: data.name,
                description: data.description,
                price: Number(data.price),
                category_id: category.id,
                is_vegetarian: false,
                is_anytime_available: false
            };

            const createdItem = await menuItemApi.createMenuItem(menuItem);
            
            // Add image to menu_item_images table
            const { error: imageError } = await supabase
                .from('menu_item_images')
                .insert({
                    menu_item_id: createdItem.id,
                    image_url: imageUrl,
                    image_order: 0
                });

            if (imageError) throw imageError;
            
            toast.success('Menu item added successfully!');
            setData({
                name: "",
                description: "",
                price: "",
                category: data.category
            });
            setImage(false);
        } catch (error) {
            console.error('Error adding menu item:', error);
            toast.error(error.message || 'Failed to add menu item');
        } finally {
            setLoading(false);
        }
    }

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className='add-img-upload flex-col'>
                    <p>Upload image</p>
                    <input onChange={(e) => { setImage(e.target.files[0]); e.target.value = '' }} type="file" accept="image/*" id="image" hidden />
                    <label htmlFor="image">
                        <img src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
                    </label>
                </div>
                <div className='add-product-name flex-col'>
                    <p>Product name</p>
                    <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Type here' required />
                </div>
                <div className='add-product-description flex-col'>
                    <p>Product description</p>
                    <textarea name='description' onChange={onChangeHandler} value={data.description} type="text" rows={6} placeholder='Write content here' required />
                </div>
                <div className='add-category-price'>
                    <div className='add-category flex-col'>
                        <p>Product category</p>
                        <select name='category' onChange={onChangeHandler} value={data.category} required>
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        {categories.length === 0 && (
                            <p style={{fontSize: '12px', color: '#f44336', marginTop: '5px'}}>
                                No categories available. Please create categories first.
                            </p>
                        )}
                    </div>
                    <div className='add-price flex-col'>
                        <p>Product Price</p>
                        <input type="Number" name='price' onChange={onChangeHandler} value={data.price} placeholder='25' />
                    </div>
                </div>
                <button type='submit' className='add-btn' disabled={loading}>
                    {loading ? 'ADDING...' : 'ADD'}
                </button>
            </form>
        </div>
    )
}

export default Add

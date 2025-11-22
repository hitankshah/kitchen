import { supabase } from "../config/supabase.js";

//config variables
const currency = "inr";
const deliveryCharge = 50;
const frontend_URL = 'https://kitchen-peach.vercel.app';

// Placing User Order for Frontend using Foxy hosted checkout
const placeOrder = async (req, res) => {
    try {
        // Create order in Supabase
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: req.body.userId,
                total_amount: req.body.amount,
                status: 'pending',
                payment_method: req.body.paymentMethod || 'foxy',
                payment_status: 'pending',
                delivery_address: typeof req.body.address === 'string' 
                    ? req.body.address 
                    : `${req.body.address.street}, ${req.body.address.city}, ${req.body.address.state} ${req.body.address.zipCode}`,
                customer_name: req.body.address.firstName + ' ' + req.body.address.lastName || '',
                customer_email: req.body.address.email || '',
                customer_phone: req.body.address.phone || ''
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = req.body.items.map(item => ({
            order_id: orderData.id,
            menu_item_id: item._id || item.id,
            quantity: item.quantity,
            price: item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // Clear user's cart
        await supabase
            .from('users')
            .update({ cart_data: {} })
            .eq('id', req.body.userId);

        // If payment method is Foxy, prepare a hosted checkout payload
        const paymentMethod = req.body.paymentMethod || 'foxy';

        if (paymentMethod === 'foxy') {
            // Build Foxy form fields (item_name_X, item_price_X, item_quantity_X)
            const fields = {};
            req.body.items.forEach((item, idx) => {
                const i = idx + 1;
                fields[`item_name_${i}`] = item.name;
                fields[`item_price_${i}`] = item.price;
                fields[`item_quantity_${i}`] = item.quantity;
            });

            // Add delivery as an additional item
            const deliveryIndex = req.body.items.length + 1;
            fields[`item_name_${deliveryIndex}`] = 'Delivery Charge';
            fields[`item_price_${deliveryIndex}`] = deliveryCharge;
            fields[`item_quantity_${deliveryIndex}`] = 1;

            // Standard Foxy fields - merchant should configure store URL in env
            fields['order_id'] = orderData.id;
            fields['total'] = req.body.amount;
            fields['customer_email'] = req.body.address.email || '';
            fields['customer_name'] = `${req.body.address.firstName || ''} ${req.body.address.lastName || ''}`.trim();
            fields['customer_phone'] = req.body.address.phone || '';

            const foxyUrl = process.env.FOXY_CHECKOUT_URL || '';

            if (!foxyUrl) {
                console.warn('FOXY_CHECKOUT_URL is not set in environment variables');
                return res.json({ success: false, message: 'Payment gateway not configured' });
            }

            // Return redirect instructions to frontend (it will create and submit a form)
            return res.json({ success: true, redirect: { method: 'post', url: foxyUrl, fields } });
        }

        // Fallback: if other payment methods are used, respond with generic message
        res.json({ success: true, message: 'Order placed (no external payment required)' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error placing order" })
    }
}

// Placing User Order for Frontend using COD
const placeOrderCod = async (req, res) => {
    try {
        // Create order in Supabase
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: req.body.userId,
                total_amount: req.body.amount,
                status: 'confirmed',
                payment_method: 'cod',
                payment_status: 'pending',
                delivery_address: typeof req.body.address === 'string' 
                    ? req.body.address 
                    : `${req.body.address.street}, ${req.body.address.city}, ${req.body.address.state} ${req.body.address.zipCode}`,
                customer_name: req.body.address.firstName + ' ' + req.body.address.lastName || '',
                customer_email: req.body.address.email || '',
                customer_phone: req.body.address.phone || ''
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = req.body.items.map(item => ({
            order_id: orderData.id,
            menu_item_id: item._id || item.id,
            quantity: item.quantity,
            price: item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // Clear user's cart
        await supabase
            .from('users')
            .update({ cart_data: {} })
            .eq('id', req.body.userId);

        res.json({ success: true, message: "Order Placed" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error placing order" })
    }
}

// Listing Order for Admin panel
const listOrders = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items(
                    *,
                    menu_items(*)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data: data || [] })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching orders" })
    }
}

// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items(
                    *,
                    menu_items(*)
                )
            `)
            .eq('user_id', req.body.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data: data || [] })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching user orders" })
    }
}

const updateStatus = async (req, res) => {
    console.log(req.body);
    try {
        const { error } = await supabase
            .from('orders')
            .update({ status: req.body.status })
            .eq('id', req.body.orderId);

        if (error) throw error;

        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating status" })
    }
}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            const { error } = await supabase
                .from('orders')
                .update({ payment_status: 'completed' })
                .eq('id', orderId);

            if (error) throw error;

            res.json({ success: true, message: "Paid" })
        }
        else {
            // Delete order if payment failed
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;

            res.json({ success: false, message: "Not Paid" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Not Verified" })
    }
}

export { placeOrder, listOrders, userOrders, updateStatus, verifyOrder, placeOrderCod }
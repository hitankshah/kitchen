import { supabase } from "../config/supabase.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//config variables
const currency = "inr";
const deliveryCharge = 50;
const frontend_URL = 'https://kitchen-peach.vercel.app';

// Placing User Order for Frontend using stripe
const placeOrder = async (req, res) => {
    try {
        // Create order in Supabase
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: req.body.userId,
                total_amount: req.body.amount,
                status: 'pending',
                payment_method: 'stripe',
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

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery Charge"
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${frontend_URL}/verify?success=true&orderId=${orderData.id}`,
            cancel_url: `${frontend_URL}/verify?success=false&orderId=${orderData.id}`,
            line_items: line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });

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
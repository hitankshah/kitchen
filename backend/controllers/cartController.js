import { supabase } from "../config/supabase.js";

// add to user cart  
const addToCart = async (req, res) => {
   try {
      const { data: userData, error: userError } = await supabase
         .from('users')
         .select('cart_data')
         .eq('id', req.body.userId)
         .single();

      if (userError) throw userError;

      let cartData = userData.cart_data || {};
      
      if (!cartData[req.body.itemId]) {
         cartData[req.body.itemId] = 1;
      }
      else {
         cartData[req.body.itemId] += 1;
      }

      const { error: updateError } = await supabase
         .from('users')
         .update({ cart_data: cartData })
         .eq('id', req.body.userId);

      if (updateError) throw updateError;

      res.json({ success: true, message: "Added To Cart" });
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error adding to cart" })
   }
}

// remove food from user cart
const removeFromCart = async (req, res) => {
   try {
      const { data: userData, error: userError } = await supabase
         .from('users')
         .select('cart_data')
         .eq('id', req.body.userId)
         .single();

      if (userError) throw userError;

      let cartData = userData.cart_data || {};

      if (cartData[req.body.itemId] > 0) {
         cartData[req.body.itemId] -= 1;
      }

      const { error: updateError } = await supabase
         .from('users')
         .update({ cart_data: cartData })
         .eq('id', req.body.userId);

      if (updateError) throw updateError;

      res.json({ success: true, message: "Removed From Cart" });
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error removing from cart" })
   }
}

// get user cart
const getCart = async (req, res) => {
   try {
      const { data: userData, error } = await supabase
         .from('users')
         .select('cart_data')
         .eq('id', req.body.userId)
         .single();

      if (error) throw error;

      res.json({ success: true, cartData: userData.cart_data || {} });
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error fetching cart" })
   }
}


export { addToCart, removeFromCart, getCart }
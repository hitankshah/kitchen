import { supabase } from "./supabase";

// Menu Item API
export const menuItemApi = {
  getMenuItems: async () => {
    console.log('🔍 Fetching menu items...');
    const session = await supabase.auth.getSession();
    console.log('Auth session:', session?.data?.session ? 'Authenticated' : 'Not authenticated');
    console.log('User:', session?.data?.session?.user?.email);
    
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching menu items:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('✅ Menu items fetched:', data?.length || 0, 'items');
    return data || [];
  },

  getMenuItem: async (itemId) => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", itemId)
      .single();
    if (error) throw error;
    return data;
  },

  createMenuItem: async (item) => {
    const { data, error } = await supabase
      .from("menu_items")
      .insert(item)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  updateMenuItem: async (itemId, item) => {
    const { data, error } = await supabase
      .from("menu_items")
      .update(item)
      .eq("id", itemId)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  deleteMenuItem: async (itemId) => {
    console.log('API: Deleting menu item with ID:', itemId);
    
    if (!itemId) {
      throw new Error('Item ID is required for deletion');
    }

    // First check if item exists
    const { data: existingItem, error: fetchError } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", itemId)
      .single();
    
    if (fetchError) {
      console.error('Error checking if item exists:', fetchError);
      throw new Error(`Item not found: ${fetchError.message}`);
    }
    
    console.log('Found item to delete:', existingItem);

    // Try delete with explicit return
    const { data, error, count } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", itemId)
      .select();
    
    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
    
    console.log('Delete response - data:', data, 'count:', count);
    
    // Verify deletion
    const { data: checkDeleted, error: checkError } = await supabase
      .from("menu_items")
      .select("id")
      .eq("id", itemId)
      .maybeSingle();
    
    if (checkDeleted) {
      console.error('WARNING: Item still exists after delete!', checkDeleted);
      throw new Error('Item was not deleted from database');
    }
    
    console.log('Verified: Item successfully deleted from database');
    return { success: true, deletedItem: data?.[0] };
  },
};

// Order API
export const orderApi = {
  getOrders: async () => {
    console.log('🔍 Fetching orders...');
    const session = await supabase.auth.getSession();
    console.log('Auth session:', session?.data?.session ? 'Authenticated' : 'Not authenticated');
    
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching orders:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('✅ Orders fetched:', data?.length || 0, 'items');
    return data || [];
  },

  getOrder: async (orderId) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();
    if (error) throw error;
    return data;
  },

  createOrder: async (order) => {
    const { data, error } = await supabase
      .from("orders")
      .insert(order)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  updateOrder: async (orderId, order) => {
    const { data, error } = await supabase
      .from("orders")
      .update(order)
      .eq("id", orderId)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  updateOrderStatus: async (orderId, status) => {
    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  deleteOrder: async (orderId) => {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);
    if (error) throw error;
    return true;
  },
};

// Order Item API
export const orderItemApi = {
  getOrderItems: async (orderId) => {
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    if (error) throw error;
    return data || [];
  },

  createOrderItem: async (item) => {
    const { data, error } = await supabase
      .from("order_items")
      .insert(item)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  deleteOrderItem: async (itemId) => {
    const { error } = await supabase
      .from("order_items")
      .delete()
      .eq("id", itemId);
    if (error) throw error;
    return true;
  },
};

// User API
export const userApi = {
  getUsers: async () => {
    console.log('🔍 Fetching users...');
    const session = await supabase.auth.getSession();
    console.log('Auth session:', session?.data?.session ? 'Authenticated' : 'Not authenticated');
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('✅ Users fetched:', data?.length || 0, 'items');
    return data || [];
  },

  getUser: async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  },

  updateUser: async (userId, user) => {
    const { data, error } = await supabase
      .from("users")
      .update(user)
      .eq("id", userId)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  deleteUser: async (userId) => {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);
    if (error) throw error;
    return true;
  },
};

// Stats API for Dashboard
export const statsApi = {
  getDashboardStats: async () => {
    try {
      // Get total orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total_amount, status");
      if (ordersError) throw ordersError;

      // Get total menu items
      const { data: menuItems, error: itemsError } = await supabase
        .from("menu_items")
        .select("id");
      if (itemsError) throw itemsError;

      // Get total users
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id")
        .eq("role", "customer");
      if (usersError) throw usersError;

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      const totalMenuItems = menuItems?.length || 0;
      const totalUsers = users?.length || 0;

      return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalMenuItems,
        totalUsers
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getRecentOrders: async (limit = 5) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },
};

// Category API
export const categoryApi = {
  getCategories: async () => {
    console.log('🔍 Fetching categories...');
    console.log('Auth session:', await supabase.auth.getSession());
    
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching categories:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('✅ Categories fetched:', data?.length || 0, 'items');
    return data || [];
  },

  createCategory: async (category) => {
    const { data, error } = await supabase
      .from("categories")
      .insert(category)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  updateCategory: async (categoryId, category) => {
    const { data, error } = await supabase
      .from("categories")
      .update(category)
      .eq("id", categoryId)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  deleteCategory: async (categoryId) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);
    if (error) throw error;
    return true;
  },
};

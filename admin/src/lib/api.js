import { supabase } from "./supabase";

// Menu Item API
export const menuItemApi = {
  getMenuItems: async () => {
    console.log('🔍 Fetching menu items...');
    const session = await supabase.auth.getSession();
    console.log('Auth session:', session?.data?.session ? 'Authenticated' : 'Not authenticated');
    console.log('User:', session?.data?.session?.user?.email);
    
    const { data, error } = await supabase
      .from("items")
      .select(`
        *,
        menu_item_images(image_url, image_order),
        categories(name)
      `)
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
    
    // Format data to match old structure
    const formattedData = data?.map(item => ({
      ...item,
      image_url: item.menu_item_images?.[0]?.image_url || '',
      category: item.categories?.name || ''
    })) || [];
    
    console.log('✅ Menu items fetched:', formattedData?.length || 0, 'items');
    return formattedData;
  },

  getMenuItem: async (itemId) => {
    const { data, error } = await supabase
      .from("items")
      .select(`
        *,
        menu_item_images(image_url, image_order),
        categories(name)
      `)
      .eq("id", itemId)
      .single();
    if (error) throw error;
    return {
      ...data,
      image_url: data.menu_item_images?.[0]?.image_url || '',
      category: data.categories?.name || ''
    };
  },

  createMenuItem: async (item) => {
    const { data, error } = await supabase
      .from("items")
      .insert(item)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  updateMenuItem: async (itemId, item) => {
    const { data, error } = await supabase
      .from("items")
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

    // Get images before deleting (cascade will delete them)
    const { data: images } = await supabase
      .from("menu_item_images")
      .select("image_url")
      .eq("menu_item_id", itemId);
    
    console.log('Found images to delete:', images);

    // Delete from database (cascade will delete images)
    const { error: deleteError } = await supabase
      .from("items")
      .delete()
      .eq("id", itemId);
    
    if (deleteError) {
      console.error('Error deleting item:', deleteError);
      throw new Error(`Failed to delete: ${deleteError.message}`);
    }
    
    console.log('Item deleted successfully');
    return { success: true };
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
      .select(`
        *,
        order_items(*)
      `)
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
      .update({ order_status: status, updated_at: new Date().toISOString() })
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

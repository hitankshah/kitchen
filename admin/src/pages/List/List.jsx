import React, { useEffect, useState } from 'react'
import './List.css'
import { currency, assets } from '../../assets/assets'
import { toast } from 'react-toastify';
import { menuItemApi, categoryApi } from '../../lib/api';
import { uploadFile } from '../../lib/supabase';

const List = () => {

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });

  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await menuItemApi.getMenuItems();
      console.log('Fetched menu items:', data); // Debug log
      setList(data || []); // Ensure we set an array
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
      setList([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  const removeFood = async (foodId) => {
    console.log('=== DELETE OPERATION START ===');
    console.log('Attempting to delete item with ID:', foodId);
    console.log('Item type:', typeof foodId);
    
    if (!foodId) {
      toast.error('Invalid item ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this item?')) {
      console.log('User cancelled deletion');
      return;
    }

    try {
      setDeletingId(foodId);
      console.log('Calling deleteMenuItem API...');
      
      const result = await menuItemApi.deleteMenuItem(foodId);
      console.log('API returned:', result);
      
      if (result.success) {
        console.log('✅ Delete confirmed successful, updating UI...');
        
        // Immediately remove from UI
        setList(prevList => {
          const newList = prevList.filter(item => item.id !== foodId);
          console.log(`Removed from UI. Old count: ${prevList.length}, New count: ${newList.length}`);
          return newList;
        });
        
        toast.success('Menu item permanently deleted from database!');
        
        // Refresh from server to ensure consistency
        setTimeout(() => {
          console.log('Refreshing list from server...');
          fetchList();
        }, 1000);
      } else {
        throw new Error('Delete operation did not return success');
      }
      
    } catch (error) {
      console.error('❌ Error deleting menu item:', error);
      toast.error(`Failed to delete: ${error.message || 'Unknown error'}`);
      // Refresh list to restore item if delete failed
      fetchList();
    } finally {
      setDeletingId(null);
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category
    });
    setEditImage(null);
    setShowEditModal(true);
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let imageUrl = editingItem.image_url;

      // Upload new image if selected
      if (editImage) {
        const timestamp = Date.now();
        const imagePath = `menu-items/${timestamp}-${editImage.name}`;
        imageUrl = await uploadFile(editImage, imagePath);
      }

      const updatedItem = {
        name: editData.name,
        description: editData.description,
        price: Number(editData.price),
        category: editData.category,
        image_url: imageUrl
      };

      await menuItemApi.updateMenuItem(editingItem.id, updatedItem);
      toast.success('Menu item updated successfully');
      setShowEditModal(false);
      setEditingItem(null);
      setEditImage(null);
      await fetchList();
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setEditImage(null);
  }

  useEffect(() => {
    fetchList();
    fetchCategories();
  }, [])

  const deleteAllItems = async () => {
    if (list.length === 0) {
      toast.error('No items to delete');
      return;
    }

    const confirmMessage = `Are you sure you want to delete ALL ${list.length} menu items?\n\nThis action CANNOT be undone!`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const doubleConfirm = window.prompt('Type "DELETE ALL" to confirm:', '');
    if (doubleConfirm !== 'DELETE ALL') {
      toast.error('Deletion cancelled');
      return;
    }

    try {
      setLoading(true);
      toast.info('Deleting all items... Please wait.');

      // Delete all items
      const deletePromises = list.map(item => menuItemApi.deleteMenuItem(item.id));
      await Promise.all(deletePromises);

      setList([]);
      toast.success(`Successfully deleted all ${list.length} menu items!`);
    } catch (error) {
      console.error('Error deleting all items:', error);
      toast.error('Failed to delete all items. Some items may have been deleted.');
      fetchList(); // Refresh to see what's left
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='list add flex-col'>
      <div className='list-header'>
        <p>All Foods List ({list.length} items)</p>
        {list.length > 0 && (
          <button 
            className='delete-all-btn' 
            onClick={deleteAllItems}
            disabled={loading}
          >
            Delete All Items
          </button>
        )}
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className='list-table'>
          <div className="list-table-format title">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Actions</b>
          </div>
          {list.map((item, index) => {
            return (
              <div key={item.id || index} className='list-table-format'>
                <img src={item.image_url} alt={item.name} />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>{currency}{item.price}</p>
                <div className='action-buttons'>
                  <button 
                    className='edit-btn' 
                    onClick={() => handleEdit(item)}
                    disabled={deletingId === item.id}
                  >
                    Edit
                  </button>
                  <button 
                    className='delete-btn' 
                    onClick={() => removeFood(item.id)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className='edit-modal-overlay' onClick={closeEditModal}>
          <div className='edit-modal' onClick={(e) => e.stopPropagation()}>
            <h2>Edit Menu Item</h2>
            <form onSubmit={handleEditSubmit}>
              <div className='form-group'>
                <label>Current Image</label>
                <img src={editImage ? URL.createObjectURL(editImage) : editingItem?.image_url} alt="" className='preview-image' />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setEditImage(e.target.files[0])}
                  id="edit-image"
                />
                <label htmlFor="edit-image" className='upload-label'>Change Image</label>
              </div>

              <div className='form-group'>
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className='form-group'>
                <label>Description</label>
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  rows={4}
                  required
                />
              </div>

              <div className='form-group'>
                <label>Category</label>
                <select
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className='form-group'>
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={editData.price}
                  onChange={handleEditChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className='modal-actions'>
                <button type="submit" className='save-btn'>Save Changes</button>
                <button type="button" className='cancel-btn' onClick={closeEditModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default List

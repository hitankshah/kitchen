import React, { useState, useEffect } from 'react';
import './Categories.css';
import { categoryApi, menuItemApi } from '../../lib/api';
import { toast } from 'react-toastify';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [itemCounts, setItemCounts] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getCategories();
      setCategories(data);
      
      // Fetch item counts for each category
      const menuItems = await menuItemApi.getMenuItems();
      const counts = {};
      data.forEach(cat => {
        counts[cat.name] = menuItems.filter(item => item.category === cat.name).length;
      });
      setItemCounts(counts);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryApi.createCategory(formData);
        toast.success('Category created successfully');
      }
      
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (category) => {
    const itemCount = itemCounts[category.name] || 0;
    
    if (itemCount > 0) {
      toast.error(`Cannot delete category with ${itemCount} items. Please remove or reassign items first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      await categoryApi.deleteCategory(category.id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="categories"><div className="loading">Loading categories...</div></div>;
  }

  return (
    <div className="categories">
      <h1>Category Management</h1>

      {!showForm ? (
        <button 
          className="btn-primary" 
          style={{ marginBottom: '20px', padding: '12px 24px' }}
          onClick={() => setShowForm(true)}
        >
          + Add New Category
        </button>
      ) : (
        <div className="add-category-form">
          <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Salad, Pizza, Desserts"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description for this category"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-list">
        <h2>All Categories ({categories.length})</h2>
        
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>No categories yet. Create your first category to get started!</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <div className="category-header">
                  <div className="category-name">{category.name}</div>
                  <div className="category-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(category)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
                
                <div>
                  <span className="category-items-count">
                    {itemCounts[category.name] || 0} items
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;

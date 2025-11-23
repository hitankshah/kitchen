import React, { useContext } from 'react'
import './Category.css'
import { StoreContext } from '../../Context/StoreContext'
import FoodItem from '../../components/FoodItem/FoodItem'
import { useParams, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'

const Category = () => {
  const { categoryName } = useParams();
  const { food_list } = useContext(StoreContext);
  const navigate = useNavigate();

  // Mapping for Meal Types (Must match FoodDisplay.jsx)
  const mealMap = {
    "Morning": ["Sandwich", "Breakfast"],
    "Lunch": ["Salad", "Rolls", "Pure Veg", "Main Course"],
    "Every time available item": ["Pasta", "Noodles", "Pizza", "Burger"],
    "Dessert": ["Deserts", "Cake", "Ice Cream"],
    "Beverages": ["Beverages", "Drinks", "Cold Drinks"]
  };

  // Filter items for this category
  let categoryItems = [];
  
  if (mealMap[categoryName]) {
    // If it's a Meal Type (Morning, Lunch, etc.), filter by the mapped categories
    categoryItems = food_list.filter(item => mealMap[categoryName].includes(item.category));
  } else {
    // Fallback for direct category names
    categoryItems = food_list.filter(item => item.category === categoryName);
  }

  return (
    <div className='category-page'>
      <div className="category-header">
        <img src={assets.arrow_icon || assets.cross_icon} className="back-btn" onClick={() => navigate(-1)} alt="Back" style={{transform: 'rotate(90deg)', cursor: 'pointer'}} />
        <h2>{categoryName}</h2>
      </div>
      
      <div className="category-list">
        {categoryItems.length > 0 ? (
          categoryItems.map((item, index) => {
            return <FoodItem key={index} id={item._id} name={item.name} description={item.description} price={item.price} image={item.image} />
          })
        ) : (
          <p>No items found in this category.</p>
        )}
      </div>
    </div>
  )
}

export default Category ;
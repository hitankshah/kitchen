import React, { useContext } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'

const FoodDisplay = ({category}) => {

  const {food_list} = useContext(StoreContext);
  const navigate = useNavigate();

  // Mapping for Meal Types
  const mealMap = {
    "Morning": ["Sandwich", "Breakfast"],
    "Lunch": ["Salad", "Rolls", "Pure Veg", "Main Course"],
    "Dinner": ["Pasta", "Noodles", "Pizza", "Burger"],
    "Dessert": ["Deserts", "Cake", "Ice Cream"],
    "Beverages": ["Beverages", "Drinks", "Cold Drinks"]
  };

  // Determine current meal time
  const hour = new Date().getHours();
  let currentMeal = "";
  if (hour >= 5 && hour < 11) currentMeal = "Morning";
  else if (hour >= 11 && hour < 17) currentMeal = "Lunch";
  else currentMeal = "Dinner"; // 5pm to 5am

  // If a specific category is selected (e.g. from ExploreMenu), show that. 
  // Otherwise show the Meal Type sections.
  const isSpecificCategory = category !== "All";

  // Collect all categories used in mealMap
  const mappedCategories = Object.values(mealMap).flat();

  return (
    <div className='food-display' id='food-display'>
      
      {isSpecificCategory ? (
        // Original logic for specific category selection
        <div className="category-section">
            <h2>{category}</h2>
            <div className='food-display-list'>
                {food_list.filter(item => item.category === category).map((item)=>{
                    return <FoodItem key={item.id || item._id} image={item.image_url || item.image} name={item.name} desc={item.description} price={item.price} id={item.id || item._id}/>
                })}
            </div>
        </div>
      ) : (
        <>
        {/* Meal Type Sections */}
        {Object.entries(mealMap).map(([mealType, categories]) => {
            // Filter items that belong to any of the categories in this meal type
            const mealItems = food_list.filter(item => categories.includes(item.category));
            
            if (mealItems.length === 0) return null;

            const displayItems = mealItems.slice(0, 6);
            const hasMore = mealItems.length > 6;
            const isNowServing = currentMeal === mealType;

            return (
                <div key={mealType} className="category-section">
                    <div className="category-title-row">
                        <div className="title-wrapper">
                            <h2>{mealType}</h2>
                            {isNowServing && <span className="now-serving-badge">Now Serving</span>}
                        </div>
                        {hasMore && (
                            <button className="view-all-btn" onClick={() => navigate(`/category/${mealType}`)}>
                                View All
                            </button>
                        )}
                    </div>
                    <div className='food-display-list'>
                        {displayItems.map((item)=>{
                            return <FoodItem key={item.id || item._id} image={item.image_url || item.image} name={item.name} desc={item.description} price={item.price} id={item.id || item._id}/>
                        })}
                    </div>
                </div>
            )
        })}

        {/* Other Categories Section */}
        {(() => {
            const otherItems = food_list.filter(item => !mappedCategories.includes(item.category));
            if (otherItems.length === 0) return null;
            
            // Group by category
            const otherCategories = [...new Set(otherItems.map(item => item.category))];
            
            return otherCategories.map(cat => (
                <div key={cat} className="category-section">
                    <div className="category-title-row">
                        <h2>{cat}</h2>
                        <button className="view-all-btn" onClick={() => navigate(`/category/${cat}`)}>
                            View All
                        </button>
                    </div>
                    <div className='food-display-list'>
                        {otherItems.filter(item => item.category === cat).slice(0, 6).map((item)=>{
                            return <FoodItem key={item.id || item._id} image={item.image_url || item.image} name={item.name} desc={item.description} price={item.price} id={item.id || item._id}/>
                        })}
                    </div>
                </div>
            ));
        })()}
        </>
      )}
    </div>
  )
}

export default FoodDisplay

import React, { useContext } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'

const FoodDisplay = ({category}) => {

  const {food_list, loading, menu_list} = useContext(StoreContext);
  const navigate = useNavigate();

  // Show loading state
  if (loading) {
    return (
      <div className='food-display' id='food-display'>
        <p style={{ textAlign: 'center', padding: '50px', fontSize: '16px', color: '#999' }}>
          Loading menu items...
        </p>
      </div>
    );
  }

  // Show no data message
  if (!food_list || food_list.length === 0) {
    return (
      <div className='food-display' id='food-display'>
        <p style={{ textAlign: 'center', padding: '50px', fontSize: '16px', color: '#999' }}>
          No items available. Please check back later.
        </p>
      </div>
    );
  }

  // Mapping for Meal Types (must match database categories)
  const mealMap = {
    "Morning": ["Sandwich", "breakfast"],
    "Lunch": ["Salad", "Rolls", "Pure Veg", "Main Course", "all"],
    "Any Time Available Item": ["Pasta", "Noodles", "Pizza", "Burger", "dinner"],
    "Dessert": ["Deserts", "Ice Cream", "Cake"],
    "Beverages": ["Beverages", "Drinks", "Cold Drinks"]
  };

  // Determine current meal time
  const hour = new Date().getHours();
  let currentMeal = "";
  if (hour >= 5 && hour < 11) currentMeal = "Morning";
  else if (hour >= 11 && hour < 17) currentMeal = "Lunch";
  else currentMeal = "Any Time Available Item"; // 5pm to 5am

  // If category is "All", show all meal sections. Otherwise show specific category.
  const isShowAllMeals = category === "All";
  const isSpecificCategory = category !== "All" && !Object.keys(mealMap).includes(category);

  // Collect all categories used in mealMap
  const mappedCategories = Object.values(mealMap).flat();

  return (
    <div className='food-display' id='food-display'>
      
      {isSpecificCategory ? (
        // Single specific category view
        <div className="category-section">
            <h2>{category}</h2>
            <div className='food-display-list'>
                {food_list.filter(item => item.category === category).map((item)=>{
                    return <FoodItem key={item.id || item._id} image={item.image_url || item.image} name={item.name} desc={item.description} price={item.price} id={item.id || item._id}/>
                })}
            </div>
        </div>
      ) : isShowAllMeals || Object.keys(mealMap).includes(category) ? (
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
                        <button className="view-all-btn" onClick={() => navigate(`/category/${mealType}`)}>
                            View All
                        </button>
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
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
          <p>No items found in this category.</p>
        </div>
      )}
    </div>
  )
}

export default FoodDisplay

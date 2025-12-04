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

  return (
    <div className='food-display' id='food-display'>
      {category === "All" ? (
        <>
          {/* Group items by category and display each category section */}
          {(() => {
            // Get unique categories from food_list
            const categories = [...new Set(food_list.map(item => item.category))].filter(Boolean);
            
            return categories.map(cat => {
              const categoryItems = food_list.filter(item => item.category === cat);
              const displayItems = categoryItems.slice(0, 6);
              const hasMore = categoryItems.length > 6;
              
              return (
                <div key={cat} className="category-section">
                  <div className="category-title-row">
                    <h2>{cat}</h2>
                    {hasMore && (
                      <button className="view-all-btn" onClick={() => navigate(`/category/${cat}`)}>
                        View All
                      </button>
                    )}
                  </div>
                  <div className='food-display-list'>
                    {displayItems.map((item) => {
                      return <FoodItem 
                        key={item.id || item._id} 
                        image={item.image_url || item.image} 
                        name={item.name} 
                        desc={item.description} 
                        price={item.price} 
                        id={item.id || item._id}
                      />
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </>
      ) : (
        // Show specific category
        <div className="category-section">
          <h2>{category}</h2>
          <div className='food-display-list'>
            {(() => {
              const filteredItems = food_list.filter(item => item.category === category);
              
              if (filteredItems.length === 0) {
                return (
                  <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No items found in this category.
                  </p>
                );
              }
              
              return filteredItems.map((item) => {
                return <FoodItem 
                  key={item.id || item._id} 
                  image={item.image_url || item.image} 
                  name={item.name} 
                  desc={item.description} 
                  price={item.price} 
                  id={item.id || item._id}
                />
              });
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default FoodDisplay

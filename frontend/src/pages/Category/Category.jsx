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

  // Filter items for this category
  const categoryItems = food_list.filter(item => item.category === categoryName);

  return (
    <div className='category-page'>
      <div className="category-header">
        <img src={assets.arrow_icon || assets.cross_icon} className="back-btn" onClick={() => navigate(-1)} alt="Back" style={{transform: 'rotate(90deg)', cursor: 'pointer'}} />
        <h2>{categoryName}</h2>
      </div>
      
      <div className="category-list">
        {categoryItems.length > 0 ? (
          categoryItems.map((item, index) => {
            return <FoodItem 
              key={index} 
              id={item.id || item._id} 
              name={item.name} 
              desc={item.description} 
              price={item.price} 
              image={item.image_url || item.image} 
            />
          })
        ) : (
          <p>No items found in this category.</p>
        )}
      </div>
    </div>
  )
}

export default Category ;
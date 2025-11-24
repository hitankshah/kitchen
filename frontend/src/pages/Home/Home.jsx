import React, { useState, useEffect } from 'react'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'

const Home = () => {

  // Determine current meal time and set as default category
  const getCurrentMeal = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "Morning";
    else if (hour >= 11 && hour < 17) return "Lunch";
    else return "Any Time Available Item"; // 5pm to 5am
  }

  const [category,setCategory] = useState(getCurrentMeal())

  // Update category when component mounts
  useEffect(() => {
    setCategory(getCurrentMeal());
  }, []);

  return (
    <>
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisplay category={category}/>
    </>
  )
}

export default Home

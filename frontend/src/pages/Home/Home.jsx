import React, { useState } from 'react'
import Header from '../../components/Header/Header'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'

const Home = () => {

  const [category,setCategory] = useState("Any Time Available Item")

  return (
    <>
      <Header/>
      <FoodDisplay category={category}/>
    </>
  )
}

export default Home

import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import About from '../../components/About/About'
import Banner from '../../components/Banner/Banner'
import Chefs from '../../components/Chefs/Chefs'
import Reservation from '../../components/Reservation/Reservation'

const Home = () => {
  const [category,setCategory]=useState("All");
  return (
    <div>
      <Header/>
      <About />
      <Banner />

      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category}/>
      <Chefs />
      <Reservation/>
      {/* <AppDownload/> */}
    </div>
  )
}

export default Home

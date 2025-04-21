import React from "react";
import "./ExploreMenu.css";
import { menu_list } from "../../assets/frontend_assets/assets";

const ExploreMenu = ({ category, setCategory }) => {
  const handleCategoryClick = (selectedCategory) => {
    setCategory(prev => prev === selectedCategory ? "All" : selectedCategory);
  };

  return (
    <div className="explore-menu container" id="explore-menu">
      <h1>Explore nosso menu</h1>
      <p className="explore-menu-text">
        Choose from a diverse menu featuring a delectable array of dishes. Our
        mission is to satisfy your cravings and elevate your dining experience,
        one delicious meal at a time.
      </p>
      <div className="explore-menu-list">
        {menu_list.map((item, index) => {
          return (
            <div 
              onClick={() => handleCategoryClick(item.menu_name)} 
              key={index} 
              className="explore-menu-list-item"
            >
              <p className={category === item.menu_name ? "active" : ""} >{item.menu_name}</p>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
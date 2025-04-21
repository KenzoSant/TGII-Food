import React, { useContext, useEffect } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category = "All" }) => { // Valor padrão para category
  const { food_list } = useContext(StoreContext);

  // Debug: verifique os dados recebidos
  useEffect(() => {
    console.log("Total de itens:", food_list.length);
    console.log("Itens filtrados:", food_list.filter(item => 
      category === "All" || category === item.category
    ).length);
  }, [food_list, category]);

  return (
    <div className="food-display container" id="food-display">
      <h2>Pratos do dia</h2>
      <div className="food-display-list">
        {food_list.length === 0 ? (
          <p>Carregando alimentos...</p>
        ) : (
          food_list
            .filter((item) => category === "All" || category === item.category)
            .map((item) => (
              <FoodItem
                key={item._id} // Melhor usar item._id do que index
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
              />
            ))
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;
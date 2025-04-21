import React from "react";
import "./Chefs.css";
import { chefs } from "../../assets/frontend_assets/assets";

const Chefs = () => {

  return (
    <div className="chefs-page container" id="chefs">
      <h2>Nossos Chefs</h2>
      <div className="chefs-container">
        {chefs.map((chef, index) => (
          <div className="chef-card" key={index}>
            <img src={chef.image} alt={chef.name} className="chef-img" />
            <h3>{chef.name}</h3>
            <p className="specialty">{chef.specialty}</p>
            <p className="bio">{chef.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chefs;

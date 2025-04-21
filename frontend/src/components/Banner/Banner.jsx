import React from 'react';
import './Banner.css';
import { assets } from '../../assets/frontend_assets/assets';

const Banner = () => {
  return (
    <div className="banner">
      <div className="banner-img-wrapper">
        <img src={assets.banner} alt="Banner do restaurante" />
        <div className="overlay"></div>
        <div className="banner-text">
          <h1>Sabores que conquistam</h1>
          <p>Explore nosso cardápio e viva uma experiência gastronômica única</p>
        </div>
      </div>
    </div>
  );
};

export default Banner;

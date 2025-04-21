import React from 'react';
import './About.css'; 
import { assets } from '../../assets/frontend_assets/assets';

const About = () => {
  return (
    <div className="about-container container" id="about">
      <div className="about-text">
        <h1>Sobre Nós</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
          Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus
          rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna
          non est bibendum non venenatis nisl tempor.
        </p>
        <p>
          Suspendisse potenti. Sed egestas, ante et vulputate volutpat, eros pede semper
          est, vitae luctus metus libero eu augue. Morbi purus libero, faucibus adipiscing.
        </p>
        
      </div>
      
      <div className="about-images">
        <div className="main-image">
          <img src={assets.about3} alt="Imagem principal" />
        </div>
        <div className="secondary-images">
          <img src={assets.about2}  alt="Imagem secundária 1" />
          <img src={assets.about1}  alt="Imagem secundária 2" />
        </div>
      </div>
    </div>
  );
};

export default About;
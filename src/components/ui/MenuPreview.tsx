import React from 'react';
import oysterImg from '../../assets/images/oyster-on-ice.jpg';
import halibutImg from '../../assets/images/halibut-fish.jpg';
import wagyuImg from '../../assets/images/wagyu-beef.jpg';
import chocolateImg from '../../assets/images/chocolate-dessert.jpg';

interface MenuItemProps {
  course: string;
  title: string;
  description: string;
  price: string;
  image: string;
  isReverse?: boolean;
}

const menuItems: MenuItemProps[] = [
  {
    course: 'Prologue',
    title: 'Oyster & Snow',
    description: 'Fjord oyster · frozen cucumber mignonette · sea herbs.',
    price: '—',
    image: oysterImg,
  },
  {
    course: 'Chapter I',
    title: 'Arctic Char',
    description: 'Smoked bone broth · sea buckthorn · frozen dill.',
    price: '—',
    image: halibutImg,
    isReverse: true,
  },
  {
    course: 'Chapter II',
    title: 'Wagyu A5',
    description: 'Seared wagyu · smoked bone marrow · black garlic.',
    price: '—',
    image: wagyuImg,
  },
  {
    course: 'Epilogue',
    title: 'Cloudberry',
    description: 'Whipped skyr · white chocolate snow · pine.',
    price: '—',
    image: chocolateImg,
    isReverse: true,
  },
];

const MenuPreview: React.FC = () => {
  return (
    <section id="menu" className="menu-section">
      <div className="section-intro" style={{ margin: '0 auto', textAlign: 'center' }}>
        <p className="eyebrow">Tasting Menu</p>
        <h2>The Winter Solstice Collection.</h2>
      </div>

      {menuItems.map((item, index) => (
        <article 
          key={index} 
          className={`menu-item reveal ${item.isReverse ? 'menu-item--reverse' : ''}`}
        >
          <div className="menu-visual">
            <img src={item.image} alt={item.title} className="menu-img" loading="lazy" />
          </div>
          
          <div className="menu-info">
            <span className="menu-course">{item.course}</span>
            <h3 className="menu-title">{item.title}</h3>
            <p className="menu-desc">{item.description}</p>
            <span className="menu-price">{item.price}</span>
          </div>
        </article>
      ))}

      <div className="menu-footer-cta reveal">
        <div className="cta-left">
          <p className="eyebrow">Availability</p>
          <h3>Limited to 24 guests nightly.</h3>
        </div>
        <a href="#reservations" className="button">Secure your table</a>
      </div>
    </section>
  );
};

export default MenuPreview;

import React, { useEffect } from "react";
import Swiper from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";

const CategorySlider = () => {
  useEffect(() => {
    new Swiper(".mySwiper-category", {
      spaceBetween: 12,
      slidesPerView: 10,
      loop: true,
      speed: 1000,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        0: { slidesPerView: 2, spaceBetween: 12 },
        320: { slidesPerView: 2, spaceBetween: 12 },
        480: { slidesPerView: 3, spaceBetween: 12 },
        640: { slidesPerView: 4, spaceBetween: 12 },
        840: { slidesPerView: 5, spaceBetween: 12 },
        1140: { slidesPerView: 8, spaceBetween: 12 },
      },
      modules: [Navigation, Autoplay],
    });
  }, []);

  const categories = [
    { id: 1, img: "assets/images/category/01.png", name: "Vegetables" },
    { id: 2, img: "assets/images/category/02.png", name: "Fruits" },
    { id: 3, img: "assets/images/category/03.png", name: "Dairy" },
    { id: 4, img: "assets/images/category/04.png", name: "Beverages" },
    { id: 5, img: "assets/images/category/05.png", name: "Snacks" },
    { id: 6, img: "assets/images/category/06.png", name: "Meat" },
    { id: 7, img: "assets/images/category/07.png", name: "Seafood" },
    { id: 8, img: "assets/images/category/08.png", name: "Bakery" },
    { id: 9, img: "assets/images/category/09.png", name: "Frozen" },
    { id: 10, img: "assets/images/category/10.png", name: "Organic" },
  ];

  return (
    <>
      <style>
        {`
          .category-slider-container {
            padding: 10px 0;
            background: #f8f8f8;
          }
          .swiper-slide {
            justify-content: center;
            align-items: center;
          }
          .single-category {
            text-align: center;
            transition: transform 0.3s ease-in-out;
          }
          .single-category:hover {
            transform: scale(1.1);
          }
          .single-category img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 50%;
            border: 2px solid #ddd;
          }
          .single-category p {
            margin-top: 8px;
            font-size: 14px;
            font-weight: bold;
          }
          .swiper-button-next, .swiper-button-prev {
            color: #555 !important;
            font-size: 24px;
          }
        `}
      </style>

      <div className="category-slider-container">
        <div className="container">
          <div className="swiper mySwiper-category">
            <div className="swiper-wrapper">
              {categories.map((cat) => (
                <div className="swiper-slide" key={cat.id}>
                  <a href="shop-grid-sidebar.html" className="single-category">
                    <img src={cat.img} alt={cat.name} />


                    <p>{cat.name}</p>
                  </a>
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            <button className="swiper-button-next"></button>
            <button className="swiper-button-prev"></button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategorySlider;

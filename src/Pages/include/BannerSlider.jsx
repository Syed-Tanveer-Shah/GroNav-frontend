import React, { useEffect } from "react";
import Swiper from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";

const BannerSlider = () => {
  useEffect(() => {
    new Swiper(".mySwiper-category-1", {
      spaceBetween: 1,
      slidesPerView: 1,
      loop: true,
      speed: 2000,
      autoplay: {
        delay: 4000,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      modules: [Navigation, Autoplay],
      breakpoints: {
        0: { slidesPerView: 1, spaceBetween: 0 },
        320: { slidesPerView: 1, spaceBetween: 0 },
        480: { slidesPerView: 1, spaceBetween: 0 },
        640: { slidesPerView: 1, spaceBetween: 0 },
        840: { slidesPerView: 1, spaceBetween: 0 },
        1140: { slidesPerView: 1, spaceBetween: 0 },
      },
    });
  }, []);

  return (
    <>
   
    <div className="background-light-gray-color bg_light-1 pt_sm--20">
      <div className="rts-banner-area-one mb--30">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="category-area-main-wrapper-one">
                <div className="swiper mySwiper-category-1">
                  <div className="swiper-wrapper">
                    <div className="swiper-slide">
                      <div className="banner-bg-image bg_image bg_one-banner two ptb--120">
                        <div className="banner-one-inner-content">
                          <span className="pre">Get up to 30% off on your first €150 purchase</span>
                          <h1 className="title">
                            Do not miss our amazing <br />
                            grocery deals
                          </h1>
                          <Link to="/product-list" className="rts-btn btn-primary radious-sm with-icon">
                            <div className="btn-text">Shop Now</div>
                            <div className="arrow-icon">
                              <i className="fa-light fa-arrow-right" />
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="swiper-slide">
                      <div className="banner-bg-image bg_image bg_one-banner ptb--120">
                        <div className="banner-one-inner-content">
                          <span className="pre">Get up to 30% off on your first €150 purchase</span>
                          <h1 className="title">
                            Do not miss our amazing <br />
                            grocery deals
                          </h1>
                          <Link to="/product-list" className="rts-btn btn-primary radious-sm with-icon">
                            <div className="btn-text">Shop Now</div>
                            <div className="arrow-icon">
                              <i className="fa-light fa-arrow-right" />
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="swiper-button-next">
                    <i className="fa-regular fa-arrow-right" />
                  </button>
                  <button className="swiper-button-prev">
                    <i className="fa-regular fa-arrow-left" />
                  </button>
                  <span className="swiper-notification" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    </>
  );
};

export default BannerSlider;

import React, { useEffect } from "react";
import Swiper from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";

// Register modules on the Swiper class (required in Swiper v8+).
// Without this, Autoplay silently fails and loop transitions can stall
// on a blank cloned slide.
Swiper.use([Navigation, Autoplay]);

const BannerSlider = () => {
  useEffect(() => {
    const swiper = new Swiper(".mySwiper-category-1", {
      modules: [Navigation, Autoplay],
      // spaceBetween MUST be 0 — even 1px creates a visible white gap/flash
      // between cloned loop slides during the transition.
      spaceBetween: 0,
      slidesPerView: 1,
      slidesPerGroup: 1,
      loop: true,
      loopedSlides: 2,
      loopPreventsSliding: false,
      speed: 2000,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      // watchSlidesProgress ensures Swiper correctly tracks all slides
      // (including loop clones) so none renders blank during transition.
      watchSlidesProgress: true,
      observer: true,
      observeParents: true,
      resizeObserver: true,
      roundLengths: true,
      grabCursor: true,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        0:    { slidesPerView: 1, spaceBetween: 0 },
        320:  { slidesPerView: 1, spaceBetween: 0 },
        360:  { slidesPerView: 1, spaceBetween: 0 },
        375:  { slidesPerView: 1, spaceBetween: 0 },
        390:  { slidesPerView: 1, spaceBetween: 0 },
        414:  { slidesPerView: 1, spaceBetween: 0 },
        430:  { slidesPerView: 1, spaceBetween: 0 },
        480:  { slidesPerView: 1, spaceBetween: 0 },
        640:  { slidesPerView: 1, spaceBetween: 0 },
        840:  { slidesPerView: 1, spaceBetween: 0 },
        1140: { slidesPerView: 1, spaceBetween: 0 },
      },
    });

    // Recalculate slide widths and wrapper translate position after CSS layout settles
    const updateTimer = setTimeout(() => {
      if (swiper && !swiper.destroyed && typeof swiper.update === "function") {
        swiper.update();
      }
    }, 100);

    const handleResize = () => {
      if (swiper && !swiper.destroyed && typeof swiper.update === "function") {
        swiper.update();
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      clearTimeout(updateTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      // Clean up Swiper instance on unmount to prevent stale instances
      // re-using the same DOM node and causing blank-slide on remount.
      if (swiper && typeof swiper.destroy === "function") {
        swiper.destroy(true, true);
      }
    };
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

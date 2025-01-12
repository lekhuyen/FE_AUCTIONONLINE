import { useState, useEffect } from "react";
import { FaArrowCircleRight, FaArrowCircleLeft } from "react-icons/fa";

function ControlledCarousel({ slides, interval = 4000 }) {
  const [current, setCurrent] = useState(0);

  const previousSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  useEffect(() => {
    const slideInterval = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(slideInterval);
  }, [current, interval]);

  return (
    <div className="relative overflow-hidden w-full h-[300px] flex items-center justify-center">
      {/* Slides */}
      <div
        className={`flex transition-transform ease-out duration-600`}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((s, index) => (
          <div key={index} className="flex-shrink-0 w-full h-full flex items-center justify-center">
            <img
              alt=""
              src={s}
              className="max-w-[80%] max-h-[80%] object-contain"
            />
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="absolute top-0 h-full w-full flex justify-between items-center text-gray-400 px-10">
        <button onClick={previousSlide}>
          <FaArrowCircleLeft size={25} />
        </button>
        <button onClick={nextSlide}>
          <FaArrowCircleRight size={25} />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-0 py-4 flex justify-center gap-3 w-full">
        {slides.map((_, i) => (
          <div
            onClick={() => setCurrent(i)}
            key={"circle" + i}
            className={`rounded-full w-3 h-3 cursor-pointer ${i === current ? "bg-gray-600" : "bg-gray-300"
              }`}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default ControlledCarousel;

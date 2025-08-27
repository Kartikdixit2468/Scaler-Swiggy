const Features = () => {
  return (
    <section className="py-16 lg:py-24 reveal-on-scroll bg-white rounded-lg m-4 shadow-xl">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-[#2c3e50] mb-4">
          Why Scaler Swiggy?
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          We make campus life easier, one delivery at a time.
        </p>
        <div className="flex flex-col lg:flex-row justify-center items-center space-y-8 lg:space-y-0 lg:space-x-12">
          {/* Advantage 1: Skip the Queue */}
          <div className="w-full lg:w-1/3 bg-gray-100 p-8 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300">
            <div className="text-5xl mb-4 text-[#ff5e00]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#2c3e50] mb-2">
              Skip The Canteen Queue
            </h3>
            <p className="text-gray-600">
              No more waiting in long lines. Order your favorite food and get
              back to what matters.
            </p>
          </div>

          {/* Advantage 2: Doorstep Delivery */}
          <div className="w-full lg:w-1/3 bg-gray-100 p-8 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300">
            <div className="text-5xl mb-4 text-[#ff5e00]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#2c3e50] mb-2">
              Doorstep Delivery
            </h3>
            <p className="text-gray-600">
              Get your food delivered to your hostel room or a designated pickup
              point on campus.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

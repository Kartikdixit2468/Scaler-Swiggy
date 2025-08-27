const FeaturedStalls = () => {
    return (
        <section className="py-16 lg:py-24 bg-white rounded-lg m-4 shadow-xl reveal-on-scroll">
            <div className="container mx-auto px-4 lg:px-8 text-center">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#2c3e50] mb-4">
                    Featured Stalls
                </h2>
                <p className="text-lg text-gray-600 mb-12">
                    Discover the most popular food stalls on campus.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Stall Card 1 */}
                    <div className="bg-gray-100 p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300">
                        <img src="https://placehold.co/400x250/E5E7EB/6B7280?text=Maggie+Point" alt="Maggie Point" className="w-full rounded-lg mb-4" />
                        <h3 className="text-xl font-bold mb-2">The Maggie Hub</h3>
                        <p className="text-gray-600">The best Maggie on campus. Hot and spicy!</p>
                    </div>
                    {/* Stall Card 2 */}
                    <div className="bg-gray-100 p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300">
                        <img src="https://placehold.co/400x250/E5E7EB/6B7280?text=Burger+Joint" alt="Burger Joint" className="w-full rounded-lg mb-4" />
                        <h3 className="text-xl font-bold mb-2">The Burger Stop</h3>
                        <p className="text-gray-600">Classic burgers and fries. A student favorite.</p>
                    </div>
                    {/* Stall Card 3 */}
                    <div className="bg-gray-100 p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300">
                        <img src="https://placehold.co/400x250/E5E7EB/6B7280?text=Juice+Corner" alt="Juice Corner" className="w-full rounded-lg mb-4" />
                        <h3 className="text-xl font-bold mb-2">Juice & Shakes</h3>
                        <p className="text-gray-600">Fresh fruit juices and thick shakes for a quick energy boost.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedStalls;

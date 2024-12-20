const SubscribeSection = () => {
    return (
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get the best sent to your inbox, every month</h2>
          <p className="mb-6">Stay updated with the latest courses and special offers.</p>
          <div className="flex justify-center items-center">
            <input
              type="email"
              placeholder="Your email address"
              className="p-3 rounded-l-lg text-gray-700 w-1/3"
            />
            <button className="p-3 bg-yellow-500 rounded-r-lg font-bold text-gray-800 hover:bg-yellow-400">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    );
  };
  
  export default SubscribeSection;
  
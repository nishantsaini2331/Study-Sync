const Testimonials = () => {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">What Our Students Say</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((testimonial) => (
              <div key={testimonial} className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 italic mb-4">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin non mauris sit amet mi
                  interdum facilisis."
                </p>
                <h4 className="font-bold">John Doe</h4>
                <p className="text-gray-600">UI Designer at Google</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default Testimonials;
  
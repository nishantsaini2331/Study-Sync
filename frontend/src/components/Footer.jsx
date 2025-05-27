import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="font-bold text-lg text-white mb-4">Study Sync</h3>
          <p>
            Your go-to platform for learning new skills. Explore courses, meet
            experts, and grow your knowledge.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-lg text-white mb-4">Quick Links</h4>
          <ul>
            <li>
              <Link to="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:underline">
                Courses
              </Link>
            </li>
            <li>
              <Link to="/teachers" className="hover:underline">
                Teachers
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:underline">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-bold text-lg text-white mb-4">Resources</h4>
          <ul>
            <li>
              <Link to="/faq" className="hover:underline">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:underline">
                Support
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:underline">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-lg text-white mb-4">Contact</h4>
          <p>Email: support@studysync.com</p>
          <p>Phone: +1 (123) 456-7890</p>
          <p>Address: 123 Learning St, Knowledge City</p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="mt-8 border-t border-gray-700 pt-4 text-center">
        <p>&copy; 2024 Study Sync. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

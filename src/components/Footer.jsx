import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-50 border-t border-blue-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-slate-600 text-sm">
        <p>
          &copy; {currentYear} Athlemics. All rights reserved.
        </p>
        <p className="mt-2 sm:mt-0">
          Licensed under the{" "}
          <a
            href="https://www.apache.org/licenses/LICENSE-2.0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Apache License 2.0
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

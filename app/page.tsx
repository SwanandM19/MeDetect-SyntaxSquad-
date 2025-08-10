'use client';

import React from 'react';
import Link from 'next/link';


export default function HomePage() {
  return (
    <div className="relative w-full h-full overflow-x-hidden">
      <link
        href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@200;500;600;700&display=swap"
        rel="stylesheet"
      />

      <nav className="flex items-center justify-between px-8 py-6 bg-transparent fixed w-full z-50 font-sans">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="/logoo.png" alt="Medetect" className="h-10" />
        </div>

        {/* Nav Links */}
        <ul className="hidden md:flex space-x-30 text-white text-sm font-light bg-white/4 backdrop-blur-lg px-6 py-3 shadow-lg">
          <li>
            <a href="#hero" className="px-4 py-2 hover:text-black hover:bg-white transition">
              HOME
            </a>
          </li>
          <li>
            <a href="#about" className="px-4 py-2 hover:text-black hover:bg-white transition">
              ABOUT
            </a>
          </li>
          <li>
            <a href="#whyus" className="px-4 py-2 hover:text-black hover:bg-white transition">
              WHY US
            </a>
          </li>
          <li>
            <Link href="/signin" className="px-4 py-2 hover:text-black hover:bg-white transition">
              LOGIN
            </Link>
          </li>
        </ul>


        {/* Auth Buttons */}
        <div className="flex items-center space-x-3 bg-white/4 backdrop-blur-lg px-6 py-1 shadow-lg font-light">
         <Link
            href="/login"
            className="px-4 py-2 text-sm text-white hover:text-black hover:bg-white transition"
          >
            SIGNIN
          </Link>
          <p className="text-white">|</p>
          <Link
            href="/signin"
            className="px-4 py-2 text-sm text-white hover:text-black hover:bg-white transition"
          >
            LOGIN
          </Link>
        </div>
      </nav>







      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen overflow-hidden font-readex">
        {/* Spline Iframe */}
        <div className="absolute inset-0 w-full h-full z-0">
          <iframe
            src="https://my.spline.design/aibrain-jwu6TAdZlFke3PogYM4yDqbd/"
            frameBorder="0"
            allowFullScreen
            className="w-full h-full pointer-events-auto"
          ></iframe>
        </div>

        {/* Foreground Text */}
        <div className="relative flex items-center justify-start h-full w-full px-6 mt-80 ml-20">
          <div className="w-full lg:w-1/2 text-white p-8 rounded-xl font-[200] font-[Readex Pro]">
            <h2 className="text-4xl sm:text-5xl leading-snug mb-6">
              <span className="inline-block ">
                AI-powered diagnosis
              </span>
              <br />
              <span className="inline-block  ">
                Accessible to all
              </span>
            </h2>
            <button className="px-6 py-3 bg-[#333] text-white font-medium hover:bg-[#555] transition">
              GET STARTED
            </button>
          </div>
        </div>
      </section>


      {/* How to Use Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-black">HOW TO USE</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10 text-center">

            {/* Item 1 */}
            <div>
              <img
                src="/icons/scan.png"
                alt="Scan Icon"
                className="mx-auto w-20 h-20 mb-4 object-contain"
              />
              <h3 className="text-black text-base font-medium leading-tight">
                SCAN
              </h3>
            </div>

            {/* Item 2 */}
            <div>
              <img
                src="/icons/magnify.png"
                alt="Detect Icon"
                className="mx-auto w-32 h-20 mb-4 object-contain"
              />
              <h3 className="text-black text-base font-medium leading-tight">
                DETECT
              </h3>
            </div>

            {/* Item 3 */}
            <div>
              <img
                src="/icons/testing.png"
                alt="Answer Questions Icon"
                className="mx-auto w-40 h-20 mb-4 object-contain"
              />
              <h3 className="text-black text-base font-medium leading-tight">
                ANSWER<br />
              </h3>
            </div>

            {/* Item 4 */}
            <div>
              <img
                src="/icons/reporting.png"
                alt="Generate Report Icon"
                className="mx-auto w-40 h-20 mb-4 object-contain"
              />
              <h3 className="text-black text-base font-medium leading-tight">
                GENERATE<br />REPORT
              </h3>
            </div>

            {/* Item 5 */}
            <div>
              <img
                src="/icons/drug.png"
                alt="Suggested Medication Icon"
                className="mx-auto w-40 h-20 mb-4 object-contain"
              />
              <h3 className="text-black text-base font-medium leading-tight">
                SUGGESTED<br />MEDICATION
              </h3>
            </div>

          </div>
        </div>
      </section>




      {/* this is future section  */}

      <section id="hero" className="relative min-h-screen overflow-hidden">
        {/* Background Spline Iframe - Interactive */}
        <div className="absolute inset-0 w-full h-full z-0 bg-black">
          <iframe
            src="https://my.spline.design/bodywithglowrings-kER2OLam6I5zC0dLEWRMtvfO/"
            frameBorder="0"
            allowFullScreen
            className="w-full h-full pointer-events-auto"
          ></iframe>
        </div>

        {/* Foreground Content */}
        <div className="relative flex items-center justify-start h-full w-full px-6 lg:px-20">
          <div className="w-full lg:w-1/2 text-white p-8 rounded-xl font-light font-readex mt-70">
            <h2 className="text-4xl sm:text-6xl font-light mb-4 mt-20">
              AI-Based Skin Disease Detection
            </h2>
            <p className="text-lg sm:text-xl mb-6 max-w-xl font-light">
              Revolutionize healthcare with AI. Detect skin conditions early using image analysis and SMS-based diagnosis.
            </p>
            <button className="px-6 py-3 bg-[#333] text-white font-medium hover:bg-[#555] transition">
              GET STARTED
            </button>
          </div>
        </div>

      </section>
      {/* integrated with agentic ai  */}

      <section id="hero" className="relative min-h-screen overflow-hidden">
        {/* Background Spline Iframe - Interactive */}
        <div className="absolute inset-0 w-full h-full z-0 bg-white">
          <iframe
            src="https://my.spline.design/infinityblubs-DpMKcDSqYuCaW25YOuUtLVtS/"
            frameBorder="0"
            allowFullScreen
            className="w-full h-full pointer-events-auto"
          ></iframe>
        </div>

        {/* Foreground Content */}
        <div className="relative flex items-center justify-start h-full w-full px-6 lg:px-20">
          <div className="w-full lg:w-1/2 text-black p-8 mt-[300px] ml-[650px]">
            <h2 className="text-4xl sm:text-6xl font-light mb-4">
              AI-Based Skin Disease Detection
            </h2>
            <p className="text-lg sm:text-xl mb-6 max-w-xl font-light">
              Revolutionize healthcare with AI. Detect skin conditions early using image analysis and SMS-based diagnosis.
            </p>
            <button className="px-6 py-3 bg-[#333] text-white font-medium hover:bg-[#555] transition">
              START NOW
            </button>
          </div>
        </div>

      </section>
      {/*the pill  */}

      <section id="hero" className="relative min-h-screen overflow-hidden">
        {/* Background Spline Iframe - Interactive */}
        <div className="absolute inset-0 w-full h-full z-0">
          <iframe
            src="https://my.spline.design/pillanddnaanimation-zhtpnpEhpkCk0gXMxRYaO4XQ/"
            frameBorder="0"
            allowFullScreen
            className="w-full h-full pointer-events-auto"
          ></iframe>
        </div>

        {/* Foreground Content */}
        <div className="relative flex items-center justify-start h-full w-full px-6 lg:px-20">
          <div className="w-full lg:w-1/2 text-white  p-8 rounded-xl mt-70">
            <h2 className="text-4xl sm:text-6xl font-light mb-4">
              AI-Based Skin Disease Detection
            </h2>
            <p className="text-lg sm:text-xl mb-6 max-w-xl font-light">
              Revolutionize healthcare with AI. Detect skin conditions early using image analysis and SMS-based diagnosis.
            </p>
            <button className="px-6 py-3 bg-[#333] text-white font-medium hover:bg-[#555] transition">
              START NOW
            </button>
          </div>
        </div>
      </section>




      {/* Footer */}
      {/* <footer className="px-6 py-16 bg-white text-gray-700 shadow-inner border-t">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">

     
          <div>
            <p className="mb-4">
              Appland is completely creative, lightweight,<br />
              clean app landing page.
            </p>
            <p className="mb-6">
              Made with <span className="text-gray-500">by</span>{" "}
              <span className="text-indigo-600 font-medium">Designing World</span>
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fab fa-facebook-f text-blue-600"></i>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fab fa-pinterest-p text-blue-600"></i>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fab fa-skype text-blue-600"></i>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fab fa-twitter text-blue-600"></i>
              </div>
            </div>
          </div>

    
          <div>
            <h4 className="font-semibold text-black mb-4">About</h4>
            <ul className="space-y-2 text-gray-500">
              <li><a href="#" className="hover:text-black">About Us</a></li>
              <li><a href="#" className="hover:text-black">Corporate Sale</a></li>
              <li><a href="#" className="hover:text-black">Terms & Policy</a></li>
              <li><a href="#" className="hover:text-black">Community</a></li>
            </ul>
          </div>

   
          <div>
            <h4 className="font-semibold text-black mb-4">Support</h4>
            <ul className="space-y-2 text-gray-500">
              <li><a href="#" className="hover:text-black">Help</a></li>
              <li><a href="#" className="hover:text-black">Support</a></li>
              <li><a href="#" className="hover:text-black">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-black">Term & Conditions</a></li>
              <li><a href="#" className="hover:text-black">Help & Support</a></li>
            </ul>
          </div>

     
          <div>
            <h4 className="font-semibold text-black mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-500">
              <li><a href="#" className="hover:text-black">Call Centre</a></li>
              <li><a href="#" className="hover:text-black">Email Us</a></li>
              <li><a href="#" className="hover:text-black">Term & Conditions</a></li>
              <li><a href="#" className="hover:text-black">Help Center</a></li>
            </ul>
          </div>

        </div>
      </footer> */}

    </div>
  );
}

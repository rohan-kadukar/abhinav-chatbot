"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function RecruitmentPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    position: '',
    experience: '',
    resume: null,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      resume: e.target.files[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData);
    alert("Thank you for your application! Abhinav Academy will review your application and contact you soon.");
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      qualification: '',
      position: '',
      experience: '',
      resume: null,
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Academy Logo */}
      <div className="bg-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4">
              {/* Replace with actual logo if available */}
              <div className="text-blue-700 font-bold text-xl">AA</div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Abhinav Academy</h1>
              <p className="text-sm md:text-base">Gadhinglaj</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <h2 className="text-xl md:text-2xl font-semibold">Join Our Teaching Team</h2>
            <p className="text-sm md:text-base">Excellence in Education Since 2005</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              
              {/* Academy and Recruitment Info */}
              <div>
                <div className="mb-8 pb-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">About Abhinav Academy</h2>
                  <p className="text-gray-700 mb-4">
                    Established in 2005, Abhinav Academy Gadhinglaj has been a center of academic excellence in the region. 
                    We are dedicated to providing quality education and nurturing the potential of every student through 
                    innovative teaching methods and a supportive learning environment.
                  </p>
                  <p className="text-gray-700">
                    Our faculty consists of passionate educators who are experts in their fields and committed to 
                    the holistic development of students.
                  </p>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">Why Join Us?</h2>
                  <ul className="text-gray-700 space-y-3">
                    <li className="flex items-start">
                      <span className="text-blue-700 mr-2">✓</span>
                      <span>Supportive and collaborative work environment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-700 mr-2">✓</span>
                      <span>Opportunities for professional growth and development</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-700 mr-2">✓</span>
                      <span>Competitive salary and benefits</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-700 mr-2">✓</span>
                      <span>Modern teaching facilities and resources</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-700 mr-2">✓</span>
                      <span>Make a meaningful impact on students' lives</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">Current Openings</h2>
                  <div className="space-y-4">
                    <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800">Mathematics Faculty</h4>
                      <p className="text-gray-600 text-sm mt-1">For Secondary and Higher Secondary Classes</p>
                    </div>
                    <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800">Science Faculty</h4>
                      <p className="text-gray-600 text-sm mt-1">Physics, Chemistry and Biology</p>
                    </div>
                    <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800">English Language Teacher</h4>
                      <p className="text-gray-600 text-sm mt-1">For Primary and Secondary Classes</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-700 mb-3">Contact Information</h3>
                  <p className="mb-2">
                    <span className="font-medium">Address:</span> Main Road, Gadhinglaj, Kolhapur District, Maharashtra
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Email:</span> <a href="mailto:careers@abhinavacademy.edu" className="text-blue-600">careers@abhinavacademy.edu</a>
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> <a href="tel:+919876543210" className="text-blue-600">+91 98765 43210</a>
                  </p>
                </div>
              </div>
              
              {/* Application Form */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-blue-700 mb-6">Apply Now</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification*</label>
                    <input
                      type="text"
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g., M.Sc., B.Ed., Ph.D."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position Applied For*</label>
                      <select
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">Select Position</option>
                        <option value="Mathematics Faculty">Mathematics Faculty</option>
                        <option value="Science Faculty">Science Faculty</option>
                        <option value="English Language Teacher">English Language Teacher</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Teaching Experience</label>
                      <select
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">Select Experience</option>
                        <option value="Fresher">Fresher</option>
                        <option value="1-2 years">1-2 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5+ years">5+ years</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">Upload Resume/CV* (PDF, DOC, DOCX)</label>
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Why do you want to join Abhinav Academy?</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Tell us about your teaching philosophy and why you'd like to join our academy..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-700 text-white py-3 px-6 rounded-md hover:bg-blue-800 transition font-medium text-lg"
                  >
                    Submit Application
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {/* Copyright Notice */}
          <div className="bg-blue-700 text-white text-center py-3 text-sm">
            © {new Date().getFullYear()} Abhinav Academy Gadhinglaj. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
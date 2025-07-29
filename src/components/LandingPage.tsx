import React from 'react';
import { ArrowRight, Zap, Code, Download, Palette, Layers, Users, Shield, Clock, Sparkles } from 'lucide-react';
import type { LandingPageProps } from '../types';

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn, onSignUp }) => {
  const features = [
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Visual Architecture Design",
      description: "Drag and drop technology components to design your fullstack application architecture visually. No coding required to plan your system."
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Code Generation",
      description: "Automatically generate production-ready code, Docker configurations, and deployment files based on your visual design."
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Technology Stack Library",
      description: "Comprehensive library of modern technologies including React, Node.js, PostgreSQL, AWS, and many more."
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "One-Click Download",
      description: "Download your complete project as a ZIP file with all necessary files, dependencies, and documentation."
    }
  ];

  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Save Time",
      description: "Reduce development time from weeks to hours by automating the initial project setup and configuration."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Best Practices",
      description: "Built-in architectural patterns and best practices ensure your projects follow industry standards."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Visualize and share your architecture with team members before writing a single line of code."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Modern Stack",
      description: "Stay current with the latest technologies and frameworks in the ever-evolving web development landscape."
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Design Your Architecture",
      description: "Drag technology components from the sidebar onto the canvas. Connect them to define data flow and dependencies."
    },
    {
      step: "2",
      title: "Configure Components",
      description: "Click on components to configure their properties, settings, and connections with other services."
    },
    {
      step: "3",
      title: "Generate Code",
      description: "Click the generate button to create your complete project with all necessary files and configurations."
    },
    {
      step: "4",
      title: "Download & Deploy",
      description: "Download your project as a ZIP file and start developing immediately with a fully configured codebase."
    }
  ];

  const techCategories = [
    { name: "Frontend", count: "6", color: "bg-blue-500" },
    { name: "Backend", count: "6", color: "bg-green-500" },
    { name: "Databases", count: "6", color: "bg-purple-500" },
    { name: "Cloud Services", count: "6", color: "bg-orange-500" },
    { name: "Messaging", count: "6", color: "bg-red-500" },
    { name: "Caching", count: "6", color: "bg-yellow-500" },
    { name: "DevOps", count: "10", color: "bg-indigo-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
      {/* Top Right Auth Buttons */}
      <div className="fixed top-6 right-8 z-50 flex gap-3">
        <button
          onClick={onSignIn}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all duration-200 cursor-pointer shadow-lg"
        >
          Sign In
        </button>
        <button
          onClick={onSignUp}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-all duration-200 cursor-pointer shadow-lg"
        >
          Sign Up
        </button>
      </div>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Fullstack App
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Generator</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Design, visualize, and generate complete fullstack applications with our intuitive drag-and-drop interface. 
              From architecture to deployment-ready code in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to design and generate modern fullstack applications
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:bg-gray-50 transition-all duration-200">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl inline-flex mb-4">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Fullstack App Generator?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your development workflow and accelerate your projects
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="bg-blue-100 p-3 rounded-xl inline-flex mb-4">
                  <div className="text-blue-600">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get from idea to working application in just 4 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform translate-x-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Technology Library
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from 50+ modern technologies across all major categories
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techCategories.map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <span className={`${category.color} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                    {category.count}
                  </span>
                </div>
                <div className="space-y-2">
                  {category.name === "Frontend" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">React, Vue, Angular</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Next.js, Svelte</span>
                      </div>
                    </>
                  )}
                  {category.name === "Backend" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Express, Django</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">FastAPI, Spring</span>
                      </div>
                    </>
                  )}
                  {category.name === "Databases" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">PostgreSQL, MongoDB</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Redis, MySQL</span>
                      </div>
                    </>
                  )}
                  {category.name === "Cloud Services" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">AWS, Google Cloud</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Azure, Vercel</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Build Your Next Fullstack App?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers who are already using Fullstack App Generator to accelerate their development process.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
          >
            <span>Start Building Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400">
              © 2024 Fullstack App Generator. Built with ❤️ for developers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 
import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, Code, Download, Palette, Layers, Users, Shield, Clock, Sparkles, Play, Star, CheckCircle, Rocket, Globe, Database, Server, Settings } from 'lucide-react';
import type { LandingPageProps } from '../types';

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn, onSignUp }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeDemo, setActiveDemo] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveDemo(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { number: "10K+", label: "Developers", icon: <Users className="w-5 h-5" /> },
    { number: "50+", label: "Technologies", icon: <Code className="w-5 h-5" /> },
    { number: "1M+", label: "Projects Generated", icon: <Rocket className="w-5 h-5" /> },
    { number: "99%", label: "Uptime", icon: <CheckCircle className="w-5 h-5" /> }
  ];

  const demoSteps = [
    "Drag components from the sidebar",
    "Connect services with visual lines", 
    "Configure component properties",
    "Generate production-ready code"
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Tech Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] animate-float">
          <div className="bg-blue-500/10 backdrop-blur-sm p-3 rounded-2xl border border-blue-500/20">
            <Database className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="absolute top-40 right-[15%] animate-float animation-delay-1000">
          <div className="bg-purple-500/10 backdrop-blur-sm p-3 rounded-2xl border border-purple-500/20">
            <Server className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="absolute bottom-40 left-[20%] animate-float animation-delay-2000">
          <div className="bg-indigo-500/10 backdrop-blur-sm p-3 rounded-2xl border border-indigo-500/20">
            <Globe className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
        <div className="absolute top-60 left-[70%] animate-float animation-delay-3000">
          <div className="bg-emerald-500/10 backdrop-blur-sm p-3 rounded-2xl border border-emerald-500/20">
            <Code className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo with Animation */}
            <div className={`flex justify-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-3xl shadow-2xl">
                  <Zap className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-lg opacity-50 animate-pulse"></div>
              </div>
            </div>

            {/* Main Title */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-6xl md:text-7xl font-bold mb-6">
                <span className="text-white">Fullstack</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x"> Gen</span>
              </h1>
            </div>

            {/* Subtitle */}
            <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed">
                Design, visualize, and generate complete fullstack applications with our intuitive 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold"> drag-and-drop interface</span>
              </p>
              <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
                From architecture to deployment-ready code in minutes, not hours
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <button
                onClick={onGetStarted}
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-purple-500/25 hover:scale-105 cursor-pointer"
              >
                <span className="text-lg">Get Started Free</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </button>
              <button className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-10 py-5 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-3 hover:scale-105">
                <Play className="w-6 h-6" />
                <span className="text-lg">Watch Demo</span>
              </button>
            </div>

            {/* Demo Preview */}
            <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold text-lg">Live Demo Preview</h3>
                  <div className="flex space-x-2">
                    {demoSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === activeDemo ? 'bg-blue-400' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 border border-white/10">
                  <p className="text-gray-300 text-center text-lg">
                    {demoSteps[activeDemo]}
                  </p>
                  <div className="mt-4 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-white/5 flex items-center justify-center">
                    <div className="text-6xl animate-pulse">
                      {activeDemo === 0 && <Palette className="w-16 h-16 text-blue-400" />}
                      {activeDemo === 1 && <Layers className="w-16 h-16 text-purple-400" />}
                      {activeDemo === 2 && <Settings className="w-16 h-16 text-indigo-400" />}
                      {activeDemo === 3 && <Code className="w-16 h-16 text-emerald-400" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={`py-20 transition-all duration-1000 delay-1100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
                  <div className="flex justify-center mb-3 text-blue-400">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Features</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to design and generate modern fullstack applications with enterprise-grade quality
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-purple-400/30">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-2xl inline-flex mb-6 group-hover:shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-300">
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Fullstack Gen</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transform your development workflow and accelerate your projects with cutting-edge technology
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group relative">
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-blue-500/10 transition-all duration-500 hover:scale-105 hover:border-emerald-400/30">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-4 rounded-2xl inline-flex mb-6 group-hover:shadow-2xl group-hover:shadow-emerald-500/25 transition-all duration-300">
                      <div className="text-white">
                        {benefit.icon}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-blue-400 transition-all duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get from idea to working application in just 4 simple steps - no complex setup required
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center relative group">
                <div className="relative mb-8">
                  <div className="bg-gradient-to-r from-pink-500 to-violet-500 w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-2xl group-hover:shadow-pink-500/25 transition-all duration-300 group-hover:scale-110">
                    {step.step}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-pink-500/50 to-violet-500/50 transform translate-x-4">
                      <div className="absolute right-0 top-0 w-2 h-2 bg-violet-500 rounded-full transform translate-y-[-4px]"></div>
                    </div>
                  )}
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:border-pink-400/30">
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-violet-400 transition-all duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack Section */}
      <div className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Technology</span> Library
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose from 50+ modern technologies across all major categories - always up-to-date with the latest versions
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techCategories.map((category, index) => (
              <div key={index} className="group relative">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-orange-400/30">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-400 transition-all duration-300">
                      {category.name}
                    </h3>
                    <span className={`${category.color} text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      {category.count}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {category.name === "Frontend" && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">React, Vue, Angular</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Next.js, Svelte</span>
                        </div>
                      </>
                    )}
                    {category.name === "Backend" && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Express, Django</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">FastAPI, Spring</span>
                        </div>
                      </>
                    )}
                    {category.name === "Databases" && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">PostgreSQL, MongoDB</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Redis, MySQL</span>
                        </div>
                      </>
                    )}
                    {category.name === "Cloud Services" && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">AWS, Google Cloud</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Azure, Vercel</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Ready to Build Your Next 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Fullstack App</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Join thousands of developers who are already using Fullstack Gen to accelerate their development process and ship faster.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button
              onClick={onGetStarted}
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-6 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-purple-500/25 hover:scale-105"
            >
              <span>Start Building Now</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </button>
            <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-12 py-6 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-3 hover:scale-105">
              <Star className="w-6 h-6" />
              <span>View Examples</span>
            </button>
          </div>
          
          {/* Trust Indicators */}
          <div className="text-center">
            <p className="text-gray-400 mb-4 font-medium">Trusted by developers at</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-gray-400 font-bold text-lg">Google</div>
              <div className="text-gray-400 font-bold text-lg">Microsoft</div>
              <div className="text-gray-400 font-bold text-lg">Netflix</div>
              <div className="text-gray-400 font-bold text-lg">Uber</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-16 bg-slate-900 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-2xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50"></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Fullstack Gen</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              The fastest way to design and generate modern fullstack applications
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Docs</a>
            </div>
            <p className="text-gray-500">
              © 2024 Fullstack Gen. Built with ❤️ for developers worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 
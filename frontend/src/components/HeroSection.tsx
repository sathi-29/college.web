import React from 'react'
import { Search, Target, TrendingUp, Users, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

const HeroSection: React.FC = () => {
  const stats = [
    { icon: Users, label: 'Active Students', value: '50K+' },
    { icon: Target, label: 'Colleges Listed', value: '10K+' },
    { icon: TrendingUp, label: 'Success Rate', value: '95%' },
    { icon: Shield, label: 'Verified Data', value: '100%' },
  ]

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Find Your Perfect
            <span className="block gradient-text">Educational Path</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            India's most comprehensive college discovery and preparation platform. 
            Get personalized recommendations, admission predictions, and preparation 
            resources all in one place.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search for colleges, courses, or exams..."
                className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-colors">
                Search
              </button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-gray-500">Popular:</span>
              {['IIT Bombay', 'NEET UG', 'B.Tech CSE', 'MBA', 'NIT'].map((tag) => (
                <button
                  key={tag}
                  className="text-sm bg-white dark:bg-gray-800 px-3 py-1 rounded-full hover:shadow-md transition-shadow"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <stat.icon className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-4 mx-auto" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/predict"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Predict Admission
            </Link>
            <Link
              to="/colleges"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-full text-primary-600 bg-white hover:bg-gray-50 border-2 border-primary-600 transition-colors"
            >
              Explore Colleges
            </Link>
          </div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 text-white dark:text-gray-900"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  )
}

export default HeroSection
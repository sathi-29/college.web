import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Star, TrendingUp, Users, DollarSign, BookOpen } from 'lucide-react'
import { College } from '../types'

interface CollegeCardProps {
  college: College
  showSaveButton?: boolean
  onSaveToggle?: (collegeId: string) => void
  isSaved?: boolean
}

const CollegeCard: React.FC<CollegeCardProps> = ({
  college,
  showSaveButton = true,
  onSaveToggle,
  isSaved = false,
}) => {
  const rating = college.reviews?.length
    ? college.reviews.reduce((acc, review) => acc + review.rating.overall, 0) / college.reviews.length
    : 0

  const formatFee = (fee: number) => {
    if (fee >= 100000) return `₹${(fee / 100000).toFixed(1)}L`
    if (fee >= 1000) return `₹${(fee / 1000).toFixed(0)}K`
    return `₹${fee}`
  }

  return (
    <div className="card hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link to={`/colleges/${college._id}`}>
              <h3 className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
                {college.name}
              </h3>
            </Link>
            <div className="flex items-center mt-1 text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {college.location.city}, {college.location.state}
              </span>
            </div>
          </div>

          {showSaveButton && onSaveToggle && (
            <button
              onClick={() => onSaveToggle(college._id)}
              className={`p-2 rounded-lg transition-colors ${
                isSaved
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              aria-label={isSaved ? 'Remove from saved' : 'Save college'}
            >
              <svg
                className="w-5 h-5"
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={isSaved ? 0 : 2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Rating and Ranking */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-gray-500 text-sm ml-1">
              ({college.reviews?.length || 0} reviews)
            </span>
          </div>
          {college.ranking?.nirf?.overall && (
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm font-medium">NIRF #{college.ranking.nirf.overall}</span>
            </div>
          )}
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
            <div>
              <div className="text-xs text-gray-500">Annual Fees</div>
              <div className="font-medium">
                {college.courses?.[0]?.fees?.totalFee
                  ? formatFee(college.courses[0].fees.totalFee)
                  : 'N/A'}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 text-gray-400 mr-2" />
            <div>
              <div className="text-xs text-gray-500">Placement</div>
              <div className="font-medium">
                {college.placement?.averagePackage
                  ? formatFee(college.placement.averagePackage)
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium">Popular Courses</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {college.courses?.slice(0, 3).map((course, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {course.courseName}
              </span>
            ))}
            {college.courses && college.courses.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{college.courses.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge badge-primary">{college.type}</span>
          {college.accreditation?.naacGrade && (
            <span className="badge badge-success">
              NAAC {college.accreditation.naacGrade}
            </span>
          )}
          {college.infrastructure?.wifiCampus && (
            <span className="badge badge-secondary">Wi-Fi Campus</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link
            to={`/colleges/${college._id}`}
            className="flex-1 btn-primary text-center py-2 text-sm"
          >
            View Details
          </Link>
          <Link
            to={`/compare?colleges=${college._id}`}
            className="flex-1 btn-secondary text-center py-2 text-sm"
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CollegeCard

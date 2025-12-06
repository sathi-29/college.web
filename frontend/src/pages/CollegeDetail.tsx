import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin, Star, DollarSign, Users, TrendingUp, BookOpen,
  Calendar, Building, Wifi, Book, Award, CheckCircle,
  Share2, Heart, Download, Phone, Mail, Globe
} from 'lucide-react'
import { useCollegeStore } from '../store/collegeStore'
import { useAuthStore } from '../store/authStore'
import AdmissionChance from '../components/AdmissionChance'
import ReviewSection from '../components/ReviewSection'
import Gallery from '../components/Gallery'

const CollegeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState('overview')
  const [isSaved, setIsSaved] = useState(false)
  
  const { currentCollege, loading, error, fetchCollege } = useCollegeStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (id) {
      fetchCollege(id)
    }
  }, [id])

  const handleSaveToggle = () => {
    if (!user) {
      // Redirect to login
      return
    }
    setIsSaved(!isSaved)
    // TODO: API call to save/unsave
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Courses & Fees' },
    { id: 'admission', label: 'Admission' },
    { id: 'placement', label: 'Placement' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'gallery', label: 'Gallery' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !currentCollege) {
    return (
      <div className="min-h-screen pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              College not found
            </h2>
            <p className="text-gray-600 mb-6">
              The college you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/colleges" className="btn-primary">
              Browse Colleges
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const college = currentCollege
  const avgRating = college.reviews?.length
    ? college.reviews.reduce((acc, review) => acc + review.rating.overall, 0) / college.reviews.length
    : 0

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link to="/" className="hover:text-primary-600">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/colleges" className="hover:text-primary-600">Colleges</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{college.name}</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center flex-wrap gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {college.name}
                  </h1>
                  {college.accreditation?.naacGrade && (
                    <span className="badge badge-success text-sm">
                      NAAC {college.accreditation.naacGrade}
                    </span>
                  )}
                  {college.ranking?.nirf?.overall && (
                    <span className="badge badge-primary text-sm">
                      NIRF #{college.ranking.nirf.overall}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>
                    {college.location.city}, {college.location.state}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 mr-2" />
                    <span className="font-semibold">{avgRating.toFixed(1)}</span>
                    <span className="text-gray-600 ml-1">
                      ({college.reviews?.length || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Building className="w-5 h-5 text-gray-400 mr-2" />
                    <span>{college.type}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <span>Est. {college.establishmentYear}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSaveToggle}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                    isSaved
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </button>
                <button className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">About {college.name}</h2>
                    <p className="text-gray-600">
                      {college.description || 'No description available.'}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600 mb-1">
                          {college.faculty?.total || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Faculty</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600 mb-1">
                          {college.infrastructure?.campusArea || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Campus Area</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600 mb-1">
                          {college.infrastructure?.library?.books
                            ? `${(college.infrastructure.library.books / 1000).toFixed(0)}K+`
                            : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Books</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600 mb-1">
                          {college.infrastructure?.hostels?.capacity || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Hostel Capacity</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'courses' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Courses & Fees</h2>
                    <div className="space-y-4">
                      {college.courses?.map((course, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{course.courseName}</h3>
                              <div className="flex items-center text-gray-600 mt-1">
                                <BookOpen className="w-4 h-4 mr-2" />
                                <span>{course.degree} • {course.duration}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary-600">
                                ₹{(course.fees?.totalFee || 0).toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">per year</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-600">Seats</div>
                              <div className="font-medium">{course.seats?.total || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Eligibility</div>
                              <div className="font-medium">{course.eligibility?.minPercentage || 'N/A'}%</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Exam</div>
                              <div className="font-medium">
                                {course.eligibility?.exam?.join(', ') || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Degree</div>
                              <div className="font-medium">{course.degree}</div>
                            </div>
                          </div>

                          {course.specialization?.length > 0 && (
                            <div>
                              <div className="text-sm text-gray-600 mb-2">Specializations:</div>
                              <div className="flex flex-wrap gap-2">
                                {course.specialization.map((spec, i) => (
                                  <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'placement' && college.placement && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Placement Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {college.placement.placementPercentage}%
                        </div>
                        <div className="text-sm text-gray-600">Placement Rate</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          ₹{(college.placement.averagePackage / 100000).toFixed(1)}L
                        </div>
                        <div className="text-sm text-gray-600">Average Package</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          ₹{(college.placement.highestPackage / 100000).toFixed(1)}L
                        </div>
                        <div className="text-sm text-gray-600">Highest Package</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                          {college.placement.placedStudents}/{college.placement.totalStudents}
                        </div>
                        <div className="text-sm text-gray-600">Students Placed</div>
                      </div>
                    </div>

                    {college.placement.topRecruiters?.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Top Recruiters</h3>
                        <div className="flex flex-wrap gap-3">
                          {college.placement.topRecruiters.map((recruiter, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
                            >
                              {recruiter}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <ReviewSection collegeId={college._id} reviews={college.reviews || []} />
                )}

                {activeTab === 'gallery' && (
                  <Gallery images={college.images || []} />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Admission Chance */}
            <AdmissionChance college={college} />

            {/* Quick Facts */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Facts</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium">Type</div>
                    <div className="text-sm text-gray-600">{college.type}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium">Established</div>
                    <div className="text-sm text-gray-600">{college.establishmentYear}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium">Student Faculty Ratio</div>
                    <div className="text-sm text-gray-600">
                      {college.faculty?.studentFacultyRatio || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Wifi className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium">Campus</div>
                    <div className="text-sm text-gray-600">
                      {college.infrastructure?.wifiCampus ? 'Wi-Fi Enabled' : 'No Wi-Fi'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                {college.contact?.phone?.map((phone, index) => (
                  <div key={index} className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <a href={`tel:${phone}`} className="text-primary-600 hover:underline">
                      {phone}
                    </a>
                  </div>
                ))}
                {college.contact?.email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <a
                      href={`mailto:${college.contact.email}`}
                      className="text-primary-600 hover:underline"
                    >
                      {college.contact.email}
                    </a>
                  </div>
                )}
                {college.contact?.website && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <a
                      href={college.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Official Website
                    </a>
                  </div>
                )}
              </div>
              <button className="w-full mt-4 btn-primary">
                <Download className="w-5 h-5 mr-2 inline" />
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollegeDetail
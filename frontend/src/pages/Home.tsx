import React from 'react'
import HeroSection from '../components/HeroSection'
import FeaturesSection from '../components/FeaturesSection'
import PopularColleges from '../components/PopularColleges'
import ExamHighlights from '../components/ExamHighlights'
import Testimonials from '../components/Testimonials'
import CTASection from '../components/CTASection'

const Home: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <PopularColleges />
      <ExamHighlights />
      <Testimonials />
      <CTASection />
    </div>
  )
}

export default Home

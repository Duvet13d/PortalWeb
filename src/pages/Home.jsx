import LandingSection from '../components/homepage/LandingSection'
import CuratedLinksSection from '../components/homepage/CuratedLinksSection'

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Landing Section - Above the fold */}
      <LandingSection />
      
      {/* Curated Links Section - Below the fold, scroll triggered */}
      <CuratedLinksSection />
    </div>
  )
}

export default Home 
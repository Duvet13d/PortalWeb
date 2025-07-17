import LandingSection from '../components/homepage/LandingSection'
import WidgetSection from '../components/homepage/WidgetSection'

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Landing Section - Above the fold */}
      <LandingSection />
      
      {/* Widget Section - Below the fold, scroll triggered */}
      <WidgetSection />
    </div>
  )
}

export default Home 
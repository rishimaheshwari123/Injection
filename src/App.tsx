import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import HealthcareServicesPage from './pages/HealthcareServicesPage'
import ResearchServicesPage from './pages/ResearchServicesPage'
import TrainingPlacementPage from './pages/TrainingPlacementPage'
import ResearchPage from './pages/ResearchPage'
import BlogPage from './pages/BlogPage'
import ContactPage from './pages/ContactPage'
import Navigation from './components/Navigation'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/healthcare" element={<HealthcareServicesPage />} />
        <Route path="/services/research" element={<ResearchServicesPage />} />
        <Route path="/services/training" element={<TrainingPlacementPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
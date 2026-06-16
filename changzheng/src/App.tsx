import { Routes, Route } from 'react-router'
import { LanguageProvider } from './i18n/LanguageProvider'
import Layout from './components/Layout'
import Home from './pages/Home'
import Generator from './pages/Generator'
import Community from './pages/Community'
import AppDetail from './pages/AppDetail'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <LanguageProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<Generator />} />
          <Route path="/community" element={<Community />} />
          <Route path="/app/:id" element={<AppDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </LanguageProvider>
  )
}

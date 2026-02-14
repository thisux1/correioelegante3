import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { Create } from '@/pages/Create'
import { Auth } from '@/pages/Auth'
import { Profile } from '@/pages/Profile'
import { Contact } from '@/pages/Contact'
import { Payment } from '@/pages/Payment'
import { Card } from '@/pages/Card'
import { ErrorPage } from '@/pages/Error'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/payment/:messageId" element={<Payment />} />
          <Route path="/card/:id" element={<Card />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

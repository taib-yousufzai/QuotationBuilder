import { BrowserRouter, Routes, Route } from 'react-router-dom'
import QuotationBuilder from './pages/QuotationBuilder'
import QuotationList from './pages/QuotationList'
import ViewQuotation from './pages/ViewQuotation'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuotationBuilder />} />
        <Route path="/list" element={<QuotationList />} />
        <Route path="/view/:id" element={<ViewQuotation />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

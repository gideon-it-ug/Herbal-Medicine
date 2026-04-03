import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PlantList from './pages/PlantList';
import PlantDetail from './pages/PlantDetail';
import Upload from './pages/Upload';
import Login from './pages/Login'; // ✅ ADD THIS
import SearchResults from './pages/SearchResults';
import Chatbot from './pages/Chatbot';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} /> {/* ✅ ADD THIS */}
        <Route path='/plants' element={<PlantList />} />
        <Route path='/plants/:id' element={<PlantDetail />} />
        <Route path='/upload' element={<Upload />} />
        <Route path='/search' element= {<SearchResults />} />
        <Route path='/chatbot' element= {<Chatbot />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
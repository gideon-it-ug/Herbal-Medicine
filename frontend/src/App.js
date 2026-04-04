import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import PlantList from './pages/PlantList';
import PlantDetail from './pages/PlantDetail';
import SearchResults from './pages/SearchResults';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Chatbot from './pages/Chatbot';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('access');
  return token ? children : <Navigate to='/login' />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/plants' element={<PlantList />} />
        <Route path='/plants/:id' element={<PlantDetail />} />
        <Route path='/search' element={<SearchResults />} />
        <Route path='/login' element={<Login />} />
        <Route path='/chatbot' element={<Chatbot />} />
        <Route path='/upload' element={<PrivateRoute><Upload /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;

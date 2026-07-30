import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import PlantList from './pages/PlantList';
import PlantDetail from './pages/PlantDetail';
import SearchResults from './pages/SearchResults';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import Chatbot from './pages/Chatbot';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Approvals from './pages/Approvals';
import Profile from './pages/Profile';
import Classification from './pages/Classification';

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
        <Route path='/register' element={<Register />} />
        <Route path='/chatbot' element={<Chatbot />} />
        <Route path='/upload' element={<PrivateRoute><Upload /></PrivateRoute>} />
        <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path='/reports' element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path='/approvals' element={<PrivateRoute><Approvals /></PrivateRoute>} />
        <Route path='/profile' element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path='/classify' element={<Classification />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;

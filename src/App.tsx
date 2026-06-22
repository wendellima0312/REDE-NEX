import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Feed } from './pages/Feed';
import { Training } from './pages/Training';
import { Wiki } from './pages/Wiki';
import { Users } from './pages/Users';
import { Permissions } from './pages/Permissions';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/treinamentos" element={<Training />} />
          <Route path="/wiki" element={<Wiki />} />
          <Route path="/colaboradores" element={<Users />} />
          <Route path="/permissoes" element={<Permissions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

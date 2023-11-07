import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Login from '../pages/Login'
import Chat  from '../pages/Chat'
import Profile from '../pages/Profile'
import Home from '../pages/Home'
import Game from '../pages/Game'
import Public from '../pages/Public/[userName]'

import { AuthProvider, RedirectAtAuth, RequireAuth } from '../hooks/AuthHooks';
import App from '../pages/App';
import TwoFAValidation from '@/pages/TwoFA';
const AppRoutes = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<App />}>
            <Route index element={<Navigate to="Login" />}/>
            <Route path="Login" element = {<RedirectAtAuth> <Login/></RedirectAtAuth>}/>
            <Route path="TwoFA" element = {<TwoFAValidation/>}/>
            <Route  path="Home" element={ <RequireAuth>     <Home /></RequireAuth>}/>
            <Route path="Profile" element={ <RequireAuth>   <Profile /></RequireAuth>}/>
            <Route  path="Chat" element={     <RequireAuth> <Chat /></RequireAuth>}/>
            <Route  path="Game" element={     <RequireAuth> <Game privateGame={false}/></RequireAuth>}/>
            <Route path="privateGame" element={<Game privateGame={true} />} />
            
            <Route  path="Public/:userName" element={     <RequireAuth> <Public/></RequireAuth>}/>
          </Route>
          <Route path="*" element = {<Navigate to="Login"/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;
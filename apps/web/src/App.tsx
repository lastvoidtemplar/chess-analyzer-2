import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./hooks/auth";
import { TRPCProvider } from "./hooks/trpc";
import Layout from "./layouts/Layout";
import Home from "./components/Home";
import ProtectedLayout from "./layouts/ProtectedLayout";
import Profile from "./components/Profile";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TRPCProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route element={<ProtectedLayout />}>
                <Route path="/protected" element={<Profile />} />
              </Route>
            </Route>
          </Routes>
        </TRPCProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

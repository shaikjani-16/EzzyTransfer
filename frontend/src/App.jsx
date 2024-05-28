import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import {
  Signin,
  Send,
  Signup,
  Dashboard,
  Appbar,
  SendMoney,
} from "./components/index.js";
import "./App.css";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Appbar />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/send" element={<SendMoney />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

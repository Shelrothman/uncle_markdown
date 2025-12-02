import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import './App.css'

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(true)

  return (
    <div className="app">
      <Header />
      <div className="app-content">
        {sidebarVisible ? (
          <Sidebar onToggleSidebar={() => setSidebarVisible(false)} />
        ) : (
          <div className="sidebar-collapsed">
            <div className="collapsed-icons">
              <button 
                className="collapsed-icon" 
                onClick={() => setSidebarVisible(true)}
                title="Show Sidebar"
              >
                📁
              </button>
            </div>
          </div>
        )}
        <Editor />
      </div>
    </div>
  )
}

export default App

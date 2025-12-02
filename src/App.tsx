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
        {sidebarVisible && <Sidebar />}
        <Editor />
        <button 
          className="sidebar-toggle" 
          onClick={() => setSidebarVisible(!sidebarVisible)}
          title={sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          {sidebarVisible ? '◀' : '▶'}
        </button>
      </div>
    </div>
  )
}

export default App

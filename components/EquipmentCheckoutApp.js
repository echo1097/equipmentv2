import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, ChevronDown, Download, LogIn } from 'lucide-react';

// Main App Component
export default function EquipmentCheckoutApp() {
  const [activeTab, setActiveTab] = useState('checkout');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const equipmentTypes = ['Charger', 'Headphones', 'Chromebook', 'Other'];
  
  // Manage checkout data state
  const [checkoutData, setCheckoutData] = useState({
    equipmentType: 'Charger',
    equipmentNumber: '',
    staffApproval: '',
  });
  
  // Manage return data state
  const [returnData, setReturnData] = useState({
    equipmentType: 'Charger',
    equipmentNumber: '',
  });
  
  // For log storage and retrieval
  const [logs, setLogs] = useState([]);
  
  // Show notification function
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };
  
  // Load logs on component mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/getAllLogs');
        
        if (!response.ok) {
          throw new Error('Failed to fetch logs');
        }
        
        const data = await response.json();
        setLogs(data.logs || []);
      } catch (error) {
        console.error('Error fetching logs:', error);
        showNotification('Failed to fetch logs', 'error');
      }
    };
    
    fetchLogs();
  }, []);
  
  // Handle checkout form submission
  const handleCheckout = async () => {
    // Validate form
    if (!checkoutData.equipmentNumber || !checkoutData.staffApproval) {
      showNotification('Please fill out all fields', 'error');
      return;
    }
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error checking out equipment');
      }
      
      const result = await response.json();
      
      // Add the new log to our local state
      setLogs([result.logEntry, ...logs]);
      
      // Reset form
      setCheckoutData({
        equipmentType: 'Charger',
        equipmentNumber: '',
        staffApproval: '',
      });
      
      showNotification('Equipment checked out successfully!', 'success');
    } catch (error) {
      showNotification(error.message || 'Error checking out equipment', 'error');
    }
  };
  
  // Handle return form submission
  const handleReturn = async () => {
    // Validate form
    if (!returnData.equipmentNumber) {
      showNotification('Please enter an equipment number', 'error');
      return;
    }
    
    try {
      const response = await fetch('/api/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(returnData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error returning equipment');
      }
      
      const result = await response.json();
      
      // Add the new log to our local state
      setLogs([result.logEntry, ...logs]);
      
      // Reset form
      setReturnData({
        equipmentType: 'Charger',
        equipmentNumber: '',
      });
      
      showNotification('Equipment returned successfully!', 'success');
    } catch (error) {
      showNotification(error.message || 'Error returning equipment', 'error');
    }
  };
  
  // Handle password validation for logs access
  const handlePasswordSubmit = () => {
    // Check password against the hardcoded value (in a real app, this would check against server)
    if (password === 'MHS') {
      downloadLogs();
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };
  
  // Function to download logs as a zip file
  const downloadLogs = async () => {
    try {
      // Fetch logs from server as a zip file
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid password');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error downloading logs');
        }
      }
      
      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'equipment_logs.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('Logs downloaded successfully!', 'success');
    } catch (error) {
      showNotification(error.message || 'Error downloading logs', 'error');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105 duration-300">
        <header className="bg-blue-600 p-4 text-white text-center">
          <h1 className="text-2xl font-bold">Equipment Checkout System</h1>
        </header>
        
        <div className="flex border-b">
          <button 
            className={`flex-1 py-3 font-medium transition-colors duration-300 ${activeTab === 'checkout' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
            onClick={() => setActiveTab('checkout')}
          >
            Checkout
          </button>
          <button 
            className={`flex-1 py-3 font-medium transition-colors duration-300 ${activeTab === 'return' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
            onClick={() => setActiveTab('return')}
          >
            Return
          </button>
          <button 
            className={`flex-1 py-3 font-medium transition-colors duration-300 ${activeTab === 'logs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
            onClick={() => setShowPasswordModal(true)}
          >
            <div className="flex items-center justify-center gap-1">
              <LogIn size={16} />
              Logs
            </div>
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'checkout' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Equipment Type</label>
                <div className="relative">
                  <select 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 pl-3 pr-10 text-base appearance-none border"
                    value={checkoutData.equipmentType}
                    onChange={(e) => setCheckoutData({...checkoutData, equipmentType: e.target.value})}
                  >
                    {equipmentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Equipment Number</label>
                <input 
                  type="text" 
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                  value={checkoutData.equipmentNumber}
                  onChange={(e) => setCheckoutData({...checkoutData, equipmentNumber: e.target.value})}
                  placeholder="e.g. CB-1001"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Staff Approval</label>
                <input 
                  type="text" 
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                  value={checkoutData.staffApproval}
                  onChange={(e) => setCheckoutData({...checkoutData, staffApproval: e.target.value})}
                  placeholder="Teacher Name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date & Time Out</label>
                <input 
                  type="text" 
                  className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 py-2 px-3 border"
                  value={new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
                  disabled
                />
                <p className="text-xs text-gray-500">Current time (PST)</p>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition hover:scale-105 duration-300"
              >
                Check Out Equipment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Equipment Type</label>
                <div className="relative">
                  <select 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 pl-3 pr-10 text-base appearance-none border"
                    value={returnData.equipmentType}
                    onChange={(e) => setReturnData({...returnData, equipmentType: e.target.value})}
                  >
                    {equipmentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Equipment Number</label>
                <input 
                  type="text" 
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                  value={returnData.equipmentNumber}
                  onChange={(e) => setReturnData({...returnData, equipmentNumber: e.target.value})}
                  placeholder="e.g. CB-1001"
                />
              </div>
              
              <button 
                onClick={handleReturn}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition hover:scale-105 duration-300"
              >
                Return Equipment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 w-full max-w-md transform transition-all duration-300 animate-pop-in">
            <h3 className="text-lg font-bold mb-4">Enter Admin Password</h3>
            <div className="space-y-4">
              <input
                type="password"
                className={`w-full border rounded-md py-2 px-3 ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit();
                  }
                }}
              />
              {passwordError && (
                <p className="text-red-500 text-sm">Incorrect password</p>
              )}
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium hover:bg-gray-300 transition-colors duration-300"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setPasswordError(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-1"
                  onClick={handlePasswordSubmit}
                >
                  <Download size={16} />
                  Download Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div 
          className={`fixed bottom-4 right-4 py-2 px-4 rounded-md text-white flex items-center gap-2 animate-slide-in-right ${
            notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle size={20} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-pop-in {
          animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
}

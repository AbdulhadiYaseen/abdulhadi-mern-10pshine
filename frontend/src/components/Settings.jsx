import React from 'react';

function Settings() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                <div className="space-y-6">
                    <div>
                        
                    </div>

                    <button className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings; 
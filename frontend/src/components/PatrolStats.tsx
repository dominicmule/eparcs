import React from 'react';
import { Shield, AlertTriangle, Target } from 'lucide-react';

function PatrolStats() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Patrol Statistics</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <Shield className="text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Active Rangers</p>
            <p className="text-lg font-semibold text-gray-800">12</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <AlertTriangle className="text-red-600" />
          <div>
            <p className="text-sm text-gray-600">Critical Areas</p>
            <p className="text-lg font-semibold text-gray-800">3</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <Target className="text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Coverage Today</p>
            <p className="text-lg font-semibold text-gray-800">67%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatrolStats;
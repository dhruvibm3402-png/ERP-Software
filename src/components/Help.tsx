import React from 'react';
import { HelpCircle, BookOpen, Clock, MessageSquare, Phone } from 'lucide-react';

export default function Help() {
  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300">
      <div>
        <h1
          className="text-2xl font-bold flex items-center gap-2"
          style={{ color: 'var(--secondary)' }}
        >
          <HelpCircle size={28} className="text-primary" /> Help & Support
        </h1>
        <p className="text-muted mt-1">Documentation, tutorials, and technical support.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-8 flex flex-col items-center justify-center text-center gap-4 border-2 border-indigo-100 hover:border-indigo-300 transition">
          <BookOpen size={48} className="text-indigo-600" />
          <div>
            <h3 className="font-bold text-lg mb-1">Knowledge Base</h3>
            <p className="text-sm text-gray-500">
              Read guides on how to use POS, manufacturing, and general ledger.
            </p>
          </div>
          <button className="btn btn-primary mt-2">Open Docs</button>
        </div>
        <div className="card p-8 flex flex-col items-center justify-center text-center gap-4 border-2 border-green-100 hover:border-green-300 transition">
          <MessageSquare size={48} className="text-green-600" />
          <div>
            <h3 className="font-bold text-lg mb-1">Live Chat Support</h3>
            <p className="text-sm text-gray-500">
              Connect with an Aura ERP technician for instant resolutions.
            </p>
          </div>
          <button className="btn bg-green-50 text-green-700 font-bold border-green-200 mt-2">
            Start Chat
          </button>
        </div>
      </div>
      <div className="card p-5 mt-4 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Clock size={24} className="text-gray-400" />
          <div>
            <h4 className="font-bold">System Status</h4>
            <p className="text-sm text-gray-500">All services operational</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Phone size={24} className="text-gray-400" />
          <div>
            <h4 className="font-bold">Toll Free</h4>
            <p className="text-sm text-gray-500">1800-AURA-ERP</p>
          </div>
        </div>
      </div>
    </div>
  );
}

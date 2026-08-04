import React, { useState } from 'react';
import { ArrowLeft, Edit, Phone, Mail, Building2, MapPin, Receipt, History, Wallet, CheckCircle, Clock } from 'lucide-react';

export default function VendorProfile({ vendor, onBack, onEdit }: { vendor: any, onBack: () => void, onEdit: (vendor: any) => void }) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 shadow-sm">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Vendor Details</h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(vendor)} className="btn bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-sm">
                        <Edit size={16} /> Edit Vendor
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Left Profile Card */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="card text-center p-6 bg-white border border-gray-100 shadow-sm flex flex-col items-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold uppercase shadow-lg shadow-indigo-200 mb-4 transform rotate-3">
                            {vendor.vendorName.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{vendor.vendorName}</h2>
                        {vendor.companyName && <p className="text-sm font-medium text-gray-500 mb-3">{vendor.companyName}</p>}

                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5 ${vendor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {vendor.status}
                        </div>

                        <div className="w-full flex flex-col gap-3 text-left border-t border-gray-100 pt-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5"><Building2 size={16} /></div>
                                <div>
                                    <div className="text-xs text-gray-400 font-semibold uppercase">Vendor Code</div>
                                    <div className="text-sm font-semibold text-gray-800">{vendor.vendorCode}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5"><Phone size={16} /></div>
                                <div>
                                    <div className="text-xs text-gray-400 font-semibold uppercase">Mobile</div>
                                    <div className="text-sm font-semibold text-gray-800">{vendor.mobile}</div>
                                </div>
                            </div>
                            {vendor.email && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5"><Mail size={16} /></div>
                                    <div>
                                        <div className="text-xs text-gray-400 font-semibold uppercase">Email</div>
                                        <div className="text-sm font-semibold text-gray-800">{vendor.email}</div>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <div className="p-2 justify-center bg-gray-50 rounded-lg text-gray-400 mt-0.5"><Receipt size={16} /></div>
                                <div>
                                    <div className="text-xs text-gray-400 font-semibold uppercase">GST No</div>
                                    <div className="text-sm font-semibold text-gray-800">{vendor.gstNumber || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <Wallet size={16} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Outstanding Balance</h3>
                        </div>
                        <div className="text-3xl font-black mb-1">
                            ₹{(vendor.outstandingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-400">Credit Limit: ₹{(vendor.creditLimit || 0).toLocaleString('en-IN')}</div>
                    </div>
                </div>

                {/* Right Tabs Content */}
                <div className="lg:col-span-3 card p-0 overflow-hidden flex flex-col bg-white shadow-sm border border-gray-100">
                    <div className="flex border-b border-gray-200 bg-gray-50/50 overflow-x-auto scrollbar-hide shrink-0">
                        {['overview', 'purchase-history', 'payment-history', 'documents', 'activity-timeline'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-4 text-sm font-bold capitalize transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'}`}
                            >
                                {tab.replace('-', ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={18} className="text-primary" /> Address & Location</h3>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{vendor.address || 'No address provided'}</p>
                                        {(vendor.city || vendor.state || vendor.pincode) && (
                                            <p className="text-sm text-gray-600 mt-2 font-medium">
                                                {vendor.city} {vendor.state ? `, ${vendor.state}` : ''} {vendor.pincode}
                                                <br />
                                                {vendor.country}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Building2 size={18} className="text-primary" /> Bank Details</h3>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="text-gray-500 font-medium">Bank Name</div>
                                            <div className="font-semibold text-gray-900 text-right">{vendor.bankName || '—'}</div>

                                            <div className="text-gray-500 font-medium">Account Name</div>
                                            <div className="font-semibold text-gray-900 text-right">{vendor.accountHolderName || '—'}</div>

                                            <div className="text-gray-500 font-medium">Account No</div>
                                            <div className="font-semibold text-gray-900 text-right">{vendor.accountNumber || '—'}</div>

                                            <div className="text-gray-500 font-medium">IFSC Code</div>
                                            <div className="font-semibold text-primary uppercase text-right">{vendor.ifscCode || '—'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 mt-2">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><History size={18} className="text-primary" /> Business Profile</h3>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-500 font-medium mb-1">Vendor Type</div>
                                            <div className="font-bold text-gray-900">{vendor.vendorType?.replace('_', ' ') || '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 font-medium mb-1">Payment Terms</div>
                                            <div className="font-bold text-gray-900">{vendor.paymentTerms?.replace('_', ' ') || '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 font-medium mb-1">PAN Number</div>
                                            <div className="font-bold text-gray-900">{vendor.panNumber || '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 font-medium mb-1">MSME Number</div>
                                            <div className="font-bold text-gray-900">{vendor.msmeNumber || '—'}</div>
                                        </div>
                                    </div>

                                    {vendor.notes && (
                                        <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-sm">
                                            <strong className="text-yellow-800 block mb-1">Notes:</strong>
                                            <p className="text-yellow-700">{vendor.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(activeTab === 'purchase-history' || activeTab === 'payment-history' || activeTab === 'documents') && (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                    <Clock size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">No data available yet</h3>
                                <p className="text-gray-500 max-w-sm">
                                    This module corresponds to the {activeTab.replace('-', ' ')} which will populate once transactions are recorded.
                                </p>
                            </div>
                        )}

                        {activeTab === 'activity-timeline' && (
                            <div className="animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-gray-800 mb-6">Activity Timeline</h3>
                                <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
                                    <div className="relative">
                                        <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-primary ring-4 ring-white"></div>
                                        <p className="text-sm font-semibold text-gray-800">Vendor Profile Created</p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(vendor.createdAt).toLocaleString('en-IN')}</p>
                                    </div>
                                    {vendor.updatedAt !== vendor.createdAt && (
                                        <div className="relative">
                                            <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white"></div>
                                            <p className="text-sm font-semibold text-gray-800">Profile Updated</p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(vendor.updatedAt).toLocaleString('en-IN')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

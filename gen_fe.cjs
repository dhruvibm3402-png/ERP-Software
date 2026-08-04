const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
};

const frontendContent = `
import React, { useState } from 'react';
import { Search, Plus, UserCircle, Briefcase, Phone, Mail, FileText, ChevronRight, ChevronLeft, Building, CreditCard, Save, X, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';

export default function Employees() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const initialForm = {
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    role: 'SALES',
    gender: 'MALE',
    baseSalary: 15000,
    departmentId: '',
    designationId: '',
    employmentType: 'FULL_TIME',
    salaryType: 'MONTHLY',
    city: '',
    address: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // Fetch employees logic
  const { data: response, isLoading } = useQuery({
    queryKey: ['employees', search, page],
    queryFn: async () => (await apiClient.get(\`/v1/employees?search=\${search}&page=\${page}&limit=\${limit}\`)).data,
  });
  
  const employees = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.post('/v1/employees', data),
    onSuccess: () => {
      toast.success('Employee onboarded successfully!');
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to create employee'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await apiClient.delete(\`/v1/employees/\${id}\`),
    onSuccess: () => {
      toast.success('Employee deactivated.');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });

  function closeModal() {
    setIsCreating(false);
    setSelectedEmployeeId(null);
    setStep(1);
    setFormData(initialForm);
  }

  const getRoleColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'bg-red-100 text-red-700';
      case 'MANAGER': return 'bg-purple-100 text-purple-700';
      case 'GOLDSMITH': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };
  
  const submitForm = () => {
    const payload = { ...formData, name: \`\${formData.firstName} \${formData.lastName}\`.trim() };
    createMutation.mutate(payload);
  };

  return (
    <div className="flex flex-col h-full gap-4 relative animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--secondary)' }}>
            <UserCircle size={28} className="text-primary" />
            Employee Management
          </h1>
          <p className="text-muted mt-1">Manage staff profiles, payroll, attendance, and documents.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn bg-white border text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm font-semibold">
            <FileText size={18} /> Export Excel
          </button>
          <button className="btn btn-primary shadow-lg flex items-center gap-2" onClick={() => setIsCreating(true)}>
            <Plus size={18} /> Add Employee
          </button>
        </div>
      </div>

      <div className="card flex items-center justify-between p-4 py-3">
        <div className="search-bar w-full max-w-md bg-gray-50 border-gray-200 m-0">
          <Search size={18} className="text-muted" />
          <input
            type="text"
            placeholder="Search by name, ID or phone..."
            className="search-input w-full bg-transparent"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1 text-sm font-semibold text-gray-600">
          <button className="px-4 py-1.5 rounded-md bg-white shadow-sm text-gray-900">All Employees</button>
          <button className="px-4 py-1.5 rounded-md hover:text-gray-900">Departments</button>
          <button className="px-4 py-1.5 rounded-md hover:text-gray-900">Attendance</button>
          <button className="px-4 py-1.5 rounded-md hover:text-gray-900">Payroll</button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center flex-1 items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
          {employees.map((emp: any) => (
            <div key={emp.id} className="card hover:shadow-lg transition-all border border-gray-100 cursor-default group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-blue-500"></div>
              
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                  <Edit size={14} />
                </button>
                <button className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100" onClick={() => {
                  if(confirm('Deactivate employee?')) {
                     deleteMutation.mutate(emp.id);
                  }
                }}>
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4 mt-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center items-center font-bold text-xl text-gray-600 shrink-0 uppercase border border-gray-200 shadow-inner">
                  {emp.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight truncate">{emp.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">{emp.employeeId}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mb-5 px-1">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="bg-gray-50 p-1.5 rounded text-gray-400"><Phone size={14} /></div>
                  <span className="font-medium">{emp.mobile}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="bg-gray-50 p-1.5 rounded text-gray-400"><Mail size={14} /></div>
                  <span className="truncate">{emp.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="bg-gray-50 p-1.5 rounded text-gray-400"><Briefcase size={14} /></div>
                  <span className="font-medium capitalize">{emp.EmployeeExt?.Department?.name || 'Unassigned Dept'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className={\`px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-black/5 \${getRoleColor(emp.role)}\`}>
                  {emp.role}
                </span>
                <button className="text-xs text-primary font-semibold hover:underline flex items-center gap-1.5 bg-blue-50/50 px-3 py-1 rounded-full">
                  <CreditCard size={12} /> Payroll
                </button>
              </div>
            </div>
          ))}
          {employees.length === 0 && (
             <div className="col-span-full py-20 text-center text-gray-400 font-medium">No employees found.</div>
          )}
        </div>
      )}

      {/* Pagination controls */}
      {!search && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
           <button 
             className="btn btn-primary" 
             disabled={page === 1} 
             onClick={() => setPage(page - 1)}
           >
             Prev
           </button>
           <span className="px-4 py-2 font-semibold">Page {page} of {meta.totalPages}</span>
           <button 
             className="btn btn-primary" 
             disabled={page === meta.totalPages} 
             onClick={() => setPage(page + 1)}
           >
             Next
           </button>
        </div>
      )}

      {/* Multi-step Create Employee Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <UserCircle size={24} className="text-primary" />
                Add New Employee
              </h2>
              <button className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition-colors" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            
            {/* Stepper Header */}
            <div className="flex px-8 py-5 border-b bg-white relative">
               <div className="absolute top-1/2 left-12 right-12 h-1 bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
               <div className="absolute top-1/2 left-12 h-1 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-300" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
               
               <div className="flex-1 text-center relative z-10 flex flex-col items-center gap-2">
                  <div className={\`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 \${step >= 1 ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'}\`}>1</div>
                  <span className={\`text-xs font-semibold \${step >= 1 ? 'text-gray-800' : 'text-gray-400'}\`}>Personal Info</span>
               </div>
               <div className="flex-1 text-center relative z-10 flex flex-col items-center gap-2">
                  <div className={\`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300 \${step >= 2 ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'}\`}>2</div>
                  <span className={\`text-xs font-semibold \${step >= 2 ? 'text-gray-800' : 'text-gray-400'}\`}>Employment</span>
               </div>
               <div className="flex-1 text-center relative z-10 flex flex-col items-center gap-2">
                  <div className={\`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300 \${step >= 3 ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'}\`}>3</div>
                  <span className={\`text-xs font-semibold \${step >= 3 ? 'text-gray-800' : 'text-gray-400'}\`}>Payroll</span>
               </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/30">
              {step === 1 && (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">First Name <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Last Name</label>
                      <input type="text" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Doe" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Mobile <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full p-3 border border-gray-200 rounded-xl outline-none shadow-sm" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="9876543210" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                      <input type="email" className="w-full p-3 border border-gray-200 rounded-xl outline-none shadow-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Gender</label>
                      <select className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white shadow-sm" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">City</label>
                       <input type="text" className="w-full p-3 border border-gray-200 rounded-xl outline-none shadow-sm" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Mumbai" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Address</label>
                    <textarea className="w-full p-3 border border-gray-200 rounded-xl outline-none min-h-[80px] shadow-sm resize-none" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full residential address..."></textarea>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Employment Type</label>
                      <select className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white shadow-sm" value={formData.employmentType} onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}>
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">System Role <span className="text-red-500">*</span></label>
                      <select className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white shadow-sm" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                        <option value="SALES">Sales Staff</option>
                        <option value="MANAGER">Store Manager</option>
                        <option value="GOLDSMITH">Gold Smith</option>
                        <option value="ADMIN">Administrator</option>
                        <option value="CASHIER">Cashier</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Department</label>
                      <select className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white shadow-sm text-gray-400" disabled>
                        <option>Loading departments...</option>
                      </select>
                       <p className="text-[10px] text-gray-400 mt-1">Select empty until departments API is linked.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Designation</label>
                      <select className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white shadow-sm text-gray-400" disabled>
                        <option>Loading designations...</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 mb-6 shadow-sm">
                    <CreditCard size={20} className="shrink-0 text-blue-600" />
                    <div>
                       <h4 className="font-bold text-sm">Payroll Generation</h4>
                       <p className="text-xs text-blue-700 mt-1 bg-transparent">Entering base salary will automatically generate initial salary configurations and payslips each month based on attendance.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Salary Type</label>
                      <select className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white shadow-sm" value={formData.salaryType} onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}>
                        <option value="MONTHLY">Monthly Total</option>
                        <option value="DAILY">Daily Wage</option>
                        <option value="HOURLY">Hourly Wage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Base Salary / Wage (₹) <span className="text-red-500">*</span></label>
                      <input type="number" className="w-full p-3 border border-gray-200 rounded-xl outline-none shadow-sm font-semibold text-gray-800" value={formData.baseSalary} onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })} />
                    </div>
                  </div>
                  
                  <div className="mt-8 border-t pt-5">
                     <h3 className="font-bold text-gray-800 text-sm mb-3">Summary Preview</h3>
                     <div className="bg-white border rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between py-1.5 border-b border-dashed">
                           <span className="text-gray-500 text-sm font-medium">Name:</span>
                           <span className="font-bold text-gray-800 text-sm">{formData.firstName} {formData.lastName}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-dashed">
                           <span className="text-gray-500 text-sm font-medium">Role:</span>
                           <span className="font-bold text-gray-800 text-sm">{formData.role}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                           <span className="text-gray-500 text-sm font-medium">Monthly Gross:</span>
                           <span className="font-bold text-primary text-base">₹{formData.baseSalary.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 border-t bg-gray-50 flex justify-between items-center gap-4">
              {step > 1 ? (
                <button className="btn bg-white border text-gray-700 hover:bg-gray-100 flex items-center gap-2 shadow-sm font-bold" onClick={() => setStep(step - 1)}>
                   <ChevronLeft size={16} /> Back
                </button>
              ) : (
                <button className="btn bg-white border text-gray-400 flex items-center gap-2" disabled>
                   <ChevronLeft size={16} /> Back
                </button>
              )}
              
              <div className="flex gap-3">
                 <button className="btn bg-white border text-gray-700 hover:bg-gray-100 font-bold" onClick={closeModal} disabled={createMutation.isPending}>
                   Cancel
                 </button>
                 
                 {step < 3 ? (
                    <button className="btn btn-primary px-8 flex items-center gap-2 shadow-md filter hover:brightness-110" onClick={() => {
                        if (step === 1 && (!formData.firstName || !formData.mobile)) {
                           toast.error("Please fill required fields (First Name & Mobile)");
                           return;
                        }
                        setStep(step + 1);
                    }}>
                       Next <ChevronRight size={16} />
                    </button>
                 ) : (
                    <button className="btn btn-primary px-8 flex items-center gap-2 shadow-md" onClick={submitForm} disabled={!formData.baseSalary || createMutation.isPending}>
                       {createMutation.isPending ? 'Saving Profile...' : <><Save size={16} /> Save Profile</>}
                    </button>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

write('src/components/Employees.tsx', frontendContent);

console.log('Frontend generated.');

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useBranch } from '@/context/BranchContext';
import { getDepartmentsByBranch, getDoctorsByDepartment, getSlotsByDoctor } from '@/data/mockData';

const STEP_LABELS = ['Department', 'Doctor', 'Time Slot', 'Your Details', 'Confirmed'];

interface Department { id: string; branchId: string; name: string; icon: string; }
interface Doctor { id: string; departmentId: string; name: string; qualification: string; photoUrl: string; nextAvailable: string; }
interface Slot { id: string; date: string; time: string; session: string; available: boolean; }

export default function BookingFlow() {
  const { branch } = useBranch();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [department, setDepartment] = useState<Department | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientReason, setPatientReason] = useState('');

  if (!branch) { router.push('/'); return null; }

  const departments = getDepartmentsByBranch(branch.id);
  const doctors = department ? getDoctorsByDepartment(department.id) : [];
  const slots = doctor ? getSlotsByDoctor(doctor.id) : [];

  function handleBack() { step === 1 ? router.push('/home') : setStep(s => s - 1); }

  const isConfirmed = step === 5;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="font-semibold text-gray-900">{isConfirmed ? 'Booking Confirmed' : 'Book Appointment'}</h1>
        </div>
        {!isConfirmed && (
          <div className="flex items-center gap-2 pb-2">
            {STEP_LABELS.slice(0, -1).map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i + 1 <= step ? 'bg-[#1E6FBA] text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</div>
                {i < 3 && <div className={`w-6 h-0.5 ${i + 1 < step ? 'bg-[#1E6FBA]' : 'bg-gray-200'}`} />}
              </div>
            ))}
            <span className="text-xs text-gray-500 ml-2">{STEP_LABELS[step - 1]}</span>
          </div>
        )}
      </div>

      <div className="pb-8">
        {step === 1 && (
          <div className="px-4 pt-4">
            <p className="text-sm text-gray-500 mb-3">Select a department</p>
            <div className="grid grid-cols-2 gap-3">
              {departments.map(dept => (
                <button key={dept.id} onClick={() => { setDepartment(dept); setDoctor(null); setSlot(null); setStep(2); }}
                  className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-[#1E6FBA] hover:shadow-sm transition-all">
                  <div className="text-3xl mb-2">{dept.icon}</div>
                  <div className="text-sm font-medium text-gray-800">{dept.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="px-4 pt-4 space-y-3">
            <p className="text-sm text-gray-500">{department?.name} — choose your doctor</p>
            {doctors.map(doc => (
              <button key={doc.id} onClick={() => { setDoctor(doc); setSlot(null); setStep(3); }}
                className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1E6FBA] transition-all flex items-center gap-3">
                <img src={doc.photoUrl} alt={doc.name} className="w-12 h-12 rounded-full" />
                <div>
                  <div className="font-semibold text-gray-900">{doc.name}</div>
                  <div className="text-xs text-gray-500">{doc.qualification}</div>
                  <div className="text-xs text-[#1E6FBA] mt-0.5">Next: {doc.nextAvailable}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="px-4 pt-4">
            <p className="text-sm text-gray-500 mb-3">{doctor?.name} — pick a time slot</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {slots.filter(s => s.available).map(s => (
                <button key={s.id} onClick={() => setSlot(s)}
                  className={`border rounded-lg p-2 text-center text-sm transition-all ${slot?.id === s.id ? 'border-[#1E6FBA] bg-blue-50 text-[#1E6FBA] font-semibold' : 'border-gray-200 hover:border-[#1E6FBA]'}`}>
                  <div className="text-xs text-gray-500">{s.date}</div>
                  <div>{s.time}</div>
                </button>
              ))}
            </div>
            <button disabled={!slot} onClick={() => setStep(4)}
              className="w-full bg-[#1E6FBA] text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-40">Continue</button>
          </div>
        )}

        {step === 4 && (
          <div className="px-4 pt-4 space-y-4">
            <p className="text-sm text-gray-500">Your details</p>
            <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Full Name *"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1E6FBA]" />
            <input value={patientPhone} onChange={e => setPatientPhone(e.target.value)} placeholder="Phone Number *"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1E6FBA]" />
            <textarea value={patientReason} onChange={e => setPatientReason(e.target.value)} placeholder="Reason for visit (optional)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1E6FBA] resize-none" rows={3} />
            <button disabled={!patientName.trim() || !patientPhone.trim()} onClick={() => setStep(5)}
              className="w-full bg-[#1E6FBA] text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-40">Confirm Booking</button>
          </div>
        )}

        {step === 5 && department && doctor && slot && (
          <div className="px-4 pt-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-3xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
              <div className="flex justify-between"><span className="text-gray-500">Doctor</span><span className="font-medium">{doctor.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Department</span><span className="font-medium">{department.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{slot.date}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{slot.time}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Patient</span><span className="font-medium">{patientName}</span></div>
            </div>
            <button onClick={() => router.push('/home')} className="w-full bg-[#1E6FBA] text-white py-3.5 rounded-2xl font-semibold text-sm">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    User, Mail, Phone, GraduationCap, Code, 
    Briefcase, Award, Users, Plus, Trash2, Edit3, 
    Save, X, CheckCircle, Shield, Globe, Cpu, BookOpen, AlertCircle,
    Calendar, Heart, MapPin, Hash, UserCheck, Star, 
    ChevronRight, ChevronLeft, Flag, Zap, Trophy, Home, Download, FileText
} from 'lucide-react';
import api from '../../utils/axiosInstance';
import { useUser } from '../../context/userContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BASE_URL = 'http://localhost:5000';

const InputField = ({ label, name, value, onChange, type = "text", placeholder = "", options = null, readOnly = false, ...props }) => (
    <div className="space-y-1 md:space-y-1.5">
        <label className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
            {label}
            {readOnly && <span className="text-[7px] md:text-[8px] text-amber-600 bg-amber-50 px-1.5 rounded uppercase">System Record</span>}
        </label>
        {options ? (
            <select 
                value={value || ''}
                onChange={(e) => onChange(name, e.target.value)}
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none text-slate-700 font-bold text-xs md:text-sm appearance-none cursor-pointer"
            >
                <option value="" disabled>Select {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : type === "file" ? (
            <div className="relative group">
                <input 
                    type="file"
                    onChange={(e) => onChange(name, e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl md:rounded-2xl group-hover:border-blue-400 group-hover:bg-blue-50 transition-all flex items-center justify-between">
                    <span className="text-slate-400 font-bold text-[10px] md:text-xs truncate max-w-[200px]">
                        {value ? (typeof value === 'string' ? value.split('/').pop() : value.name) : "Upload document"}
                    </span>
                    <Plus size={14} md:size={16} className="text-slate-300 group-hover:text-blue-500" />
                </div>
            </div>
        ) : (
            <input 
                type={type}
                name={name}
                value={value || ''}
                onChange={(e) => onChange(name, e.target.value)}
                readOnly={readOnly}
                placeholder={placeholder}
                {...props}
                className={`w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none text-slate-700 font-bold text-xs md:text-sm placeholder:text-slate-300 ${readOnly ? 'cursor-not-allowed text-slate-400' : ''}`}
            />
        )}
    </div>
);

const WizardNavigation = ({ currentStep, setCurrentStep, onSave }) => (
    <div className="flex justify-between items-center mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-100">
        <button 
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 md:gap-2 px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                currentStep === 1 ? 'opacity-30 cursor-not-allowed text-slate-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
            <ChevronLeft size={16} md:size={18} /> Back
        </button>
        <button 
            onClick={() => onSave(currentStep < 7 ? currentStep + 1 : null)}
            className="flex items-center gap-1.5 md:gap-2 px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-[0.98]"
        >
            {currentStep === 7 ? 'Finish' : 'Next'}
            {currentStep < 7 && <ChevronRight size={16} md:size={18} />}
        </button>
    </div>
);

const StudentProfile = () => {
    const { id } = useParams();
    const { user } = useUser();
    const profileId = id || user?.id;
    const isOwnProfile = String(profileId) === String(user?.id);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isWizardMode, setIsWizardMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [showEduForm, setShowEduForm] = useState(false);
    const [showSkillForm, setShowSkillForm] = useState(false);
    const [showProjForm, setShowProjForm] = useState(false);
    const [showAwardForm, setShowAwardForm] = useState(false);
    const [showActivityForm, setShowActivityForm] = useState(false);
    const [newSkill, setNewSkill] = useState({ skill_name: '', proficiency: 'Intermediate' });
    const [newEdu, setNewEdu] = useState({
        qualification_type: '',
        institute_name: '',
        board_university: '',
        year_of_passing: '',
        percentage_cgpa: '',
        document_url: ''
    });
    const [newProj, setNewProj] = useState({ 
        title: '', 
        description: '', 
        link: '', 
        tech_stack: '',
        from_date: '',
        to_date: '',
        mentor: '',
        team_size: '',
        key_skills: ''
    });
    const [newAward, setNewAward] = useState({ title: '', category: 'Award', date: '', description: '', document_url: '' });
    const [newActivity, setNewActivity] = useState({ organization: '', role: 'Member', start_date: '', description: '', document_url: '' });

    const handleInputChange = (name, value) => {
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // If "Same as current" is checked and we're editing a current address field
            if (prev.same_as_current && name.startsWith('current_address')) {
                const permName = name.replace('current_address', 'permanent_address');
                newData[permName] = value;
            } else if (prev.same_as_current && name.startsWith('current_')) {
                const permName = name.replace('current_', 'permanent_');
                newData[permName] = value;
            }
            
            return newData;
        });
    };

    const handleSameAsCurrentChange = (checked) => {
        setFormData(prev => {
            const newData = { ...prev, same_as_current: checked };
            if (checked) {
                newData.permanent_address_line1 = prev.current_address_line1;
                newData.permanent_address_line2 = prev.current_address_line2;
                newData.permanent_country = prev.current_country;
                newData.permanent_state = prev.current_state;
                newData.permanent_city = prev.current_city;
                newData.permanent_pincode = prev.current_pincode;
            }
            return newData;
        });
    };

    const steps = [
        { id: 1, title: 'Basic Details', icon: GraduationCap },
        { id: 2, title: 'Contact Info', icon: Phone },
        { id: 3, title: 'Guardian Info', icon: Users },
        { id: 4, title: 'Academics', icon: BookOpen },
        { id: 5, title: 'Skills', icon: Cpu },
        { id: 6, title: 'Experience', icon: Briefcase },
        { id: 7, title: 'Achievements', icon: Trophy }
    ];

    useEffect(() => {
        fetchProfile();
    }, [profileId]);

    const fetchProfile = async () => {
        try {
            const response = await api.get(`/api/profile/${profileId}`);
            setProfile(response.data);
            setFormData(response.data);
            
            // Auto-enter wizard if essential info is missing
            if (!response.data.phone && isOwnProfile) {
                setIsWizardMode(true);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStep = async (nextStep = null) => {
        try {
            await api.put(`/api/profile/${profileId}`, formData);
            if (nextStep) {
                setCurrentStep(nextStep);
            } else {
                setIsWizardMode(false);
                fetchProfile();
                alert("Profile completed successfully!");
            }
        } catch (err) {
            alert("Failed to save data. Please try again.");
        }
    };

    const addCollectionItem = async (type, data) => {
        try {
            let finalData = { ...data };
            
            // If there's a file, upload it first
            if (data.file) {
                const formData = new FormData();
                formData.append('file', data.file);
                const uploadRes = await api.post('/api/profile/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalData.document_url = uploadRes.data.url;
                delete finalData.file;
            }

            await api.post(`/api/profile/collection/${type}`, { student_id: id, ...finalData });
            fetchProfile();
        } catch (err) {
            console.error(`Add ${type} error:`, err);
            alert("Error adding item");
        }
    };

    const deleteCollectionItem = async (type, itemId) => {
        try {
            await api.delete(`/api/profile/collection/${type}/${itemId}`);
            fetchProfile();
        } catch (err) {
            alert(`Failed to delete ${type}`);
        }
    };

    const handleProfilePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/api/profile/profile-pic', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(prev => ({ ...prev, profile_pic: res.data.url }));
            alert("Profile picture updated!");
        } catch (err) {
            alert("Failed to upload profile picture");
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const primaryColor = [37, 99, 235]; // blue-600
        
        // Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text((profile.name || 'STUDENT PROFILE').toUpperCase(), 15, 25);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${profile.branch || 'N/A'} | Roll No: ${profile.roll_number || 'N/A'} | Year: ${profile.year || 'N/A'}`, 15, 33);

        let yPos = 50;

        // Contact Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTACT INFORMATION', 15, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const contactInfo = [
            ['Email', profile.email || 'N/A'],
            ['Phone', profile.phone || 'N/A'],
            ['PRN', profile.prn_no || 'N/A'],
            ['CGPA', profile.cgpa || 'N/A'],
            ['Address', `${profile.current_address_line1 || ''}, ${profile.current_city || ''}, ${profile.current_state || ''}`]
        ];
        autoTable(doc, {
            startY: yPos,
            body: contactInfo,
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 1 },
            columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
        });
        yPos = doc.lastAutoTable.finalY + 15;

        // Education
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('ACADEMIC QUALIFICATIONS', 15, yPos);
        yPos += 5;
        const eduData = profile.education?.map(e => [e.qualification_type, e.institute_name, e.year_of_passing, e.percentage_cgpa]);
        autoTable(doc, {
            startY: yPos,
            head: [['Qualification', 'Institute', 'Year', 'Score']],
            body: eduData || [['No education records found']],
            headStyles: { fillColor: primaryColor }
        });
        yPos = doc.lastAutoTable.finalY + 15;

        // Projects
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TECHNICAL PROJECTS', 15, yPos);
        yPos += 5;
        const projData = profile.projects?.map(p => [
            p.title || 'Untitled Project', 
            p.key_skills || 'N/A', 
            (p.description || '').substring(0, 100) + (p.description?.length > 100 ? '...' : '')
        ]);
        autoTable(doc, {
            startY: yPos,
            head: [['Project Title', 'Tech Stack', 'Brief']],
            body: projData || [['No projects found']],
            headStyles: { fillColor: primaryColor }
        });
        yPos = doc.lastAutoTable.finalY + 15;

        // Skills
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TECHNICAL SKILLS', 15, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const skills = profile.skills?.map(s => s.skill_name).join(', ') || 'None listed';
        doc.text(skills, 15, yPos, { maxWidth: 180 });

        doc.save(`${profile.roll_number}_${profile.name.replace(' ', '_')}_Profile.pdf`);
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div></div>;





    if (isWizardMode) return (
        <div className="min-h-screen bg-slate-50 p-5 md:p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Progress Indicator */}
                <div className="mb-8 md:mb-12">
                    <div className="flex justify-between items-center mb-4 md:mb-6 px-2">
                        <div>
                            <h1 className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight">Profile Details</h1>
                            <p className="text-[9px] md:text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-1 italic">Note: If information not available, please write N/A</p>
                        </div>
                        <button onClick={() => setIsWizardMode(false)} className="text-slate-400 hover:text-rose-500 font-bold text-[10px] md:text-xs uppercase tracking-widest">Exit</button>
                    </div>
                    <div className="flex gap-2 md:gap-3 overflow-x-auto pb-4 md:pb-6 -mx-2 px-2 no-scrollbar scroll-smooth">
                        {steps.map(s => {
                            const StepIcon = s.icon;
                            return (
                                <button 
                                    key={s.id} 
                                    onClick={() => setCurrentStep(s.id)}
                                    className={`flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-[20px] transition-all duration-500 border-2 ${
                                        s.id === currentStep 
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 scale-105 z-10' 
                                        : s.id < currentStep
                                            ? 'bg-emerald-50 border-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-500'
                                    }`}
                                >
                                    <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl ${s.id === currentStep ? 'bg-blue-500 text-white' : s.id < currentStep ? 'bg-white text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                                        <StepIcon size={14} md:size={16} />
                                    </div>
                                    <div className="text-left">
                                        <p className={`text-[7px] md:text-[8px] font-bold uppercase tracking-[0.1em] mb-0.5 ${s.id === currentStep ? 'text-blue-100' : 'text-slate-400'}`}>Step 0{s.id}</p>
                                        <p className="font-bold text-[10px] md:text-[11px] uppercase tracking-wider whitespace-nowrap">{s.title}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-[22px] p-6 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                    {currentStep === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} readOnly />
                                <InputField label="Roll Number" name="roll_number" value={formData.roll_number} onChange={handleInputChange} readOnly />
                                <InputField label="PRN Number" name="prn_no" value={formData.prn_no} onChange={handleInputChange} />
                                <InputField label="Current Branch" name="branch" value={formData.branch} onChange={handleInputChange} readOnly />
                                <InputField label="Current Year" name="year" value={formData.year} onChange={handleInputChange} readOnly />
                                <InputField label="Current Semester" name="semester" value={formData.semester} onChange={handleInputChange} readOnly />
                                <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                                <InputField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} options={['Male', 'Female', 'Other']} />
                                <InputField label="Admission Year" name="admission_year" type="number" value={formData.admission_year} onChange={handleInputChange} />
                                <InputField label="Blood Group" name="blood_group" value={formData.blood_group} onChange={handleInputChange} options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} />
                                <InputField label="Category" name="category" value={formData.category} onChange={handleInputChange} options={['Open', 'OBC', 'SC', 'ST', 'EWS', 'Other']} />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Official Email" name="email" value={formData.email} onChange={handleInputChange} readOnly />
                                <InputField label="Personal Email" name="personal_email" value={formData.personal_email} onChange={handleInputChange} />
                                <InputField label="Contact Number" name="phone" value={formData.phone} onChange={handleInputChange} />
                                <InputField label="Alternate Number" name="alternate_phone" value={formData.alternate_phone} onChange={handleInputChange} />
                            </div>

                            <div className="space-y-6 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Current Address</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-1">
                                        <InputField label="Address Line 1" name="current_address_line1" value={formData.current_address_line1} onChange={handleInputChange} placeholder="Flat/House No, Building, Area" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <InputField label="Address Line 2" name="current_address_line2" value={formData.current_address_line2} onChange={handleInputChange} placeholder="Landmark, Street" />
                                    </div>
                                    <InputField label="Country" name="current_country" value={formData.current_country} onChange={handleInputChange} options={['India', 'USA', 'UK', 'Canada', 'Australia']} />
                                    <InputField label="State" name="current_state" value={formData.current_state} onChange={handleInputChange} placeholder="e.g. Maharashtra" />
                                    <InputField label="City" name="current_city" value={formData.current_city} onChange={handleInputChange} placeholder="e.g. Pune" />
                                    <InputField label="Postal Code" name="current_pincode" value={formData.current_pincode} onChange={handleInputChange} placeholder="e.g. 411001" />
                                </div>
                            </div>

                            <div className="space-y-6 pt-8 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Permanent Address</h3>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.same_as_current} 
                                            onChange={(e) => handleSameAsCurrentChange(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Same as Current Address</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300" style={{ opacity: formData.same_as_current ? 0.6 : 1 }}>
                                    <div className="md:col-span-1">
                                        <InputField label="Address Line 1" name="permanent_address_line1" value={formData.permanent_address_line1} onChange={handleInputChange} readOnly={formData.same_as_current} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <InputField label="Address Line 2" name="permanent_address_line2" value={formData.permanent_address_line2} onChange={handleInputChange} readOnly={formData.same_as_current} />
                                    </div>
                                    <InputField label="Country" name="permanent_country" value={formData.permanent_country} onChange={handleInputChange} options={['India', 'USA', 'UK', 'Canada', 'Australia']} readOnly={formData.same_as_current} />
                                    <InputField label="State" name="permanent_state" value={formData.permanent_state} onChange={handleInputChange} readOnly={formData.same_as_current} />
                                    <InputField label="City" name="permanent_city" value={formData.permanent_city} onChange={handleInputChange} readOnly={formData.same_as_current} />
                                    <InputField label="Postal Code" name="permanent_pincode" value={formData.permanent_pincode} onChange={handleInputChange} readOnly={formData.same_as_current} />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Father's Details */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">Father's Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Name" name="father_name" value={formData.father_name} onChange={handleInputChange} />
                                    <InputField label="Occupation" name="parent_occupation" value={formData.parent_occupation} onChange={handleInputChange} />
                                    <InputField label="Organisation" name="father_organisation" value={formData.father_organisation} onChange={handleInputChange} />
                                    <InputField label="Designation" name="father_designation" value={formData.father_designation} onChange={handleInputChange} />
                                    <InputField label="Email" name="father_email" value={formData.father_email} onChange={handleInputChange} />
                                    <InputField label="Phone Number" name="parent_phone" value={formData.parent_phone} onChange={handleInputChange} />
                                </div>
                            </div>

                            {/* Mother's Details */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">Mother's Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Name" name="mother_name" value={formData.mother_name} onChange={handleInputChange} />
                                    <InputField label="Occupation" name="mother_occupation" value={formData.mother_occupation} onChange={handleInputChange} />
                                    <InputField label="Organisation" name="mother_organisation" value={formData.mother_organisation} onChange={handleInputChange} />
                                    <InputField label="Designation" name="mother_designation" value={formData.mother_designation} onChange={handleInputChange} />
                                    <InputField label="Email" name="mother_email" value={formData.mother_email} onChange={handleInputChange} />
                                    <InputField label="Phone Number" name="mother_phone" value={formData.mother_phone} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Current Academic Stats */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">Current Academic Stats</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Current CGPA" name="cgpa" type="number" step="0.01" value={formData.cgpa} onChange={handleInputChange} />
                                    <InputField label="Active Backlogs" name="backlogs" type="number" value={formData.backlogs} onChange={handleInputChange} />
                                </div>
                            </div>

                            {/* Past Qualifications */}
                            <div className="space-y-6 pt-4 border-t border-slate-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <h3 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-widest">Past Qualifications</h3>
                                    <button 
                                        onClick={() => setShowEduForm(true)}
                                        className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
                                    >
                                        <Plus size={14} /> <span>Add Qualification</span>
                                    </button>
                                </div>

                                {showEduForm && (
                                    <div className="bg-white p-5 md:p-6 rounded-[22px] border-2 border-blue-50 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300 mt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                                <GraduationCap size={16}/> New Qualification
                                            </h4>
                                            <button onClick={() => setShowEduForm(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all"><X size={18}/></button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            <InputField 
                                                label="Qualification" 
                                                value={newEdu.qualification_type} 
                                                onChange={(_, val) => setNewEdu({...newEdu, qualification_type: val})} 
                                                options={['10th', '12th', 'Diploma', 'FE', 'SE', 'TE', 'BE', 'B.Tech', 'M.Tech', 'Other']}
                                            />
                                            <InputField 
                                                label="Institute Name" 
                                                value={newEdu.institute_name} 
                                                onChange={(_, val) => setNewEdu({...newEdu, institute_name: val})} 
                                                placeholder="e.g. SNBP School"
                                            />
                                            <InputField 
                                                label="Board/University" 
                                                value={newEdu.board_university} 
                                                onChange={(_, val) => setNewEdu({...newEdu, board_university: val})} 
                                                placeholder="e.g. CBSE, Pune Uni"
                                            />
                                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                                <InputField 
                                                    label="Year" 
                                                    value={newEdu.year_of_passing} 
                                                    type="number"
                                                    onChange={(_, val) => setNewEdu({...newEdu, year_of_passing: val})} 
                                                />
                                                <InputField 
                                                    label="Score" 
                                                    value={newEdu.percentage_cgpa} 
                                                    onChange={(_, val) => setNewEdu({...newEdu, percentage_cgpa: val})} 
                                                    placeholder="92% / 9.5"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <InputField 
                                                    label="Marksheet / Certificate" 
                                                    type="file"
                                                    value={newEdu.file} 
                                                    onChange={(_, val) => setNewEdu({...newEdu, file: val})} 
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                            <button 
                                                onClick={async () => {
                                                    if(!newEdu.qualification_type || !newEdu.institute_name) return alert("Please fill at least Type and Institute");
                                                    await addCollectionItem('education', newEdu);
                                                    setNewEdu({ qualification_type: '', institute_name: '', board_university: '', year_of_passing: '', percentage_cgpa: '' });
                                                    setShowEduForm(false);
                                                }}
                                                className="flex-[2] bg-slate-900 text-white py-3.5 md:py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 order-1 sm:order-2"
                                            >
                                                Save Record
                                            </button>
                                            <button 
                                                onClick={() => setShowEduForm(false)}
                                                className="flex-1 bg-slate-100 text-slate-500 py-3.5 md:py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all order-2 sm:order-1"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4">
                                    {formData.education?.length > 0 ? (
                                        formData.education.map((edu) => (
                                            <div key={edu.id} className="group bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-center hover:bg-white hover:shadow-md transition-all">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">{edu.qualification_type}</span>
                                                        <p className="font-bold text-slate-900">{edu.institute_name}</p>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-500">{edu.board_university} • {edu.year_of_passing}</p>
                                                    <p className="text-xs font-bold text-blue-600">{edu.percentage_cgpa}</p>
                                                </div>
                                                <button 
                                                    onClick={() => deleteCollectionItem('education', edu.id)}
                                                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[22px]">
                                            <GraduationCap className="mx-auto text-slate-200 mb-4" size={48} />
                                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No past qualifications added yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-8 bg-blue-50/50 rounded-[22px] border border-blue-100 border-dashed">
                                <div className="text-center mb-6">
                                    <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">Technical Stack</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {profile.skills?.map(s => (
                                            <div key={s.id} className="px-4 py-2 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-blue-100 flex items-center gap-2 group hover:border-rose-200 transition-all">
                                                <span className="text-xs font-bold text-slate-700">{s.skill_name}</span>
                                                <button onClick={() => deleteCollectionItem('skills', s.id)} className="text-slate-300 group-hover:text-rose-500 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {!showSkillForm ? (
                                    <div className="flex justify-center">
                                        <button 
                                            onClick={() => setShowSkillForm(true)}
                                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                                        >
                                            <Plus size={16} /> Add New Skill
                                        </button>
                                    </div>
                                ) : (
                                    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-xl border border-blue-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Add Tech Skill</h4>
                                            <button onClick={() => setShowSkillForm(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                                        </div>
                                        <div className="space-y-4">
                                            <InputField 
                                                label="Skill Name" 
                                                value={newSkill.skill_name} 
                                                onChange={(_, val) => setNewSkill({...newSkill, skill_name: val})} 
                                                placeholder="e.g. React.js, Python, AWS"
                                            />
                                            <InputField 
                                                label="Proficiency" 
                                                value={newSkill.proficiency} 
                                                onChange={(_, val) => setNewSkill({...newSkill, proficiency: val})} 
                                                options={['Beginner', 'Intermediate', 'Advanced', 'Expert']}
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button 
                                                onClick={async () => {
                                                    if(!newSkill.skill_name) return;
                                                    await addCollectionItem('skills', newSkill);
                                                    setNewSkill({ skill_name: '', proficiency: 'Intermediate' });
                                                    setShowSkillForm(false);
                                                }}
                                                className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest"
                                            >
                                                Add Skill
                                            </button>
                                            <button 
                                                onClick={() => setShowSkillForm(false)}
                                                className="px-4 bg-slate-100 text-slate-500 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <InputField label="Areas of Interest" name="interests" value={formData.interests} onChange={handleInputChange} />
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="p-6 bg-slate-50 rounded-[22px] border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Current Projects</p>
                                    <div className="space-y-3 mb-6">
                                        {profile.projects?.map(p => (
                                            <div key={p.id} className="p-4 bg-white rounded-2xl flex justify-between items-center border border-slate-100">
                                                <span className="font-bold text-sm">{p.title}</span>
                                                <button onClick={() => deleteCollectionItem('projects', p.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                    {!showProjForm ? (
                                        <button 
                                            onClick={() => setShowProjForm(true)}
                                            className="w-full py-4 bg-white border border-slate-200 border-dashed rounded-2xl font-bold text-[10px] text-slate-400 uppercase tracking-widest hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus size={16} /> Add Project Details
                                        </button>
                                    ) : (
                                        <div className="bg-white p-6 rounded-[22px] shadow-2xl border-2 border-blue-50/50 space-y-6 md:space-y-8 animate-in zoom-in-95 duration-500 mt-6 md:mt-8 overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                            
                                            <div className="flex justify-between items-center pb-4 border-b border-slate-50 relative">
                                                <h4 className="text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                                    <Briefcase size={20} className="text-blue-600"/> New Project
                                                </h4>
                                                <button onClick={() => setShowProjForm(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-all"><X size={20}/></button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative">
                                                <div className="space-y-4 md:space-y-6">
                                                    <InputField label="Project Name *" value={newProj.title} onChange={(_, val) => setNewProj({...newProj, title: val})} placeholder="e.g. AI Attendance System" />
                                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                                        <InputField label="Start Date" type="date" value={newProj.from_date} onChange={(_, val) => setNewProj({...newProj, from_date: val})} />
                                                        <InputField label="End Date" type="date" value={newProj.to_date} onChange={(_, val) => setNewProj({...newProj, to_date: val})} />
                                                    </div>
                                                    <InputField label="Project Mentor" value={newProj.mentor} onChange={(_, val) => setNewProj({...newProj, mentor: val})} placeholder="Internal/External Mentor" />
                                                </div>

                                                <div className="space-y-4 md:space-y-6">
                                                    <InputField label="Project Link (Optional)" value={newProj.link} onChange={(_, val) => setNewProj({...newProj, link: val})} placeholder="https://github.com/..." />
                                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                                        <InputField label="Team Size" type="number" value={newProj.team_size} onChange={(_, val) => setNewProj({...newProj, team_size: val})} placeholder="e.g. 4" />
                                                        <InputField label="Key Skills" value={newProj.key_skills} onChange={(_, val) => setNewProj({...newProj, key_skills: val})} placeholder="React, Node..." />
                                                    </div>
                                                    <InputField label="Proof/Documentation" type="file" value={newProj.file} onChange={(_, val) => setNewProj({...newProj, file: val})} />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <div className="space-y-1.5 md:space-y-2">
                                                        <label className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Detailed Description</label>
                                                        <textarea 
                                                            className="w-full h-24 md:h-32 px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none text-slate-700 font-bold text-xs md:text-sm placeholder:text-slate-300 leading-relaxed"
                                                            value={newProj.description}
                                                            onChange={(e) => setNewProj({...newProj, description: e.target.value})}
                                                            placeholder="Briefly describe the project, your specific role and outcomes..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6 border-t border-slate-50">
                                                <button 
                                                    onClick={async () => {
                                                        if(!newProj.title) return alert("Please enter project name");
                                                        await addCollectionItem('projects', newProj);
                                                        setNewProj({ title: '', description: '', link: '', tech_stack: '', from_date: '', to_date: '', mentor: '', team_size: '', key_skills: '' });
                                                        setShowProjForm(false);
                                                    }}
                                                    className="flex-[2] bg-blue-600 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-2"
                                                >
                                                    <Plus size={18} /> Confirm Project
                                                </button>
                                                <button 
                                                    onClick={() => setShowProjForm(false)} 
                                                    className="flex-1 bg-slate-50 text-slate-500 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-100 transition-all order-2 sm:order-1"
                                                >
                                                    Discard
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 7 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <button 
                                        onClick={() => setShowAwardForm(true)}
                                        className="w-full p-6 bg-white border-2 border-slate-100 border-dashed rounded-3xl hover:border-emerald-500 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all mb-4"><Award size={20} /></div>
                                        <p className="font-bold text-slate-900">Add Awards</p>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Hackathons, Scholarhips...</p>
                                    </button>
                                    
                                    {showAwardForm && (
                                        <div className="bg-white p-6 rounded-[22px] shadow-xl border border-emerald-100 space-y-4 animate-in slide-in-from-left-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">New Achievement</h4>
                                                <button onClick={() => setShowAwardForm(false)} className="text-slate-400"><X size={16}/></button>
                                            </div>
                                            <InputField label="Title" value={newAward.title} onChange={(_, val) => setNewAward({...newAward, title: val})} placeholder="e.g. Hackathon Winner" />
                                            <InputField label="Category" value={newAward.category} onChange={(_, val) => setNewAward({...newAward, category: val})} options={['Award', 'Scholarship', 'Certificate', 'Other']} />
                                            <InputField label="Upload Certificate" type="file" value={newAward.file} onChange={(_, val) => setNewAward({...newAward, file: val})} />
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={async () => {
                                                        if(!newAward.title) return;
                                                        await addCollectionItem('achievements', newAward);
                                                        setNewAward({ title: '', category: 'Award', date: '', description: '' });
                                                        setShowAwardForm(false);
                                                    }}
                                                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest"
                                                >Save</button>
                                                <button onClick={() => setShowAwardForm(false)} className="px-4 bg-slate-100 text-slate-500 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <button 
                                        onClick={() => setShowActivityForm(true)}
                                        className="w-full p-6 bg-white border-2 border-slate-100 border-dashed rounded-3xl hover:border-indigo-500 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all mb-4"><Users size={20} /></div>
                                        <p className="font-bold text-slate-900">Add Activities</p>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Clubs, Committees, Events...</p>
                                    </button>

                                    {showActivityForm && (
                                        <div className="bg-white p-6 rounded-[22px] shadow-xl border border-indigo-100 space-y-4 animate-in slide-in-from-right-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">New Activity</h4>
                                                <button onClick={() => setShowActivityForm(false)} className="text-slate-400"><X size={16}/></button>
                                            </div>
                                            <InputField label="Organization/Club" value={newActivity.organization} onChange={(_, val) => setNewActivity({...newActivity, organization: val})} placeholder="e.g. IEEE Club" />
                                            <InputField label="Role" value={newActivity.role} onChange={(_, val) => setNewActivity({...newActivity, role: val})} placeholder="e.g. Secretary" />
                                            <InputField label="Upload Proof" type="file" value={newActivity.file} onChange={(_, val) => setNewActivity({...newActivity, file: val})} />
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={async () => {
                                                        if(!newActivity.organization) return;
                                                        await addCollectionItem('engagement', newActivity);
                                                        setNewActivity({ organization: '', role: 'Member', start_date: '', description: '' });
                                                        setShowActivityForm(false);
                                                    }}
                                                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest"
                                                >Save</button>
                                                <button onClick={() => setShowActivityForm(false)} className="px-4 bg-slate-100 text-slate-500 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <WizardNavigation 
                        currentStep={currentStep} 
                        setCurrentStep={setCurrentStep} 
                        onSave={handleSaveStep} 
                    />
                </div>
            </div>
        </div>
    );

    {/* Default Profile View */}
    return (
        <div className="min-h-screen bg-slate-50 p-5 md:p-6 font-sans pb-24">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Profile Header */}
                <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                    <div className="h-32 md:h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative" />
                    <div className="px-6 md:px-8 pb-6 md:pb-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start -mt-16 md:-mt-20">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-[22px] md:rounded-[22px] bg-slate-900 border-[4px] md:border-[6px] border-white shadow-2xl flex items-center justify-center overflow-hidden group relative z-10">
                            {profile.profile_pic ? (
                                <img src={profile.profile_pic} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                                <User size={48} className="text-white/20 md:w-16 md:h-16" />
                            )}
                            
                            {isOwnProfile && (
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white">
                                    <Edit3 size={20} className="mb-1 md:w-6 md:h-6" />
                                    <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Update Photo</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
                                </label>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 mt-4 md:mt-24">
                                <div className="space-y-3">
                                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">{profile.name}</h1>
                                    <p className="text-slate-500 text-sm md:text-base font-bold flex flex-wrap justify-center md:justify-start items-center gap-2">
                                        <GraduationCap size={16} /> {profile.roll_number} <span className="hidden md:inline">•</span> <span className="w-full md:w-auto">{profile.branch || 'N/A'}</span> <span className="hidden md:inline">•</span> {profile.year || 'N/A'}
                                    </p>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] md:text-xs font-bold border border-blue-100">
                                            <Hash size={10} /> {profile.prn_no || 'N/A'}
                                        </span>
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] md:text-xs font-bold border border-indigo-100">
                                            <Mail size={10} /> {profile.email}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    <button 
                                        onClick={downloadPDF}
                                        className="flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95"
                                    >
                                        <Download size={16} /> Resume PDF
                                    </button>
                                    {isOwnProfile && (
                                        <button 
                                            onClick={() => setIsWizardMode(true)} 
                                            className="flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                                        >
                                            <Edit3 size={16} /> Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Core Info */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Personal Details */}
                        <div className="bg-white rounded-[22px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2"><User size={20} className="text-emerald-600"/> Basic Details</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date of Birth</label>
                                        <p className="font-bold text-slate-700">{profile.dob || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Gender</label>
                                        <p className="font-bold text-slate-700">{profile.gender || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Study Year</label>
                                        <p className="font-bold text-blue-600">{profile.year || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Category</label>
                                        <p className="font-bold text-slate-700">{profile.category || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Blood Group</label>
                                    <p className="font-bold text-rose-600">{profile.blood_group || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white rounded-[22px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2"><Phone size={20} className="text-blue-600"/> Contact Details</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Personal Email</label>
                                    <p className="font-bold text-slate-700">{profile.personal_email || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Phone Number</label>
                                    <p className="font-bold text-slate-700">{profile.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Alternate Phone</label>
                                    <p className="font-bold text-slate-700">{profile.alternate_phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Current Address</label>
                                    <p className="font-bold text-slate-700 text-sm leading-relaxed">
                                        {profile.current_address_line1 || profile.address || 'N/A'}<br/>
                                        {profile.current_address_line2 && <>{profile.current_address_line2}<br/></>}
                                        {profile.current_city && `${profile.current_city}, `}{profile.current_state && `${profile.current_state}, `}{profile.current_country} {profile.current_pincode && `- ${profile.current_pincode}`}
                                    </p>
                                </div>
                                {profile.permanent_address_line1 && (
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Permanent Address</label>
                                        <p className="font-bold text-slate-700 text-sm leading-relaxed">
                                            {profile.permanent_address_line1}<br/>
                                            {profile.permanent_address_line2 && <>{profile.permanent_address_line2}<br/></>}
                                            {profile.permanent_city && `${profile.permanent_city}, `}{profile.permanent_state && `${profile.permanent_state}, `}{profile.permanent_country} {profile.permanent_pincode && `- ${profile.permanent_pincode}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Family Info */}
                        <div className="bg-white rounded-[22px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2"><Users size={20} className="text-indigo-600"/> Guardian Info</h3>
                            <div className="space-y-6">
                                {/* Father Section */}
                                <div className="pb-4 border-b border-slate-50">
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3">Father's Info</p>
                                    <p className="font-bold text-slate-900">{profile.father_name || 'N/A'}</p>
                                    <p className="text-xs font-bold text-slate-500">{profile.parent_occupation || 'N/A'}{profile.father_organisation && ` at ${profile.father_organisation}`}</p>
                                    {profile.parent_phone && <p className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-1.5"><Phone size={12}/> {profile.parent_phone}</p>}
                                    {profile.father_email && <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><Mail size={12}/> {profile.father_email}</p>}
                                </div>
                                {/* Mother Section */}
                                <div>
                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-3">Mother's Info</p>
                                    <p className="font-bold text-slate-900">{profile.mother_name || 'N/A'}</p>
                                    <p className="text-xs font-bold text-slate-500">{profile.mother_occupation || 'N/A'}{profile.mother_organisation && ` at ${profile.mother_organisation}`}</p>
                                    {profile.mother_phone && <p className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-1.5"><Phone size={12}/> {profile.mother_phone}</p>}
                                    {profile.mother_email && <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><Mail size={12}/> {profile.mother_email}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Academic & Collections */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid */}
                        <div className="bg-white rounded-[22px] p-5 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                {[
                                    { label: 'Current CGPA', val: profile.cgpa, color: 'blue', icon: <BookOpen size={16}/> },
                                    { label: 'Active Backlogs', val: profile.backlogs || '0', color: 'rose', icon: <AlertCircle size={16}/> }
                                ].map((s, i) => (
                                    <div key={i} className="bg-slate-50 p-5 md:p-6 rounded-2xl md:rounded-[22px] border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                                            <p className={`text-2xl md:text-3xl font-bold text-${s.color}-600 tracking-tight`}>{s.val || '0.00'}</p>
                                        </div>
                                        <div className={`p-2.5 md:p-3 bg-${s.color}-50 text-${s.color}-600 rounded-xl md:rounded-2xl`}>
                                            {s.icon}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Academic Journey */}
                        <div className="bg-white rounded-[22px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-2"><GraduationCap size={20} className="text-blue-600"/> Academic Journey</h3>
                            <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                {profile.education?.length > 0 ? (
                                    profile.education.map((edu, i) => (
                                        <div key={i} className="relative pl-10">
                                            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-4 border-blue-600 z-10" />
                                            <div className="bg-slate-50 p-6 rounded-[22px] border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wider">{edu.qualification_type}</span>
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{edu.year_of_passing}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-900 mb-1">{edu.institute_name}</h4>
                                                <p className="text-xs font-bold text-slate-500 mb-3">{edu.board_university}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-100">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score:</p>
                                                        <p className="text-xs font-bold text-blue-600">{edu.percentage_cgpa}</p>
                                                    </div>
                                                    {edu.document_url && (
                                                        <a href={edu.document_url.startsWith('http') ? edu.document_url : `${BASE_URL}${edu.document_url}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:bg-blue-700 transition-all">
                                                            <Shield size={10} /> View Certificate
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No qualifications listed</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Skills & Interests */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-[22px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2"><Cpu size={20} className="text-blue-600"/> Technical Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills?.length > 0 ? profile.skills.map(s => (
                                        <span key={s.id} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-blue-100">{s.skill_name}</span>
                                    )) : <p className="text-slate-400 font-bold text-xs">No skills added yet</p>}
                                </div>
                            </div>
                            <div className="bg-white rounded-[22px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2"><Heart size={20} className="text-rose-500"/> Interests</h3>
                                <p className="font-bold text-slate-700 leading-relaxed text-sm">
                                    {profile.interests || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Projects */}
                        <div className="bg-white rounded-[22px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2"><Briefcase size={20} className="text-amber-600"/> Projects</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.projects?.length > 0 ? profile.projects.map(p => (
                                    <div key={p.id} className="p-8 bg-slate-50 rounded-[22px] border border-slate-100 group hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-xl tracking-tight">{p.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar size={12} className="text-slate-400"/>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {p.from_date ? new Date(p.from_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'} - 
                                                        {p.to_date ? new Date(p.to_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {p.link && (
                                                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-2xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                                                        <Globe size={18} />
                                                    </a>
                                                )}
                                                {p.document_url && (
                                                    <a href={p.document_url.startsWith('http') ? p.document_url : `${BASE_URL}${p.document_url}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-2xl text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                                                        <Shield size={18} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 line-clamp-3">{p.description}</p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {p.key_skills?.split(',').map((s, i) => (
                                                <span key={i} className="px-3 py-1 bg-white text-slate-500 rounded-xl text-[10px] font-bold border border-slate-100 uppercase tracking-wider">{s.trim()}</span>
                                            ))}
                                        </div>

                                        {(p.mentor || p.team_size) && (
                                            <div className="pt-6 border-t border-slate-100 flex gap-8">
                                                {p.mentor && (
                                                    <div>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mentor</p>
                                                        <p className="text-xs font-bold text-slate-700">{p.mentor}</p>
                                                    </div>
                                                )}
                                                {p.team_size && (
                                                    <div>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Team Size</p>
                                                        <p className="text-xs font-bold text-slate-700">{p.team_size} Members</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )) : <p className="text-slate-400 font-bold text-xs p-4">No projects listed</p>}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="bg-white rounded-[22px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2"><Trophy size={20} className="text-emerald-600"/> Achievements & Activities</h3>
                            <div className="space-y-4">
                                {profile.achievements?.map(a => (
                                    <div key={a.id} className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"><Award size={20} /></div>
                                            <div>
                                                <p className="font-bold text-slate-900">{a.title}</p>
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{a.category}</p>
                                            </div>
                                        </div>
                                        {a.document_url && (
                                            <a href={a.document_url.startsWith('http') ? a.document_url : `${BASE_URL}${a.document_url}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-emerald-100">
                                                <Shield size={16} />
                                            </a>
                                        )}
                                    </div>
                                ))}
                                {profile.engagement?.map(e => (
                                    <div key={e.id} className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"><Users size={20} /></div>
                                            <div>
                                                <p className="font-bold text-slate-900">{e.organization}</p>
                                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{e.role}</p>
                                            </div>
                                        </div>
                                        {e.document_url && (
                                            <a href={e.document_url.startsWith('http') ? e.document_url : `${BASE_URL}${e.document_url}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-indigo-100">
                                                <UserCheck size={16} />
                                            </a>
                                        )}
                                    </div>
                                ))}
                                {(!profile.achievements?.length && !profile.engagement?.length) && <p className="text-slate-400 font-bold text-xs">No achievements listed yet</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;


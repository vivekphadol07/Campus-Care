import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Mail, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../utils/axiosInstance';
import './Applications.css';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Applications = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (jobId) fetchApplications();
    }, [jobId]);

    const fetchApplications = async () => {
        try {
            const res = await api.get(`/api/placement/applications?jobId=${jobId}`);
            setApps(res.data);
        } catch (err) {
            console.error("Error fetching apps:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/api/placement/applications/${id}/status`, { status });
            fetchApplications();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Applicant List', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        
        const tableData = apps.map(app => [
            app.student_name,
            app.email,
            app.roll_number,
            app.status
        ]);

        autoTable(doc, {
            head: [['Student Name', 'Email', 'Roll Number', 'Status']],
            body: tableData,
            startY: 30,
        });

        doc.save(`Applicants_Job_${jobId}.pdf`);
    };

    if (loading) return <div className="p-8 text-center">Loading Applications...</div>;

    return (
        <div className="apps-page">
            <header className="apps-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Job Applications</h1>
                        <p>Review student profiles and update recruitment status</p>
                    </div>
                    <button 
                        onClick={downloadPDF}
                        style={{
                            background: '#0f172a',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <FileText size={18} /> Download List PDF
                    </button>
                </div>
            </header>

            <div className="apps-table-container">
                <table className="apps-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Email</th>
                            <th>Roll Number</th>
                            <th>Resume</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apps.map((app) => (
                            <tr key={app.id}>
                                <td>
                                    <div className="user-info">
                                        <div className="avatar"><User size={16} /></div>
                                        <span>{app.student_name}</span>
                                    </div>
                                </td>
                                <td>{app.email}</td>
                                <td>{app.roll_number}</td>
                                <td>
                                    <a href={app.resume_url} target="_blank" rel="noreferrer" className="resume-link">
                                        <FileText size={16} /> View
                                    </a>
                                </td>
                                <td>
                                    <span className={`status-badge ${app.status}`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <button className="btn-shortlist" title="Shortlist" onClick={() => handleStatusUpdate(app.id, 'shortlisted')}>
                                            <CheckCircle size={18} />
                                        </button>
                                        <button className="btn-reject" title="Reject" onClick={() => handleStatusUpdate(app.id, 'rejected')}>
                                            <XCircle size={18} />
                                        </button>
                                        <button className="btn-interview" title="Schedule Interview" onClick={() => handleStatusUpdate(app.id, 'interview')}>
                                            <Clock size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {apps.length === 0 && <p className="no-data">No applications received yet for this job.</p>}
            </div>
        </div>
    );
};

export default Applications;

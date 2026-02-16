
import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  AlertCircle,
  ChevronRight,
  BrainCircuit,
  TrendingUp,
  FlaskConical,
  Stethoscope,
  HeartPulse,
  LayoutDashboard,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:5001/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Categorized form data
  const [formData, setFormData] = useState({
    demographics: {
      age_at_encounter: 45,
      gender_M: 1, // Simulating encoded gender
    },
    vitals: {
      'Heart Rate_mean': 75,
      'Systolic BP_mean': 120,
      'Diastolic BP_mean': 80,
      'Temperature_mean': 98.6,
      'SpO2_mean': 98,
    },
    labs: {
      'Lab_White_Blood_Cell_Count': 7.5,
      'Lab_Creatinine': 0.9,
      'Lab_Glucose': 95,
      'Lab_Hemoglobin_A1c': 5.4,
    },
    history: {
      'Medication_Count': 2,
      'length_of_stay': 3,
      'Has_Diabetes': 0,
    }
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_BASE}/leads`);
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error("Failed to fetch leads", err);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Flatten data for backend
    const flatData = {
      ...formData.demographics,
      ...formData.vitals,
      ...formData.labs,
      ...formData.history
    };

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flatData)
      });
      const data = await res.json();
      setPredictionResult(data);
    } catch (err) {
      console.error("Prediction failed", err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (category, field, val) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: parseFloat(val) || 0
      }
    }));
  };

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { id: 'predict', icon: <BrainCircuit size={20} />, label: 'Risk Engine' },
    { id: 'leads', icon: <Users size={20} />, label: 'Active Leads' },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="logo">
          <BrainCircuit className="logo-icon" size={32} />
          <span>HealthPredict Pro</span>
        </div>
        <div className="nav-links">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="status-pill status-indicator">
          <div className="pulse"></div>
          <span>Model v2.4 Live</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1 className="title-gradient">
            {activeTab === 'dashboard' && 'Clinical Intelligence'}
            {activeTab === 'predict' && 'Lead Qualification'}
            {activeTab === 'leads' && 'Priority Management'}
          </h1>
          <div className="user-pill">
            <span className="label">Admin Panel</span>
            <div className="avatar">AD</div>
          </div>
        </header>

        <section className="scroll-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-view fade-in">
              <div className="insight-grid">
                <div className="insight-card">
                  <div className="card-icon" style={{ color: 'var(--primary)' }}><Users /></div>
                  <div className="card-info">
                    <span className="label">Total Patients</span>
                    <span className="val">1,248</span>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="card-icon" style={{ color: 'var(--danger)' }}><ShieldAlert /></div>
                  <div className="card-info">
                    <span className="label">Critical Risks</span>
                    <span className="val">{leads.filter(l => l.Risk_Category?.includes('High')).length}</span>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="card-icon" style={{ color: 'var(--success)' }}><TrendingUp /></div>
                  <div className="card-info">
                    <span className="label">Lead Accuracy</span>
                    <span className="val">91.2%</span>
                  </div>
                </div>
              </div>

              <div className="chart-panel pro-card mt-2">
                <h3>Vulnerability Trends (7 Days)</h3>
                <div className="chart-mock">
                  {[40, 65, 30, 85, 45, 95, 60].map((h, i) => (
                    <div key={i} className="pro-bar" style={{ height: `${h}%`, '--delay': `${i * 0.1}s` }}></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'predict' && (
            <div className="predict-layout fade-in">
              <div className="pro-form">
                <div className="form-header">
                  <h2>Qualify New Lead</h2>
                  <p>Input real-time clinical parameters to determine patient mortality and readmission risk.</p>
                </div>

                <form onSubmit={handlePredict}>
                  {/* Section 1: Demographics */}
                  <div className="input-section">
                    <div className="section-label"><Users size={14} /> Demographics</div>
                    <div className="inputs-grid">
                      <div className="input-wrapper">
                        <label>Age</label>
                        <input type="number" value={formData.demographics.age_at_encounter} onChange={(e) => updateField('demographics', 'age_at_encounter', e.target.value)} />
                      </div>
                      <div className="input-wrapper">
                        <label>Length of Stay (Expected)</label>
                        <input type="number" value={formData.history.length_of_stay} onChange={(e) => updateField('history', 'length_of_stay', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Vitals */}
                  <div className="input-section mt-1">
                    <div className="section-label"><HeartPulse size={14} /> Clinical Vitals</div>
                    <div className="inputs-grid">
                      <div className="input-wrapper">
                        <label>Heart Rate (Mean)</label>
                        <input type="number" value={formData.vitals['Heart Rate_mean']} onChange={(e) => updateField('vitals', 'Heart Rate_mean', e.target.value)} />
                      </div>
                      <div className="input-wrapper">
                        <label>Systolic BP</label>
                        <input type="number" value={formData.vitals['Systolic BP_mean']} onChange={(e) => updateField('vitals', 'Systolic BP_mean', e.target.value)} />
                      </div>
                      <div className="input-wrapper">
                        <label>SpO2 Levels (%)</label>
                        <input type="number" value={formData.vitals['SpO2_mean']} onChange={(e) => updateField('vitals', 'SpO2_mean', e.target.value)} />
                      </div>
                      <div className="input-wrapper">
                        <label>Temperature (F)</label>
                        <input type="number" step="0.1" value={formData.vitals['Temperature_mean']} onChange={(e) => updateField('vitals', 'Temperature_mean', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Labs */}
                  <div className="input-section mt-1">
                    <div className="section-label"><FlaskConical size={14} /> Laboratory Data</div>
                    <div className="inputs-grid">
                      <div className="input-wrapper">
                        <label>WBC Count</label>
                        <input type="number" step="0.1" value={formData.labs['Lab_White_Blood_Cell_Count']} onChange={(e) => updateField('labs', 'Lab_White_Blood_Cell_Count', e.target.value)} />
                      </div>
                      <div className="input-wrapper">
                        <label>Creatinine (mg/dL)</label>
                        <input type="number" step="0.01" value={formData.labs['Lab_Creatinine']} onChange={(e) => updateField('labs', 'Lab_Creatinine', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="action-bar mt-2" style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className="pro-view-btn" style={{ width: 'auto', padding: '0 1.5rem' }} onClick={() => {
                      setFormData({
                        demographics: {
                          age_at_encounter: Math.floor(18 + Math.random() * 70),
                          gender_M: Math.random() > 0.5 ? 1 : 0,
                        },
                        vitals: {
                          'Heart Rate_mean': Math.floor(60 + Math.random() * 40),
                          'Systolic BP_mean': Math.floor(100 + Math.random() * 40),
                          'Diastolic BP_mean': Math.floor(60 + Math.random() * 30),
                          'Temperature_mean': parseFloat((97 + Math.random() * 3).toFixed(1)),
                          'SpO2_mean': Math.floor(90 + Math.random() * 10),
                        },
                        labs: {
                          'Lab_White_Blood_Cell_Count': parseFloat((4 + Math.random() * 10).toFixed(1)),
                          'Lab_Creatinine': parseFloat((0.5 + Math.random() * 2).toFixed(2)),
                          'Lab_Glucose': Math.floor(70 + Math.random() * 100),
                          'Lab_Hemoglobin_A1c': parseFloat((4 + Math.random() * 6).toFixed(1)),
                        },
                        history: {
                          'Medication_Count': Math.floor(Math.random() * 8),
                          'length_of_stay': Math.floor(1 + Math.random() * 14),
                          'Has_Diabetes': Math.random() > 0.8 ? 1 : 0,
                        }
                      })
                    }}>
                      Randomize Full Profile
                    </button>
                    <button type="submit" className="predict-btn" disabled={loading} style={{ flex: 1 }}>
                      {loading ? 'Analyzing Data Points...' : 'Generate AI Risk Prediction'}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Prediction Result Panel */}
              <div className="results-sidebar">
                {predictionResult ? (
                  <div className="score-card fade-in">
                    <div className="score-radial" style={{ '--angle': `${predictionResult.probability * 360}deg` }}>
                      <div className="score-content">
                        <span className="score-value">{(predictionResult.probability * 100).toFixed(0)}</span>
                        <span className="score-label">Risk Score</span>
                      </div>
                    </div>

                    <div className={`status-callout ${predictionResult.probability > 0.75 ? 'high' : (predictionResult.probability > 0.45 ? 'warn' : 'low')}`}>
                      {predictionResult.category.toUpperCase()}
                    </div>

                    <div className="key-factors">
                      <h4>Model Interpretability (Top Predictors)</h4>
                      <div className="factor-item">
                        <span className="factor-name">Expected Stay (LOS)</span>
                        <span className="factor-val">+18.5%</span>
                      </div>
                      <div className="factor-item">
                        <span className="factor-name">Serum Creatinine</span>
                        <span className="factor-val">+12.4%</span>
                      </div>
                      <div className="factor-item">
                        <span className="factor-name">SpO2 (Oxygen Sat.)</span>
                        <span className="factor-val">-4.1%</span>
                      </div>
                      <div className="factor-item">
                        <span className="factor-name">WBC Count</span>
                        <span className="factor-val">+9.6%</span>
                      </div>
                      <div className="factor-item">
                        <span className="factor-name">Patient Age</span>
                        <span className="factor-val">+8.2%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="score-card empty">
                    <div className="empty-state">
                      <BrainCircuit size={48} className="muted-icon" />
                      <p>Run prediction to view AI clinical assessment</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="table-panel fade-in">
              <table className="leads-pro-table">
                <thead>
                  <tr>
                    <th>Patient Identification</th>
                    <th>Medical Score</th>
                    <th>Risk Magnitude</th>
                    <th>Priority Level</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="patient-info">
                          <div className="p-avatar"><Stethoscope size={16} /></div>
                          <div>
                            <div className="p-id">Lead #82{idx}</div>
                            <div className="p-sub">Added 2h ago</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="score-mini">
                          <div className="mini-bar-bg"><div className="mini-bar-fill" style={{ width: `${(lead.Predicted_Probability || 0) * 100}%` }}></div></div>
                          <span>{((lead.Predicted_Probability || 0) * 100).toFixed(1)}</span>
                        </div>
                      </td>
                      <td>
                        <div className={`risk-pill ${lead.Risk_Category?.toLowerCase().includes('high') ? 'high' : (lead.Risk_Category?.toLowerCase().includes('medium') || lead.Risk_Category?.toLowerCase().includes('elevated') ? 'med' : 'low')}`}>
                          {lead.Risk_Category?.split('(')[0] || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className="priority-text">{lead.Predicted_Probability > 0.7 ? 'CRITICAL' : (lead.Predicted_Probability > 0.4 ? 'ELEVATED' : 'ROUTINE')}</span>
                      </td>
                      <td><div className="active-dot"></div> Active</td>
                      <td><button className="pro-view-btn"><ArrowRight size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

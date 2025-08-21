'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Chart from 'chart.js/auto';
import { Calendar, Clock, PillIcon, Brain, AlertCircle } from 'lucide-react';

export default function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [mhProgressData, setMhProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        setMessage('❌ User not logged in!');
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const profileRes = await fetch(`/api/user-profile/${userId}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          setProfile(profileData.profile);
        }

        // Fetch appointments
        const apptsRes = await fetch('/api/appointments', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
        if (apptsRes.ok) {
          const apptsData = await apptsRes.json();
          setAppointments(apptsData.appointments || []);
        }

        // Fetch medications
        const medsRes = await fetch('/api/medications', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
        if (medsRes.ok) {
          const medsData = await medsRes.json();
          setMedications(medsData.reminders || []);
        }

        // Fetch mental health data for graph
        if (userId) {
          const mhRes = await fetch(`/api/mentalhealth/progress?userId=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (mhRes.ok) {
            const mhData = await mhRes.json();
            setMhProgressData(mhData || []);
          }
      }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setMessage('❌ Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Initialize charts when data is loaded
  useEffect(() => {
    if (mhProgressData.length > 0) {
      const ctx = document.getElementById('mhProgressChart');
      
      // Check if there's an existing chart and destroy it
      if (ctx && ctx.chart) {
        ctx.chart.destroy();
      }
      
      if (ctx) {
        // Create a new chart and store the reference
        ctx.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: mhProgressData.map(record => new Date(record.timestamp).toLocaleDateString()),
          datasets: [{
            label: 'Stress Level',
            data: mhProgressData.map(record => record.stressLevel),
              borderColor: 'rgb(59, 130, 246)', // Blue
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4
            }, {
              label: 'Sleep Hours',
              data: mhProgressData.map(record => record.sleepHours),
              borderColor: 'rgb(16, 185, 129)', // Green
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4
            }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Health Trends'
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    }
  }, [mhProgressData]);

  // Get the date of the next appointment
  const getNextAppointment = () => {
    if (!appointments || appointments.length === 0) return null;
    
    const sortedAppointments = [...appointments]
      .filter(apt => apt.status === 'approved')
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      });
    
    const now = new Date();
    const futureAppointments = sortedAppointments.filter(apt => {
      const aptDate = new Date(`${apt.date}T${apt.time}`);
      return aptDate > now;
    });
    
    return futureAppointments.length > 0 ? futureAppointments[0] : null;
  };

  // Get next medication to take
  const getNextMedication = () => {
    if (!medications || medications.length === 0) return null;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Sort medications by time
    const sortedMeds = [...medications].sort((a, b) => {
      const [hoursA, minutesA] = a.time.split(':').map(Number);
      const [hoursB, minutesB] = b.time.split(':').map(Number);
      return (hoursA * 60 + minutesA) - (hoursB * 60 + minutesB);
    });
    
    // Find the next medication to take today
    const nextMed = sortedMeds.find(med => {
      const [hours, minutes] = med.time.split(':').map(Number);
      const medTime = hours * 60 + minutes;
      return medTime > currentTime;
    });
    
    return nextMed || sortedMeds[0]; // Return the first med of tomorrow if none left today
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const nextAppointment = getNextAppointment();
  const nextMedication = getNextMedication();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your Health Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {profile ? `${profile.firstName} ${profile.lastName}` : 'Patient'}
        </p>
      </div>
      
      {message && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Appointments card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Next Appointment</h2>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
          {nextAppointment ? (
            <div>
              <p className="font-medium text-lg">
                {typeof nextAppointment.doctor === 'object' 
                  ? (nextAppointment.doctor.name || 'Unknown Doctor') 
                  : (nextAppointment.doctor || 'Unknown Doctor')}
              </p>
              <p className="text-gray-600">{nextAppointment.date} at {nextAppointment.time}</p>
              <Link href="/dashboard/appointments">
                <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                  View all appointments →
            </button>
          </Link>
        </div>
      ) : (
            <div>
              <p className="text-gray-500">No upcoming appointments</p>
              <Link href="/dashboard/appointments">
                <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                  Schedule an appointment →
            </button>
          </Link>
        </div>
      )}
        </div>

        {/* Medications card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Next Medication</h2>
            <PillIcon className="h-8 w-8 text-green-500" />
          </div>
          {nextMedication ? (
            <div>
              <p className="font-medium text-lg">{nextMedication.medicationName}</p>
              <p className="text-gray-600">{nextMedication.dosage} at {nextMedication.time}</p>
              <Link href="/dashboard/medications">
                <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                  View all medications →
          </button>
        </Link>
            </div>
          ) : (
            <div>
              <p className="text-gray-500">No medications scheduled</p>
              <Link href="/dashboard/add-medication">
                <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                  Add medication reminder →
          </button>
        </Link>
      </div>
          )}
        </div>

        {/* Health summary card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Health Status</h2>
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
          {mhProgressData.length > 0 ? (
            <div>
              <p className="font-medium">
                Current stress level: <span className="text-purple-600">{mhProgressData[mhProgressData.length - 1]?.stressLevel || '-'}/10</span>
              </p>
              <p className="text-gray-600">
                Sleep: {mhProgressData[mhProgressData.length - 1]?.sleepHours || '-'} hours
              </p>
              <Link href="/dashboard/mental-health">
                <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                  Track your mental health →
              </button>
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-gray-500">No health data available</p>
              <Link href="/dashboard/mental-health">
                <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                  Start tracking your health →
        </button>
              </Link>
            </div>
          )}
        </div>

        {/* Activity card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Activity</h2>
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
          <p className="font-medium">Recent Activity</p>
          <ul className="text-gray-600 mt-1 space-y-1">
            <li>• {appointments.length} appointments</li>
            <li>• {medications.length} medication reminders</li>
            <li>• {mhProgressData.length} health records</li>
          </ul>
          <Link href="/dashboard/notifications">
            <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
              View notifications →
            </button>
          </Link>
        </div>
      </div>

      {/* Health trends graph */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="font-bold text-xl mb-4">Health Trends</h2>
        <div className="h-80">
          {mhProgressData.length > 0 ? (
            <canvas id="mhProgressChart"></canvas>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 mb-4">No health data available to display</p>
                <Link href="/dashboard/mental-health">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                    Start tracking your health
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h2 className="font-bold text-xl mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/appointments">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:border-blue-300 hover:shadow-md transition">
              <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="font-medium">Schedule Appointment</p>
            </div>
          </Link>
          <Link href="/dashboard/add-medication">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:border-blue-300 hover:shadow-md transition">
              <PillIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium">Add Medication</p>
            </div>
          </Link>
          <Link href="/dashboard/mental-health">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:border-blue-300 hover:shadow-md transition">
              <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="font-medium">Track Mental Health</p>
            </div>
          </Link>
          <Link href="/dashboard/symptom-checker">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:border-blue-300 hover:shadow-md transition">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="font-medium">Check Symptoms</p>
        </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
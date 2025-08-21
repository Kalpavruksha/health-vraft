'use client';

import { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { ArrowLeft, Brain, Send, BarChart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function MentalHealth() {
  const [formData, setFormData] = useState({
    mood: '',
    anxiety: 0,
    depression: 0,
    stressLevel: 0,
    sleepHours: 0,
    energyLevel: 0,
    concentration: 0,
    appetite: '',
    socialInteraction: 0,
    selfEsteem: 0,
    thoughts: '',
    userId: '',
  });
  const [recommendation, setRecommendation] = useState('');
  const [progressData, setProgressData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set userId from localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      setFormData((prevData) => ({ ...prevData, userId }));
      // Fetch previous data
      fetchProgress(userId);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/mentalhealth/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          stressLevel: Number(formData.stressLevel),
          sleepHours: Number(formData.sleepHours),
          anxiety: Number(formData.anxiety),
          depression: Number(formData.depression),
          energyLevel: Number(formData.energyLevel),
          concentration: Number(formData.concentration),
          socialInteraction: Number(formData.socialInteraction),
          selfEsteem: Number(formData.selfEsteem),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRecommendation(data.recommendation);
        setErrorMessage('');
        setSubmitted(true);
        // Refresh progress data
        fetchProgress(formData.userId);
      } else {
        setErrorMessage(data.error || 'Failed to submit data');
        setRecommendation('');
      }
    } catch (error) {
      console.error("Failed to submit data:", error);
      setErrorMessage('Failed to submit data. Please try again.');
      setRecommendation('');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgress = async (userId) => {
    if (!userId) return;
    
    try {
      const res = await fetch(`/api/mentalhealth/progress?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProgressData(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch progress data:", error);
    }
  };

  useEffect(() => {
    let chartInstance;

    if (progressData.length > 0) {
      const ctx = document.getElementById('progressChart');
      
      if (ctx) {
        // Clear any existing chart
        if (ctx.chart) {
          ctx.chart.destroy();
        }
        
        // Create a new chart
        ctx.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: progressData.map(record => new Date(record.timestamp).toLocaleDateString()),
            datasets: [
              {
                label: 'Stress Level',
                data: progressData.map(record => record.stressLevel),
                borderColor: 'rgb(59, 130, 246)', // Blue
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Anxiety',
                data: progressData.map(record => record.anxiety),
                borderColor: 'rgb(239, 68, 68)', // Red
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Depression',
                data: progressData.map(record => record.depression),
                borderColor: 'rgb(124, 58, 237)', // Purple
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Sleep Hours',
                data: progressData.map(record => record.sleepHours),
                borderColor: 'rgb(16, 185, 129)', // Green
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
              }
            ]
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
                text: 'Mental Health Trends'
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

    return () => {
      const ctx = document.getElementById('progressChart');
      if (ctx && ctx.chart) {
        ctx.chart.destroy();
      }
    };
  }, [progressData]);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/patient">
            <div className="flex items-center text-blue-600 hover:text-blue-800 mr-4 font-medium">
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span>Back to Dashboard</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold flex items-center text-gray-900">
            <Brain className="h-8 w-8 text-purple-600 mr-3" />
            Mental Health Assessment
          </h1>
        </div>
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300 font-medium">
            {errorMessage}
          </div>
        )}
        
        {!submitted ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">How are you feeling today?</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-800 font-medium mb-2">What is your current mood?</label>
                <select
                  name="mood"
                  value={formData.mood}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="">Select your mood</option>
                  <option value="happy">Happy</option>
                  <option value="content">Content</option>
                  <option value="neutral">Neutral</option>
                  <option value="sad">Sad</option>
                  <option value="frustrated">Frustrated</option>
                  <option value="angry">Angry</option>
                  <option value="anxious">Anxious</option>
                  <option value="overwhelmed">Overwhelmed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-800 font-medium mb-2">
                  On a scale of 1-10, how would you rate your anxiety level? (1 = none, 10 = severe)
                </label>
                <input
                  type="range"
                  name="anxiety"
                  min="0"
                  max="10"
                  value={formData.anxiety}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>None (0)</span>
                  <span>Mild (3)</span>
                  <span>Moderate (6)</span>
                  <span>Severe (10)</span>
                </div>
                <p className="text-center mt-2 text-gray-900 font-medium">{formData.anxiety}</p>
              </div>
              
              <div>
                <label className="block text-gray-800 font-medium mb-2">
                  On a scale of 1-10, how would you rate your feelings of depression? (1 = none, 10 = severe)
                </label>
                <input
                  type="range"
                  name="depression"
                  min="0"
                  max="10"
                  value={formData.depression}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>None (0)</span>
                  <span>Mild (3)</span>
                  <span>Moderate (6)</span>
                  <span>Severe (10)</span>
                </div>
                <p className="text-center mt-2 text-gray-900 font-medium">{formData.depression}</p>
              </div>
              
              <div>
                <label className="block text-gray-800 font-medium mb-2">
                  On a scale of 1-10, how would you rate your current stress level? (1 = none, 10 = severe)
                </label>
                <input
                  type="range"
                  name="stressLevel"
                  min="0"
                  max="10"
                  value={formData.stressLevel}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>None (0)</span>
                  <span>Mild (3)</span>
                  <span>Moderate (6)</span>
                  <span>Severe (10)</span>
                </div>
                <p className="text-center mt-2 text-gray-900 font-medium">{formData.stressLevel}</p>
              </div>
              
              <div>
                <label className="block text-gray-800 font-medium mb-2">How many hours did you sleep last night?</label>
                <input
                  type="number"
                  name="sleepHours"
                  value={formData.sleepHours}
                  onChange={handleChange}
                  min="0"
                  max="24"
                  step="0.5"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-gray-800 font-medium mb-2">
                  On a scale of 1-10, how is your energy level today? (1 = very low, 10 = very high)
                </label>
                <input
                  type="range"
                  name="energyLevel"
                  min="0"
                  max="10"
                  value={formData.energyLevel}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>Very low (0)</span>
                  <span>Low (3)</span>
                  <span>Moderate (6)</span>
                  <span>High (10)</span>
                </div>
                <p className="text-center mt-2 text-gray-900 font-medium">{formData.energyLevel}</p>
              </div>
              
              <div>
                <label className="block text-gray-800 font-medium mb-2">
                  On a scale of 1-10, how would you rate your ability to concentrate today? (1 = poor, 10 = excellent)
                </label>
                <input
                  type="range"
                  name="concentration"
                  min="0"
                  max="10"
                  value={formData.concentration}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>Poor (0)</span>
                  <span>Fair (3)</span>
                  <span>Good (6)</span>
                  <span>Excellent (10)</span>
                </div>
                <p className="text-center mt-2 text-gray-900 font-medium">{formData.concentration}</p>
              </div>
              
              <div>
                <label className="block text-gray-800 font-medium mb-2">How has your appetite been?</label>
                <select
                  name="appetite"
                  value={formData.appetite}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="">Select an option</option>
                  <option value="increased">Increased</option>
                  <option value="normal">Normal</option>
                  <option value="decreased">Decreased</option>
                  <option value="significantly decreased">Significantly decreased</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-800 font-medium mb-2">
                  On a scale of 1-10, how social have you been in the past week? (1 = not at all, 10 = very social)
                </label>
                <input
                  type="range"
                  name="socialInteraction"
                  min="0"
                  max="10"
                  value={formData.socialInteraction}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>Not at all (0)</span>
                  <span>Some (3)</span>
                  <span>Regular (6)</span>
                  <span>Very social (10)</span>
                </div>
                <p className="text-center mt-2 text-gray-900 font-medium">{formData.socialInteraction}</p>
              </div>
              
              <div>
                <label className="block text-gray-800 font-medium mb-2">
                  On a scale of 1-10, how would you rate your self-esteem today? (1 = very low, 10 = very high)
                </label>
                <input
                  type="range"
                  name="selfEsteem"
                  min="0"
                  max="10"
                  value={formData.selfEsteem}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>Very low (0)</span>
                  <span>Low (3)</span>
                  <span>Average (6)</span>
                  <span>High (10)</span>
                </div>
                <p className="text-center mt-2 text-gray-900 font-medium">{formData.selfEsteem}</p>
              </div>
              
              <div>
                <label className="block text-gray-800 font-medium mb-2">Do you have any specific thoughts or concerns you'd like to share?</label>
                <textarea
                  name="thoughts"
                  value={formData.thoughts}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  placeholder="Share any thoughts, concerns, or feelings here..."
                ></textarea>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Submit Assessment
                  </>
                )}
              </Button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Assessment Results</h2>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-6">
              <h3 className="font-medium text-purple-800 mb-2">Personal Recommendations</h3>
              <p className="text-gray-800">{recommendation || "No specific recommendations available at this time."}</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-1">Stress Level</h3>
                <p className="text-gray-800 mb-2">You reported a stress level of {formData.stressLevel}/10</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(formData.stressLevel / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800 mb-1">Anxiety</h3>
                <p className="text-gray-800 mb-2">You reported an anxiety level of {formData.anxiety}/10</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-red-500 h-2.5 rounded-full" 
                    style={{ width: `${(formData.anxiety / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-1">Depression</h3>
                <p className="text-gray-800 mb-2">You reported a depression level of {formData.depression}/10</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${(formData.depression / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="mt-6"
            >
              Take Another Assessment
            </Button>
          </div>
        )}
        
        {/* Mental Health Trends Chart */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BarChart className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Your Mental Health Trends</h2>
          </div>
          
          <div className="h-80">
            {progressData.length > 0 ? (
              <canvas id="progressChart"></canvas>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-600 font-medium mb-4">No assessment history available yet.</p>
                  <p className="text-gray-800">Complete your first assessment to start tracking your mental health trends.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

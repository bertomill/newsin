'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

// Define common business sectors
const BUSINESS_SECTORS = [
  { id: 'technology', name: 'Technology & Software' },
  { id: 'finance', name: 'Finance & Banking' },
  { id: 'healthcare', name: 'Healthcare & Pharmaceuticals' },
  { id: 'retail', name: 'Retail & E-commerce' },
  { id: 'manufacturing', name: 'Manufacturing & Industry' },
  { id: 'education', name: 'Education & Training' },
  { id: 'media', name: 'Media & Entertainment' },
  { id: 'consulting', name: 'Consulting & Professional Services' },
  { id: 'nonprofit', name: 'Non-profit & NGO' },
  { id: 'government', name: 'Government & Public Sector' },
  { id: 'other', name: 'Other' },
];

// Define common roles
const COMMON_ROLES = [
  { id: 'executive', name: 'Executive (CEO, CTO, CFO, etc.)' },
  { id: 'management', name: 'Management' },
  { id: 'marketing', name: 'Marketing & Communications' },
  { id: 'sales', name: 'Sales & Business Development' },
  { id: 'product', name: 'Product Management' },
  { id: 'engineering', name: 'Engineering & Development' },
  { id: 'design', name: 'Design & UX' },
  { id: 'operations', name: 'Operations' },
  { id: 'finance', name: 'Finance & Accounting' },
  { id: 'hr', name: 'Human Resources' },
  { id: 'research', name: 'Research & Development' },
  { id: 'other', name: 'Other' },
];

// Define common themes to track
const KEY_THEMES = [
  { id: 'ai', name: 'Artificial Intelligence & Machine Learning' },
  { id: 'blockchain', name: 'Blockchain & Cryptocurrency' },
  { id: 'sustainability', name: 'Sustainability & Climate Change' },
  { id: 'remote_work', name: 'Remote Work & Future of Work' },
  { id: 'cybersecurity', name: 'Cybersecurity & Data Privacy' },
  { id: 'digital_transformation', name: 'Digital Transformation' },
  { id: 'market_trends', name: 'Market Trends & Competitive Analysis' },
  { id: 'funding', name: 'Funding & Investment' },
  { id: 'regulation', name: 'Regulation & Compliance' },
  { id: 'innovation', name: 'Innovation & Emerging Technologies' },
  { id: 'customer_experience', name: 'Customer Experience' },
  { id: 'talent', name: 'Talent & Workforce Development' },
];

export default function Personalization() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  
  // User information state
  const [businessSector, setBusinessSector] = useState('');
  const [otherBusinessSector, setOtherBusinessSector] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [role, setRole] = useState('');
  const [otherRole, setOtherRole] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [customThemes, setCustomThemes] = useState('');
  
  // Get user data and existing preferences
  useEffect(() => {
    const auth = getAuth(app);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Personalization page - User authenticated:', user.uid);
        setUserId(user.uid);
        
        // Extract first name for greeting
        if (user.displayName) {
          setFirstName(user.displayName.split(' ')[0]);
        } else if (user.email) {
          setFirstName(user.email.split('@')[0]);
        }
        
        // Try to load existing preferences
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Loaded user data:', userData);
            
            // Load business information if it exists
            if (userData.business) {
              setBusinessSector(userData.business.sector || '');
              setOtherBusinessSector(userData.business.otherSector || '');
              setBusinessDescription(userData.business.description || '');
            }
            
            // Load role information
            if (userData.role) {
              setRole(userData.role.type || '');
              setOtherRole(userData.role.otherType || '');
            }
            
            // Load themes
            if (userData.themes) {
              setSelectedThemes(userData.themes.selected || []);
              setCustomThemes(userData.themes.custom || '');
            }
          }
        } catch (error) {
          console.error('Error loading user preferences:', error);
        }
        
        setLoading(false);
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    });
    
    return () => unsubscribe();
  }, [router]);
  
  // Handle theme selection
  const toggleTheme = (themeId: string) => {
    setSelectedThemes(prev => 
      prev.includes(themeId)
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  };
  
  // Save preferences
  const savePreferences = async () => {
    if (!userId) return;
    
    setSaving(true);
    
    try {
      // Prepare business information
      const businessInfo = {
        sector: businessSector,
        otherSector: businessSector === 'other' ? otherBusinessSector : '',
        description: businessDescription
      };
      
      // Prepare role information
      const roleInfo = {
        type: role,
        otherType: role === 'other' ? otherRole : ''
      };
      
      // Prepare themes information
      const themesInfo = {
        selected: selectedThemes,
        custom: customThemes.trim()
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'users', userId), {
        business: businessInfo,
        role: roleInfo,
        themes: themesInfo,
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('Preferences saved successfully');
      
      // Navigate to home page after saving
      router.push('/home');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('There was an error saving your information. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Personalize Your News Experience</h1>
          <p className="text-gray-600">
            Hi {firstName}! Help us understand your business needs so we can deliver the most relevant news to you.
          </p>
        </header>
        
        <div className="space-y-10">
          {/* Business Information Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">What does your business do?</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="businessSector" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Sector
                </label>
                <select
                  id="businessSector"
                  value={businessSector}
                  onChange={(e) => setBusinessSector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a sector</option>
                  {BUSINESS_SECTORS.map(sector => (
                    <option key={sector.id} value={sector.id}>{sector.name}</option>
                  ))}
                </select>
              </div>
              
              {businessSector === 'other' && (
                <div>
                  <label htmlFor="otherBusinessSector" className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify
                  </label>
                  <input
                    type="text"
                    id="otherBusinessSector"
                    value={otherBusinessSector}
                    onChange={(e) => setOtherBusinessSector(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your business sector"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Brief description of your business
                </label>
                <textarea
                  id="businessDescription"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What products or services does your business provide?"
                  rows={3}
                />
              </div>
            </div>
          </section>
          
          {/* Role Information */}
          <section>
            <h2 className="text-xl font-semibold mb-4">What is your role in your organization?</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a role</option>
                  {COMMON_ROLES.map(roleOption => (
                    <option key={roleOption.id} value={roleOption.id}>{roleOption.name}</option>
                  ))}
                </select>
              </div>
              
              {role === 'other' && (
                <div>
                  <label htmlFor="otherRole" className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify
                  </label>
                  <input
                    type="text"
                    id="otherRole"
                    value={otherRole}
                    onChange={(e) => setOtherRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your role"
                  />
                </div>
              )}
            </div>
          </section>
          
          {/* Key Themes Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">What are the key themes you are tracking?</h2>
            <p className="text-gray-600 mb-4">Select all that apply. This helps our AI understand what news to prioritize.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {KEY_THEMES.map(theme => (
                <div 
                  key={theme.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedThemes.includes(theme.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleTheme(theme.id)}
                >
                  <h3 className="font-medium">{theme.name}</h3>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <label htmlFor="customThemes" className="block text-sm font-medium text-gray-700 mb-1">
                Any other specific themes or topics you&apos;re interested in?
              </label>
              <textarea
                id="customThemes"
                value={customThemes}
                onChange={(e) => setCustomThemes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E.g., Industry-specific trends, specific technologies, regional markets"
                rows={2}
              />
            </div>
          </section>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link
              href="/home"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              onClick={savePreferences}
              disabled={saving}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Save Information'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 
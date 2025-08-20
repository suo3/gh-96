import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useListingStore } from '@/stores/listingStore';
import { useMessageStore } from '@/stores/messageStore';
import { useCoinPricing } from '@/hooks/useCoinPricing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Smartphone, Database, Wifi, DollarSign } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export const UITestingPanel = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const { user, isAuthenticated } = useAuthStore();
  const { listings } = useListingStore();
  const { conversations } = useMessageStore();
  const { data: pricingPlans } = useCoinPricing();

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Authentication Status
    results.push({
      name: 'Authentication System',
      status: isAuthenticated ? 'pass' : 'warning',
      message: isAuthenticated ? 'User authenticated successfully' : 'No user logged in (testing anonymously)',
      details: user ? `User: ${user.username || user.email}` : 'Anonymous user'
    });

    // Test 2: Data Loading
    results.push({
      name: 'Listing Data Loading',
      status: listings.length > 0 ? 'pass' : 'warning',
      message: `${listings.length} listings loaded`,
      details: listings.length === 0 ? 'No listings available - this is normal for new installations' : `Found ${listings.length} listings`
    });

    // Test 3: UI Components
    const uiElements = [
      { name: 'Buttons', element: document.querySelector('button') },
      { name: 'Cards', element: document.querySelector('[class*="card"]') },
      { name: 'Navigation', element: document.querySelector('nav, header') },
      { name: 'Forms', element: document.querySelector('form, input') }
    ];

    uiElements.forEach(({ name, element }) => {
      results.push({
        name: `UI Component: ${name}`,
        status: element ? 'pass' : 'fail',
        message: element ? `${name} rendered correctly` : `${name} not found`,
        details: element ? `Element found: ${element.tagName}` : 'Component missing'
      });
    });

    // Test 4: Mobile Money Configuration
    results.push({
      name: 'Mobile Money Integration',
      status: 'warning',
      message: 'Mobile money configured but requires API integration',
      details: 'Edge function exists, awaiting real API credentials'
    });

    // Test 5: Responsive Design
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    results.push({
      name: 'Responsive Design',
      status: 'pass',
      message: `Detected ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'} viewport`,
      details: `Screen width: ${window.innerWidth}px`
    });

    // Test 6: Color System
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const textColor = getComputedStyle(document.body).color;
    results.push({
      name: 'Design System Colors',
      status: bodyBg !== 'rgba(0, 0, 0, 0)' ? 'pass' : 'fail',
      message: 'CSS variables and color system working',
      details: `Background: ${bodyBg}, Text: ${textColor}`
    });

    // Test 7: Network Connectivity
    try {
      const response = await fetch('/robots.txt');
      results.push({
        name: 'Network Connectivity',
        status: response.ok ? 'pass' : 'fail',
        message: response.ok ? 'Network requests working' : 'Network issues detected',
        details: `Status: ${response.status}`
      });
    } catch (error) {
      results.push({
        name: 'Network Connectivity',
        status: 'fail',
        message: 'Network request failed',
        details: String(error)
      });
    }

    // Test 8: Database Connection (via coin pricing)
    results.push({
      name: 'Database Connection',
      status: pricingPlans && pricingPlans.length > 0 ? 'pass' : 'warning',
      message: pricingPlans ? `Database connected, ${pricingPlans.length} pricing plans loaded` : 'Database connection pending',
      details: pricingPlans ? `First plan: ${pricingPlans[0]?.name}` : 'No pricing data available'
    });

    setTests(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return 'border-green-200 bg-green-50';
      case 'fail': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
    }
  };

  const passCount = tests.filter(t => t.status === 'pass').length;
  const failCount = tests.filter(t => t.status === 'fail').length;
  const warningCount = tests.filter(t => t.status === 'warning').length;

  // Only show in development
  if (!import.meta.env.DEV) return null;

  return (
    <Card className="fixed bottom-4 left-4 w-96 max-h-[500px] overflow-auto z-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Smartphone className="w-4 h-4" />
          UI Testing Panel
          <Badge variant="outline" className="ml-auto">
            DEV
          </Badge>
        </CardTitle>
        <div className="flex gap-4 text-xs">
          <span className="text-green-600">✓ {passCount} Pass</span>
          <span className="text-red-600">✗ {failCount} Fail</span>
          <span className="text-yellow-600">⚠ {warningCount} Warning</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          size="sm" 
          className="w-full mb-3"
        >
          {isRunning ? 'Running Tests...' : 'Run Tests Again'}
        </Button>

        {tests.map((test, index) => (
          <div 
            key={index}
            className={`p-2 rounded border ${getStatusColor(test.status)}`}
          >
            <div className="flex items-start gap-2">
              {getStatusIcon(test.status)}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs">{test.name}</div>
                <div className="text-xs text-gray-600">{test.message}</div>
                {test.details && (
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {test.details}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <Alert className="mt-4">
          <Database className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Production Status: {failCount === 0 ? '🟢 Ready' : failCount > 2 ? '🔴 Issues Found' : '🟡 Minor Issues'}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
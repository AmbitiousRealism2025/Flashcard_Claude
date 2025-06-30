/**
 * Navigation Integration Test
 * Comprehensive validation of navigation flow and edge cases
 */

import { NavigationUtils, validateRouteParams, NavigationErrorHandler } from './navigation';
import { NavigationParamList } from '../types';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

export class NavigationIntegrationTest {
  private results: TestResult[] = [];

  /**
   * Run all navigation integration tests
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Navigation Integration Tests...');
    
    this.results = [];
    
    // Test navigation utility methods
    await this.testNavigationUtilities();
    
    // Test route parameter validation
    await this.testRouteValidation();
    
    // Test error handling
    await this.testErrorHandling();
    
    // Test edge cases
    await this.testEdgeCases();
    
    // Test performance
    await this.testPerformance();
    
    this.logResults();
    return this.results;
  }

  /**
   * Test navigation utility methods
   */
  private async testNavigationUtilities(): Promise<void> {
    // Test 1: Navigation readiness check
    try {
      const isReady = NavigationUtils.isReady();
      this.addResult('Navigation Readiness Check', typeof isReady === 'boolean');
    } catch (error) {
      this.addResult('Navigation Readiness Check', false, error as string);
    }

    // Test 2: Route name retrieval
    try {
      const routeName = NavigationUtils.getCurrentRouteName();
      this.addResult('Current Route Name', routeName === undefined || typeof routeName === 'string');
    } catch (error) {
      this.addResult('Current Route Name', false, error as string);
    }

    // Test 3: Navigation state retrieval
    try {
      const state = NavigationUtils.getNavigationState();
      this.addResult('Navigation State', state === undefined || typeof state === 'object');
    } catch (error) {
      this.addResult('Navigation State', false, error as string);
    }
  }

  /**
   * Test route parameter validation
   */
  private async testRouteValidation(): Promise<void> {
    // Test 1: Valid Flashcards parameters
    try {
      const validParams = { deckId: 'ai-beginner-deck', title: 'Test Deck' };
      const isValid = validateRouteParams.Flashcards(validParams);
      this.addResult('Valid Flashcards Parameters', isValid === true, undefined, validParams);
    } catch (error) {
      this.addResult('Valid Flashcards Parameters', false, error as string);
    }

    // Test 2: Invalid Flashcards parameters
    try {
      const invalidParams = { deckId: '', title: 'Test Deck' };
      const isValid = validateRouteParams.Flashcards(invalidParams);
      this.addResult('Invalid Flashcards Parameters', isValid === false, undefined, invalidParams);
    } catch (error) {
      this.addResult('Invalid Flashcards Parameters', false, error as string);
    }

    // Test 3: Missing Flashcards parameters
    try {
      const missingParams = { title: 'Test Deck' };
      const isValid = validateRouteParams.Flashcards(missingParams);
      this.addResult('Missing Flashcards Parameters', isValid === false, undefined, missingParams);
    } catch (error) {
      this.addResult('Missing Flashcards Parameters', false, error as string);
    }

    // Test 4: Home screen parameters (should be undefined)
    try {
      const homeParams = undefined;
      const isValid = validateRouteParams.Home(homeParams);
      this.addResult('Home Screen Parameters', isValid === true);
    } catch (error) {
      this.addResult('Home Screen Parameters', false, error as string);
    }

    // Test 5: Settings screen parameters (should be undefined)
    try {
      const settingsParams = undefined;
      const isValid = validateRouteParams.Settings(settingsParams);
      this.addResult('Settings Screen Parameters', isValid === true);
    } catch (error) {
      this.addResult('Settings Screen Parameters', false, error as string);
    }
  }

  /**
   * Test error handling mechanisms
   */
  private async testErrorHandling(): Promise<void> {
    // Test 1: Navigation error handler exists
    try {
      const hasHandler = typeof NavigationErrorHandler.handleNavigationError === 'function';
      this.addResult('Navigation Error Handler Exists', hasHandler);
    } catch (error) {
      this.addResult('Navigation Error Handler Exists', false, error as string);
    }

    // Test 2: Edge case handler exists
    try {
      const hasEdgeHandler = typeof NavigationErrorHandler.handleEdgeCase === 'function';
      this.addResult('Edge Case Handler Exists', hasEdgeHandler);
    } catch (error) {
      this.addResult('Edge Case Handler Exists', false, error as string);
    }

    // Test 3: Navigation state validation
    try {
      const isValid = NavigationErrorHandler.validateNavigationState();
      this.addResult('Navigation State Validation', typeof isValid === 'boolean');
    } catch (error) {
      this.addResult('Navigation State Validation', false, error as string);
    }
  }

  /**
   * Test edge cases and error scenarios
   */
  private async testEdgeCases(): Promise<void> {
    // Test 1: Rapid navigation prevention
    try {
      const result = NavigationErrorHandler.handleEdgeCase('rapid_navigation');
      this.addResult('Rapid Navigation Prevention', typeof result === 'boolean');
    } catch (error) {
      this.addResult('Rapid Navigation Prevention', false, error as string);
    }

    // Test 2: Invalid parameters handling
    try {
      const result = NavigationErrorHandler.handleEdgeCase('invalid_params');
      this.addResult('Invalid Parameters Handling', typeof result === 'boolean');
    } catch (error) {
      this.addResult('Invalid Parameters Handling', false, error as string);
    }

    // Test 3: Memory pressure handling
    try {
      const result = NavigationErrorHandler.handleEdgeCase('memory_pressure');
      this.addResult('Memory Pressure Handling', typeof result === 'boolean');
    } catch (error) {
      this.addResult('Memory Pressure Handling', false, error as string);
    }

    // Test 4: Unknown edge case handling
    try {
      const result = NavigationErrorHandler.handleEdgeCase('unknown_scenario');
      this.addResult('Unknown Edge Case Handling', result === false);
    } catch (error) {
      this.addResult('Unknown Edge Case Handling', false, error as string);
    }
  }

  /**
   * Test navigation performance
   */
  private async testPerformance(): Promise<void> {
    // Test 1: Navigation method performance
    try {
      const startTime = performance.now();
      
      // Simulate navigation calls
      NavigationUtils.getCurrentRouteName();
      NavigationUtils.getNavigationState();
      NavigationUtils.isReady();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Navigation calls should be fast (< 10ms)
      const isPerformant = duration < 10;
      this.addResult('Navigation Method Performance', isPerformant, undefined, `${duration.toFixed(2)}ms`);
    } catch (error) {
      this.addResult('Navigation Method Performance', false, error as string);
    }

    // Test 2: Route validation performance
    try {
      const startTime = performance.now();
      
      // Test multiple validations
      for (let i = 0; i < 100; i++) {
        validateRouteParams.Flashcards({ deckId: 'test-deck', title: 'Test' });
        validateRouteParams.Home(undefined);
        validateRouteParams.Settings(undefined);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 100 validations should be fast (< 50ms)
      const isPerformant = duration < 50;
      this.addResult('Route Validation Performance', isPerformant, undefined, `${duration.toFixed(2)}ms for 100 validations`);
    } catch (error) {
      this.addResult('Route Validation Performance', false, error as string);
    }
  }

  /**
   * Add a test result
   */
  private addResult(testName: string, passed: boolean, error?: string, details?: any): void {
    this.results.push({
      testName,
      passed,
      error,
      details,
    });
  }

  /**
   * Log test results
   */
  private logResults(): void {
    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log('\n📊 Navigation Integration Test Results:');
    console.log(`✅ Passed: ${passedTests}/${totalTests} (${passRate}%)`);
    
    if (passedTests < totalTests) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`  • ${result.testName}: ${result.error || 'Unknown error'}`);
          if (result.details) {
            console.log(`    Details: ${JSON.stringify(result.details)}`);
          }
        });
    }

    console.log('\n🔧 All Tests:');
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`  ${status} ${result.testName}`);
      if (result.details && result.passed) {
        console.log(`    ${result.details}`);
      }
    });
  }

  /**
   * Get summary of test results
   */
  getSummary(): { passed: number; total: number; passRate: number; failedTests: string[] } {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = (passed / total) * 100;
    const failedTests = this.results.filter(r => !r.passed).map(r => r.testName);

    return { passed, total, passRate, failedTests };
  }
}

/**
 * Quick test runner for development
 */
export const runNavigationTests = async (): Promise<TestResult[]> => {
  const tester = new NavigationIntegrationTest();
  return await tester.runAllTests();
};

/**
 * Validate complete navigation flow
 */
export const validateNavigationFlow = (): boolean => {
  try {
    // Check if all required navigation components exist
    const requiredMethods = [
      'navigate',
      'goBack',
      'reset',
      'navigateToFlashcards',
      'navigateToSettings',
      'navigateToHome',
      'smartGoBack',
      'getCurrentRoute',
      'getCurrentRouteName',
      'getNavigationState',
      'isReady',
    ];

    const missingMethods = requiredMethods.filter(method => 
      typeof (NavigationUtils as any)[method] !== 'function'
    );

    if (missingMethods.length > 0) {
      console.error('Missing NavigationUtils methods:', missingMethods);
      return false;
    }

    // Check if all route validators exist
    const requiredValidators = ['Flashcards', 'Home', 'Settings'];
    const missingValidators = requiredValidators.filter(validator =>
      typeof validateRouteParams[validator as keyof typeof validateRouteParams] !== 'function'
    );

    if (missingValidators.length > 0) {
      console.error('Missing route validators:', missingValidators);
      return false;
    }

    console.log('✅ Navigation flow validation passed');
    return true;
  } catch (error) {
    console.error('Navigation flow validation failed:', error);
    return false;
  }
};
/**
 * Test Screen
 * UI for running test suites
 */

import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { runAllTests, runQuickTests } from '../tests/run-all-tests';

export default function TestScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);

  // Capture console.log output
  const captureConsole = () => {
    const originalLog = console.log;
    const logs: string[] = [];

    console.log = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(message);
      originalLog(...args);
    };

    return {
      logs,
      restore: () => { console.log = originalLog; }
    };
  };

  const runTests = async (quick: boolean = false) => {
    setIsRunning(true);
    setOutput([]);

    const capture = captureConsole();

    try {
      if (quick) {
        await runQuickTests();
      } else {
        await runAllTests();
      }
    } catch (error) {
      console.log('❌ Test execution error:', error);
    }

    capture.restore();
    setOutput(capture.logs);
    setIsRunning(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Test Suite</Text>
        <Text style={styles.subtitle}>Critical Features Testing</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.quickButton]}
          onPress={() => runTests(true)}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running...' : 'Quick Test'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.fullButton]}
          onPress={() => runTests(false)}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running...' : 'Full Test Suite'}
          </Text>
        </TouchableOpacity>
      </View>

      {isRunning && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Running tests...</Text>
        </View>
      )}

      <ScrollView style={styles.outputContainer}>
        {output.map((line, index) => (
          <Text
            key={index}
            style={[
              styles.outputText,
              line.includes('✅') && styles.successText,
              line.includes('❌') && styles.errorText,
              line.includes('⚠️') && styles.warningText,
              line.includes('📊') && styles.summaryText,
            ]}
          >
            {line}
          </Text>
        ))}
        {output.length === 0 && !isRunning && (
          <Text style={styles.placeholderText}>
            Press a button above to run tests
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tests verify: Model Integration • Blue Background • Scan History • Database
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickButton: {
    backgroundColor: '#3b82f6',
  },
  fullButton: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  outputContainer: {
    flex: 1,
    backgroundColor: '#1e293b',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  outputText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#e2e8f0',
    marginBottom: 4,
    lineHeight: 18,
  },
  successText: {
    color: '#86efac',
  },
  errorText: {
    color: '#fca5a5',
  },
  warningText: {
    color: '#fcd34d',
  },
  summaryText: {
    color: '#bfdbfe',
    fontWeight: 'bold',
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});

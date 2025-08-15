import { calculateRiskScore, calculateCVSSRisk } from '../utils/risk-calculator';
import { Finding, Severity } from '@prisma/client';

// Mock findings for testing
const createMockFinding = (
  type: any,
  severity: Severity,
  cvssScore?: number
): Finding => ({
  id: 'test-finding',
  scanId: 'test-scan',
  type,
  severity,
  title: 'Test Finding',
  description: 'Test description',
  filePath: null,
  lineNumber: null,
  columnNumber: null,
  metadata: null,
  cveId: null,
  cvssScore,
  status: 'OPEN',
  resolvedAt: null,
  resolvedBy: null,
});

describe('Risk Calculator', () => {
  describe('calculateRiskScore', () => {
    it('should return zero scores for no findings', () => {
      const result = calculateRiskScore([]);
      
      expect(result.overall).toBe(0);
      expect(result.license).toBe(0);
      expect(result.security).toBe(0);
      expect(result.configuration).toBe(0);
      expect(result.trend).toBe('stable');
    });

    it('should calculate correct scores for license violations', () => {
      const findings = [
        createMockFinding('LICENSE_VIOLATION', 'HIGH'),
        createMockFinding('LICENSE_VIOLATION', 'MEDIUM'),
      ];

      const result = calculateRiskScore(findings);
      
      expect(result.license).toBeGreaterThan(0);
      expect(result.security).toBe(0);
      expect(result.configuration).toBe(0);
    });

    it('should calculate correct scores for security findings', () => {
      const findings = [
        createMockFinding('VULNERABILITY', 'CRITICAL', 9.5),
        createMockFinding('SECURITY_MISCONFIGURATION', 'HIGH'),
      ];

      const result = calculateRiskScore(findings);
      
      expect(result.security).toBeGreaterThan(0);
      expect(result.license).toBe(0);
      expect(result.configuration).toBe(0);
    });

    it('should calculate correct scores for dependency issues', () => {
      const findings = [
        createMockFinding('DEPENDENCY_ISSUE', 'HIGH', 7.8),
        createMockFinding('DEPENDENCY_ISSUE', 'MEDIUM'),
      ];

      const result = calculateRiskScore(findings);
      
      expect(result.configuration).toBeGreaterThan(0);
      expect(result.license).toBe(0);
      expect(result.security).toBe(0);
    });

    it('should handle mixed finding types correctly', () => {
      const findings = [
        createMockFinding('LICENSE_VIOLATION', 'HIGH'),
        createMockFinding('VULNERABILITY', 'CRITICAL', 9.2),
        createMockFinding('DEPENDENCY_ISSUE', 'MEDIUM'),
      ];

      const result = calculateRiskScore(findings);
      
      expect(result.overall).toBeGreaterThan(0);
      expect(result.license).toBeGreaterThan(0);
      expect(result.security).toBeGreaterThan(0);
      expect(result.configuration).toBeGreaterThan(0);
    });

    it('should cap scores at 100', () => {
      // Create many critical findings to test capping
      const findings = Array(50).fill(null).map(() => 
        createMockFinding('VULNERABILITY', 'CRITICAL', 10.0)
      );

      const result = calculateRiskScore(findings);
      
      expect(result.overall).toBeLessThanOrEqual(100);
      expect(result.security).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateCVSSRisk', () => {
    it('should classify CVSS scores correctly', () => {
      expect(calculateCVSSRisk(10.0)).toBe('CRITICAL');
      expect(calculateCVSSRisk(9.0)).toBe('CRITICAL');
      expect(calculateCVSSRisk(8.5)).toBe('HIGH');
      expect(calculateCVSSRisk(7.0)).toBe('HIGH');
      expect(calculateCVSSRisk(6.5)).toBe('MEDIUM');
      expect(calculateCVSSRisk(4.0)).toBe('MEDIUM');
      expect(calculateCVSSRisk(3.5)).toBe('LOW');
      expect(calculateCVSSRisk(0.1)).toBe('LOW');
      expect(calculateCVSSRisk(0.0)).toBe('INFO');
    });
  });
});
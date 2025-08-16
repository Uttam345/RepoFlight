import { 
  mapToOWASPTop10, 
  mapToCISBenchmarks, 
  mapToSOC2 
} from '../utils/compliance-mapper';
import { Finding, Severity } from '@prisma/client';

// Mock finding factory
const createMockFinding = (
  type: any,
  severity: Severity,
  title: string,
  cveId?: string
): Finding => ({
  id: `finding-${Math.random()}`,
  scanId: 'test-scan',
  type,
  severity,
  title,
  description: `Description for ${title}`,
  filePath: 'test/file.js',
  lineNumber: 10,
  columnNumber: 5,
  metadata: null,
  cveId: cveId || null,
  cvssScore: severity === 'CRITICAL' ? 9.5 : severity === 'HIGH' ? 7.5 : 5.0,
  status: 'OPEN',
  resolvedAt: null,
  resolvedBy: null,
});

describe('Compliance Mapper', () => {
  describe('OWASP Top 10 Mapping', () => {
    it('should map injection vulnerabilities to A03:2021', () => {
      const findings = [
        createMockFinding('VULNERABILITY', 'HIGH', 'SQL Injection vulnerability detected'),
        createMockFinding('VULNERABILITY', 'MEDIUM', 'XSS vulnerability in user input'),
      ];

      const result = mapToOWASPTop10(findings);

      expect(result.framework).toBe('OWASP_TOP_10');
      
      const injectionControl = result.controls.find(c => c.controlId === 'A03:2021');
      expect(injectionControl).toBeDefined();
      expect(injectionControl!.findings).toHaveLength(2);
      expect(injectionControl!.status).toBe('non_compliant');
      expect(injectionControl!.riskLevel).toBe('high');
    });

    it('should map security misconfigurations to A05:2021', () => {
      const findings = [
        createMockFinding('SECURITY_MISCONFIGURATION', 'MEDIUM', 'Missing security headers'),
        createMockFinding('SECURITY_MISCONFIGURATION', 'LOW', 'Insecure cookie settings'),
      ];

      const result = mapToOWASPTop10(findings);

      const misconfigControl = result.controls.find(c => c.controlId === 'A05:2021');
      expect(misconfigControl).toBeDefined();
      expect(misconfigControl!.findings).toHaveLength(2);
      expect(misconfigControl!.status).toBe('partial');
      expect(misconfigControl!.riskLevel).toBe('medium');
    });

    it('should map dependency issues to A06:2021', () => {
      const findings = [
        createMockFinding('DEPENDENCY_ISSUE', 'CRITICAL', 'Vulnerable dependency detected', 'CVE-2023-1234'),
        createMockFinding('DEPENDENCY_ISSUE', 'HIGH', 'Outdated package with known vulnerabilities'),
      ];

      const result = mapToOWASPTop10(findings);

      const componentControl = result.controls.find(c => c.controlId === 'A06:2021');
      expect(componentControl).toBeDefined();
      expect(componentControl!.findings).toHaveLength(2);
      expect(componentControl!.status).toBe('non_compliant');
      expect(componentControl!.riskLevel).toBe('critical');
    });

    it('should map authentication vulnerabilities to A07:2021', () => {
      const findings = [
        createMockFinding('VULNERABILITY', 'HIGH', 'Authentication bypass vulnerability'),
        createMockFinding('VULNERABILITY', 'MEDIUM', 'Weak session management'),
      ];

      const result = mapToOWASPTop10(findings);

      const authControl = result.controls.find(c => c.controlId === 'A07:2021');
      expect(authControl).toBeDefined();
      expect(authControl!.findings).toHaveLength(2);
      expect(authControl!.status).toBe('non_compliant');
    });

    it('should calculate overall compliance correctly', () => {
      const findings = [
        createMockFinding('VULNERABILITY', 'HIGH', 'SQL Injection vulnerability'),
        createMockFinding('SECURITY_MISCONFIGURATION', 'MEDIUM', 'Missing CSP header'),
      ];

      const result = mapToOWASPTop10(findings);

      // 8 out of 10 controls should be compliant (no findings)
      expect(result.overallCompliance).toBe(80);
    });

    it('should handle empty findings array', () => {
      const result = mapToOWASPTop10([]);

      expect(result.framework).toBe('OWASP_TOP_10');
      expect(result.controls).toHaveLength(10);
      expect(result.overallCompliance).toBe(100);
      
      result.controls.forEach(control => {
        expect(control.status).toBe('compliant');
        expect(control.findings).toHaveLength(0);
        expect(control.riskLevel).toBe('low');
      });
    });
  });

  describe('CIS Benchmarks Mapping', () => {
    it('should map vulnerability findings to CIS-3', () => {
      const findings = [
        createMockFinding('VULNERABILITY', 'CRITICAL', 'Buffer overflow vulnerability'),
        createMockFinding('DEPENDENCY_ISSUE', 'HIGH', 'Vulnerable package detected'),
      ];

      const result = mapToCISBenchmarks(findings);

      expect(result.framework).toBe('CIS_BENCHMARKS');
      
      const vulnControl = result.controls.find(c => c.controlId === 'CIS-3');
      expect(vulnControl).toBeDefined();
      expect(vulnControl!.findings).toHaveLength(2);
      expect(vulnControl!.status).toBe('non_compliant');
      expect(vulnControl!.riskLevel).toBe('critical');
    });

    it('should calculate compliance percentage correctly', () => {
      const findings = [
        createMockFinding('VULNERABILITY', 'MEDIUM', 'Minor vulnerability'),
      ];

      const result = mapToCISBenchmarks(findings);

      // 2 out of 3 controls should be compliant
      expect(result.overallCompliance).toBeCloseTo(66.67, 1);
    });

    it('should handle no vulnerability findings', () => {
      const findings = [
        createMockFinding('LICENSE_VIOLATION', 'HIGH', 'GPL license detected'),
      ];

      const result = mapToCISBenchmarks(findings);

      expect(result.overallCompliance).toBe(100);
      
      const vulnControl = result.controls.find(c => c.controlId === 'CIS-3');
      expect(vulnControl!.status).toBe('compliant');
    });
  });

  describe('SOC 2 Mapping', () => {
    it('should map security misconfigurations to CC6.1', () => {
      const findings = [
        createMockFinding('SECURITY_MISCONFIGURATION', 'HIGH', 'Weak access controls'),
        createMockFinding('SECURITY_MISCONFIGURATION', 'MEDIUM', 'Missing authentication'),
      ];

      const result = mapToSOC2(findings);

      expect(result.framework).toBe('SOC_2');
      
      const accessControl = result.controls.find(c => c.controlId === 'CC6.1');
      expect(accessControl).toBeDefined();
      expect(accessControl!.findings).toHaveLength(2);
      expect(accessControl!.status).toBe('non_compliant');
      expect(accessControl!.riskLevel).toBe('high');
    });

    it('should handle mixed finding types correctly', () => {
      const findings = [
        createMockFinding('SECURITY_MISCONFIGURATION', 'LOW', 'Minor config issue'),
        createMockFinding('VULNERABILITY', 'HIGH', 'Code vulnerability'),
        createMockFinding('LICENSE_VIOLATION', 'MEDIUM', 'License issue'),
      ];

      const result = mapToSOC2(findings);

      // Only security misconfigurations should be mapped
      const accessControl = result.controls.find(c => c.controlId === 'CC6.1');
      expect(accessControl!.findings).toHaveLength(1);
      expect(accessControl!.status).toBe('compliant'); // LOW severity = compliant
    });

    it('should calculate overall compliance', () => {
      const findings = [
        createMockFinding('SECURITY_MISCONFIGURATION', 'CRITICAL', 'Critical access control issue'),
      ];

      const result = mapToSOC2(findings);

      // 1 out of 2 controls should be compliant
      expect(result.overallCompliance).toBe(50);
    });
  });

  describe('Control Status Determination', () => {
    it('should mark control as non_compliant for critical/high findings', () => {
      const findings = [
        createMockFinding('VULNERABILITY', 'CRITICAL', 'Critical vulnerability'),
      ];

      const result = mapToOWASPTop10(findings);
      const injectionControl = result.controls.find(c => c.controlId === 'A03:2021');
      
      expect(injectionControl!.status).toBe('non_compliant');
      expect(injectionControl!.riskLevel).toBe('critical');
    });

    it('should mark control as partial for medium findings', () => {
      const findings = [
        createMockFinding('SECURITY_MISCONFIGURATION', 'MEDIUM', 'Medium severity issue'),
      ];

      const result = mapToOWASPTop10(findings);
      const misconfigControl = result.controls.find(c => c.controlId === 'A05:2021');
      
      expect(misconfigControl!.status).toBe('partial');
      expect(misconfigControl!.riskLevel).toBe('medium');
    });

    it('should mark control as compliant for low/info findings', () => {
      const findings = [
        createMockFinding('VULNERABILITY', 'LOW', 'Low severity issue'),
      ];

      const result = mapToOWASPTop10(findings);
      const injectionControl = result.controls.find(c => c.controlId === 'A03:2021');
      
      expect(injectionControl!.status).toBe('compliant');
      expect(injectionControl!.riskLevel).toBe('low');
    });
  });

  describe('Risk Level Determination', () => {
    it('should determine critical risk for critical findings', () => {
      const findings = [
        createMockFinding('VULNERABILITY', 'CRITICAL', 'Critical issue'),
      ];

      const result = mapToOWASPTop10(findings);
      const control = result.controls.find(c => c.findings.length > 0);
      
      expect(control!.riskLevel).toBe('critical');
    });

    it('should determine high risk for high findings', () => {
      const findings = [
        createMockFinding('VULNERABILITY', 'HIGH', 'High severity issue'),
      ];

      const result = mapToOWASPTop10(findings);
      const control = result.controls.find(c => c.findings.length > 0);
      
      expect(control!.riskLevel).toBe('high');
    });

    it('should determine medium risk for medium findings', () => {
      const findings = [
        createMockFinding('VULNERABILITY', 'MEDIUM', 'Medium severity issue'),
      ];

      const result = mapToOWASPTop10(findings);
      const control = result.controls.find(c => c.findings.length > 0);
      
      expect(control!.riskLevel).toBe('medium');
    });

    it('should determine low risk for low/info findings', () => {
      const findings = [
        createMockFinding('VULNERABILITY', 'LOW', 'Low severity issue'),
      ];

      const result = mapToOWASPTop10(findings);
      const control = result.controls.find(c => c.findings.length > 0);
      
      expect(control!.riskLevel).toBe('low');
    });
  });
});
import type { Finding, FindingType } from '@prisma/client';

export interface ComplianceMapping {
    framework: ComplianceFramework;
    controls: ControlMapping[];
    overallCompliance: number;
}

export interface ControlMapping {
    controlId: string;
    title: string;
    description: string;
    status: 'compliant' | 'non_compliant' | 'partial';
    findings: Finding[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export type ComplianceFramework = 'OWASP_TOP_10' | 'CIS_BENCHMARKS' | 'SOC_2';

/**
 * Map findings to OWASP Top 10 controls
 */
export function mapToOWASPTop10(findings: Finding[]): ComplianceMapping {
    const controls: ControlMapping[] = [
        {
            controlId: 'A01:2021',
            title: 'Broken Access Control',
            description: 'Access control enforces policy such that users cannot act outside of their intended permissions',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        },
        {
            controlId: 'A02:2021',
            title: 'Cryptographic Failures',
            description: 'Protect data in transit and at rest with strong cryptography',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        },
        {
            controlId: 'A03:2021',
            title: 'Injection',
            description: 'Application is vulnerable to injection attacks',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        },
        {
            controlId: 'A04:2021',
            title: 'Insecure Design',
            description: 'Risks related to design and architectural flaws',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        },
        {
            controlId: 'A05:2021',
            title: 'Security Misconfiguration',
            description: 'Security misconfiguration is commonly a result of insecure default configurations',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        },
        {
            controlId: 'A06:2021',
            title: 'Vulnerable and Outdated Components',
            description: 'Components with known vulnerabilities',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        },
        {
            controlId: 'A07:2021',
            title: 'Identification and Authentication Failures',
            description: 'Confirmation of the user\'s identity, authentication, and session management',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        },
        {
            controlId: 'A08:2021',
            title: 'Software and Data Integrity Failures',
            description: 'Software and data integrity failures relate to code and infrastructure',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        },
        {
            controlId: 'A09:2021',
            title: 'Security Logging and Monitoring Failures',
            description: 'Insufficient logging and monitoring',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        },
        {
            controlId: 'A10:2021',
            title: 'Server-Side Request Forgery',
            description: 'SSRF flaws occur whenever a web application is fetching a remote resource',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        }
    ];

    // Map findings to appropriate controls
    findings.forEach(finding => {
        const mappedControls = mapFindingToOWASPControls(finding);
        mappedControls.forEach(controlId => {
            const control = controls.find(c => c.controlId === controlId);
            if (control) {
                control.findings.push(finding);
                control.status = determineControlStatus(control.findings);
                control.riskLevel = determineRiskLevel(control.findings);
            }
        });
    });

    const compliantControls = controls.filter(c => c.status === 'compliant').length;
    const overallCompliance = (compliantControls / controls.length) * 100;

    return {
        framework: 'OWASP_TOP_10',
        controls,
        overallCompliance: Math.round(overallCompliance * 100) / 100
    };
}

/**
 * Map findings to CIS Benchmarks
 */
export function mapToCISBenchmarks(findings: Finding[]): ComplianceMapping {
    const controls: ControlMapping[] = [
        {
            controlId: 'CIS-1',
            title: 'Inventory and Control of Hardware Assets',
            description: 'Actively manage all hardware devices',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        },
        {
            controlId: 'CIS-2',
            title: 'Inventory and Control of Software Assets',
            description: 'Actively manage all software on the network',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        },
        {
            controlId: 'CIS-3',
            title: 'Continuous Vulnerability Management',
            description: 'Continuously acquire, assess, and take action on new information',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        }
        // Add more CIS controls as needed
    ];

    // Map findings to CIS controls
    findings.forEach(finding => {
        if (finding.type === 'VULNERABILITY' || finding.type === 'DEPENDENCY_ISSUE') {
            const control = controls.find(c => c.controlId === 'CIS-3');
            if (control) {
                control.findings.push(finding);
                control.status = determineControlStatus(control.findings);
                control.riskLevel = determineRiskLevel(control.findings);
            }
        }
    });

    const compliantControls = controls.filter(c => c.status === 'compliant').length;
    const overallCompliance = (compliantControls / controls.length) * 100;

    return {
        framework: 'CIS_BENCHMARKS',
        controls,
        overallCompliance: Math.round(overallCompliance * 100) / 100
    };
}

/**
 * Map findings to SOC 2 controls
 */
export function mapToSOC2(findings: Finding[]): ComplianceMapping {
    const controls: ControlMapping[] = [
        {
            controlId: 'CC6.1',
            title: 'Logical and Physical Access Controls',
            description: 'The entity implements logical and physical access controls',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        },
        {
            controlId: 'CC6.7',
            title: 'Data Transmission and Disposal',
            description: 'The entity restricts the transmission, movement, and removal of information',
            status: 'compliant',
            findings: [],
            riskLevel: 'low'
        }
        // Add more SOC 2 controls as needed
    ];

    // Map findings to SOC 2 controls
    findings.forEach(finding => {
        if (finding.type === 'SECURITY_MISCONFIGURATION') {
            const control = controls.find(c => c.controlId === 'CC6.1');
            if (control) {
                control.findings.push(finding);
                control.status = determineControlStatus(control.findings);
                control.riskLevel = determineRiskLevel(control.findings);
            }
        }
    });

    const compliantControls = controls.filter(c => c.status === 'compliant').length;
    const overallCompliance = (compliantControls / controls.length) * 100;

    return {
        framework: 'SOC_2',
        controls,
        overallCompliance: Math.round(overallCompliance * 100) / 100
    };
}

/**
 * Map a finding to OWASP Top 10 controls
 */
function mapFindingToOWASPControls(finding: Finding): string[] {
    const controls: string[] = [];
    const title = finding.title.toLowerCase();

    switch (finding.type) {
        case 'VULNERABILITY':
            if (title.includes('injection') || title.includes('sql') || title.includes('xss')) {
                controls.push('A03:2021');
            }
            if (title.includes('auth') || title.includes('session') || title.includes('bypass')) {
                controls.push('A07:2021');
            }
            // If no specific mapping, default to injection for vulnerabilities
            if (controls.length === 0) {
                controls.push('A03:2021');
            }
            break;
        case 'SECURITY_MISCONFIGURATION':
            controls.push('A05:2021');
            break;
        case 'DEPENDENCY_ISSUE':
            controls.push('A06:2021');
            break;
    }

    return controls;
}

/**
 * Determine control status based on findings
 */
function determineControlStatus(findings: Finding[]): 'compliant' | 'non_compliant' | 'partial' {
    if (findings.length === 0) return 'compliant';

    const criticalFindings = findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH');
    if (criticalFindings.length > 0) return 'non_compliant';

    const mediumFindings = findings.filter(f => f.severity === 'MEDIUM');
    if (mediumFindings.length > 0) return 'partial';

    return 'compliant';
}

/**
 * Determine risk level based on findings
 */
function determineRiskLevel(findings: Finding[]): 'low' | 'medium' | 'high' | 'critical' {
    if (findings.length === 0) return 'low';

    const hasCritical = findings.some(f => f.severity === 'CRITICAL');
    if (hasCritical) return 'critical';

    const hasHigh = findings.some(f => f.severity === 'HIGH');
    if (hasHigh) return 'high';

    const hasMedium = findings.some(f => f.severity === 'MEDIUM');
    if (hasMedium) return 'medium';

    return 'low';
}
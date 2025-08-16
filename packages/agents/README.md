# RepoFlight Agents

This package contains the scanning agents for RepoFlight, including license compliance, security vulnerability detection, and configuration auditing.

## License Agent

The License Agent provides comprehensive license compliance scanning for multiple programming language ecosystems.

### Features

- **Multi-ecosystem Support**: Scans Node.js (npm), Python (pip), and Go (modules) dependencies
- **License Policy Engine**: Configurable forbidden and approved license lists
- **SPDX Report Generation**: Creates standard SPDX inventory reports
- **Repository License Detection**: Analyzes LICENSE files using pattern matching
- **Risk Scoring**: Calculates compliance risk based on violation severity
- **Comprehensive Testing**: 100% test coverage with unit and integration tests

### Supported Ecosystems

#### Node.js / npm
- Uses `license-checker` for accurate dependency license detection
- Scans `package.json` and `package-lock.json` files
- Detects both direct and transitive dependencies

#### Python / pip
- Attempts to use `pip-licenses` for detailed license information
- Falls back to `requirements.txt` parsing when pip-licenses unavailable
- Supports `Pipfile` detection

#### Go Modules
- Parses `go.mod` files for dependency information
- Handles both `require` blocks and single-line requirements
- Notes: Go modules don't include license info, so manual verification may be needed

### Usage

```typescript
import { LicenseAgent, LicensePolicy } from '@repoflight/agents'

// Initialize the agent
const licenseAgent = new LicenseAgent()

// Basic scan with default policy
const result = await licenseAgent.scan('/path/to/repository')

// Scan with custom policy
const customPolicy: Partial<LicensePolicy> = {
  forbiddenLicenses: ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0'],
  allowUnknownLicenses: false,
  requireLicenseFile: true,
}

const customResult = await licenseAgent.scan('/path/to/repository', { 
  policy: customPolicy 
})

// Export SPDX report
if (result.metadata?.spdxReport) {
  await licenseAgent.exportSPDXReport(
    result.metadata.spdxReport, 
    '/path/to/spdx-report.json'
  )
}
```

### License Policy Configuration

```typescript
interface LicensePolicy {
  forbiddenLicenses: string[]     // Licenses that trigger violations
  approvedLicenses: string[]      // Known safe licenses
  requireLicenseFile: boolean     // Require LICENSE file in repository
  allowUnknownLicenses: boolean   // Allow dependencies with unknown licenses
}
```

### Default Forbidden Licenses

The agent comes with a comprehensive list of forbidden licenses:
- GPL family: GPL-1.0, GPL-2.0, GPL-3.0 (and + variants)
- AGPL family: AGPL-1.0, AGPL-3.0
- Server Side Public License: SSPL-1.0
- Open Software License: OSL-1.0, OSL-2.0, OSL-3.0

### SPDX Report Format

The agent generates SPDX 2.3 compliant reports including:
- Document metadata and namespace
- Package inventory with license information
- Creation timestamp and tool information
- Downloadable locations and version info

### Risk Scoring

Risk scores are calculated based on:
- **Critical violations** (10 points): Repository uses forbidden license
- **High violations** (7 points): Dependencies with forbidden licenses
- **Medium violations** (4 points): Unknown licenses when not allowed
- **Low violations** (2 points): Missing license files, parsing errors

### Testing

Run the comprehensive test suite:

```bash
npm test
```

The test suite includes:
- Unit tests for all scanning methods
- Mock implementations for external tools
- Error handling and edge case coverage
- Policy evaluation and risk scoring tests
- SPDX report generation validation

### Example Usage

See `src/examples/license-scan-example.ts` for a complete working example that demonstrates:
- Setting up test repositories
- Running scans with different policies
- Generating and exporting SPDX reports
- Interpreting scan results

Run the example:

```bash
npx ts-node src/examples/license-scan-example.ts
```

### Requirements

#### Required Dependencies
- `license-checker`: For Node.js dependency license detection
- `spdx-license-list`: For license validation and normalization

#### Optional External Tools
- `pip-licenses`: For detailed Python package license information
- Python environment with pip for Python dependency scanning

### Integration with RepoFlight

The License Agent integrates with the broader RepoFlight system through:
- Standardized `BaseAgent` interface
- Consistent finding and result formats
- Risk scoring compatible with dashboard visualization
- SPDX reports for compliance documentation

### Error Handling

The agent provides robust error handling:
- Graceful degradation when external tools unavailable
- Detailed error reporting for debugging
- Continuation of scanning when individual files fail
- Comprehensive logging for audit trails

### Performance Considerations

- Parallel scanning of different ecosystems
- Efficient file parsing with minimal memory usage
- Caching of license detection patterns
- Configurable timeouts for external tool execution

## Security Agent

*Coming soon - SAST, DAST, and container vulnerability scanning*

## Configuration Agent

*Coming soon - Infrastructure and configuration security scanning*
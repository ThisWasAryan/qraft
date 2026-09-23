import type { QRConfig, QRReliabilityReport, QRReliabilityCheck } from '../types';
import { checkContrast, checkEyeContrast } from './contrast';
import { checkQuietZone } from './quietZone';
import { checkErrorCorrection } from './errorCorrection';
import { checkLogoSize } from './logo';
import { checkModuleShape, checkCornerShape, checkOutputSize, checkGradientContrast } from './moduleStyle';
import { checkDensity } from './density';

export function analyzeReliability(config: QRConfig): QRReliabilityReport {
  const checks: QRReliabilityCheck[] = [
    checkContrast(config.style.dotOptions, config.style.backgroundOptions),
    checkEyeContrast(config.style.cornerSquareOptions, config.style.cornerDotOptions, config.style.backgroundOptions),
    checkQuietZone(config.style.margin, config.style.frame),
    checkErrorCorrection(config.errorCorrection, config.style.logo),
    checkLogoSize(config.style.logo, config.errorCorrection),
    checkModuleShape(config.style.dotOptions, config.errorCorrection, config.style.width),
    checkCornerShape(config.style.cornerSquareOptions),
    checkOutputSize(config.style.width),
    checkGradientContrast(config.style),
    checkDensity(config),
  ];

  const warningCount = checks.filter(c => c.severity === 'warning').length;
  
  let overallScore = determineOverall(checks);
  
  // Compound risk: 3+ warnings = danger
  if (warningCount >= 3 && overallScore !== 'danger') {
    overallScore = 'danger';
    
    // Add a compound risk info check
    checks.push({
      id: 'compound-risk',
      factor: 'Compound Risk',
      label: 'Multiple Warnings',
      passed: false,
      severity: 'danger',
      detail: 'Accumulation of multiple warnings drastically reduces reliability.',
      recommendation: 'Resolve at least some warnings.'
    });
  }
  
  return {
    overallScore,
    checks: checks.filter(c => c.severity !== 'good' || c.id === 'contrast' || c.id === 'error-correction') // keep some good ones for info
  };
}

function determineOverall(checks: QRReliabilityCheck[]): 'good' | 'warning' | 'danger' {
  if (checks.some(c => c.severity === 'danger')) return 'danger';
  if (checks.some(c => c.severity === 'warning')) return 'warning';
  return 'good';
}

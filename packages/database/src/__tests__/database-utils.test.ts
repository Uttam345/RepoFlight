/**
 * Basic tests for database utilities and connection management
 * These tests focus on the core functionality without complex mocking
 */

describe('Database Package', () => {
  describe('Module Exports', () => {
    it('should export all required modules', () => {
      // Test that all main exports are available
      const dbModule = require('../index');
      
      expect(dbModule).toHaveProperty('prisma');
      expect(dbModule).toHaveProperty('edgePrisma');
      expect(dbModule).toHaveProperty('calculateRiskScore');
      expect(dbModule).toHaveProperty('mapToOWASPTop10');
      expect(dbModule).toHaveProperty('RepositoryQueries');
      expect(dbModule).toHaveProperty('DatabaseConnection');
    });
  });

  describe('Risk Calculator Utilities', () => {
    it('should export risk calculation functions', () => {
      const { calculateRiskScore, calculateCVSSRisk } = require('../utils/risk-calculator');
      
      expect(typeof calculateRiskScore).toBe('function');
      expect(typeof calculateCVSSRisk).toBe('function');
    });
  });

  describe('Compliance Mapper Utilities', () => {
    it('should export compliance mapping functions', () => {
      const { 
        mapToOWASPTop10, 
        mapToCISBenchmarks, 
        mapToSOC2 
      } = require('../utils/compliance-mapper');
      
      expect(typeof mapToOWASPTop10).toBe('function');
      expect(typeof mapToCISBenchmarks).toBe('function');
      expect(typeof mapToSOC2).toBe('function');
    });
  });

  describe('Query Helper Classes', () => {
    it('should export query helper classes', () => {
      const { 
        RepositoryQueries, 
        ScanQueries, 
        FindingQueries, 
        AnalyticsQueries 
      } = require('../utils/query-helpers');
      
      expect(RepositoryQueries).toBeDefined();
      expect(ScanQueries).toBeDefined();
      expect(FindingQueries).toBeDefined();
      expect(AnalyticsQueries).toBeDefined();
    });
  });

  describe('Connection Utilities', () => {
    it('should export connection management classes', () => {
      const { 
        DatabaseConnection, 
        withDatabase 
      } = require('../utils/connection');
      
      expect(DatabaseConnection).toBeDefined();
      expect(typeof withDatabase).toBe('function');
    });

    it('should create DatabaseConnection instance', () => {
      const { DatabaseConnection } = require('../utils/connection');
      
      const instance = DatabaseConnection.getInstance();
      expect(instance).toBeDefined();
      expect(typeof instance.getMetrics).toBe('function');
      expect(typeof instance.isHealthy).toBe('function');
    });
  });

  describe('Prisma Schema Validation', () => {
    it('should have Prisma client available', () => {
      // Test that Prisma client is available
      const { PrismaClient } = require('@prisma/client');
      
      expect(PrismaClient).toBeDefined();
      expect(typeof PrismaClient).toBe('function');
    });
  });

  describe('Environment Configuration', () => {
    it('should handle missing environment variables gracefully', () => {
      const originalUrl = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;
      
      // Should not throw when DATABASE_URL is missing
      expect(() => {
        require('../utils/connection');
      }).not.toThrow();
      
      // Restore original URL
      if (originalUrl) {
        process.env.DATABASE_URL = originalUrl;
      }
    });
  });
});
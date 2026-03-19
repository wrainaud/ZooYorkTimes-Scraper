const express = require('express');

// Mock the db module to avoid MongoDB dependency issues
jest.mock('../models', () => ({
  Articles: {
    find: jest.fn()
  }
}));

const articlesController = require('./articlesController');
const db = require('../models');

describe('articlesController.generateReport', () => {
  let app;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up express app for testing
    app = express();
    app.use(express.json());
    app.get('/api/saved/report', articlesController.generateReport);

    // Set up mock request and response
    mockReq = { query: {} };
    mockRes = {
      json: jest.fn(),
      send: jest.fn(),
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('CSV format (default)', () => {
    test('should generate an empty CSV report when no articles exist', async () => {
      const mockSort = jest.fn().mockReturnValue({
        then: jest.fn((callback) => {
          callback([]);
          return { catch: jest.fn() };
        })
      });
      db.Articles.find.mockReturnValue({ sort: mockSort });

      await articlesController.generateReport(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="saved-articles-report.csv"');
      expect(mockRes.send).toHaveBeenCalledWith('Title,URL,Date\n');
    });

    test('should generate a CSV report with saved articles', async () => {
      const mockArticles = [
        { title: 'Test Article 1', url: 'https://example.com/article1', date: new Date('2024-01-16') },
        { title: 'Test Article 2', url: 'https://example.com/article2', date: new Date('2024-01-15') }
      ];
      const mockSort = jest.fn().mockReturnValue({
        then: jest.fn((callback) => {
          callback(mockArticles);
          return { catch: jest.fn() };
        })
      });
      db.Articles.find.mockReturnValue({ sort: mockSort });

      await articlesController.generateReport(mockReq, mockRes);

      const csvOutput = mockRes.send.mock.calls[0][0];
      expect(csvOutput).toContain('Title,URL,Date');
      expect(csvOutput).toContain('Test Article 1');
      expect(csvOutput).toContain('Test Article 2');
      expect(csvOutput).toContain('https://example.com/article1');
      expect(csvOutput).toContain('https://example.com/article2');
    });

    test('should properly escape CSV fields with special characters', async () => {
      const mockArticles = [
        { title: 'Article with, comma', url: 'https://example.com/article', date: new Date('2024-01-15') },
        { title: 'Article with "quotes"', url: 'https://example.com/article2', date: new Date('2024-01-14') }
      ];
      const mockSort = jest.fn().mockReturnValue({
        then: jest.fn((callback) => {
          callback(mockArticles);
          return { catch: jest.fn() };
        })
      });
      db.Articles.find.mockReturnValue({ sort: mockSort });

      await articlesController.generateReport(mockReq, mockRes);

      const csvOutput = mockRes.send.mock.calls[0][0];
      // Title with comma should be wrapped in quotes
      expect(csvOutput).toContain('"Article with, comma"');
      // Title with quotes should be wrapped and quotes escaped
      expect(csvOutput).toContain('"Article with ""quotes"""');
    });

    test('should handle articles without date in CSV', async () => {
      const mockArticles = [
        { title: 'Article without date', url: 'https://example.com/nodate', date: null }
      ];
      const mockSort = jest.fn().mockReturnValue({
        then: jest.fn((callback) => {
          callback(mockArticles);
          return { catch: jest.fn() };
        })
      });
      db.Articles.find.mockReturnValue({ sort: mockSort });

      await articlesController.generateReport(mockReq, mockRes);

      const csvOutput = mockRes.send.mock.calls[0][0];
      expect(csvOutput).toContain('Article without date,https://example.com/nodate,');
    });
  });

  describe('JSON format', () => {
    test('should generate a JSON report when format=json is specified', async () => {
      mockReq.query.format = 'json';
      const mockArticles = [
        { title: 'Test Article', url: 'https://example.com/article', date: new Date('2024-01-15T00:00:00.000Z') }
      ];
      const mockSort = jest.fn().mockReturnValue({
        then: jest.fn((callback) => {
          callback(mockArticles);
          return { catch: jest.fn() };
        })
      });
      db.Articles.find.mockReturnValue({ sort: mockSort });

      await articlesController.generateReport(mockReq, mockRes);

      const jsonOutput = mockRes.json.mock.calls[0][0];
      expect(jsonOutput).toHaveProperty('generatedAt');
      expect(jsonOutput).toHaveProperty('totalArticles', 1);
      expect(jsonOutput).toHaveProperty('articles');
      expect(jsonOutput.articles).toHaveLength(1);
      expect(jsonOutput.articles[0]).toHaveProperty('title', 'Test Article');
      expect(jsonOutput.articles[0]).toHaveProperty('url', 'https://example.com/article');
    });

    test('should handle articles without date in JSON', async () => {
      mockReq.query.format = 'json';
      const mockArticles = [
        { title: 'Article without date', url: 'https://example.com/nodate', date: null }
      ];
      const mockSort = jest.fn().mockReturnValue({
        then: jest.fn((callback) => {
          callback(mockArticles);
          return { catch: jest.fn() };
        })
      });
      db.Articles.find.mockReturnValue({ sort: mockSort });

      await articlesController.generateReport(mockReq, mockRes);

      const jsonOutput = mockRes.json.mock.calls[0][0];
      expect(jsonOutput.articles[0].date).toBeNull();
    });

    test('should include totalArticles count in JSON report', async () => {
      mockReq.query.format = 'json';
      const mockArticles = [
        { title: 'Article 1', url: 'https://example.com/1', date: new Date('2024-01-15') },
        { title: 'Article 2', url: 'https://example.com/2', date: new Date('2024-01-14') },
        { title: 'Article 3', url: 'https://example.com/3', date: new Date('2024-01-13') }
      ];
      const mockSort = jest.fn().mockReturnValue({
        then: jest.fn((callback) => {
          callback(mockArticles);
          return { catch: jest.fn() };
        })
      });
      db.Articles.find.mockReturnValue({ sort: mockSort });

      await articlesController.generateReport(mockReq, mockRes);

      const jsonOutput = mockRes.json.mock.calls[0][0];
      expect(jsonOutput.totalArticles).toBe(3);
    });
  });

  describe('sorting', () => {
    test('should request articles sorted by date descending', async () => {
      const mockSort = jest.fn().mockReturnValue({
        then: jest.fn((callback) => {
          callback([]);
          return { catch: jest.fn() };
        })
      });
      db.Articles.find.mockReturnValue({ sort: mockSort });

      await articlesController.generateReport(mockReq, mockRes);

      expect(db.Articles.find).toHaveBeenCalledWith({});
      expect(mockSort).toHaveBeenCalledWith({ date: -1 });
    });
  });
});

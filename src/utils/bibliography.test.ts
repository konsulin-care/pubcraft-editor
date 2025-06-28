import { describe, it, expect } from 'vitest'
import { parseBibEntry, parseBibTeX } from './bibliography'

describe('Bibliography Utilities', () => {
  describe('parseBibEntry', () => {
    it('should parse a simple BibTeX entry', () => {
      const entry = '@article{key, title="Test Title", author="John Doe"}'
      const result = parseBibEntry(entry)
      
      expect(result).toEqual({
        type: 'article',
        key: 'key',
        fields: {
          title: 'Test Title',
          author: 'John Doe'
        }
      })
    })

    it('should handle entries with multiple fields', () => {
      const entry = '@book{book1, title="Research Methods", author="Jane Smith", year=2023}'
      const result = parseBibEntry(entry)
      
      expect(result).toEqual({
        type: 'book',
        key: 'book1',
        fields: {
          title: 'Research Methods',
          author: 'Jane Smith',
          year: 2023
        }
      })
    })
  })

  describe('parseBibTeX', () => {
    it('should parse multiple BibTeX entries', () => {
      const bibText = `
        @article{key1, title="First Paper"}
        @book{key2, title="Research Book"}
      `
      const result = parseBibTeX(bibText)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        type: 'article',
        key: 'key1',
        fields: { title: 'First Paper' }
      })
      expect(result[1]).toEqual({
        type: 'book',
        key: 'key2',
        fields: { title: 'Research Book' }
      })
    })
  })
})
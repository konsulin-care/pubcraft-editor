import { describe, it, expect } from 'vitest'
import { parseBibEntry, parseBibTeX } from './bibliography'

describe('Bibliography Utilities', () => {
  describe('parseBibEntry', () => {
    it('should parse a simple BibTeX entry', () => {
      const entry = '@article{key, title="Test Title", author="John Doe"}'
      const result = parseBibEntry(entry)
      
      expect(result).toEqual({
        id: 'key',
        key: 'key',
        type: 'article',
        title: 'Test Title',
        author: 'John Doe',
        year: '',
        journal: undefined,
        volume: undefined,
        number: undefined,
        pages: undefined,
        doi: undefined,
        url: undefined,
        publisher: undefined,
        booktitle: undefined,
        editor: undefined,
        series: undefined,
        address: undefined,
        month: undefined,
        note: undefined,
        organization: undefined,
        school: undefined,
        institution: undefined,
        chapter: undefined,
        edition: undefined,
        howpublished: undefined
      })
    })

    it('should handle entries with multiple fields', () => {
      const entry = '@book{book1, title="Research Methods", author="Jane Smith", year=2023}'
      const result = parseBibEntry(entry)
      
      expect(result).toEqual({
        id: 'book1',
        key: 'book1',
        type: 'book',
        title: 'Research Methods',
        author: 'Jane Smith',
        year: '2023',
        journal: undefined,
        volume: undefined,
        number: undefined,
        pages: undefined,
        doi: undefined,
        url: undefined,
        publisher: undefined,
        booktitle: undefined,
        editor: undefined,
        series: undefined,
        address: undefined,
        month: undefined,
        note: undefined,
        organization: undefined,
        school: undefined,
        institution: undefined,
        chapter: undefined,
        edition: undefined,
        howpublished: undefined
      })
    })
  })

  describe('parseBibTeX', () => {
    it('should parse multiple BibTeX entries', () => {
      const bibText = `
        @article{key1, title="First Paper", author="John Doe"}
        @book{key2, title="Research Book", author="Jane Smith"}
      `
      const result = parseBibTeX(bibText)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'key1',
        key: 'key1',
        type: 'article',
        title: 'First Paper',
        author: 'John Doe',
        year: '',
        journal: undefined,
        volume: undefined,
        number: undefined,
        pages: undefined,
        doi: undefined,
        url: undefined,
        publisher: undefined,
        booktitle: undefined,
        editor: undefined,
        series: undefined,
        address: undefined,
        month: undefined,
        note: undefined,
        organization: undefined,
        school: undefined,
        institution: undefined,
        chapter: undefined,
        edition: undefined,
        howpublished: undefined
      })
      expect(result[1]).toEqual({
        id: 'key2',
        key: 'key2',
        type: 'book',
        title: 'Research Book',
        author: 'Jane Smith',
        year: '',
        journal: undefined,
        volume: undefined,
        number: undefined,
        pages: undefined,
        doi: undefined,
        url: undefined,
        publisher: undefined,
        booktitle: undefined,
        editor: undefined,
        series: undefined,
        address: undefined,
        month: undefined,
        note: undefined,
        organization: undefined,
        school: undefined,
        institution: undefined,
        chapter: undefined,
        edition: undefined,
        howpublished: undefined
      })
    })
  })
})
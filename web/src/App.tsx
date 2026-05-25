import { BrowserRouter, Routes, Route } from 'react-router'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import LibraryPage from '@/pages/LibraryPage'
import ComicDetailPage from '@/pages/ComicDetailPage'
import ReaderPage from '@/pages/ReaderPage'
import CategoriesPage from '@/pages/CategoriesPage'
import RandomPage from '@/pages/RandomPage'
import BookLibraryPage from '@/pages/BookLibraryPage'
import BookDetailPage from '@/pages/BookDetailPage'
import BookReaderPage from '@/pages/BookReaderPage'
import BookmarksPage from '@/pages/BookmarksPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/comic/:id" element={<ComicDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/tags" element={<CategoriesPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/random" element={<RandomPage />} />
          <Route path="/books" element={<BookLibraryPage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />
        </Route>
        <Route path="/reader/:comicId/:chapterId" element={<ReaderPage />} />
        <Route path="/book-reader/:id" element={<BookReaderPage />} />
      </Routes>
    </BrowserRouter>
  )
}

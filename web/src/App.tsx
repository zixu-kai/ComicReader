import { BrowserRouter, Routes, Route } from 'react-router'
import AuthGate from '@/components/AuthGate'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import LibraryPage from '@/pages/LibraryPage'
import ComicDetailPage from '@/pages/ComicDetailPage'
import ReaderPage from '@/pages/ReaderPage'
import CategoriesPage from '@/pages/CategoriesPage'
import RandomPage from '@/pages/RandomPage'
import BookmarksPage from '@/pages/BookmarksPage'

export default function App() {
  return (
    <AuthGate>
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
          </Route>
          <Route path="/reader/:comicId/:chapterId" element={<ReaderPage />} />
        </Routes>
      </BrowserRouter>
    </AuthGate>
  )
}

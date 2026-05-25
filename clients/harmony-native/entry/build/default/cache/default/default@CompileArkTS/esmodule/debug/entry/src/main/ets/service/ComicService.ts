import type { AxiosResponse } from '@ohos/axios';
import api from "@bundle:com.comicreader.harmony/entry/ets/common/HttpUtil";
import { ProgressUpdateRequest, RatingRequest, CreateNoteRequest, CreateBookmarkRequest, CreateCategoryRequest, CreateTagRequest, AddToBookmarkRequest, AddBookToBookmarkRequest } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
import type { Comic, Chapter, Category, Tag, PaginatedResponse, ComicQueryParams, Book, BookQueryParams, ScanResult, ChapterPagesResult, ServerInfo, ServerStats, Annotation, BookmarkItem, BookNote, BookBookmark, ComicRating, BookRating, ComicReadingProgress, BookReadingProgress } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
export class ComicService {
    static async getComics(params: ComicQueryParams): Promise<PaginatedResponse<Comic>> {
        const res: AxiosResponse<PaginatedResponse<Comic>> = await api.get<PaginatedResponse<Comic>, AxiosResponse<PaginatedResponse<Comic>>, ComicQueryParams>('/api/comics', { params: params });
        return res.data;
    }
    static async getComic(id: number): Promise<Comic> {
        const res: AxiosResponse<Comic> = await api.get<Comic, AxiosResponse<Comic>, null>(`/api/comics/${id}`);
        return res.data;
    }
    static async updateComic(id: number, data: Comic): Promise<Comic> {
        const res: AxiosResponse<Comic> = await api.put<Comic, AxiosResponse<Comic>, Comic>(`/api/comics/${id}`, data);
        return res.data;
    }
    static async deleteComic(id: number): Promise<void> {
        await api.delete<void, AxiosResponse<void>, null>(`/api/comics/${id}`);
    }
    static async scan(): Promise<ScanResult> {
        const res: AxiosResponse<ScanResult> = await api.post<ScanResult, AxiosResponse<ScanResult>, null>('/api/comics/scan', null);
        return res.data;
    }
    static async getRandomComics(count?: number): Promise<Comic[]> {
        const params: Record<string, string> = {};
        if (count)
            params['count'] = count.toString();
        const res: AxiosResponse<Comic[]> = await api.get<Comic[], AxiosResponse<Comic[]>, null>('/api/comics/random', { params: params });
        return res.data;
    }
    static async searchComics(query: string): Promise<PaginatedResponse<Comic>> {
        const res: AxiosResponse<PaginatedResponse<Comic>> = await api.get<PaginatedResponse<Comic>, AxiosResponse<PaginatedResponse<Comic>>, null>(`/api/comics/search`, { params: { query: query } });
        return res.data;
    }
    static async getChapters(comicId: number): Promise<Chapter[]> {
        const res: AxiosResponse<Chapter[]> = await api.get<Chapter[], AxiosResponse<Chapter[]>, null>(`/api/comics/${comicId}/chapters`);
        return res.data;
    }
    static async getChapterPages(chapterId: number): Promise<ChapterPagesResult> {
        const res: AxiosResponse<ChapterPagesResult> = await api.get<ChapterPagesResult, AxiosResponse<ChapterPagesResult>, null>(`/api/chapters/${chapterId}/pages`);
        return res.data;
    }
    static getCoverUrl(id: number): string {
        return `${api.defaults.baseURL}/api/comics/${id}/cover`;
    }
    static getPageImageUrl(chapterId: number, pageNum: number): string {
        return `${api.defaults.baseURL}/api/chapters/${chapterId}/pages/${pageNum}`;
    }
    static async getProgress(comicId: number): Promise<ComicReadingProgress> {
        const res: AxiosResponse<ComicReadingProgress> = await api.get<ComicReadingProgress, AxiosResponse<ComicReadingProgress>, null>(`/api/comics/${comicId}/progress`);
        return res.data;
    }
    static async updateProgress(comicId: number, chapterId: number, currentPage: number, totalPages: number): Promise<void> {
        const body = new ProgressUpdateRequest();
        body.chapterId = chapterId;
        body.currentPage = currentPage;
        body.totalPages = totalPages;
        await api.put<void, AxiosResponse<void>, ProgressUpdateRequest>(`/api/comics/${comicId}/progress`, body);
    }
    static async markCompleted(comicId: number): Promise<void> {
        await api.put<void, AxiosResponse<void>, null>(`/api/comics/${comicId}/progress/complete`, null);
    }
    static async getContinueReading(): Promise<Comic[]> {
        const res: AxiosResponse<Comic[]> = await api.get<Comic[], AxiosResponse<Comic[]>, null>('/api/progress/continue');
        return res.data;
    }
    static async getRating(comicId: number): Promise<ComicRating> {
        const res: AxiosResponse<ComicRating> = await api.get<ComicRating, AxiosResponse<ComicRating>, null>(`/api/comics/${comicId}/rating`);
        return res.data;
    }
    static async setRating(comicId: number, score: number, readingStatus: string, notes?: string): Promise<void> {
        const body = new RatingRequest();
        body.score = score;
        body.readingStatus = readingStatus;
        if (notes)
            body.notes = notes;
        await api.put<void, AxiosResponse<void>, RatingRequest>(`/api/comics/${comicId}/rating`, body);
    }
}
export class BookService {
    static async getBooks(params: BookQueryParams): Promise<PaginatedResponse<Book>> {
        const res: AxiosResponse<PaginatedResponse<Book>> = await api.get<PaginatedResponse<Book>, AxiosResponse<PaginatedResponse<Book>>, BookQueryParams>('/api/books', { params: params });
        return res.data;
    }
    static async getBook(id: number): Promise<Book> {
        const res: AxiosResponse<Book> = await api.get<Book, AxiosResponse<Book>, null>(`/api/books/${id}`);
        return res.data;
    }
    static async updateBook(id: number, data: Book): Promise<Book> {
        const res: AxiosResponse<Book> = await api.put<Book, AxiosResponse<Book>, Book>(`/api/books/${id}`, data);
        return res.data;
    }
    static async deleteBook(id: number): Promise<void> {
        await api.delete<void, AxiosResponse<void>, null>(`/api/books/${id}`);
    }
    static async scanBooks(): Promise<ScanResult> {
        const res: AxiosResponse<ScanResult> = await api.post<ScanResult, AxiosResponse<ScanResult>, null>('/api/books/scan', null);
        return res.data;
    }
    static async getRandomBooks(count?: number): Promise<Book[]> {
        const params: Record<string, string> = {};
        if (count)
            params['count'] = count.toString();
        const res: AxiosResponse<Book[]> = await api.get<Book[], AxiosResponse<Book[]>, null>('/api/books/random', { params: params });
        return res.data;
    }
    static async searchBooks(query: string): Promise<Book[]> {
        const res: AxiosResponse<Book[]> = await api.get<Book[], AxiosResponse<Book[]>, null>(`/api/books/search`, { params: { q: query } });
        return res.data;
    }
    static getCoverUrl(id: number): string {
        return `${api.defaults.baseURL}/api/books/${id}/cover`;
    }
    static getFileUrl(id: number): string {
        return `${api.defaults.baseURL}/api/books/${id}/file`;
    }
    static async getProgress(bookId: number): Promise<BookReadingProgress> {
        const res: AxiosResponse<BookReadingProgress> = await api.get<BookReadingProgress, AxiosResponse<BookReadingProgress>, null>(`/api/books/${bookId}/progress`);
        return res.data;
    }
    static async updateProgress(bookId: number, data: BookReadingProgress): Promise<void> {
        await api.put<void, AxiosResponse<void>, BookReadingProgress>(`/api/books/${bookId}/progress`, data);
    }
    static async markCompleted(bookId: number): Promise<void> {
        await api.put<void, AxiosResponse<void>, null>(`/api/books/${bookId}/progress/complete`, null);
    }
    static async getRating(bookId: number): Promise<BookRating> {
        const res: AxiosResponse<BookRating> = await api.get<BookRating, AxiosResponse<BookRating>, null>(`/api/books/${bookId}/rating`);
        return res.data;
    }
    static async setRating(bookId: number, score: number, readingStatus: string, notes?: string): Promise<void> {
        const body = new RatingRequest();
        body.score = score;
        body.readingStatus = readingStatus;
        if (notes)
            body.notes = notes;
        await api.put<void, AxiosResponse<void>, RatingRequest>(`/api/books/${bookId}/rating`, body);
    }
    static async getNotes(bookId: number): Promise<BookNote[]> {
        const res: AxiosResponse<BookNote[]> = await api.get<BookNote[], AxiosResponse<BookNote[]>, null>(`/api/books/${bookId}/notes`);
        return res.data;
    }
    static async createNote(bookId: number, cfi: string, text: string, note: string): Promise<BookNote> {
        const body = new CreateNoteRequest();
        body.cfi = cfi;
        body.text = text;
        body.note = note;
        const res: AxiosResponse<BookNote> = await api.post<BookNote, AxiosResponse<BookNote>, CreateNoteRequest>(`/api/books/${bookId}/notes`, body);
        return res.data;
    }
    static async deleteNote(bookId: number, noteId: number): Promise<void> {
        await api.delete<void, AxiosResponse<void>, null>(`/api/books/${bookId}/notes/${noteId}`);
    }
    static async getBookmarks(bookId: number): Promise<BookBookmark[]> {
        const res: AxiosResponse<BookBookmark[]> = await api.get<BookBookmark[], AxiosResponse<BookBookmark[]>, null>(`/api/books/${bookId}/bookmarks`);
        return res.data;
    }
    static async createBookmark(bookId: number, cfi: string, label: string): Promise<BookBookmark> {
        const body = new CreateBookmarkRequest();
        body.cfi = cfi;
        body.label = label;
        const res: AxiosResponse<BookBookmark> = await api.post<BookBookmark, AxiosResponse<BookBookmark>, CreateBookmarkRequest>(`/api/books/${bookId}/bookmarks`, body);
        return res.data;
    }
    static async deleteBookmark(bookId: number, bookmarkId: number): Promise<void> {
        await api.delete<void, AxiosResponse<void>, null>(`/api/books/${bookId}/bookmarks/${bookmarkId}`);
    }
}
export class CategoryService {
    static async getCategories(): Promise<Category[]> {
        const res: AxiosResponse<Category[]> = await api.get<Category[], AxiosResponse<Category[]>, null>('/api/categories');
        return res.data;
    }
    static async createCategory(name: string, description?: string, parentId?: number): Promise<Category> {
        const body = new CreateCategoryRequest();
        body.name = name;
        if (description)
            body.description = description;
        if (parentId)
            body.parentId = parentId;
        const res: AxiosResponse<Category> = await api.post<Category, AxiosResponse<Category>, CreateCategoryRequest>('/api/categories', body);
        return res.data;
    }
    static async updateCategory(id: number, data: Category): Promise<Category> {
        const res: AxiosResponse<Category> = await api.put<Category, AxiosResponse<Category>, Category>(`/api/categories/${id}`, data);
        return res.data;
    }
    static async deleteCategory(id: number): Promise<void> {
        await api.delete<void, AxiosResponse<void>, null>(`/api/categories/${id}`);
    }
}
export class TagService {
    static async getTags(): Promise<Tag[]> {
        const res: AxiosResponse<Tag[]> = await api.get<Tag[], AxiosResponse<Tag[]>, null>('/api/tags');
        return res.data;
    }
    static async createTag(name: string): Promise<Tag> {
        const body = new CreateTagRequest();
        body.name = name;
        const res: AxiosResponse<Tag> = await api.post<Tag, AxiosResponse<Tag>, CreateTagRequest>('/api/tags', body);
        return res.data;
    }
    static async deleteTag(id: number): Promise<void> {
        await api.delete<void, AxiosResponse<void>, null>(`/api/tags/${id}`);
    }
}
export class SystemService {
    static async getInfo(): Promise<ServerInfo> {
        const res: AxiosResponse<ServerInfo> = await api.get<ServerInfo, AxiosResponse<ServerInfo>, null>('/api/server/info');
        return res.data;
    }
    static async getStats(): Promise<ServerStats> {
        const res: AxiosResponse<ServerStats> = await api.get<ServerStats, AxiosResponse<ServerStats>, null>('/api/server/stats');
        return res.data;
    }
}
export class AnnotationService {
    static async getAnnotations(targetType: string, targetId: number): Promise<Annotation[]> {
        const res: AxiosResponse<Annotation[]> = await api.get<Annotation[], AxiosResponse<Annotation[]>, null>(`/api/annotations/${targetType}/${targetId}`);
        return res.data;
    }
    static async createAnnotation(data: Annotation): Promise<Annotation> {
        const res: AxiosResponse<Annotation> = await api.post<Annotation, AxiosResponse<Annotation>, Annotation>('/api/annotations', data);
        return res.data;
    }
    static async deleteAnnotation(id: number): Promise<void> {
        await api.delete<void, AxiosResponse<void>, null>(`/api/annotations/${id}`);
    }
}
export class BookmarkService {
    static async getBookmarks(): Promise<BookmarkItem[]> {
        const res: AxiosResponse<BookmarkItem[]> = await api.get<BookmarkItem[], AxiosResponse<BookmarkItem[]>, null>('/api/bookmarks');
        return res.data;
    }
    static async addComic(bookmarkId: number, comicId: number): Promise<void> {
        const body = new AddToBookmarkRequest();
        body.comicId = comicId;
        await api.post<void, AxiosResponse<void>, AddToBookmarkRequest>(`/api/bookmarks/${bookmarkId}/comics`, body);
    }
    static async removeComic(bookmarkId: number, comicId: number): Promise<void> {
        await api.delete<void, AxiosResponse<void>, null>(`/api/bookmarks/${bookmarkId}/comics/${comicId}`);
    }
    static async addBook(bookmarkId: number, bookId: number): Promise<void> {
        const body = new AddBookToBookmarkRequest();
        body.bookId = bookId;
        await api.post<void, AxiosResponse<void>, AddBookToBookmarkRequest>(`/api/bookmarks/${bookmarkId}/books`, body);
    }
    static async removeBook(bookmarkId: number, bookId: number): Promise<void> {
        await api.delete<void, AxiosResponse<void>, null>(`/api/bookmarks/${bookmarkId}/books/${bookId}`);
    }
}

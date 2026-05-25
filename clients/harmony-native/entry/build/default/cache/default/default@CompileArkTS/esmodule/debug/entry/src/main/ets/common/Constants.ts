export class Constants {
    static readonly BASE_URL: string = 'http://192.168.1.100:8080';
    static readonly PAGE_SIZE: number = 20;
    static readonly PREF_NAME: string = 'comicreader_settings';
    static readonly KEY_SERVER_URL: string = 'server_url';
}
export class NavParams {
    comicId: number = 0;
    bookId: number = 0;
    chapterId: number = 0;
    categoryId: number = 0;
    tagId: number = 0;
}
export function navigateTo(context: UIContext, url: string, params?: NavParams): void {
    try {
        if (params) {
            context.getRouter().pushUrl({ url: url, params: params });
        }
        else {
            context.getRouter().pushUrl({ url: url });
        }
    }
    catch (e) {
        console.error('Navigation failed: ' + JSON.stringify(e));
    }
}
export function navigateToTab(context: UIContext, url: string): void {
    try {
        context.getRouter().replaceUrl({ url: url });
    }
    catch (e) {
        console.error('Tab navigation failed: ' + JSON.stringify(e));
    }
}

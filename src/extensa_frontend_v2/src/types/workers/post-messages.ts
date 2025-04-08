export type PostMessageResponse = 'syncStatus' | 'error' | 'success';

export interface PostMessage<T> {
    msg: PostMessageResponse;
    data: T;
} 
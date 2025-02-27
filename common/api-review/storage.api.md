## API Report File for "@firebase/storage"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { AppCheckInternalComponentName } from '@firebase/app-check-interop-types';
import { CompleteFn } from '@firebase/util';
import { FirebaseApp } from '@firebase/app';
import { FirebaseAuthInternalName } from '@firebase/auth-interop-types';
import { FirebaseError } from '@firebase/util';
import { _FirebaseService } from '@firebase/app';
import { NextFn } from '@firebase/util';
import { Provider } from '@firebase/component';
import { Subscribe } from '@firebase/util';
import { Unsubscribe } from '@firebase/util';

// @public
export function connectStorageEmulator(storage: FirebaseStorage, host: string, port: number): void;

// @public
export function deleteObject(ref: StorageReference): Promise<void>;

// @internal (undocumented)
export class _FbsBlob {
    constructor(data: Blob | Uint8Array | ArrayBuffer, elideCopy?: boolean);
    // (undocumented)
    static getBlob(...args: Array<string | _FbsBlob>): _FbsBlob | null;
    // (undocumented)
    size(): number;
    // (undocumented)
    slice(startByte: number, endByte: number): _FbsBlob | null;
    // (undocumented)
    type(): string;
    // (undocumented)
    uploadData(): Blob | Uint8Array;
}

// @public
export interface FirebaseStorage extends _FirebaseService {
    readonly app: FirebaseApp;
    maxOperationRetryTime: number;
    maxUploadRetryTime: number;
}

// @public
export interface FirebaseStorageError extends FirebaseError {
    serverResponse: string | null;
}

// @public
export interface FullMetadata extends UploadMetadata {
    bucket: string;
    downloadTokens: string[] | undefined;
    fullPath: string;
    generation: string;
    metageneration: string;
    name: string;
    ref?: StorageReference | undefined;
    size: number;
    timeCreated: string;
    updated: string;
}

// @internal (undocumented)
export function _getChild(ref: StorageReference, childPath: string): _Reference;

// @public
export function getDownloadURL(ref: StorageReference): Promise<string>;

// @public
export function getMetadata(ref: StorageReference): Promise<FullMetadata>;

// @public
export function getStorage(app?: FirebaseApp, bucketUrl?: string): FirebaseStorage;

// @public
export function list(ref: StorageReference, options?: ListOptions): Promise<ListResult>;

// @public
export function listAll(ref: StorageReference): Promise<ListResult>;

// @public
export interface ListOptions {
    maxResults?: number | null;
    pageToken?: string | null;
}

// @public
export interface ListResult {
    items: StorageReference[];
    nextPageToken?: string;
    prefixes: StorageReference[];
}

// @internal
export class _Location {
    constructor(bucket: string, path: string);
    // (undocumented)
    readonly bucket: string;
    // (undocumented)
    bucketOnlyServerUrl(): string;
    // (undocumented)
    fullServerUrl(): string;
    // (undocumented)
    get isRoot(): boolean;
    // (undocumented)
    static makeFromBucketSpec(bucketString: string, host: string): _Location;
    // (undocumented)
    static makeFromUrl(url: string, host: string): _Location;
    // (undocumented)
    get path(): string;
    }

// @public
export function ref(storage: FirebaseStorage, url?: string): StorageReference;

// @public
export function ref(storageOrRef: FirebaseStorage | StorageReference, path?: string): StorageReference;

// @internal
export class _Reference {
    // Warning: (ae-forgotten-export) The symbol "FirebaseStorageImpl" needs to be exported by the entry point index.d.ts
    constructor(_service: FirebaseStorageImpl, location: string | _Location);
    get bucket(): string;
    get fullPath(): string;
    // (undocumented)
    _location: _Location;
    get name(): string;
    // (undocumented)
    protected _newRef(service: FirebaseStorageImpl, location: _Location): _Reference;
    get parent(): _Reference | null;
    get root(): _Reference;
    get storage(): FirebaseStorageImpl;
    _throwIfRoot(name: string): void;
    // @override
    toString(): string;
}

// @public
export interface SettableMetadata {
    cacheControl?: string | undefined;
    contentDisposition?: string | undefined;
    contentEncoding?: string | undefined;
    contentLanguage?: string | undefined;
    contentType?: string | undefined;
    customMetadata?: {
        [key: string]: string;
    } | undefined;
}

// @public
export interface StorageObserver<T> {
    // (undocumented)
    complete?: CompleteFn | null;
    // (undocumented)
    error?: (error: FirebaseStorageError) => void | null;
    // (undocumented)
    next?: NextFn<T> | null;
}

// @public
export interface StorageReference {
    bucket: string;
    fullPath: string;
    name: string;
    parent: StorageReference | null;
    root: StorageReference;
    storage: FirebaseStorage;
    toString(): string;
}

// @public
export type StringFormat = string;

// @public
export const StringFormat: {
    RAW: string;
    BASE64: string;
    BASE64URL: string;
    DATA_URL: string;
};

// @public
export type TaskEvent = 'state_changed';

// @public
export type TaskState = 'running' | 'paused' | 'success' | 'canceled' | 'error';

// @public
export function updateMetadata(ref: StorageReference, metadata: SettableMetadata): Promise<FullMetadata>;

// @public
export function uploadBytes(ref: StorageReference, data: Blob | Uint8Array | ArrayBuffer, metadata?: UploadMetadata): Promise<UploadResult>;

// @public
export function uploadBytesResumable(ref: StorageReference, data: Blob | Uint8Array | ArrayBuffer, metadata?: UploadMetadata): UploadTask;

// @public
export interface UploadMetadata extends SettableMetadata {
    md5Hash?: string | undefined;
}

// @public
export interface UploadResult {
    readonly metadata: FullMetadata;
    readonly ref: StorageReference;
}

// @public
export function uploadString(ref: StorageReference, value: string, format?: string, metadata?: UploadMetadata): Promise<UploadResult>;

// @public
export interface UploadTask {
    cancel(): boolean;
    catch(onRejected: (error: FirebaseStorageError) => unknown): Promise<unknown>;
    on(event: TaskEvent, nextOrObserver?: StorageObserver<UploadTaskSnapshot> | null | ((snapshot: UploadTaskSnapshot) => unknown), error?: ((a: FirebaseStorageError) => unknown) | null, complete?: Unsubscribe | null): Unsubscribe | Subscribe<UploadTaskSnapshot>;
    pause(): boolean;
    resume(): boolean;
    snapshot: UploadTaskSnapshot;
    then(onFulfilled?: ((snapshot: UploadTaskSnapshot) => unknown) | null, onRejected?: ((error: FirebaseStorageError) => unknown) | null): Promise<unknown>;
}

// @internal
export class _UploadTask {
    constructor(ref: _Reference, blob: _FbsBlob, metadata?: Metadata | null);
    _blob: _FbsBlob;
    cancel(): boolean;
    catch<T>(onRejected: (p1: FirebaseStorageError_2) => T | Promise<T>): Promise<T>;
    // Warning: (ae-forgotten-export) The symbol "Metadata" needs to be exported by the entry point index.d.ts
    _metadata: Metadata | null;
    // Warning: (ae-forgotten-export) The symbol "TaskEvent" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "StorageObserver" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "ErrorFn" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "CompleteFn" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "Unsubscribe" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "Subscribe" needs to be exported by the entry point index.d.ts
    on(type: TaskEvent_2, nextOrObserver?: StorageObserver_2<UploadTaskSnapshot_2> | ((a: UploadTaskSnapshot_2) => unknown), error?: ErrorFn, completed?: CompleteFn_2): Unsubscribe_2 | Subscribe_2<UploadTaskSnapshot_2>;
    pause(): boolean;
    resume(): boolean;
    // Warning: (ae-forgotten-export) The symbol "UploadTaskSnapshot" needs to be exported by the entry point index.d.ts
    get snapshot(): UploadTaskSnapshot_2;
    // Warning: (ae-forgotten-export) The symbol "InternalTaskState" needs to be exported by the entry point index.d.ts
    _state: InternalTaskState;
    // Warning: (ae-forgotten-export) The symbol "FirebaseStorageError" needs to be exported by the entry point index.d.ts
    then<U>(onFulfilled?: ((value: UploadTaskSnapshot_2) => U | Promise<U>) | null, onRejected?: ((error: FirebaseStorageError_2) => U | Promise<U>) | null): Promise<U>;
    _transferred: number;
    }

// @public
export interface UploadTaskSnapshot {
    bytesTransferred: number;
    metadata: FullMetadata;
    ref: StorageReference;
    state: TaskState;
    task: UploadTask;
    totalBytes: number;
}


```

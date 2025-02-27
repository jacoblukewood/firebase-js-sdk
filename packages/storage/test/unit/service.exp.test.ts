/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { expect } from 'chai';
import { TaskEvent } from '../../src/implementation/taskenums';
import { Headers } from '../../src/implementation/connection';
import { ConnectionPool } from '../../src/implementation/connectionPool';
import {
  FirebaseStorageImpl,
  ref,
  connectStorageEmulator
} from '../../src/service';
import * as testShared from './testshared';
import { DEFAULT_HOST } from '../../src/implementation/constants';
import { FirebaseStorageError } from '../../src/implementation/error';
import {
  Reference,
  getMetadata,
  uploadBytesResumable,
  getDownloadURL
} from '../../src/reference';
import { Location } from '../../src/implementation/location';
import { TestingConnection } from './connection';

const fakeAppGs = testShared.makeFakeApp('gs://mybucket');
const fakeAppGsEndingSlash = testShared.makeFakeApp('gs://mybucket/');
const fakeAppInvalidGs = testShared.makeFakeApp('gs://mybucket/hello');
const connectionPool = new ConnectionPool();
const testLocation = new Location('bucket', 'object');

function makeGsUrl(child: string = ''): string {
  return 'gs://' + testShared.bucket + '/' + child;
}

describe('Firebase Storage > Service', () => {
  describe('simple constructor', () => {
    const service = new FirebaseStorageImpl(
      testShared.fakeApp,
      testShared.fakeAuthProvider,
      testShared.fakeAppCheckTokenProvider,
      connectionPool
    );
    it('Root refs point to the right place', () => {
      const reference = ref(service);
      expect(reference.toString()).to.equal(makeGsUrl());
    });
    it('Child refs point to the right place', () => {
      const reference = ref(service, 'path/to/child');
      expect(reference.toString()).to.equal(makeGsUrl('path/to/child'));
    });
  });
  describe('custom bucket constructor', () => {
    it('gs:// custom bucket constructor refs point to the right place', () => {
      const service = new FirebaseStorageImpl(
        testShared.fakeApp,
        testShared.fakeAuthProvider,
        testShared.fakeAppCheckTokenProvider,
        connectionPool,
        'gs://foo-bar.appspot.com'
      );
      const reference = ref(service);
      expect(reference.toString()).to.equal('gs://foo-bar.appspot.com/');
    });
    it('http:// custom bucket constructor refs point to the right place', () => {
      const service = new FirebaseStorageImpl(
        testShared.fakeApp,
        testShared.fakeAuthProvider,
        testShared.fakeAppCheckTokenProvider,
        connectionPool,
        `http://${DEFAULT_HOST}/v1/b/foo-bar.appspot.com/o`
      );
      const reference = ref(service);
      expect(reference.toString()).to.equal('gs://foo-bar.appspot.com/');
    });
    it('https:// custom bucket constructor refs point to the right place', () => {
      const service = new FirebaseStorageImpl(
        testShared.fakeApp,
        testShared.fakeAuthProvider,
        testShared.fakeAppCheckTokenProvider,
        connectionPool,
        `https://${DEFAULT_HOST}/v1/b/foo-bar.appspot.com/o`
      );
      const reference = ref(service);
      expect(reference.toString()).to.equal('gs://foo-bar.appspot.com/');
    });

    it('Bare bucket name constructor refs point to the right place', () => {
      const service = new FirebaseStorageImpl(
        testShared.fakeApp,
        testShared.fakeAuthProvider,
        testShared.fakeAppCheckTokenProvider,
        connectionPool,
        'foo-bar.appspot.com'
      );
      const reference = ref(service);
      expect(reference.toString()).to.equal('gs://foo-bar.appspot.com/');
    });
    it('Child refs point to the right place', () => {
      const service = new FirebaseStorageImpl(
        testShared.fakeApp,
        testShared.fakeAuthProvider,
        testShared.fakeAppCheckTokenProvider,
        connectionPool,
        'foo-bar.appspot.com'
      );
      const reference = ref(service, 'path/to/child');
      expect(reference.toString()).to.equal(
        'gs://foo-bar.appspot.com/path/to/child'
      );
    });
    it('Throws trying to construct with a gs:// URL containing an object path', () => {
      const error = testShared.assertThrows(() => {
        new FirebaseStorageImpl(
          testShared.fakeApp,
          testShared.fakeAuthProvider,
          testShared.fakeAppCheckTokenProvider,
          connectionPool,
          'gs://bucket/object/'
        );
      }, 'storage/invalid-default-bucket');
      expect(error.message).to.match(/Invalid default bucket/);
    });
  });
  describe('default bucket config', () => {
    it('gs:// works without ending slash', () => {
      const service = new FirebaseStorageImpl(
        fakeAppGs,
        testShared.fakeAuthProvider,
        testShared.fakeAppCheckTokenProvider,
        connectionPool
      );
      expect(ref(service)?.toString()).to.equal('gs://mybucket/');
    });
    it('gs:// works with ending slash', () => {
      const service = new FirebaseStorageImpl(
        fakeAppGsEndingSlash,
        testShared.fakeAuthProvider,
        testShared.fakeAppCheckTokenProvider,
        connectionPool
      );
      expect(ref(service)?.toString()).to.equal('gs://mybucket/');
    });
    it('Throws when config bucket is gs:// with an object path', () => {
      testShared.assertThrows(() => {
        new FirebaseStorageImpl(
          fakeAppInvalidGs,
          testShared.fakeAuthProvider,
          testShared.fakeAppCheckTokenProvider,
          connectionPool
        );
      }, 'storage/invalid-default-bucket');
    });
  });
  describe('ref(service, url)', () => {
    const service = new FirebaseStorageImpl(
      testShared.fakeApp,
      testShared.fakeAuthProvider,
      testShared.fakeAppCheckTokenProvider,
      connectionPool
    );
    it('Works with gs:// URLs', () => {
      const reference = ref(service, 'gs://mybucket/child/path/image.png');
      expect(reference.toString()).to.equal(
        'gs://mybucket/child/path/image.png'
      );
    });
    it('Works with http:// URLs', () => {
      const reference = ref(
        service,
        `http://${DEFAULT_HOST}/v0/b/` +
          'mybucket/o/child%2Fpath%2Fimage.png?downloadToken=hello'
      );
      expect(reference.toString()).to.equal(
        'gs://mybucket/child/path/image.png'
      );
    });
    it('Works with https:// URLs', () => {
      const reference = ref(
        service,
        `https://${DEFAULT_HOST}/v0/b/` +
          'mybucket/o/child%2Fpath%2Fimage.png?downloadToken=hello'
      );
      expect(reference.toString()).to.equal(
        'gs://mybucket/child/path/image.png'
      );
    });
    it('Works with storage.googleapis.com URLs', () => {
      const reference = ref(
        service,
        `https://storage.googleapis.com/mybucket/path%20with%20space/image.png`
      );
      expect(reference.toString()).to.equal(
        'gs://mybucket/path with space/image.png'
      );
    });
    it('Works with storage.googleapis.com URLs with query params', () => {
      const reference = ref(
        service,
        `https://storage.googleapis.com/mybucket/path%20with%20space/image.png?X-Goog-Algorithm=
GOOG4-RSA-SHA256`
      );
      expect(reference.toString()).to.equal(
        'gs://mybucket/path with space/image.png'
      );
    });
    it('Works with storage.cloud.google.com URLs', () => {
      const reference = ref(
        service,
        `https://storage.cloud.google.com/mybucket/path%20with%20space/image.png`
      );
      expect(reference.toString()).to.equal(
        'gs://mybucket/path with space/image.png'
      );
    });
    it('Works with storage.cloud.google.com URLs and escaped slash', () => {
      const reference = ref(
        service,
        `https://storage.cloud.google.com/mybucket/path%20with%20space%2Fimage.png`
      );
      expect(reference.toString()).to.equal(
        'gs://mybucket/path with space/image.png'
      );
    });
  });
  describe('connectStorageEmulator(service, host, port)', () => {
    it('sets emulator host correctly', done => {
      function newSend(
        connection: TestingConnection,
        url: string,
        method: string,
        body?: ArrayBufferView | Blob | string | null,
        headers?: Headers
      ): void {
        // Expect emulator host to be in url of storage operations requests,
        // in this case getDownloadURL.
        expect(url).to.match(/^http:\/\/test\.host\.org:1234.+/);
        connection.abort();
        done();
      }
      const service = new FirebaseStorageImpl(
        testShared.fakeApp,
        testShared.fakeAuthProvider,
        testShared.fakeAppCheckTokenProvider,
        testShared.makePool(newSend)
      );
      connectStorageEmulator(service, 'test.host.org', 1234);
      expect(service.host).to.equal('http://test.host.org:1234');
      void getDownloadURL(ref(service, 'test.png'));
    });
  });
  describe('ref(service, path)', () => {
    const service = new FirebaseStorageImpl(
      testShared.fakeApp,
      testShared.fakeAuthProvider,
      testShared.fakeAppCheckTokenProvider,
      connectionPool
    );
    it('Works with non URL paths', () => {
      const newRef = ref(service, 'child/path/image.png');
      expect(newRef.toString()).to.equal('gs://mybucket/child/path/image.png');
    });
    it('Works with no path', () => {
      const newRef = ref(service);
      expect(newRef.toString()).to.equal('gs://mybucket/');
    });
  });
  describe('ref(reference, path)', () => {
    const service = new FirebaseStorageImpl(
      testShared.fakeApp,
      testShared.fakeAuthProvider,
      testShared.fakeAppCheckTokenProvider,
      connectionPool
    );
    const reference = new Reference(service, testLocation);
    it('Throws calling ref(reference, path) with a gs:// URL', () => {
      const error = testShared.assertThrows(() => {
        ref(reference, 'gs://bucket/object');
      }, 'storage/invalid-argument');
      expect(error.message).to.match(/url/);
    });
    it('Throws calling ref(reference, path) with an http:// URL', () => {
      const error = testShared.assertThrows(() => {
        ref(reference, `http://${DEFAULT_HOST}/etc`);
      }, 'storage/invalid-argument');
      expect(error.message).to.match(/url/);
    });
    it('Throws calling ref(reference, path) with an https:// URL', () => {
      const error = testShared.assertThrows(() => {
        ref(reference, `https://${DEFAULT_HOST}/etc`);
      }, 'storage/invalid-argument');
      expect(error.message).to.match(/url/);
    });
    it('Works with non URL paths', () => {
      const newRef = ref(reference, 'child/path/image.png');
      expect(newRef.toString()).to.equal(
        'gs://bucket/object/child/path/image.png'
      );
    });
    it('Works with no path', () => {
      const newRef = ref(reference);
      expect(newRef.toString()).to.equal('gs://bucket/object');
    });
    it('Throws calling ref(reference, path) if path contains ".."', () => {
      const error = testShared.assertThrows(() => {
        ref(reference, `../child/path`);
      }, 'storage/invalid-argument');
      expect(error.message).to.match(/"\.\."/);
    });
  });

  describe('Deletion', () => {
    const service = new FirebaseStorageImpl(
      testShared.fakeApp,
      testShared.fakeAuthProvider,
      testShared.fakeAppCheckTokenProvider,
      connectionPool
    );
    it('In-flight requests are canceled when the service is deleted', async () => {
      const reference = ref(service, 'gs://mybucket/image.jpg');
      const metadataPromise = getMetadata(reference);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      service._delete();
      await expect(metadataPromise).to.be.rejectedWith('storage/app-deleted');
    });
    it('Requests fail when started after the service is deleted', async () => {
      const reference = ref(service, 'gs://mybucket/image.jpg');
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      service._delete();
      await expect(getMetadata(reference)).to.be.rejectedWith(
        'storage/app-deleted'
      );
    });
    it('Running uploads fail when the service is deleted', () => {
      const reference = ref(service, 'gs://mybucket/image.jpg');
      const toReturn = new Promise<void>((resolve, reject) => {
        uploadBytesResumable(reference, new Uint8Array([97])).on(
          TaskEvent.STATE_CHANGED,
          undefined,
          (err: FirebaseStorageError | Error) => {
            expect((err as FirebaseStorageError).code).to.equal(
              'storage/app-deleted'
            );
            resolve();
          },
          () => {
            reject('Upload completed, should have been canceled');
          }
        );
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        service._delete();
      });
      return toReturn;
    });
  });
});

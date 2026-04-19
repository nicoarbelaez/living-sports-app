import { assertEquals, assertRejects } from 'jsr:@std/assert';
import { uploadMedia, type MediaMetadata } from '../_shared/cloudinary.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFile(name: string, type: string, size: number): File {
  const bytes = new Uint8Array(size);
  return new File([bytes], name, { type });
}

function mockFetch(response: Partial<Response> & { body?: unknown }): typeof fetch {
  return (_input: string | URL | Request, _init?: RequestInit) => {
    const { body, ...rest } = response;
    return Promise.resolve(
      new Response(JSON.stringify(body ?? {}), {
        status: rest.status ?? 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  };
}

function withEnv(vars: Record<string, string>, fn: () => Promise<void>): Promise<void> {
  for (const [k, v] of Object.entries(vars)) Deno.env.set(k, v);
  return fn().finally(() => {
    for (const k of Object.keys(vars)) Deno.env.delete(k);
  });
}

// ---------------------------------------------------------------------------
// Tests — uploadMedia
// ---------------------------------------------------------------------------

Deno.test('uploadMedia: throws when env vars missing', async () => {
  // Ensure vars are absent
  Deno.env.delete('CLOUDINARY_CLOUD_NAME');
  Deno.env.delete('CLOUDINARY_UPLOAD_PRESET');

  const file = makeFile('photo.jpg', 'image/jpeg', 100);
  await assertRejects(
    () => uploadMedia([file], 'users/user-123/posts'),
    Error,
    'Faltan CLOUDINARY_CLOUD_NAME'
  );
});

Deno.test('uploadMedia: throws when file exceeds 5 MB', async () => {
  await withEnv(
    { CLOUDINARY_CLOUD_NAME: 'test-cloud', CLOUDINARY_UPLOAD_PRESET: 'test-preset' },
    async () => {
      const bigFile = makeFile('big.jpg', 'image/jpeg', 6_000_000);
      await assertRejects(
        () => uploadMedia([bigFile], 'users/user-123/posts'),
        Error,
        'excede el límite de 5 MB'
      );
    }
  );
});

Deno.test('uploadMedia: throws on unsupported MIME type', async () => {
  await withEnv(
    { CLOUDINARY_CLOUD_NAME: 'test-cloud', CLOUDINARY_UPLOAD_PRESET: 'test-preset' },
    async () => {
      const pdfFile = makeFile('doc.pdf', 'application/pdf', 100);
      await assertRejects(
        () => uploadMedia([pdfFile], 'users/user-123/posts'),
        Error,
        'Tipo de archivo inválido'
      );
    }
  );
});

Deno.test('uploadMedia: throws when Cloudinary returns non-OK', async () => {
  await withEnv(
    { CLOUDINARY_CLOUD_NAME: 'test-cloud', CLOUDINARY_UPLOAD_PRESET: 'test-preset' },
    async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (_url, _init) =>
        Promise.resolve(new Response('Bad Request', { status: 400 }));

      try {
        const file = makeFile('photo.jpg', 'image/jpeg', 100);
        await assertRejects(
          () => uploadMedia([file], 'users/user-123/posts'),
          Error,
          'Error en Cloudinary'
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  );
});

Deno.test('uploadMedia: returns correct metadata for an image', async () => {
  await withEnv(
    { CLOUDINARY_CLOUD_NAME: 'test-cloud', CLOUDINARY_UPLOAD_PRESET: 'test-preset' },
    async () => {
      const cloudinaryPayload = {
        secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/v1/living-sports/users/user-123/posts/photo.jpg',
        public_id: 'living-sports/users/user-123/posts/photo',
        width: 800,
        height: 600,
        format: 'jpg',
        bytes: 12345,
      };

      const originalFetch = globalThis.fetch;
      globalThis.fetch = mockFetch({ status: 200, body: cloudinaryPayload }) as typeof fetch;

      try {
        const file = makeFile('photo.jpg', 'image/jpeg', 100);
        const [result] = await uploadMedia([file], 'users/user-123/posts');

        assertEquals(result.type, 'image');
        assertEquals(result.width, 1080);
        assertEquals(result.height, 1350);
        assertEquals(result.format, 'jpg');
        assertEquals(result.bytes, 12345);
        // Transformation URL injected
        assertEquals(result.url.includes('/upload/c_fill,w_1080,h_1350,g_auto/'), true);
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  );
});

Deno.test('uploadMedia: returns correct metadata for a video', async () => {
  await withEnv(
    { CLOUDINARY_CLOUD_NAME: 'test-cloud', CLOUDINARY_UPLOAD_PRESET: 'test-preset' },
    async () => {
      const cloudinaryPayload = {
        secure_url: 'https://res.cloudinary.com/test-cloud/video/upload/v1/living-sports/users/user-123/posts/clip.mp4',
        public_id: 'living-sports/users/user-123/posts/clip',
        width: 1920,
        height: 1080,
        format: 'mp4',
        bytes: 4_000_000,
      };

      const originalFetch = globalThis.fetch;
      globalThis.fetch = mockFetch({ status: 200, body: cloudinaryPayload }) as typeof fetch;

      try {
        const file = makeFile('clip.mp4', 'video/mp4', 100);
        const [result] = await uploadMedia([file], 'users/user-123/posts');

        assertEquals(result.type, 'video');
        assertEquals(result.width, 1920);
        assertEquals(result.height, 1080);
        // No transformation URL for videos
        assertEquals(result.url.includes('/upload/c_fill'), false);
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  );
});

Deno.test('uploadMedia: handles multiple files and preserves order', async () => {
  await withEnv(
    { CLOUDINARY_CLOUD_NAME: 'test-cloud', CLOUDINARY_UPLOAD_PRESET: 'test-preset' },
    async () => {
      let callIndex = 0;
      const responses = [
        { secure_url: 'https://res.cloudinary.com/test/image/upload/first.jpg', public_id: 'first', width: 800, height: 600, format: 'jpg', bytes: 1000 },
        { secure_url: 'https://res.cloudinary.com/test/image/upload/second.jpg', public_id: 'second', width: 800, height: 600, format: 'jpg', bytes: 2000 },
      ];

      const originalFetch = globalThis.fetch;
      globalThis.fetch = (_url: string | URL | Request, _init?: RequestInit) => {
        const payload = responses[callIndex++];
        return Promise.resolve(
          new Response(JSON.stringify(payload), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      };

      try {
        const files = [
          makeFile('first.jpg', 'image/jpeg', 100),
          makeFile('second.jpg', 'image/jpeg', 200),
        ];
        const results: MediaMetadata[] = await uploadMedia(files, 'users/user-123/posts');

        assertEquals(results.length, 2);
        assertEquals(results[0].public_id, 'first');
        assertEquals(results[1].public_id, 'second');
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  );
});

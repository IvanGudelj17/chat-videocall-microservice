export const API_URL = 'http://localhost:8080';

export async function post<T>(
  path: string,
  body: unknown,
  options: RequestInit = {}
): Promise<T> {
  console.log('POST request body:', JSON.stringify(body));
console.log('POST request body:', JSON.stringify(body));

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    credentials: 'include',
    ...options,
  });

  if (!res.ok) {
    const error = await res.json();
    console.log('P1OST request body:', JSON.stringify(body));

    throw new Error(error.error || 'Unexpected error');
  }

  return res.json();
}
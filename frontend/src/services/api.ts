export interface ApiHealth {
  status: string;
  application: string;
}

export async function checkApiHealth(): Promise<ApiHealth> {
  const response = await fetch('/api/health');

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}`);
  }

  return response.json() as Promise<ApiHealth>;
}
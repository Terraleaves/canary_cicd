import axios from "axios";

// Get availability and latency
export async function checkWebsiteHealth(
    url: string
  ): Promise<{ availability: number; latency: number }> {
    const startTime = Date.now();
    try {
      const response = await axios.get(url);
      const latency = Date.now() - startTime;
      const availability = response.status === 200 ? 100.0 : 0.0;
      return { availability, latency };
    } catch (error) {
      return { availability: 0.0, latency: 0 };
    }
  }
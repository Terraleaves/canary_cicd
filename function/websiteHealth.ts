import axios from "axios";

// Get availability and latency
export async function checkWebsiteHealth(
  url: string
): Promise<{ availability: number; latency: number }> {
  // Current time. This is used to define latency
  const startTime = Date.now();
  try {
    // Send get request to website
    const response = await axios.get(url);

    // Define latency
    const latency = Date.now() - startTime;

    // If response status code is 200, set availability 100
    const availability = response.status === 200 ? 100.0 : 0.0;

    // Return availability and latency value
    return { availability, latency };
  } catch (error) {
    return { availability: 0.0, latency: 0 };
  }
}

export function highMemoryUsage() {
  // Allocate a large array to simulate high memory usage
  const largeArray = new Array(10000000).fill("memory test");

  // Perform some dummy operations
  let sum = 0;
  for (let i = 0; i < largeArray.length; i++) {
    sum += largeArray[i].length;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Simulated memory usage", sum: sum }),
  };
}

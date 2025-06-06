export const hasAccount = async (address: string) => {
  try {
    const response = await fetch(`/api/hasAccount?address=${address}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      const json = await response.json();
      throw new Error(json.error);
    }
    
    const json = await response.json();
    return json.hasAccount;
  } catch (error) {
    console.error("hasAccount error: ", error);
    throw error;
  }
};
